import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import axios from 'axios'
import { PLANS, calculatePrice, calculateUpgradePrice, PlanKey, PLAN_WEIGHTS } from '@/lib/plans'

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'admin' && user.role !== 'owner')) {
      return NextResponse.json({ error: 'Unauthorized: Admins only' }, { status: 403 })
    }

    const { gymId, planKey, months } = await req.json()
    if (!gymId || !planKey || !months) {
      return NextResponse.json({ error: 'Gym ID, plan, and duration are required' }, { status: 400 })
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

    const latestSub = gym.subscriptions[0];
    const currentPlanName = latestSub?.plan?.toLowerCase() as PlanKey || 'starter';
    const isNewGym = gym.status === 'pending';
    
    let finalAmount = 0;
    let paymentType = 'renewal';

    if (isNewGym) {
      const { total } = calculatePrice(planKey as PlanKey, months, true);
      finalAmount = total;
      paymentType = 'signup';
    } else {
      const currentWeight = PLAN_WEIGHTS[currentPlanName] || 0;
      const newWeight = PLAN_WEIGHTS[planKey as PlanKey] || 0;

      if (newWeight > currentWeight && latestSub && new Date(latestSub.endDate) > new Date()) {
        // Upgrade with proration
        const { total } = calculateUpgradePrice(
          currentPlanName,
          planKey as PlanKey,
          new Date(latestSub.endDate),
          months
        );
        finalAmount = total;
        paymentType = 'upgrade';
      } else {
        // Simple renewal or plan change after expiry
        const { total } = calculatePrice(planKey as PlanKey, months, false, currentPlanName);
        finalAmount = total;
        paymentType = planKey !== currentPlanName ? 'upgrade' : 'renewal';
      }
    }

    const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
    if (!PAYSTACK_SECRET_KEY) {
      return NextResponse.json({ error: 'Paystack secret key not configured' }, { status: 500 });
    }

    const amountInKobo = Math.round(finalAmount * 100);

    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const callbackUrl = `${protocol}://${host}/payment/success`;

    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email: user.email,
        amount: amountInKobo,
        metadata: {
          plan: planKey,
          months: months,
          gymId,
          userId: user.id,
          type: paymentType
        },
        callback_url: callbackUrl,
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return NextResponse.json({ 
      success: true, 
      authorization_url: response.data.data.authorization_url,
      reference: response.data.data.reference
    })
  } catch (error: any) {
    console.error('Renew error:', error.response?.data || error.message)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
