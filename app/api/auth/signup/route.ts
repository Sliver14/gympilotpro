import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import QRCode from 'qrcode'
import { getCurrentUser } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const {
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
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
      !membershipId ||
      !paymentMethod ||
      !gender
    ) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // Check existing user
    if (await prisma.user.findUnique({ where: { email } })) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

    // Validate membership exists
    const membership = await prisma.membershipPackage.findUnique({
      where: { id: membershipId },
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
    const qrCodeData = `${email}-${Date.now()}`
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
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phoneNumber: phoneNumber || null,
        role: 'member',
        memberProfile: {
          create: {
            membership: {
              connect: { id: membershipId },
            },
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
              approvedById: currentUser.id,
              approvedAt: new Date(),
            }),
          },
        },
      },
      include: { memberProfile: true },
    })

    // Create Payment record (always, status depends on approval)
    await prisma.payment.create({
      data: {
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