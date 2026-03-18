import { NextResponse } from 'next/server';
import axios from 'axios';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { reference } = await req.json();

    if (!reference) {
      return NextResponse.json({ error: 'Missing reference' }, { status: 400 });
    }

    const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
    if (!PAYSTACK_SECRET_KEY) {
      return NextResponse.json({ error: 'Paystack secret key not configured' }, { status: 500 });
    }

    // 1. Check if our database already has it marked as success (from webhook)
    const existingPayment = await prisma.saaSPayment.findUnique({
      where: { reference },
    });

    if (existingPayment && existingPayment.status === 'success') {
      return NextResponse.json({ success: true, message: 'Payment verified via webhook' });
    }

    // 2. If webhook hasn't fired yet, check Paystack directly
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const { status, data } = response.data;

    if (status && data.status === 'success') {
      return NextResponse.json({ success: true, data });
    }

    return NextResponse.json({ success: false, message: 'Payment verification failed' }, { status: 400 });
  } catch (error: any) {
    console.error('Paystack Verification Error:', error.response?.data || error.message);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
