import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getGymBillingOverview } from '@/lib/billing';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.gymId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!['admin', 'owner'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden: Admins only' }, { status: 403 });
    }

    const billingOverview = await getGymBillingOverview(user.gymId);

    return NextResponse.json({
      success: true,
      ...billingOverview,
    });
  } catch (error: any) {
    console.error('Error fetching gym invoices:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch billing data' },
      { status: 500 }
    );
  }
}
