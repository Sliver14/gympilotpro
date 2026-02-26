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

    const { membershipId } = await req.json()

    if (!membershipId) {
      return NextResponse.json(
        { error: 'Membership ID is required', success: false },
        { status: 400 }
      )
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

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        amount: membership.price,
        status: 'completed',
        paymentMethod: 'paystack',
        description: `Membership renewal - ${membership.name}`,
        reference: `KLIMARX-${Date.now()}`,
      },
    })

    // Calculate new expiry date
    const newExpiryDate = new Date()
    newExpiryDate.setDate(newExpiryDate.getDate() + membership.duration)

    // Update member profile with new membership and expiry date
    await prisma.memberProfile.update({
      where: { userId: user.id },
      data: {
        membershipId,
        expiryDate: newExpiryDate,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Membership renewed successfully',
      payment: {
        id: payment.id,
        amount: payment.amount,
        reference: payment.reference,
      },
      membershipExpiry: newExpiryDate.toISOString(),
    })
  } catch (error) {
    console.error('Payment renewal error:', error)
    return NextResponse.json(
      { error: 'Internal server error', success: false, message: 'Payment processing failed' },
      { status: 500 }
    )
  }
}
