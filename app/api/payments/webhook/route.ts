import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import axios from 'axios';
import { sendSignupEmail, sendRenewalEmail, sendUpgradeEmail, sendMemberPaymentEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
    if (!PAYSTACK_SECRET_KEY) {
      console.error('Webhook Error: PAYSTACK_SECRET_KEY is missing');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const signature = req.headers.get('x-paystack-signature');
    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    const rawBody = await req.text();
    const hash = crypto.createHmac('sha512', PAYSTACK_SECRET_KEY).update(rawBody).digest('hex');

    if (hash !== signature) {
      console.error('Webhook Error: Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const eventData = JSON.parse(rawBody);

    if (eventData.event === 'charge.success') {
      const { reference, amount, customer, metadata } = eventData.data;

      // 1. Extra verification step via Paystack API to ensure transaction authenticity
      const verifyRes = await axios.get(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
        }
      );

      const verificationData = verifyRes.data;

      if (verificationData.status && verificationData.data.status === 'success') {
        const { gymId, userId, plan, months, isNewUser } = metadata || {};
        const paymentType = metadata?.type || 'signup';

        console.log(`Processing Webhook: type=${paymentType}, gymId=${gymId}`);

        if (!gymId || !userId) {
          console.error('Webhook Error: Missing metadata (gymId or userId)', metadata);
          return NextResponse.json({ error: 'Invalid metadata' }, { status: 400 });
        }

        const durationMonths = parseInt(months) || 1;
        const actualAmount = amount / 100; // Convert from Kobo

        // Store payment for SaaS billing (signup, renewal, upgrade)
        if (['signup', 'renewal', 'upgrade'].includes(paymentType)) {
          const existingPayment = await prisma.saaSPayment.findUnique({
            where: { reference },
          });

          if (!existingPayment) {
            await prisma.saaSPayment.create({
              data: {
                email: customer.email,
                amount: actualAmount,
                plan: plan || 'Unknown',
                reference: reference,
                status: 'success',
                gymId: gymId,
                userId: userId,
              },
            });
          } else {
            await prisma.saaSPayment.update({
              where: { reference },
              data: { status: 'success' },
            });
          }
        }

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://gympilotpro.com';

        switch (paymentType) {
          case 'signup': {
            const result = await prisma.$transaction(async (tx) => {
              const activatedGym = await tx.gym.update({
                where: { id: gymId },
                data: { status: 'active' },
              });
              const activatedUser = await tx.user.update({
                where: { id: userId },
                data: { status: 'active' },
              });
              const startDate = new Date();
              const endDate = new Date();
              endDate.setMonth(endDate.getMonth() + durationMonths);

              await tx.gymSubscription.create({
                data: {
                  gymId: gymId,
                  plan: plan || 'pro',
                  status: 'active',
                  startDate: startDate,
                  endDate: endDate,
                },
              });
              return { activatedGym, activatedUser };
            });

            const dashboardLoginUrl = baseUrl.replace('://', `://${result.activatedGym.slug}.`) + '/login';
            
            await sendSignupEmail({
              email: result.activatedUser.email,
              firstName: result.activatedUser.firstName,
              gymName: result.activatedGym.name,
              loginUrl: dashboardLoginUrl,
              isNewUser: isNewUser === true || isNewUser === 'true'
            });
            break;
          }

          case 'renewal': {
            const result = await prisma.$transaction(async (tx) => {
              const gym = await tx.gym.findUnique({ where: { id: gymId } });
              const user = await tx.user.findUnique({ where: { id: userId } });
              
              const latestSub = await tx.gymSubscription.findFirst({
                where: { gymId },
                orderBy: { endDate: 'desc' },
              });

              const now = new Date();
              let newEndDate = latestSub && latestSub.endDate > now ? new Date(latestSub.endDate) : now;
              newEndDate.setMonth(newEndDate.getMonth() + durationMonths);

              if (latestSub) {
                await tx.gymSubscription.update({
                  where: { id: latestSub.id },
                  data: { status: 'active', endDate: newEndDate },
                });
              } else {
                await tx.gymSubscription.create({
                  data: {
                    gymId,
                    plan: plan || 'pro',
                    status: 'active',
                    startDate: now,
                    endDate: newEndDate,
                  },
                });
              }
              
              return { gym, user, newEndDate };
            });

            if (result.gym && result.user) {
              const dashboardLoginUrl = baseUrl.replace('://', `://${result.gym.slug}.`) + '/login';
              await sendRenewalEmail({
                email: result.user.email,
                gymName: result.gym.name,
                amount: actualAmount,
                nextBillingDate: result.newEndDate.toLocaleDateString(),
                dashboardUrl: dashboardLoginUrl,
              });
            }
            break;
          }

          case 'upgrade': {
            const result = await prisma.$transaction(async (tx) => {
              const gym = await tx.gym.findUnique({ where: { id: gymId } });
              const user = await tx.user.findUnique({ where: { id: userId } });
              
              const latestSub = await tx.gymSubscription.findFirst({
                where: { gymId },
                orderBy: { endDate: 'desc' },
              });

              const now = new Date();
              const newEndDate = new Date();
              newEndDate.setMonth(newEndDate.getMonth() + durationMonths);

              if (latestSub) {
                await tx.gymSubscription.update({
                  where: { id: latestSub.id },
                  data: { 
                    plan: plan || latestSub.plan,
                    status: 'active',
                    startDate: now,
                    endDate: newEndDate
                  },
                });
              } else {
                await tx.gymSubscription.create({
                  data: {
                    gymId,
                    plan: plan || 'pro',
                    status: 'active',
                    startDate: now,
                    endDate: newEndDate,
                  },
                });
              }
              
              return { gym, user, newEndDate };
            });

            if (result.gym && result.user) {
              const dashboardLoginUrl = baseUrl.replace('://', `://${result.gym.slug}.`) + '/login';
              await sendUpgradeEmail({
                email: result.user.email,
                gymName: result.gym.name,
                planName: plan || 'New Plan',
                dashboardUrl: dashboardLoginUrl,
              });
            }
            break;
          }

          case 'member_payment': {
            const { paymentId } = metadata;

            const result = await prisma.$transaction(async (tx) => {
              let paymentRecord;
              if (paymentId) {
                paymentRecord = await tx.payment.update({
                  where: { id: paymentId },
                  data: { status: 'approved', reference },
                });
              } else {
                paymentRecord = await tx.payment.create({
                  data: {
                    gymId,
                    userId,
                    amount: actualAmount,
                    status: 'approved',
                    paymentMethod: 'Paystack',
                    reference,
                    description: 'Online membership renewal',
                  },
                });
              }

              const memberProfile = await tx.memberProfile.findUnique({
                where: { userId },
              });

              let newExpiry = new Date();
              if (memberProfile && memberProfile.expiryDate && new Date(memberProfile.expiryDate) > newExpiry) {
                newExpiry = new Date(memberProfile.expiryDate);
              }
              newExpiry.setMonth(newExpiry.getMonth() + durationMonths);

              if (memberProfile) {
                await tx.memberProfile.update({
                  where: { userId },
                  data: { expiryDate: newExpiry },
                });
              }

              const gym = await tx.gym.findUnique({ where: { id: gymId } });
              const memberUser = await tx.user.findUnique({ where: { id: userId } });
              
              const adminUser = await tx.user.findFirst({
                where: { gymId, role: { in: ['admin', 'owner'] } },
              });

              return { gym, memberUser, adminUser, newExpiry, paymentRecord };
            });

            if (result.gym && result.memberUser) {
              await sendMemberPaymentEmail({
                memberEmail: result.memberUser.email,
                adminEmail: result.adminUser?.email || '',
                memberName: result.memberUser.firstName + ' ' + result.memberUser.lastName,
                gymName: result.gym.name,
                amount: actualAmount,
                expiryDate: result.newExpiry.toLocaleDateString(),
                datePaid: new Date().toLocaleDateString(),
              });
            }
            break;
          }

          default:
            console.warn(`Unknown payment type: ${paymentType}`);
            break;
        }

        return NextResponse.json({ success: true, message: 'Webhook processed successfully' });
      } else {
        console.error('Webhook Error: Transaction verification failed');
        return NextResponse.json({ error: 'Transaction verification failed' }, { status: 400 });
      }
    }

    return NextResponse.json({ success: true, message: 'Event ignored' });
  } catch (error: any) {
    console.error('Webhook Processing Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
