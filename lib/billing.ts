import { prisma } from '@/lib/prisma';

export const PLATFORM_COMMISSION_RATE = 0.05; // 5%

export interface BillingOverview {
  currentCycleRevenue: number;
  currentCycleEstimatedFee: number;
  totalOutstandingDue: number;
  unpaidInvoicesCount: number;
  oldestUnpaidInvoiceMonthsAgo: number;
  billingStatus: 'active' | 'warning' | 'restricted';
  isRestricted: boolean;
  restrictionReason?: string | null;
  invoices: any[];
}

/**
 * Calculates approved member subscription revenue and 5% fee for a gym in a given date range.
 */
export async function calculateGymRevenueAndFee(gymId: string, startDate: Date, endDate: Date) {
  const payments = await prisma.payment.findMany({
    where: {
      gymId,
      status: 'approved',
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      id: true,
      amount: true,
      createdAt: true,
      paymentMethod: true,
      description: true,
    },
  });

  const totalMemberRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const commissionAmount = Math.round(totalMemberRevenue * PLATFORM_COMMISSION_RATE * 100) / 100;

  return {
    paymentsCount: payments.length,
    totalMemberRevenue,
    commissionAmount,
    payments,
  };
}

/**
 * Generates a monthly 5% commission invoice for a gym.
 * If total revenue is 0, the invoice is automatically marked as 'paid'.
 */
export async function generateMonthlyInvoice(
  gymId: string,
  periodStart: Date,
  periodEnd: Date,
  billingMonth: string // e.g. "2026-03"
) {
  // Check if invoice already exists for this gym and billing month
  const existing = await prisma.gymInvoice.findFirst({
    where: {
      gymId,
      billingMonth,
    },
  });

  if (existing) {
    return existing;
  }

  const { totalMemberRevenue, commissionAmount } = await calculateGymRevenueAndFee(
    gymId,
    periodStart,
    periodEnd
  );

  const gym = await prisma.gym.findUnique({
    where: { id: gymId },
    select: { slug: true },
  });

  const slugSuffix = (gym?.slug || gymId).substring(0, 4).toUpperCase();
  const invoiceNumber = `INV-${billingMonth}-${slugSuffix}-${Math.floor(1000 + Math.random() * 9000)}`;

  // Due date is 14 days after period end
  const dueDate = new Date(periodEnd);
  dueDate.setDate(dueDate.getDate() + 14);

  // If revenue was ₦0, fee is 0, so mark it immediately paid
  const isZeroDue = commissionAmount <= 0;

  const invoice = await prisma.gymInvoice.create({
    data: {
      gymId,
      invoiceNumber,
      periodStart,
      periodEnd,
      billingMonth,
      totalMemberRevenue,
      commissionRate: PLATFORM_COMMISSION_RATE,
      amountDue: commissionAmount,
      amountPaid: isZeroDue ? 0 : 0,
      status: isZeroDue ? 'paid' : 'unpaid',
      dueDate,
      paidAt: isZeroDue ? new Date() : null,
    },
  });

  return invoice;
}

/**
 * Evaluates whether a gym must be restricted due to unpaid invoices older than 2 months (60 days).
 * Returns the updated gym record.
 */
export async function evaluateGymRestriction(gymId: string) {
  const now = new Date();
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  // Find all unpaid invoices
  const unpaidInvoices = await prisma.gymInvoice.findMany({
    where: {
      gymId,
      status: 'unpaid',
      amountDue: { gt: 0 },
    },
    orderBy: { periodEnd: 'asc' },
  });

  if (unpaidInvoices.length === 0) {
    // All paid or zero invoices -> ensure active status
    const gym = await prisma.gym.update({
      where: { id: gymId },
      data: {
        billingStatus: 'active',
        // Only unrestrict if the restriction was billing-related
        status: 'active',
        restrictedAt: null,
        restrictionReason: null,
      },
    });
    return { isRestricted: false, billingStatus: 'active', gym };
  }

  // Check if any unpaid invoice ended more than 60 days ago OR there are 2 or more unpaid invoices
  const overduePast2Months = unpaidInvoices.some((inv) => new Date(inv.periodEnd) < sixtyDaysAgo);
  const hasTwoOrMoreUnpaidCycles = unpaidInvoices.length >= 2;

  if (overduePast2Months || hasTwoOrMoreUnpaidCycles) {
    // RESTRICT
    const reason = overduePast2Months
      ? 'Platform commission invoice is more than 2 months overdue.'
      : 'Account has 2 or more consecutive unpaid monthly invoices.';

    const gym = await prisma.gym.update({
      where: { id: gymId },
      data: {
        billingStatus: 'restricted',
        status: 'restricted',
        restrictedAt: now,
        restrictionReason: reason,
      },
    });

    return { isRestricted: true, billingStatus: 'restricted', gym, reason };
  }

  // 1 month unpaid -> warning
  const gym = await prisma.gym.update({
    where: { id: gymId },
    data: {
      billingStatus: 'warning',
      status: 'active',
    },
  });

  return { isRestricted: false, billingStatus: 'warning', gym };
}

/**
 * Gets a full billing overview for a gym admin dashboard.
 */
export async function getGymBillingOverview(gymId: string): Promise<BillingOverview> {
  const gym = await prisma.gym.findUnique({
    where: { id: gymId },
    select: {
      id: true,
      status: true,
      billingStatus: true,
      restrictedAt: true,
      restrictionReason: true,
    },
  });

  const now = new Date();
  // Current month cycle: from 1st of current month to now
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const { totalMemberRevenue, commissionAmount } = await calculateGymRevenueAndFee(
    gymId,
    currentMonthStart,
    now
  );

  // Invoices list
  const invoices = await prisma.gymInvoice.findMany({
    where: { gymId },
    orderBy: { periodEnd: 'desc' },
  });

  const unpaidInvoices = invoices.filter((i) => i.status === 'unpaid' && i.amountDue > 0);
  const totalOutstandingDue = unpaidInvoices.reduce((sum, i) => sum + (i.amountDue - i.amountPaid), 0);

  let oldestUnpaidMonthsAgo = 0;
  if (unpaidInvoices.length > 0) {
    const oldest = unpaidInvoices[unpaidInvoices.length - 1];
    const diffMs = now.getTime() - new Date(oldest.periodEnd).getTime();
    oldestUnpaidMonthsAgo = Math.max(0, Math.floor(diffMs / (30 * 24 * 60 * 60 * 1000)));
  }

  const isRestricted =
    gym?.billingStatus === 'restricted' ||
    gym?.status === 'restricted' ||
    oldestUnpaidMonthsAgo >= 2 ||
    unpaidInvoices.length >= 2;

  const billingStatus = isRestricted
    ? 'restricted'
    : unpaidInvoices.length > 0
    ? 'warning'
    : 'active';

  return {
    currentCycleRevenue: totalMemberRevenue,
    currentCycleEstimatedFee: commissionAmount,
    totalOutstandingDue,
    unpaidInvoicesCount: unpaidInvoices.length,
    oldestUnpaidInvoiceMonthsAgo: oldestUnpaidMonthsAgo,
    billingStatus,
    isRestricted,
    restrictionReason: gym?.restrictionReason,
    invoices,
  };
}

/**
 * Settles a GymInvoice by reference, marks it paid, and re-evaluates restriction.
 */
export async function settleGymInvoice(invoiceId: string, reference: string, amountPaid: number) {
  const invoice = await prisma.gymInvoice.update({
    where: { id: invoiceId },
    data: {
      status: 'paid',
      amountPaid: amountPaid,
      paidAt: new Date(),
      paymentReference: reference,
    },
  });

  // Re-evaluate gym restriction status
  await evaluateGymRestriction(invoice.gymId);

  return invoice;
}
