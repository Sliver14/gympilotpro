import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  getGymMemberReminderEmailContent, 
  getSaaSReminderEmailContent, 
  sendBatchEmails 
} from '@/lib/email';

// The days we want to trigger emails for Gym Members
const MEMBER_REMINDER_DAYS = [3, 1, 0];
// The days we want to trigger emails for SaaS Owners
const SAAS_REMINDER_DAYS = [3, 2, 1, 0];

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
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const results = {
      membersNotified: 0,
      saasOwnersNotified: 0,
      errors: [] as string[]
    };

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://gympilotpro.com';
    const emailBatch: any[] = [];

    // ---------------------------------------------------------
    // PROCESS GYM MEMBERS
    // ---------------------------------------------------------
    for (const daysRemaining of MEMBER_REMINDER_DAYS) {
      const targetDateStart = new Date(todayStart);
      targetDateStart.setDate(todayStart.getDate() + daysRemaining);
      
      const targetDateEnd = new Date(targetDateStart);
      targetDateEnd.setDate(targetDateEnd.getDate() + 1);

      const expiringMembers = await prisma.memberProfile.findMany({
        where: {
          expiryDate: {
            gte: targetDateStart,
            lt: targetDateEnd,
          },
          user: {
            deletedAt: null,
          }
        },
        include: {
          user: true,
          gym: true,
        }
      });

      for (const profile of expiringMembers) {
        if (!profile.user.email) continue;
        
        try {
          const gymDomain = profile.gym.customDomain 
            ? `https://${profile.gym.customDomain}`
            : `https://${profile.gym.slug}.gympilotpro.com`;

          const emailContent = getGymMemberReminderEmailContent({
            email: profile.user.email,
            firstName: profile.user.firstName,
            gymName: profile.gym.name,
            daysRemaining,
            expiryDate: profile.expiryDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
            renewalUrl: `${gymDomain}/member/renew-membership`
          });
          
          emailBatch.push(emailContent);
          results.membersNotified++;
        } catch (error: any) {
          console.error(`Error preparing member notification ${profile.user.email}:`, error);
          results.errors.push(`Member ${profile.user.email}: ${error.message}`);
        }
      }
    }

    // ---------------------------------------------------------
    // PROCESS SAAS OWNERS (GYM SUBSCRIPTIONS)
    // ---------------------------------------------------------
    for (const daysRemaining of SAAS_REMINDER_DAYS) {
      const targetDateStart = new Date(todayStart);
      targetDateStart.setDate(todayStart.getDate() + daysRemaining);
      
      const targetDateEnd = new Date(targetDateStart);
      targetDateEnd.setDate(targetDateEnd.getDate() + 1);

      const expiringGyms = await prisma.gymSubscription.findMany({
        where: {
          endDate: {
            gte: targetDateStart,
            lt: targetDateEnd,
          },
          status: {
            not: 'cancelled'
          }
        },
        include: {
          gym: {
            include: {
              users: {
                where: { role: 'admin' },
                take: 1
              }
            }
          }
        }
      });

      for (const sub of expiringGyms) {
        const targetEmail = sub.gym.email || sub.gym.users[0]?.email;
        
        if (!targetEmail) {
          console.warn(`No email found for gym ${sub.gym.name} (ID: ${sub.gymId})`);
          continue;
        }

        try {
          const emailContent = getSaaSReminderEmailContent({
            email: targetEmail,
            gymName: sub.gym.name,
            daysRemaining,
            expiryDate: sub.endDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
            billingUrl: `${appUrl}/admin/billing`
          });
          
          emailBatch.push(emailContent);
          results.saasOwnersNotified++;
        } catch (error: any) {
          console.error(`Error preparing SaaS owner notification ${targetEmail}:`, error);
          results.errors.push(`SaaS Owner ${targetEmail}: ${error.message}`);
        }
      }
    }

    // ---------------------------------------------------------
    // SEND ALL EMAILS IN BATCHES
    // ---------------------------------------------------------
    if (emailBatch.length > 0) {
      try {
        await sendBatchEmails(emailBatch);
      } catch (error: any) {
        console.error('Failed to send email batch:', error);
        results.errors.push(`Batch send error: ${error.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Cron job executed successfully. Sent ${emailBatch.length} emails.`,
      results
    });

  } catch (error: any) {
    console.error('CRON JOB ERROR:', error);
    return new NextResponse(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

