import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== 'member') {
      return NextResponse.json(
        { error: 'Unauthorized', success: false },
        { status: 401 }
      )
    }

    const { membershipId, paymentMethod = 'Bank Transfer' } = await req.json()

    if (!membershipId) {
      return NextResponse.json(
        { error: 'Membership ID is required', success: false },
        { status: 400 }
      )
    }

    // Check for Paystack - Coming Soon
    if (paymentMethod.toLowerCase() === 'paystack') {
      return NextResponse.json({ error: 'Paystack payment is coming soon. Please use another method for now.', success: false }, { status: 400 })
    }

    // Get membership details
    const membership = await prisma.membershipPackage.findUnique({
      where: { id: membershipId },
    })

    if (!membership) {
      return NextResponse.json(
        { message: 'Membership package not found', success: false },
        { status: 404 }
      )
    }

    // Get current member profile
    const memberProfile = await prisma.memberProfile.findUnique({
      where: { userId: user.id },
    })

    if (!memberProfile) {
      return NextResponse.json(
        { message: 'Member profile not found', success: false },
        { status: 404 }
      )
    }

    // Create payment record with pending status
    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        amount: membership.price,
        status: 'pending',
        paymentMethod: paymentMethod,
        description: `Renewal: ${membership.name} (${membership.id})`,
        reference: `RENEW-${Date.now()}`,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Renewal request sent. Please contact staff for payment confirmation.',
      payment: {
        id: payment.id,
        amount: payment.amount,
        reference: payment.reference,
        status: payment.status,
      },
    })
  } catch (error) {
    console.error('Payment renewal error:', error)
    return NextResponse.json(
      { error: 'Internal server error', success: false, message: 'Payment processing failed' },
      { status: 500 }
    )
  }
}
