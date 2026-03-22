'use client'

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

import { PLANS, DURATIONS, PlanKey, calculatePrice } from '@/lib/plans';

function GetStartedContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    fullName: '',
    gymName: '',
    email: '',
    phone: '',
    plan: 'starter' as PlanKey,
    months: 1
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const planParam = searchParams.get('plan')?.toLowerCase() as PlanKey;
    const monthsParam = parseInt(searchParams.get('months') || '1');

    if (planParam && PLANS[planParam]) {
      setFormData(prev => ({ ...prev, plan: planParam, months: monthsParam || 1 }));
    } else if (monthsParam) {
      setFormData(prev => ({ ...prev, months: monthsParam }));
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'months' ? parseInt(value) : value }));
  };

  const pricing = calculatePrice(formData.plan, formData.months, true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Create Gym and User
      const registerRes = await fetch('/api/auth/register-gym', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          gymName: formData.gymName,
          email: formData.email,
          phone: formData.phone,
          plan: formData.plan
        }),
      });

      const registerData = await registerRes.json();

      if (!registerRes.ok) {
        throw new Error(registerData.error || 'Failed to create account');
      }

      const { gymId, userId } = registerData;

      // 2. Initialize Payment
      const paymentRes = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          amount: pricing.total,
          plan: formData.plan,
          months: formData.months,
          gymId,
          userId
        }),
      });

      const paymentData = await paymentRes.json();

      if (!paymentRes.ok) {
        throw new Error(paymentData.error || 'Failed to initialize payment');
      }

      if (paymentData.status && paymentData.data?.authorization_url) {
        window.location.href = paymentData.data.authorization_url;
      } else {
        throw new Error('Invalid response from payment provider');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 py-24">
      <div className="w-full max-w-xl bg-white/5 border border-border p-10 shadow-2xl relative">
        <div className="text-center mb-10">
          <span className="text-orange-500 font-black italic uppercase tracking-[0.2em] text-sm mb-4 block">
            // Onboarding
          </span>
          <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter mb-4 text-foreground">
            Create Your Gym
          </h1>
          <p className="text-muted-foreground font-medium">Set up your account and complete your payment to get started.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase text-muted-foreground mb-2">Full Name</label>
              <input 
                type="text" 
                name="fullName"
                required
                disabled={loading}
                value={formData.fullName}
                onChange={handleChange}
                placeholder="JOHN DOE" 
                className="w-full bg-transparent border-2 border-border p-4 font-black italic uppercase focus:border-orange-500 outline-none transition-colors text-foreground"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-muted-foreground mb-2">Gym Name</label>
              <input 
                type="text" 
                name="gymName"
                required
                disabled={loading}
                value={formData.gymName}
                onChange={handleChange}
                placeholder="IRON FITNESS" 
                className="w-full bg-transparent border-2 border-border p-4 font-black italic uppercase focus:border-orange-500 outline-none transition-colors text-foreground"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase text-muted-foreground mb-2">Email Address</label>
              <input 
                type="email" 
                name="email"
                required
                disabled={loading}
                value={formData.email}
                onChange={handleChange}
                placeholder="HELLO@GYM.COM" 
                className="w-full bg-transparent border-2 border-border p-4 font-black italic uppercase focus:border-orange-500 outline-none transition-colors text-foreground"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-muted-foreground mb-2">Phone (WhatsApp)</label>
              <input 
                type="tel" 
                name="phone"
                required
                disabled={loading}
                value={formData.phone}
                onChange={handleChange}
                placeholder="+234 800 000 0000" 
                className="w-full bg-transparent border-2 border-border p-4 font-black italic uppercase focus:border-orange-500 outline-none transition-colors text-foreground"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase text-muted-foreground mb-2">Selected Plan</label>
              <div className="relative">
                <select 
                  name="plan"
                  disabled={loading}
                  value={formData.plan}
                  onChange={handleChange}
                  className="w-full bg-background border-2 border-border p-4 font-black italic uppercase focus:border-orange-500 outline-none transition-colors text-foreground appearance-none cursor-pointer"
                >
                  {Object.values(PLANS).map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-orange-500">▼</div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-muted-foreground mb-2">Duration</label>
              <div className="relative">
                <select 
                  name="months"
                  disabled={loading}
                  value={formData.months}
                  onChange={handleChange}
                  className="w-full bg-background border-2 border-border p-4 font-black italic uppercase focus:border-orange-500 outline-none transition-colors text-foreground appearance-none cursor-pointer"
                >
                  {DURATIONS.map(d => (
                    <option key={d.months} value={d.months}>{d.label}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-orange-500">▼</div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-border">
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-xs font-bold uppercase text-muted-foreground">
                <span>Setup Fee</span>
                <span>₦{pricing.setupFeeCharge.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs font-bold uppercase text-muted-foreground">
                <span>{formData.months} Month(s) Access</span>
                <span>₦{pricing.monthlyTotal.toLocaleString()}</span>
              </div>
              {pricing.discountAmount > 0 && (
                <div className="flex justify-between text-xs font-bold uppercase text-green-500">
                  <span>Discount Applied</span>
                  <span>-₦{pricing.discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-xl font-black italic uppercase text-foreground pt-2">
                <span>Total Due Today</span>
                <span className="text-orange-500">₦{pricing.total.toLocaleString()}</span>
              </div>
            </div>

            {error && (
              <div className="p-4 mb-6 bg-red-500/10 border border-red-500/50 text-red-500 text-sm font-bold uppercase flex items-center gap-3">
                <AlertCircle size={20} /> {error}
              </div>
            )}

            <Button 
              type="submit"
              disabled={loading}
              className="w-full h-16 bg-orange-500 hover:bg-orange-600 text-black font-black italic uppercase text-lg rounded-none disabled:opacity-70 flex items-center justify-center transition-transform active:scale-95"
            >
              {loading ? <Loader2 className="animate-spin" /> : `Proceed to Payment`}
            </Button>
            <p className="text-center text-[10px] font-bold uppercase text-muted-foreground tracking-widest mt-4">
              Secured by Paystack
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function GetStartedPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-orange-500 selection:text-black font-sans flex flex-col">
      <nav className="fixed top-0 w-full z-[100] bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-6 h-24 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-2xl font-black italic uppercase tracking-tighter">
              Insight<span className="text-orange-500">Gym</span>
            </span>
          </Link>
          <Link href="/" className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors">
            BACK TO HOME
          </Link>
        </div>
      </nav>
      <Suspense fallback={<div className="flex-1 flex items-center justify-center"><Loader2 className="h-10 w-10 text-orange-500 animate-spin" /></div>}>
        <GetStartedContent />
      </Suspense>
    </div>
  );
}
