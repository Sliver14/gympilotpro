import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { getGymFromRequest } from '@/lib/gym-context'

export async function POST(req: NextRequest) {
  try {
    const gym = await getGymFromRequest(req)
    if (!gym) {
      return NextResponse.json({ error: 'Gym not found', success: false }, { status: 404 })
    }

    const user = await getCurrentUser()

    if (!user || user.role !== 'member') {
      return NextResponse.json(
        { error: 'Unauthorized', success: false },
        { status: 401 }
      )
    }

    // Verify user belongs to this gym
    if (user.gymId !== gym.id) {
      return NextResponse.json(
        { error: 'Unauthorized for this gym', success: false },
        { status: 403 }
      )
    }

    const { membershipId, paymentMethod = 'Bank Transfer' } = await req.json()

    if (!membershipId) {
      return NextResponse.json(
        { error: 'Membership ID is required', success: false },
        { status: 400 }
      )
    }

    // Get membership details
    const membership = await prisma.membershipPackage.findFirst({
      where: { 
        id: membershipId,
        gymId: gym.id
      },
    })

    if (!membership) {
      return NextResponse.json(
        { message: 'Membership package not found', success: false },
        { status: 404 }
      )
    }

    // Get current member profile
    const memberProfile = await prisma.memberProfile.findFirst({
      where: { 
        userId: user.id,
        gymId: gym.id
      },
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
        gymId: gym.id,
        userId: user.id,
        amount: membership.price,
        status: 'pending',
        paymentMethod: paymentMethod,
        description: `Renewal: ${membership.name} (${membership.id})`,
        reference: `RENEW-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      },
    })

    if (paymentMethod.toLowerCase() === 'paystack') {
      const gymDetails = await prisma.gym.findUnique({
        where: { id: gym.id },
        select: { paystackSecretKey: true }
      });

      if (!gymDetails || !gymDetails.paystackSecretKey) {
        return NextResponse.json({ error: 'This gym has not configured Paystack online payments.', success: false }, { status: 400 });
      }

      try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://gympilotpro.com';
        
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
              type: 'member_payment',
              gymId: gym.id,
              userId: user.id,
              membershipId: membership.id,
              paymentId: payment.id,
              months: membership.duration
            },
            callback_url: `${baseUrl.replace('://', `://${gym.slug}.`)}/payment/success`
          })
        });

        const paystackData = await response.json();
        
        if (paystackData.status) {
          return NextResponse.json({
            success: true,
            authorization_url: paystackData.data.authorization_url,
            reference: payment.reference,
            payment: {
              id: payment.id,
              amount: payment.amount,
              reference: payment.reference,
              status: payment.status,
            }
          })
        } else {
          throw new Error(paystackData.message);
        }
      } catch (err: any) {
        console.error('Paystack initialization error:', err);
        return NextResponse.json({ error: err.message || 'Payment initialization failed', success: false }, { status: 500 });
      }
    }

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
