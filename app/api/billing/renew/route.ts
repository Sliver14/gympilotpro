import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'admin' && user.role !== 'owner')) {
      return NextResponse.json({ error: 'Unauthorized: Admins only' }, { status: 403 })
    }

    const { gymId } = await req.json()
    if (!gymId) {
      return NextResponse.json({ error: 'Gym ID is required' }, { status: 400 })
    }

    if (user.gymId !== gymId) {
      return NextResponse.json({ error: 'Forbidden: Invalid Gym' }, { status: 403 })
    }

    const gym = await prisma.gym.findUnique({
      where: { id: gymId },
      include: { subscriptions: { orderBy: { endDate: 'desc' }, take: 1 } }
    })

    if (!gym) {
      return NextResponse.json({ error: 'Gym not found' }, { status: 404 })
    }

    const plan = gym.subscriptions[0]?.plan || 'pro'
    const reference = `SAAS-PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    // Create a pending SaaSPayment record
    await prisma.saaSPayment.create({
      data: {
        email: user.email,
        amount: 50000, // Hardcoded for this demo, would be dynamically calculated
        plan,
        reference,
        status: 'pending',
        gymId: gym.id,
        userId: user.id
      }
    })

    // Here you would normally initialize Paystack or Stripe and return the authorization_url.
    // We will return the reference to mock the flow for the lock screen.
    return NextResponse.json({ reference, success: true })
  } catch (error: any) {
    console.error('Renew error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
