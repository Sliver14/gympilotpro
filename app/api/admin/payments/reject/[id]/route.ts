import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { getGymFromRequest } from '@/lib/gym-context'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const gym = await getGymFromRequest(req)
    if (!gym) {
      return NextResponse.json({ error: 'Gym not found' }, { status: 404 })
    }

    const { id: paymentId } = await context.params
    const staff = await getCurrentUser()

    if (!staff || !['admin', 'secretary', 'trainer'].includes(staff.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (staff.gymId !== gym.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 1. Get payment record
    const payment = await prisma.payment.findFirst({
      where: { id: paymentId, gymId: gym.id },
    })

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    if (payment.status !== 'pending') {
      return NextResponse.json({ error: 'Payment is not pending' }, { status: 400 })
    }

    // 2. Mark payment as rejected
    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'rejected',
        approvedById: staff.id, // Record who rejected it
        approvedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Payment has been successfully declined.',
    })
  } catch (error: any) {
    console.error('Payment rejection error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
