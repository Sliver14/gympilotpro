import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import axios from 'axios';
import { sendMemberPaymentEmail } from '@/lib/email';

export async function POST(req: Request, { params }: { params: Promise<{ gymId: string }> }) {
  try {
    const { gymId } = await params;

    const gym = await prisma.gym.findUnique({
      where: { id: gymId }
    });

    if (!gym || !gym.paystackSecretKey) {
      console.error(`Webhook Error: Gym ${gymId} not found or missing Paystack Secret Key`);
      return NextResponse.json({ error: 'Invalid configuration' }, { status: 400 });
    }

    const PAYSTACK_SECRET_KEY = gym.paystackSecretKey;

    const signature = req.headers.get('x-paystack-signature');
    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    const rawBody = await req.text();
    const hash = crypto.createHmac('sha512', PAYSTACK_SECRET_KEY).update(rawBody).digest('hex');

    if (hash !== signature) {
      console.error(`Webhook Error [Gym ${gymId}]: Invalid signature`);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const eventData = JSON.parse(rawBody);

    if (eventData.event === 'charge.success') {
      const { reference, amount, metadata } = eventData.data;

      // Extra verification step via Paystack API
      const verifyRes = await axios.get(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
        }
      );

      const verificationData = verifyRes.data;

      if (verificationData.status && verificationData.data.status === 'success') {
        const { userId, type, paymentId, membershipId, months } = metadata || {};
        
        console.log(`Processing Gym Webhook: type=${type}, gymId=${gymId}, userId=${userId}`);

        if (!userId || !type) {
          console.error('Webhook Error: Missing metadata (userId or type)');
          return NextResponse.json({ error: 'Invalid metadata' }, { status: 400 });
        }

        const durationMonths = parseInt(months) || 1;
        const actualAmount = amount / 100; // Convert from Kobo

        if (type === 'member_signup' || type === 'admin_registration' || type === 'member_renewal' || type === 'member_payment') {
          // Idempotency Check
          if (paymentId) {
            const existingPayment = await prisma.payment.findUnique({ where: { id: paymentId } });
            if (existingPayment?.status === 'approved') {
              console.log(`Webhook Idempotency Check: Payment ${paymentId} already approved.`);
              return NextResponse.json({ success: true, message: 'Payment already processed' });
            }
          } else {
            const existingPayment = await prisma.payment.findUnique({ where: { reference } });
            if (existingPayment?.status === 'approved') {
              console.log(`Webhook Idempotency Check: Payment ${reference} already approved.`);
              return NextResponse.json({ success: true, message: 'Payment already processed' });
            }
          }

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
                  description: 'Online membership payment',
                },
              });
            }

            const memberProfile = await tx.memberProfile.findUnique({
              where: { userId },
            });

            const now = new Date();
            let newExpiry = new Date();
            
            if (memberProfile && memberProfile.expiryDate && new Date(memberProfile.expiryDate) > now) {
              // Extend existing active membership
              newExpiry = new Date(memberProfile.expiryDate);
            }
            newExpiry.setMonth(newExpiry.getMonth() + durationMonths);

            if (memberProfile) {
              await tx.memberProfile.update({
                where: { userId },
                data: { 
                  expiryDate: newExpiry,
                  paymentStatus: 'approved',
                  verified: true // Ensure they are active
                },
              });
            }

            const memberUser = await tx.user.update({
              where: { id: userId },
              data: { status: 'active' }
            });
            
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
        } else {
          console.warn(`Unknown gym payment type: ${type}`);
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
