'use client';

import { useEffect, useState, Suspense, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import { useGym } from '@/components/gym-provider';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  CreditCard,
  ShieldCheck,
  AlertTriangle,
  Receipt,
  TrendingUp,
  Clock,
  CheckCircle2,
  Calendar,
  Loader2,
} from 'lucide-react';

function AdminBillingContent() {
  const router = useRouter();
  const { gymData } = useGym();
  const [adminData, setAdminData] = useState<any>(null);
  const [billingData, setBillingData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [payingInvoiceId, setPayingInvoiceId] = useState<string | null>(null);

  const fetchBillingData = useCallback(async () => {
    try {
      const [userRes, billRes] = await Promise.all([
        fetch('/api/auth/user'),
        fetch('/api/billing/invoices'),
      ]);

      if (!userRes.ok) return router.push('/login');
      const userData = await userRes.json();

      if (!['admin', 'owner'].includes(userData.role)) {
        return router.push('/member/dashboard');
      }

      setAdminData(userData);

      if (billRes.ok) {
        const bData = await billRes.json();
        setBillingData(bData);
      }
    } catch (error) {
      toast.error('Failed to load billing details');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchBillingData();
  }, [fetchBillingData]);

  const handlePayInvoice = async (invoiceId?: string) => {
    setPayingInvoiceId(invoiceId || 'all');
    try {
      const res = await fetch('/api/billing/invoice-pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gymId: gymData?.id,
          invoiceId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to initialize payment');

      toast.info('Redirecting to Paystack secure checkout...');
      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      }
    } catch (err: any) {
      toast.error(err.message || 'Payment failed to initiate');
      setPayingInvoiceId(null);
    }
  };

  if (isLoading || !adminData || !gymData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner className="h-8 w-8 text-orange-500" />
      </div>
    );
  }

  const totalOutstanding = billingData?.totalOutstandingDue || 0;
  const isRestricted = billingData?.isRestricted || gymData.status === 'restricted';
  const invoices = billingData?.invoices || [];
  const currentMonthRevenue = billingData?.currentCycleRevenue || 0;
  const currentMonthEstimatedFee = billingData?.currentCycleEstimatedFee || 0;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <span className="text-orange-500 text-xs font-black tracking-widest uppercase block mb-1">
            // Revenue-Share Model (5%)
          </span>
          <h1 className="text-3xl font-black uppercase tracking-tight text-foreground">
            Platform Fee & Invoicing
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Transparent 5% platform fee on member subscriptions. Invoiced monthly with a 2-month grace period.
          </p>
        </div>

        {totalOutstanding > 0 && (
          <Button
            onClick={() => handlePayInvoice()}
            disabled={payingInvoiceId !== null}
            className="h-12 px-6 bg-orange-500 hover:bg-orange-600 text-white font-black uppercase text-sm rounded-none shadow-[0_10px_20px_rgba(249,115,22,0.2)]"
          >
            {payingInvoiceId === 'all' ? (
              <Loader2 className="animate-spin h-4 w-4 mr-2" />
            ) : (
              <CreditCard className="h-4 w-4 mr-2" />
            )}
            Pay Full Balance (₦{totalOutstanding.toLocaleString()})
          </Button>
        )}
      </div>

      {/* Account Status Alert */}
      {isRestricted ? (
        <div className="p-4 bg-red-500/10 border-2 border-red-500/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-red-500 shrink-0" />
            <div>
              <h3 className="font-bold text-red-500 uppercase text-sm">
                Account Restricted: 2+ Months Overdue
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Check-in scanners and registrations are currently locked. Settle your outstanding invoice(s) to instantly restore full access.
              </p>
            </div>
          </div>
          <Button
            onClick={() => handlePayInvoice()}
            disabled={payingInvoiceId !== null}
            className="h-10 px-5 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase"
          >
            Settle Balance Now
          </Button>
        </div>
      ) : totalOutstanding > 0 ? (
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 flex items-center gap-3 text-sm">
          <Clock className="h-5 w-5 text-yellow-500 shrink-0" />
          <p className="text-muted-foreground text-xs md:text-sm">
            <strong className="text-yellow-500 uppercase">Payment Pending:</strong> You have an outstanding balance of ₦{totalOutstanding.toLocaleString()}. Gyms have a 2-month window to settle invoices before account restriction.
          </p>
        </div>
      ) : (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-sm">
          <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0" />
          <p className="text-muted-foreground text-xs md:text-sm">
            <strong className="text-emerald-500 uppercase">Account In Good Standing:</strong> All previous monthly platform fee invoices have been settled.
          </p>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <span className="text-xs font-bold text-muted-foreground uppercase flex items-center justify-between">
              This Month's Member Revenue
              <TrendingUp className="h-4 w-4 text-orange-500" />
            </span>
            <CardTitle className="text-2xl font-black text-foreground">
              ₦{currentMonthRevenue.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[11px] text-muted-foreground">
              Approved member payments this cycle
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <span className="text-xs font-bold text-muted-foreground uppercase flex items-center justify-between">
              Estimated 5% Fee (Current Month)
              <Receipt className="h-4 w-4 text-orange-500" />
            </span>
            <CardTitle className="text-2xl font-black text-orange-500">
              ₦{currentMonthEstimatedFee.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[11px] text-muted-foreground">
              Will be invoiced on the 1st of next month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <span className="text-xs font-bold text-muted-foreground uppercase flex items-center justify-between">
              Outstanding Overdue Balance
              <CreditCard className="h-4 w-4 text-red-500" />
            </span>
            <CardTitle className="text-2xl font-black text-foreground">
              ₦{totalOutstanding.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[11px] text-muted-foreground">
              {billingData?.unpaidInvoicesCount || 0} unpaid invoice(s)
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <span className="text-xs font-bold text-muted-foreground uppercase flex items-center justify-between">
              Account Status
              <Calendar className="h-4 w-4 text-emerald-500" />
            </span>
            <CardTitle className="text-xl font-black uppercase">
              {isRestricted ? (
                <span className="text-red-500">Restricted</span>
              ) : totalOutstanding > 0 ? (
                <span className="text-yellow-500">Warning (Pending)</span>
              ) : (
                <span className="text-emerald-500">Active</span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[11px] text-muted-foreground">
              {isRestricted ? 'Restricted (2+ months overdue)' : 'Full feature & scanner access'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Invoice History */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-xl font-black uppercase text-foreground flex items-center justify-between">
            <span>Monthly Invoices History</span>
            <span className="text-xs font-normal text-muted-foreground">
              Rate: 5% of monthly member revenue
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              <Receipt className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
              <p>No monthly invoices generated yet.</p>
              <p className="text-xs mt-1">Invoices are automatically issued at the conclusion of each billing month.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-muted-foreground">Invoice #</TableHead>
                  <TableHead className="text-muted-foreground">Billing Month</TableHead>
                  <TableHead className="text-muted-foreground">Member Revenue</TableHead>
                  <TableHead className="text-muted-foreground">5% Platform Fee</TableHead>
                  <TableHead className="text-muted-foreground">Due Date</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-right text-muted-foreground">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((inv: any) => {
                  const isPaid = inv.status === 'paid';
                  const remaining = inv.amountDue - inv.amountPaid;

                  return (
                    <TableRow key={inv.id} className="border-border hover:bg-muted/30">
                      <TableCell className="font-mono font-bold text-foreground">
                        {inv.invoiceNumber}
                      </TableCell>
                      <TableCell className="text-foreground">
                        {inv.billingMonth}
                      </TableCell>
                      <TableCell className="font-medium text-foreground">
                        ₦{(inv.totalMemberRevenue || 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="font-black text-orange-500">
                        ₦{inv.amountDue.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(inv.dueDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {isPaid ? (
                          <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            Paid
                          </Badge>
                        ) : (
                          <Badge className="bg-red-500/20 text-red-400 border border-red-500/30">
                            Unpaid
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {!isPaid && remaining > 0 ? (
                          <Button
                            size="sm"
                            onClick={() => handlePayInvoice(inv.id)}
                            disabled={payingInvoiceId !== null}
                            className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs h-8 px-4"
                          >
                            {payingInvoiceId === inv.id ? (
                              <Loader2 className="animate-spin h-3 w-3" />
                            ) : (
                              'Pay Now'
                            )}
                          </Button>
                        ) : (
                          <span className="text-xs text-emerald-500 flex items-center justify-end gap-1">
                            <CheckCircle2 className="h-4 w-4" /> Settled
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminBilling() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Spinner className="h-8 w-8 text-orange-500" />
        </div>
      }
    >
      <AdminBillingContent />
    </Suspense>
  );
}
