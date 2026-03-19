import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { sendRenewalEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'admin' && user.role !== 'owner')) {
      return NextResponse.json({ error: 'Unauthorized: Admins only' }, { status: 403 })
    }

    const { gymId, reference } = await req.json()
    if (!gymId || !reference) {
      return NextResponse.json({ error: 'Gym ID and reference are required' }, { status: 400 })
    }

    if (user.gymId !== gymId) {
      return NextResponse.json({ error: 'Forbidden: Invalid Gym' }, { status: 403 })
    }

    // Find the pending payment
    const payment = await prisma.saaSPayment.findUnique({
      where: { reference }
    })

    if (!payment || payment.gymId !== gymId) {
      return NextResponse.json({ error: 'Payment record not found' }, { status: 404 })
    }

    if (payment.status === 'success') {
      return NextResponse.json({ success: true, message: 'Already verified' })
    }

    // In a real scenario, you would call Paystack/Stripe verify endpoint here.
    // For this mock, we assume the payment was successful.

    // 1. Update payment status
    await prisma.saaSPayment.update({
      where: { id: payment.id },
      data: { status: 'success' }
    })

    // 2. Update the GymSubscription
    const latestSub = await prisma.gymSubscription.findFirst({
      where: { gymId },
      orderBy: { endDate: 'desc' }
    })

    const now = new Date()
    // Calculate new end date (extend from now or from current end date if still active)
    let newEndDate = latestSub && latestSub.endDate > now ? new Date(latestSub.endDate) : now
    newEndDate.setDate(newEndDate.getDate() + 30) // Add 30 days

    if (latestSub) {
      await prisma.gymSubscription.update({
        where: { id: latestSub.id },
        data: {
          status: 'active',
          endDate: newEndDate
        }
      })
    } else {
      await prisma.gymSubscription.create({
        data: {
          gymId,
          plan: payment.plan,
          status: 'active',
          startDate: now,
          endDate: newEndDate
        }
      })
    }

    const gym = await prisma.gym.findUnique({ where: { id: gymId } })
    
    if (gym) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://gympilotpro.com'
      const dashboardLoginUrl = baseUrl.replace('://', `://${gym.slug}.`) + '/login'

      await sendRenewalEmail({
        email: user.email,
        gymName: gym.name,
        amount: payment.amount,
        nextBillingDate: newEndDate.toLocaleDateString(),
        dashboardUrl: dashboardLoginUrl
      })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Verify error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
