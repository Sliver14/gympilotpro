import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import axios from 'axios';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

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
        const result = await prisma.$transaction(async (tx) => {
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
          const activatedGym = await tx.gym.update({
            where: { id: gymId },
            data: { status: 'active' },
          });

          // Activate User
          const activatedUser = await tx.user.update({
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

          return { activatedGym, activatedUser };
        });

        const { activatedGym, activatedUser } = result;

        // Build the Gym Dashboard URL dynamically based on current environment
        // The NEXT_PUBLIC_APP_URL is "https://gympilotpro.com" in prod.
        // We replace '://' with '://<slug>.' to dynamically create "https://slug.gympilotpro.com/login"
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://gympilotpro.com';
        const dashboardLoginUrl = baseUrl.replace('://', `://${activatedGym.slug}.`) + '/login';

        // 3. Send successful payment & login details email via Resend
        await resend.emails.send({
          from: 'GymPilotPro <noreply@klimarsspace.com>',
          to: activatedUser.email,
          subject: `Your GymPilotPro Account is Live! (${activatedGym.name})`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #10b981;">Payment Successful - Account Activated</h2>
              <p>Hi ${activatedUser.firstName},</p>
              <p>Congratulations! Your payment of ₦${amount / 100} has been received and your GymPilotPro dashboard for <strong>${activatedGym.name}</strong> is now live.</p>
              
              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #374151;">Your Login Credentials</h3>
                <p><strong>Login URL:</strong> <a href="${dashboardLoginUrl}">${dashboardLoginUrl}</a></p>
                <p><strong>Admin Email:</strong> ${activatedUser.email}</p>
                <p><strong>Default Password:</strong> ChangeMe123!</p>
              </div>

              <p style="color: #ef4444; font-weight: bold;">Please log in immediately and change your default password for security purposes.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${dashboardLoginUrl}" style="background-color: #f97316; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                  Go to My Dashboard
                </a>
              </div>
              
              <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
              <p style="color: #6b7280; font-size: 14px;">Welcome to the GymPilotPro family! We are thrilled to help you automate and grow your business.</p>
            </div>
          `,
        }).catch(err => console.error('Failed to send activation email:', err));

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
