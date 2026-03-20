import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, getCurrentUser, requireActiveGymSubscription } from '@/lib/auth'
import { getGymFromRequest } from '@/lib/gym-context'
import { PLAN_LIMITS } from '@/lib/plans'

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

    // Required fields validation
    if (
      !email ||
      !password ||
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

    const hashedPassword = await hashPassword(password)
    const qrCodeData = `${normalizedEmail}-${Date.now()}`
    const goalsJson = Array.isArray(fitnessGoals) && fitnessGoals.length > 0
      ? JSON.stringify(fitnessGoals)
      : null

    // Paystack placeholder
    if (paymentMethod.toLowerCase() === 'paystack') {
      return NextResponse.json(
        { error: 'Paystack payment is coming soon. Please use another method.' },
        { status: 400 }
      )
    }

    // Check if request is from staff + instant approval flag
    const currentUser = await getCurrentUser()
    const isStaff = currentUser && ['admin', 'secretary', 'trainer'].includes(currentUser.role)
    const shouldApproveImmediately = isStaff && !!paymentCompleted // safe boolean coercion

    // For pending payments, set expired dates
    if (!shouldApproveImmediately) {
      const pastDate = new Date('2000-01-01')
      joinDate = pastDate
      expiryDate = pastDate
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
    await prisma.payment.create({
      data: {
        gymId: gym.id,
        userId: user.id,
        amount: membership.price,
        status: shouldApproveImmediately ? 'approved' : 'pending',
        paymentMethod: paymentMethod || 'Cash',
        reference: shouldApproveImmediately ? `ADMIN-${Date.now()}` : `REG-${Date.now()}`,
        description: `New Registration - ${membership.name}`,
        approvedById: shouldApproveImmediately ? currentUser.id : null,
        approvedAt: shouldApproveImmediately ? new Date() : null,
      },
    })

    // Response
    const responseData: any = {
      success: true,
      message: shouldApproveImmediately
        ? 'Member registered and payment approved instantly'
        : 'Account created. Awaiting payment verification.',
      userId: user.id,
    }

    if (paymentMethod === 'Bank Transfer' && !shouldApproveImmediately) {
      responseData.bankInstructions = `KLIMARX SPACE ENTERPRISES\nFIRST CITY MONUMENT BANK (FCMB)\n1042020132\n\nPlease confirm account name before transfer.\nSend receipt to WhatsApp: 07048430667\n\nThank you!\nSigned: Management Klimarx Space Enterprises`
    }

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