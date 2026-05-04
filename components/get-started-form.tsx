'use client'

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2, Check, ChevronRight } from 'lucide-react';
import Link from 'next/link';

import { PLANS, DURATIONS, PlanKey, calculatePrice } from '@/lib/plans';

export default function GetStartedForm() {
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
  const [success, setSuccess] = useState<{ slug: string, gymName: string } | null>(null);

  useEffect(() => {
    const planParam = searchParams.get('plan')?.toLowerCase() as PlanKey;
    // We strictly ignore the 'months' param for trial onboarding to ensure it's always 1 month (30 days)
    const monthsParam = 1;

    if (planParam && PLANS[planParam]) {
      setFormData(prev => ({ ...prev, plan: planParam, months: monthsParam }));
    } else {
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
      // 1. Create Gym and User with 30-Day Trial
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

      const { slug, gymName } = registerData;
      setSuccess({ slug, gymName });
      setLoading(false);

    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setLoading(false);
    }
  };

  if (success) {
    const dashboardUrl = `https://${success.slug}.gympilotpro.com/login`;
    
    return (
      <div className="flex-1 flex items-center justify-center p-4 md:p-6 py-24">
        <div className="w-full max-w-xl bg-white/5 border border-emerald-500/30 p-5 md:p-10 shadow-2xl text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="text-emerald-500 w-10 h-10" strokeWidth={3} />
          </div>
          <span className="text-emerald-500 font-black tracking-[0.2em] text-sm mb-4 block uppercase italic">
            // Trial Activated
          </span>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4 text-foreground italic">
            Welcome, {success.gymName}!
          </h1>
          <p className="text-muted-foreground font-medium mb-8 leading-relaxed">
            Your 30-day free trial is now live. We've waived the setup fee and activated your dashboard so you can start protecting your revenue immediately.
          </p>
          
          <div className="space-y-4">
            <Button 
              asChild
              className="w-full h-20 bg-orange-500 hover:bg-orange-600 text-white font-black uppercase text-xl rounded-none shadow-[0_20px_40px_rgba(249,115,22,0.2)] group"
            >
              <Link href={dashboardUrl}>
                Go to Dashboard <ChevronRight className="ml-2 group-hover:translate-x-2 transition-transform" />
              </Link>
            </Button>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Subdomain: <span className="text-orange-500">{success.slug}.gympilotpro.com</span>
            </p>
          </div>

          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
              Check your email for login credentials.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4 md:p-6 py-24">
      <div className="w-full max-w-xl bg-white/5 border border-border p-5 md:p-10 shadow-2xl relative">
        <div className="text-center mb-10">
          <span className="text-orange-500 font-black tracking-[0.2em] text-sm mb-4 block italic">
            // High-Performance Onboarding
          </span>
          <h1 className="text-2xl md:text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4 text-foreground italic">
            Start Your <span className="text-orange-500">Trial</span>
          </h1>
          <p className="text-muted-foreground font-medium">30 Days Free Access • $0 Setup Fee • Instant Activation</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-2">Full Name</label>
              <input 
                type="text" 
                name="fullName"
                required
                disabled={loading}
                value={formData.fullName}
                onChange={handleChange}
                placeholder="JOHN DOE" 
                className="w-full bg-transparent border-2 border-border p-4 font-black focus:border-orange-500 outline-none transition-colors text-foreground"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-2">Gym Name</label>
              <input 
                type="text" 
                name="gymName"
                required
                disabled={loading}
                value={formData.gymName}
                onChange={handleChange}
                placeholder="IRON FITNESS" 
                className="w-full bg-transparent border-2 border-border p-4 font-black focus:border-orange-500 outline-none transition-colors text-foreground"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-2">Email Address</label>
              <input 
                type="email" 
                name="email"
                required
                disabled={loading}
                value={formData.email}
                onChange={handleChange}
                placeholder="HELLO@GYM.COM" 
                className="w-full bg-transparent border-2 border-border p-4 font-black focus:border-orange-500 outline-none transition-colors text-foreground"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-2">Phone (WhatsApp)</label>
              <input 
                type="tel" 
                name="phone"
                required
                disabled={loading}
                value={formData.phone}
                onChange={handleChange}
                placeholder="+234 806 1731 600" 
                className="w-full bg-transparent border-2 border-border p-4 font-black focus:border-orange-500 outline-none transition-colors text-foreground"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-2">Selected Plan</label>
              <div className="relative">
                <select 
                  name="plan"
                  disabled={loading}
                  value={formData.plan}
                  onChange={handleChange}
                  className="w-full bg-background border-2 border-border p-4 font-black focus:border-orange-500 outline-none transition-colors text-foreground appearance-none cursor-pointer"
                >
                  {Object.values(PLANS).map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-orange-500">▼</div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-2">Trial Duration</label>
              <div className="relative">
                <div className="w-full bg-background border-2 border-border p-4 font-black text-foreground opacity-70">
                  30 DAYS (FREE)
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-border">
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-xs font-bold text-muted-foreground">
                <span>Setup Fee</span>
                <div className="flex items-center gap-2">
                  <span className="line-through opacity-50">₦{PLANS[formData.plan].originalSetupFee.toLocaleString()}</span>
                  <span className="text-emerald-500 font-black uppercase tracking-widest italic">FREE</span>
                </div>
              </div>
              <div className="flex justify-between text-xs font-bold text-muted-foreground">
                <span>First 30 Days</span>
                <span className="text-emerald-500 font-black uppercase tracking-widest italic underline underline-offset-4 decoration-2">₦0 TRIAL</span>
              </div>
              <div className="flex justify-between items-center text-xl font-black uppercase text-foreground pt-4 border-t border-white/5 mt-4">
                <span>Total Due Today</span>
                <span className="text-orange-500 italic tracking-tighter text-2xl">₦0.00</span>
              </div>
            </div>

            {error && (
              <div className="p-4 mb-6 bg-red-500/10 border border-red-500/50 text-red-500 text-sm font-bold flex items-center gap-3">
                <AlertCircle size={20} /> {error}
              </div>
            )}

            <Button 
              type="submit"
              disabled={loading}
              className="w-full h-16 bg-orange-500 hover:bg-orange-600 text-white font-black uppercase text-lg rounded-none disabled:opacity-70 flex items-center justify-center transition-all active:scale-95 shadow-[0_10px_20px_rgba(249,115,22,0.2)] group"
            >
              {loading ? <Loader2 className="animate-spin" /> : (
                <>Activate My Free Trial <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" /></>
              )}
            </Button>
            <p className="text-center text-[9px] font-black text-muted-foreground mt-4 uppercase tracking-widest italic">
              No credit card required for trial activation.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
