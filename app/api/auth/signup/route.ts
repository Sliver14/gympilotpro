import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, getCurrentUser, requireActiveGymSubscription } from '@/lib/auth'
import { getGymFromRequest } from '@/lib/gym-context'
import { PLAN_LIMITS } from '@/lib/plans'
import { sendMemberWelcomeEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const gym = await getGymFromRequest(req)

    if (!gym) {
      return NextResponse.json({ error: 'Gym context is required for signup' }, { status: 400 })
    }

    try {
      await requireActiveGymSubscription(gym.id);
    } catch (e: any) {
      return NextResponse.json({ error: 'Service Unavailable: Gym subscription expired' }, { status: 403 })
    }

    // Capacity check
    const gymDetails = await prisma.gym.findUnique({
      where: { id: gym.id },
      include: {
        subscriptions: {
          orderBy: { endDate: 'desc' },
          take: 1
        }
      }
    });

    const currentPlan = gymDetails?.subscriptions?.[0]?.plan || 'starter';
    const maxMembers = PLAN_LIMITS[currentPlan] || 200;

    const currentMemberCount = await prisma.user.count({
      where: { gymId: gym.id, role: 'member', deletedAt: null }
    });

    if (currentMemberCount >= maxMembers) {
      return NextResponse.json({ 
        error: `Member limit reached (${maxMembers}). Please upgrade your plan to add more.` 
      }, { status: 403 });
    }

    let {
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
      profileImage,
      birthday,
      gender,
      hearAboutUs,
      membershipId,
      fitnessGoals = [],
      fitnessGoalsDetails,
      paymentMethod,
      startDate,
      paymentCompleted = false,
    } = body

    // Check if request is from staff + instant approval flag
    const currentUser = await getCurrentUser()
    const isStaff = currentUser && ['admin', 'secretary', 'trainer'].includes(currentUser.role)
    const shouldApproveImmediately = isStaff && !!paymentCompleted // safe boolean coercion

    // DEFAULT PASSWORD LOGIC:
    // If admin/staff is registering, we use a default password.
    const defaultPassword = "12345678"
    const effectivePassword = isStaff ? defaultPassword : password

    // Required fields validation
    if (
      !email ||
      !effectivePassword ||
      !firstName ||
      !lastName ||
      !phoneNumber ||
      !profileImage ||
      !membershipId ||
      !paymentMethod ||
      !gender
    ) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim()

    // Email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // Check existing user in THIS gym
    const existingUser = await prisma.user.findFirst({
      where: { 
        email: normalizedEmail,
        gymId: gym.id
      }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered in this gym' }, { status: 409 })
    }

    // Validate membership exists in this gym
    const membership = await prisma.membershipPackage.findFirst({
      where: { id: membershipId, gymId: gym.id },
    })
    if (!membership) {
      return NextResponse.json({ error: 'Invalid membership package' }, { status: 400 })
    }

    // Parse & validate startDate
    let joinDate = startDate ? new Date(startDate) : new Date()
    if (isNaN(joinDate.getTime())) {
      return NextResponse.json({ error: 'Invalid start date format' }, { status: 400 })
    }

    let expiryDate = new Date(joinDate)
    expiryDate.setDate(expiryDate.getDate() + membership.duration)

    // For pending payments, set expired dates
    if (!shouldApproveImmediately) {
      const pastDate = new Date('2000-01-01')
      joinDate = pastDate
      expiryDate = pastDate
    }

    const hashedPassword = await hashPassword(effectivePassword)
    const qrCodeData = `${normalizedEmail}-${Date.now()}`
    const goalsJson = Array.isArray(fitnessGoals) && fitnessGoals.length > 0
      ? JSON.stringify(fitnessGoals)
      : null

    // Paystack validation
    if (paymentMethod.toLowerCase() === 'paystack' && (!gymDetails || !gymDetails.paystackSecretKey)) {
      return NextResponse.json(
        { error: 'This gym has not configured Paystack online payments. Please select Cash or Bank Transfer.' },
        { status: 400 }
      )
    }

    // Create user + profile
    const user = await prisma.user.create({
      data: {
        gymId: gym.id,
        email: normalizedEmail,
        password: hashedPassword,
        firstName,
        lastName,
        phoneNumber: phoneNumber || null,
        profileImage: profileImage || null,
        role: 'member',
        memberProfile: {
          create: {
            gymId: gym.id,
            membershipId: membershipId,
            joinDate,
            expiryDate,
            birthday: birthday || null,
            gender,
            hearAboutUs: hearAboutUs || null,
            fitnessGoals: goalsJson,
            fitnessGoalsDetails: fitnessGoalsDetails || null,
            paymentMethod: paymentMethod || null,
            qrCode: qrCodeData,
            paymentStatus: shouldApproveImmediately ? 'approved' : 'pending',
            // Only set these when approving (verified defaults to false otherwise)
            ...(shouldApproveImmediately && {
              verified: true,
            }),
          },
        },
      },
      include: { memberProfile: true },
    })

    // Create Payment record (always, status depends on approval)
    const payment = await prisma.payment.create({
      data: {
        gymId: gym.id,
        userId: user.id,
        amount: membership.price,
        status: shouldApproveImmediately ? 'approved' : 'pending',
        paymentMethod: paymentMethod || 'Cash',
        reference: shouldApproveImmediately ? `ADMIN-${Date.now()}` : `REG-${Date.now()}`,
        description: `New Registration - ${membership.name}`,
        approvedById: shouldApproveImmediately ? currentUser?.id : null,
        approvedAt: shouldApproveImmediately ? new Date() : null,
      },
    })

    if (paymentMethod.toLowerCase() === 'paystack' && gymDetails?.paystackSecretKey) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://gympilotpro.com';
        const callbackUrl = `${baseUrl.replace('://', `://${gym.slug}.`)}/payment/success`;
        
        const response = await fetch('https://api.paystack.co/transaction/initialize', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${gymDetails.paystackSecretKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: user.email,
            amount: membership.price * 100, // Paystack expects kobo
            reference: payment.reference,
            metadata: {
              type: isStaff ? 'admin_registration' : 'member_signup',
              gymId: gym.id,
              userId: user.id,
              membershipId: membership.id,
              paymentId: payment.id,
              months: membership.duration
            },
            callback_url: callbackUrl
          })
        });

        const paystackData = await response.json();
        
        if (paystackData.status) {
          return NextResponse.json({
            success: true,
            authorization_url: paystackData.data.authorization_url,
            reference: payment.reference,
            userId: user.id,
          });
        } else {
          throw new Error(paystackData.message);
        }
      } catch (err: any) {
        console.error('Paystack initialization error:', err);
        return NextResponse.json({ error: err.message || 'Payment initialization failed' }, { status: 500 });
      }
    }

    // Response
    const responseData: any = {
      success: true,
      message: shouldApproveImmediately
        ? 'Member registered and payment approved instantly'
        : 'Account created. Awaiting payment verification.',
      userId: user.id,
    }

    if (paymentMethod === 'Bank Transfer' && !shouldApproveImmediately) {
      const bankDetails = gymDetails?.bankName && gymDetails?.accountNumber && gymDetails?.accountName
        ? `${gymDetails.accountName}\n${gymDetails.bankName}\n${gymDetails.accountNumber}`
        : 'Bank details not configured. Please contact management.'

      responseData.bankInstructions = `${bankDetails}\n\nPlease confirm account name before transfer.\nSend receipt to WhatsApp: ${gymDetails?.phone || 'Management'}\n\nThank you!\nSigned: Management ${gymDetails?.name || 'Gym'}`
    }

    // Generate login URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://gympilotpro.com';
    const loginUrl = gymDetails?.customDomain && gymDetails?.domainVerified 
      ? `https://${gymDetails.customDomain}/login`
      : `${baseUrl.replace('://', `://${gym.slug}.`)}/login`;

    // Send Welcome Email
    await sendMemberWelcomeEmail({
      email: user.email,
      firstName: user.firstName,
      gymName: gymDetails?.name || gym.slug,
      loginUrl,
      // Only include password if it was set as a default by staff
      ...(isStaff && { password: defaultPassword })
    });

    return NextResponse.json(responseData)
  } catch (error: any) {
    console.error('Signup error:', error)

    let status = 500
    let message = 'Internal server error'

    if (error.code === 'P2002') {
      message = 'Email already registered'
      status = 409
    }

    return NextResponse.json({ error: message }, { status })
  }
}
