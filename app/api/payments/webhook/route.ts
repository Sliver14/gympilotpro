import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import axios from 'axios';

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
        const { gymId, userId, plan } = metadata;

        if (!gymId || !userId) {
          console.error('Webhook Error: Missing metadata (gymId or userId)', metadata);
          return NextResponse.json({ error: 'Invalid metadata' }, { status: 400 });
        }

        // 2. Perform updates in a database transaction
        await prisma.$transaction(async (tx) => {
          // Check if payment already exists
          const existingPayment = await tx.saaSPayment.findUnique({
            where: { reference },
          });

          if (!existingPayment) {
            // Store payment
            await tx.saaSPayment.create({
              data: {
                email: customer.email,
                amount: amount / 100, // Convert from Kobo
                plan: plan || 'Unknown',
                reference: reference,
                status: 'success',
                gymId: gymId,
                userId: userId,
              },
            });
          }

          // Activate Gym
          await tx.gym.update({
            where: { id: gymId },
            data: { status: 'active' },
          });

          // Activate User
          await tx.user.update({
            where: { id: userId },
            data: { status: 'active' },
          });

          // Create or update subscription
          const startDate = new Date();
          const endDate = new Date();
          endDate.setMonth(endDate.getMonth() + 1); // 1 month duration

          await tx.gymSubscription.create({
            data: {
              gymId: gymId,
              plan: plan,
              status: 'active',
              startDate: startDate,
              endDate: endDate,
            },
          });
        });

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
