import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendGymMemberReminderEmail, sendSaaSReminderEmail } from '@/lib/email';

// The days we want to trigger emails for Gym Members
const MEMBER_REMINDER_DAYS = [3, 1, 0];
// The days we want to trigger emails for SaaS Owners
const SAAS_REMINDER_DAYS = [7, 3, 0];

export async function GET(request: Request) {
  try {
    // 1. Verify Authorization
    // Vercel sends a specific header for cron jobs. If you are testing locally, you can pass a bearer token.
    const authHeader = request.headers.get('authorization');
    const vercelCronHeader = request.headers.get('x-vercel-cron'); // Optional: check if from vercel
    
    // Check against a secret environment variable
    if (
      authHeader !== `Bearer ${process.env.CRON_SECRET}` && 
      (!vercelCronHeader || process.env.NODE_ENV === 'development') // allow local testing with just the token
    ) {
      if (process.env.NODE_ENV !== 'development' || !authHeader) {
         return new NextResponse('Unauthorized', { status: 401 });
      }
    }

    const now = new Date();
    // Start of current day (midnight)
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const results = {
      membersNotified: 0,
      saasOwnersNotified: 0,
      errors: [] as string[]
    };

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://gympilotpro.com';

    // ---------------------------------------------------------
    // PROCESS GYM MEMBERS
    // ---------------------------------------------------------
    for (const daysRemaining of MEMBER_REMINDER_DAYS) {
      // Calculate target expiry date: today + daysRemaining
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
            deletedAt: null, // Ensure user isn't deleted
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
            : `https://${profile.gym.slug}.gympilotpro.com`; // Fallback to a subdomain structure if you use it

          await sendGymMemberReminderEmail({
            email: profile.user.email,
            firstName: profile.user.firstName,
            gymName: profile.gym.name,
            daysRemaining,
            expiryDate: profile.expiryDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
            renewalUrl: `${gymDomain}/member/renew-membership`
          });
          results.membersNotified++;
        } catch (error: any) {
          console.error(`Error notifying member ${profile.user.email}:`, error);
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
            not: 'cancelled' // Don't remind cancelled subscriptions
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
        // Fallback: use gym email first, then first admin's email
        const targetEmail = sub.gym.email || sub.gym.users[0]?.email;
        
        if (!targetEmail) {
          console.warn(`No email found for gym ${sub.gym.name} (ID: ${sub.gymId})`);
          continue;
        }

        try {
          await sendSaaSReminderEmail({
            email: targetEmail,
            gymName: sub.gym.name,
            daysRemaining,
            expiryDate: sub.endDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
            billingUrl: `${appUrl}/admin/billing`
          });
          results.saasOwnersNotified++;
        } catch (error: any) {
          console.error(`Error notifying SaaS owner ${targetEmail}:`, error);
          results.errors.push(`SaaS Owner ${targetEmail}: ${error.message}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Cron job executed successfully',
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
