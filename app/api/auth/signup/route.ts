import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import QRCode from 'qrcode'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
      gender,
      hearAboutUs,
      membershipId,
      fitnessGoals,
      fitnessGoalsDetails,
      paymentMethod,
      startDate,
    } = body

    // Expanded validation to include paymentMethod
    if (!email || !password || !firstName || !lastName || !membershipId || !paymentMethod) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

    const membership = await prisma.membershipPackage.findUnique({ where: { id: membershipId } })
    if (!membership) {
      return NextResponse.json({ error: 'Invalid membership package' }, { status: 400 })
    }

    const hashedPassword = await hashPassword(password)
    
    // Calculate expiry based on startDate if provided
    const joinDate = startDate ? new Date(startDate) : new Date()
    const expiryDate = new Date(joinDate)
    expiryDate.setDate(expiryDate.getDate() + membership.duration)
    
    const qrCodeData = `${email}-${Date.now()}`
    const goalsString = Array.isArray(fitnessGoals) ? fitnessGoals.join(', ') : null

    // Create user with new verification fields, but no session
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phoneNumber: phoneNumber || null,
        role: 'member',
        memberProfile: {
          create: {
            membershipId,
            joinDate,
            expiryDate,
            gender: gender || null,
            hearAboutUs: hearAboutUs || null,
            fitnessGoals: goalsString,
            fitnessGoalsDetails: fitnessGoalsDetails || null,
            paymentMethod: paymentMethod,
            qrCode: qrCodeData,
            // --- NEW: Set verification defaults ---
            verified: false,
            paymentStatus: 'pending',
          },
        },
      },
    })

    // --- NEW: Prepare conditional response ---
    let responseData: { success: boolean; message: string; bankInstructions?: string } = {
      success: true,
      message: 'Account created. Awaiting payment verification.',
    }

    if (paymentMethod === 'Bank Transfer') {
      responseData.bankInstructions = `
KLIMARX SPACE ENTERPRISES
FIRST CITY MONUMENT BANK (FCMB)
1042020132

Please ensure you confirm the account name before making any transfer.
After payment, kindly send your payment receipt/proof of transfer to:
WhatsApp: 07048430667

This will enable us to update your membership promptly.
Thank you for your cooperation and continued support.
We look forward to helping you achieve your fitness goals.

Signed: Management Klimarx Space Enterprises
      `.trim()
    }

    return NextResponse.json(responseData)
  } catch (error: any) {
    console.error('Signup error:', error)
    let message = 'Internal server error'
    if (error.code === 'P2002') {
      message = 'Email already registered'
    } else if (error instanceof SyntaxError) {
      message = 'Invalid request format'
    }
    return NextResponse.json({ error: message }, { status: 500 })
  }
}