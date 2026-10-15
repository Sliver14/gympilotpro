'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, Loader2, LogOut, CreditCard, ShieldAlert, CheckCircle2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionLockScreenProps {
  role: string;
  gymId: string;
  gymStatus?: string;
  currentPlan?: string;
  accent?: string;
  isUpgradeMode?: boolean;
  membersCount?: number;
}

export function SubscriptionLockScreen({
  role,
  gymId,
  gymStatus = 'active',
  accent = '#daa857',
}: SubscriptionLockScreenProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetchingBilling, setFetchingBilling] = useState(true);
  const [billingData, setBillingData] = useState<any>(null);

  const isAdmins = role === 'admin' || role === 'owner';
  const isPending = gymStatus === 'pending';

  useEffect(() => {
    async function fetchBilling() {
      try {
        const res = await fetch('/api/billing/invoices');
        if (res.ok) {
          const data = await res.json();
          setBillingData(data);
        }
      } catch (e) {
        console.error('Failed to load billing status:', e);
      } finally {
        setFetchingBilling(false);
      }
    }

    if (isAdmins) {
      fetchBilling();
    } else {
      setFetchingBilling(false);
    }
  }, [isAdmins]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error(e);
    } finally {
      window.location.href = '/login';
    }
  };

  const handlePayInvoice = async (invoiceId?: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/billing/invoice-pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gymId, invoiceId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to initialize payment');

      toast({
        title: 'Redirecting to Paystack',
        description: 'Please complete your settlement securely.',
      });

      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      }
    } catch (err: any) {
      toast({
        title: 'Payment Error',
        description: err.message || 'Could not initiate payment. Try again.',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  const totalDue = billingData?.totalOutstandingDue || 0;
  const unpaidInvoices = billingData?.invoices?.filter((i: any) => i.status === 'unpaid' && i.amountDue > 0) || [];

  return (
    <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-zinc-950 border border-red-500/30 shadow-2xl p-6 md:p-10 my-8 relative">
        <div className="absolute top-4 right-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-zinc-400 hover:text-white"
          >
            <LogOut className="h-4 w-4 mr-2" /> Logout
          </Button>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="h-14 w-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center shrink-0">
            <ShieldAlert className="h-8 w-8 text-red-500" />
          </div>
          <div>
            <span className="text-red-500 font-black tracking-widest text-xs uppercase block">
              // Account Restricted
            </span>
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white">
              {isPending ? 'Account Setup Incomplete' : 'Overdue Payment Restriction'}
            </h1>
          </div>
        </div>

        <p className="text-zinc-400 text-sm md:text-base leading-relaxed mb-6">
          {isPending ? (
            'Your gym account is currently pending activation.'
          ) : (
            'Access to member check-in scanners, attendance tracking, and registrations is temporarily restricted because platform commission payments are 2 or more months overdue.'
          )}
        </p>

        {isAdmins ? (
          <div className="space-y-6">
            {fetchingBilling ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              </div>
            ) : (
              <>
                <div className="bg-zinc-900/80 border border-zinc-800 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <span className="text-xs uppercase font-bold text-zinc-400 block mb-1">
                      Total Outstanding 5% Commission
                    </span>
                    <span className="text-3xl font-black text-orange-500">
                      ₦{totalDue.toLocaleString()}
                    </span>
                    <span className="text-xs text-zinc-500 block mt-1">
                      {unpaidInvoices.length} unpaid invoice{unpaidInvoices.length === 1 ? '' : 's'}
                    </span>
                  </div>

                  <Button
                    onClick={() => handlePayInvoice()}
                    disabled={loading || totalDue <= 0}
                    className="w-full md:w-auto h-12 px-8 bg-orange-500 hover:bg-orange-600 text-white font-black uppercase text-sm rounded-none shadow-[0_10px_20px_rgba(249,115,22,0.2)]"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    ) : (
                      <CreditCard className="h-5 w-5 mr-2" />
                    )}
                    Pay & Restore Access
                  </Button>
                </div>

                {unpaidInvoices.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
                      Overdue Monthly Invoices
                    </h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {unpaidInvoices.map((inv: any) => (
                        <div
                          key={inv.id}
                          className="flex items-center justify-between p-3 bg-zinc-900 border border-zinc-800 text-sm"
                        >
                          <div>
                            <span className="font-bold text-white block">{inv.invoiceNumber}</span>
                            <span className="text-xs text-zinc-400">
                              Billing Month: {inv.billingMonth} | Member Revenue: ₦{(inv.totalMemberRevenue || 0).toLocaleString()}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="font-black text-orange-400 block">
                              ₦{(inv.amountDue - inv.amountPaid).toLocaleString()}
                            </span>
                            <span className="text-[10px] text-red-400 uppercase font-bold">
                              Overdue
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="p-4 bg-zinc-900/50 border border-zinc-800 text-xs text-zinc-400 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>
                As soon as your payment is confirmed by Paystack, full dashboard and scanner access is instantly and automatically restored.
              </span>
            </div>
          </div>
        ) : (
          <div className="p-6 bg-zinc-900/80 border border-zinc-800 text-center space-y-3">
            <AlertCircle className="h-8 w-8 text-orange-500 mx-auto" />
            <h3 className="text-lg font-bold text-white">Administrator Action Required</h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              Please notify your gym owner or management to settle the outstanding monthly platform fee to resume operations.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
