import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import axios from 'axios';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.gymId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!['admin', 'owner'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden: Admins only' }, { status: 403 });
    }

    const { invoiceId, gymId } = await req.json();
    const targetGymId = gymId || user.gymId;

    if (user.gymId !== targetGymId) {
      return NextResponse.json({ error: 'Forbidden: Invalid gym' }, { status: 403 });
    }

    let amountToPay = 0;
    let targetInvoiceIds: string[] = [];
    let invoiceNumberDesc = '';

    if (invoiceId) {
      const invoice = await prisma.gymInvoice.findUnique({
        where: { id: invoiceId },
      });

      if (!invoice || invoice.gymId !== targetGymId) {
        return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
      }

      if (invoice.status === 'paid') {
        return NextResponse.json({ error: 'Invoice is already paid' }, { status: 400 });
      }

      amountToPay = invoice.amountDue - invoice.amountPaid;
      targetInvoiceIds = [invoice.id];
      invoiceNumberDesc = invoice.invoiceNumber;
    } else {
      // Pay all outstanding unpaid invoices
      const unpaidInvoices = await prisma.gymInvoice.findMany({
        where: {
          gymId: targetGymId,
          status: 'unpaid',
          amountDue: { gt: 0 },
        },
      });

      if (unpaidInvoices.length === 0) {
        return NextResponse.json({ error: 'No outstanding invoices due' }, { status: 400 });
      }

      amountToPay = unpaidInvoices.reduce((sum, inv) => sum + (inv.amountDue - inv.amountPaid), 0);
      targetInvoiceIds = unpaidInvoices.map((i) => i.id);
      invoiceNumberDesc = `Settlement of ${unpaidInvoices.length} invoice(s)`;
    }

    if (amountToPay <= 0) {
      return NextResponse.json({ error: 'Invalid amount to pay' }, { status: 400 });
    }

    const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
    if (!PAYSTACK_SECRET_KEY) {
      return NextResponse.json({ error: 'Paystack secret key not configured' }, { status: 500 });
    }

    const amountInKobo = Math.round(amountToPay * 100);

    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const callbackUrl = `${protocol}://${host}/payment/success`;

    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email: user.email,
        amount: amountInKobo,
        metadata: {
          type: 'invoice_payment',
          gymId: targetGymId,
          userId: user.id,
          invoiceIds: targetInvoiceIds,
          description: `GymPilotPro Platform Commission (${invoiceNumberDesc})`,
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
      reference: response.data.data.reference,
      amount: amountToPay,
    });
  } catch (error: any) {
    console.error('Invoice pay error:', error.response?.data || error.message);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
