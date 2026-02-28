import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import QRCode from 'qrcode'
import { getCurrentUser } from '@/lib/auth'  // ← must exist in your lib/auth.ts

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
      paymentCompleted = false,  // ← now read from body
    } = body

    // Validation
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

    // Basic email check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // Existing user?
    if (await prisma.user.findUnique({ where: { email } })) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

    const membership = await prisma.membershipPackage.findUnique({
      where: { id: membershipId },
    })
    if (!membership) {
      return NextResponse.json({ error: 'Invalid membership package' }, { status: 400 })
    }

    // Parse startDate
    let joinDate = startDate ? new Date(startDate) : new Date()
    if (isNaN(joinDate.getTime())) {
      return NextResponse.json({ error: 'Invalid start date format' }, { status: 400 })
    }

    const expiryDate = new Date(joinDate)
    expiryDate.setDate(expiryDate.getDate() + membership.duration)

    const hashedPassword = await hashPassword(password)
    const qrCodeData = `${email}-${Date.now()}`
    const goalsJson = Array.isArray(fitnessGoals) && fitnessGoals.length > 0
      ? JSON.stringify(fitnessGoals)
      : null

    // Check for Paystack - Coming Soon
    if (paymentMethod.toLowerCase() === 'paystack') {
      return NextResponse.json({ error: 'Paystack payment is coming soon. Please use another method for now.' }, { status: 400 })
    }

    // ── NEW: Check if admin is registering and wants instant approval ──
    const currentUser = await getCurrentUser() // null if not authenticated
    const isStaff = currentUser && ['admin', 'secretary', 'trainer'].includes(currentUser.role)
    const shouldApproveImmediately = isStaff && paymentCompleted

    // Create user + profile
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phoneNumber: phoneNumber,
        role: 'member',
        memberProfile: {
          create: {
            membershipId,
            joinDate,
            expiryDate,
            birthday: birthday || null,
            gender,
            hearAboutUs: hearAboutUs || null,
            fitnessGoals: goalsJson,
            fitnessGoalsDetails: fitnessGoalsDetails || null,
            paymentMethod: paymentMethod || null,
            qrCode: qrCodeData,
            verified: shouldApproveImmediately,
            paymentStatus: shouldApproveImmediately ? 'approved' : 'pending',
          },
        },
      },
      include: { memberProfile: true },
    })

    // ── Create Payment record ──
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