'use client'

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

function GetStartedContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    fullName: '',
    gymName: '',
    email: '',
    phone: '',
    plan: 'starter'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const plans: Record<string, { name: string, price: number }> = {
    starter: { name: 'Starter', price: 162000 },
    pro: { name: 'Pro', price: 228000 },
    elite: { name: 'Elite', price: 485000 }
  };

  useEffect(() => {
    const planParam = searchParams.get('plan')?.toLowerCase();
    if (planParam && plans[planParam]) {
      setFormData(prev => ({ ...prev, plan: planParam }));
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Create Gym and User
      const registerRes = await fetch('/api/auth/register-gym', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const registerData = await registerRes.json();

      if (!registerRes.ok) {
        throw new Error(registerData.error || 'Failed to create account');
      }

      const { gymId, userId } = registerData;
      const selectedPlan = plans[formData.plan];

      // 2. Initialize Payment
      const paymentRes = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          amount: selectedPlan.price,
          plan: selectedPlan.name,
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

  const currentPlanPrice = plans[formData.plan]?.price || plans.starter.price;

  return (
    <div className="flex-1 flex items-center justify-center p-6 py-24">
      <div className="w-full max-w-xl bg-white/5 border border-white/10 p-10 shadow-2xl relative">
        <div className="text-center mb-10">
          <span className="text-orange-500 font-black italic uppercase tracking-[0.2em] text-sm mb-4 block">
            // Onboarding
          </span>
          <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter mb-4 text-white">
            Create Your Gym
          </h1>
          <p className="text-gray-400 font-medium">Set up your account and complete your payment to get started.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Full Name</label>
              <input 
                type="text" 
                name="fullName"
                required
                disabled={loading}
                value={formData.fullName}
                onChange={handleChange}
                placeholder="JOHN DOE" 
                className="w-full bg-transparent border-2 border-white/10 p-4 font-black italic uppercase focus:border-orange-500 outline-none transition-colors text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Gym Name</label>
              <input 
                type="text" 
                name="gymName"
                required
                disabled={loading}
                value={formData.gymName}
                onChange={handleChange}
                placeholder="IRON FITNESS" 
                className="w-full bg-transparent border-2 border-white/10 p-4 font-black italic uppercase focus:border-orange-500 outline-none transition-colors text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Email Address</label>
            <input 
              type="email" 
              name="email"
              required
              disabled={loading}
              value={formData.email}
              onChange={handleChange}
              placeholder="HELLO@GYM.COM" 
              className="w-full bg-transparent border-2 border-white/10 p-4 font-black italic uppercase focus:border-orange-500 outline-none transition-colors text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Phone (WhatsApp)</label>
            <input 
              type="tel" 
              name="phone"
              required
              disabled={loading}
              value={formData.phone}
              onChange={handleChange}
              placeholder="+234 800 000 0000" 
              className="w-full bg-transparent border-2 border-white/10 p-4 font-black italic uppercase focus:border-orange-500 outline-none transition-colors text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Selected Plan</label>
            <div className="relative">
              <select 
                name="plan"
                disabled={loading}
                value={formData.plan}
                onChange={handleChange}
                className="w-full bg-[#0a0a0a] border-2 border-white/10 p-4 font-black italic uppercase focus:border-orange-500 outline-none transition-colors text-white appearance-none cursor-pointer"
              >
                <option value="starter">Starter - ₦162,000</option>
                <option value="pro">Pro - ₦228,000</option>
                <option value="elite">Elite - ₦485,000</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-orange-500">
                ▼
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10">
            <div className="flex justify-between items-center text-xl font-black italic uppercase text-white mb-6">
              <span>Total Due Today</span>
              <span className="text-orange-500">₦{currentPlanPrice.toLocaleString()}</span>
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
            <p className="text-center text-[10px] font-bold uppercase text-gray-500 tracking-widest mt-4">
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
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-orange-500 selection:text-black font-sans flex flex-col">
      <nav className="fixed top-0 w-full z-[100] bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-6 h-24 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-2xl font-black italic uppercase tracking-tighter">
              Insight<span className="text-orange-500">Gym</span>
            </span>
          </Link>
          <Link href="/" className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-white transition-colors">
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
