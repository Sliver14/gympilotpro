import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateMonthlyInvoice, evaluateGymRestriction } from '@/lib/billing';

export async function GET(request: Request) {
  try {
    // 1. Verify Authorization
    const authHeader = request.headers.get('authorization');
    const vercelCronHeader = request.headers.get('x-vercel-cron');

    if (
      authHeader !== `Bearer ${process.env.CRON_SECRET}` &&
      (!vercelCronHeader || process.env.NODE_ENV === 'development')
    ) {
      if (process.env.NODE_ENV !== 'development' || !authHeader) {
        return new NextResponse('Unauthorized', { status: 401 });
      }
    }

    const now = new Date();
    // Previous month calculation
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    const billingMonthStr = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, '0')}`;

    const gyms = await prisma.gym.findMany({
      select: { id: true, name: true, slug: true, email: true, status: true, billingStatus: true },
    });

    const summary = {
      invoicesGenerated: 0,
      gymsEvaluated: gyms.length,
      gymsRestricted: 0,
      gymsActive: 0,
    };

    for (const gym of gyms) {
      // 1. Generate monthly invoice for previous month if not yet created
      try {
        const inv = await generateMonthlyInvoice(gym.id, prevMonth, prevMonthEnd, billingMonthStr);
        if (inv) {
          summary.invoicesGenerated++;
        }
      } catch (err: any) {
        console.error(`Error generating invoice for gym ${gym.slug}:`, err.message);
      }

      // 2. Evaluate restriction status (2 months overdue)
      try {
        const result = await evaluateGymRestriction(gym.id);
        if (result.isRestricted) {
          summary.gymsRestricted++;
        } else {
          summary.gymsActive++;
        }
      } catch (err: any) {
        console.error(`Error evaluating restriction for gym ${gym.slug}:`, err.message);
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      billingMonth: billingMonthStr,
      summary,
    });
  } catch (error: any) {
    console.error('CRON BILLING ERROR:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
