'use client'

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reference = searchParams.get('reference');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your payment...');

  useEffect(() => {
    if (!reference) {
      setStatus('error');
      setMessage('No payment reference found.');
      return;
    }

    const verifyPayment = async () => {
      try {
        const response = await fetch('/api/payments/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ reference }),
        });

        const data = await response.json();

        if (data.success) {
          setStatus('success');
          setMessage('Your payment has been verified successfully!');
        } else {
          setStatus('error');
          setMessage(data.message || 'Payment could not be verified.');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Something went wrong during verification.');
      }
    };

    verifyPayment();
  }, [reference]);

  const goToDashboard = () => router.push('/admin/dashboard');

  // Go back to the previous page (usually the payment / checkout page)
  const goBack = () => router.back();

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      {status === 'loading' && (
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-16 w-16 text-orange-500 animate-spin" />
          <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">
            {message}
          </h2>
          <p className="text-gray-400 font-medium">Please do not close this page.</p>
        </div>
      )}

      {status === 'success' && (
        <div className="flex flex-col items-center gap-6 max-w-md w-full bg-white/5 border border-white/10 p-10 rounded-lg">
          <CheckCircle className="h-20 w-20 text-green-500 mb-2" />
          <div>
            <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white mb-3">
              Payment Successful
            </h2>
            <p className="text-gray-300 font-medium text-lg">
              {message}
            </p>
            <p className="text-orange-500 font-bold uppercase text-sm mt-5 tracking-widest">
              Plan Activated
            </p>
          </div>
          <Button
            onClick={goToDashboard}
            className="w-full h-16 mt-6 bg-orange-500 hover:bg-orange-600 text-black font-black italic uppercase text-lg rounded-none"
          >
            Go to Dashboard
          </Button>
        </div>
      )}

      {status === 'error' && (
        <div className="flex flex-col items-center gap-6 max-w-md w-full bg-white/5 border border-red-500/30 p-10 rounded-lg">
          <AlertCircle className="h-20 w-20 text-red-500 mb-2" />
          <div>
            <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white mb-3">
              Payment Issue
            </h2>
            <p className="text-gray-300 font-medium text-lg leading-relaxed">
              {message}
            </p>
            <p className="text-red-400 text-sm mt-4">
              Your subscription has not been activated.
            </p>
          </div>

          <div className="w-full flex flex-col sm:flex-row gap-4 mt-6">
            <Button
              onClick={goBack}
              className="flex-1 h-16 bg-orange-500 hover:bg-orange-600 text-black font-black italic uppercase text-lg rounded-none"
            >
              Go Back
            </Button>

            <Button
              variant="outline"
              onClick={() => router.push('/')}
              className="flex-1 h-16 border-white/30 hover:bg-white/10 text-white font-black italic uppercase text-lg rounded-none"
            >
              Go Home
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-orange-500 selection:text-black font-sans flex flex-col">
      <nav className="w-full bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-6 h-24 flex items-center justify-center">
          <span className="text-2xl font-black italic uppercase tracking-tighter">
            Insight<span className="text-orange-500">Gym</span>
          </span>
        </div>
      </nav>

      <Suspense fallback={<div className="flex-1 flex items-center justify-center"><Loader2 className="h-10 w-10 text-orange-500 animate-spin" /></div>}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}