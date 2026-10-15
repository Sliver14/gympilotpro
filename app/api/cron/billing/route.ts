import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateMonthlyInvoice, evaluateGymRestriction, getGymBillingOverview } from '@/lib/billing';
import {
  sendGymInvoiceIssuedEmail,
  sendGymBillingReminderEmail,
  sendGymAccountRestrictedEmail,
} from '@/lib/email';

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
      select: {
        id: true,
        name: true,
        slug: true,
        email: true,
        status: true,
        billingStatus: true,
        customDomain: true,
        users: {
          where: { role: { in: ['admin', 'owner'] } },
          select: { email: true, firstName: true },
          take: 1,
        },
      },
    });

    const summary = {
      invoicesGenerated: 0,
      invoiceEmailsSent: 0,
      warningEmailsSent: 0,
      restrictionEmailsSent: 0,
      gymsEvaluated: gyms.length,
      gymsRestricted: 0,
      gymsActive: 0,
    };

    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'gympilotpro.com';

    for (const gym of gyms) {
      const recipientEmail = gym.email || gym.users[0]?.email;
      const gymDomain = gym.customDomain
        ? `https://${gym.customDomain}`
        : `https://${gym.slug}.${rootDomain}`;
      const billingUrl = `${gymDomain}/admin/billing`;

      // 1. Check if invoice already existed before generating
      const existingInvoice = await prisma.gymInvoice.findFirst({
        where: { gymId: gym.id, billingMonth: billingMonthStr },
      });

      // 2. Generate monthly invoice for previous month
      let inv = null;
      try {
        inv = await generateMonthlyInvoice(gym.id, prevMonth, prevMonthEnd, billingMonthStr);
        if (inv && !existingInvoice) {
          summary.invoicesGenerated++;

          // Send invoice notification email if amount is due and recipient email exists
          if (inv.amountDue > 0 && recipientEmail) {
            await sendGymInvoiceIssuedEmail({
              email: recipientEmail,
              gymName: gym.name,
              invoiceNumber: inv.invoiceNumber,
              billingMonth: billingMonthStr,
              totalMemberRevenue: inv.totalMemberRevenue,
              amountDue: inv.amountDue,
              dueDate: new Date(inv.dueDate).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              }),
              paymentUrl: billingUrl,
            });
            summary.invoiceEmailsSent++;
          }
        }
      } catch (err: any) {
        console.error(`Error generating invoice for gym ${gym.slug}:`, err.message);
      }

      // 3. Evaluate restriction status (2 months overdue)
      try {
        const previousBillingStatus = gym.billingStatus;
        const result = await evaluateGymRestriction(gym.id);

        if (result.isRestricted) {
          summary.gymsRestricted++;

          // Only send restriction email if newly restricted or if transitioning
          if (previousBillingStatus !== 'restricted' && recipientEmail) {
            const overview = await getGymBillingOverview(gym.id);
            await sendGymAccountRestrictedEmail({
              email: recipientEmail,
              gymName: gym.name,
              totalOutstandingDue: overview.totalOutstandingDue,
              paymentUrl: billingUrl,
            });
            summary.restrictionEmailsSent++;
          }
        } else {
          summary.gymsActive++;

          // If in warning state (1 month overdue), send reminder
          if (result.billingStatus === 'warning' && recipientEmail) {
            const overview = await getGymBillingOverview(gym.id);
            await sendGymBillingReminderEmail({
              email: recipientEmail,
              gymName: gym.name,
              unpaidInvoicesCount: overview.unpaidInvoicesCount,
              totalOutstandingDue: overview.totalOutstandingDue,
              paymentUrl: billingUrl,
            });
            summary.warningEmailsSent++;
          }
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
