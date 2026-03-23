'use client'

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useGym } from '@/components/gym-provider';
import Image from 'next/image';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reference = searchParams.get('reference');
  const { gymData } = useGym();

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your payment...');
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Fetch user role for routing
    fetch('/api/auth/user').then(res => {
      if (res.ok) res.json().then(data => setUserRole(data.role));
    }).catch(console.error);

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

  const goToDashboard = () => {
    if (userRole === 'admin' || userRole === 'owner') {
      router.push('/admin/billing');
    } else if (userRole === 'member') {
      router.push('/member/dashboard');
    } else {
      router.push('/login');
    }
  };

  // Go back to the previous page (usually the payment / checkout page)
  const goBack = () => router.back();

  const accent = gymData?.primaryColor || '#daa857';

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-6 text-center">
      {status === 'loading' && (
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-16 w-16 animate-spin" style={{ color: accent }} />
          <h2 className="text-2xl font-black uppercase tracking-tighter text-foreground">
            {message}
          </h2>
          <p className="text-muted-foreground font-medium">Please do not close this page.</p>
        </div>
      )}

      {status === 'success' && (
        <div className="flex flex-col items-center gap-4 md:gap-6 max-w-md w-full bg-accent border border-border p-5 md:p-10 rounded-[2rem] shadow-2xl">
          <CheckCircle className="h-16 md:h-20 w-20 text-green-500 mb-2" />
          <div>
            <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-foreground mb-3">
              Payment Successful
            </h2>
            <p className="text-muted-foreground font-medium text-lg">
              {message}
            </p>
            <p className="font-bold text-[10px] mt-5" style={{ color: accent }}>
              Your access has been granted
            </p>
          </div>
          <Button
            onClick={goToDashboard}
            className="w-full h-16 mt-6 text-black font-black uppercase text-lg rounded-xl transition-transform hover:scale-[1.02]"
            style={{ backgroundColor: accent }}
          >
            Go to Dashboard
          </Button>
        </div>
      )}

      {status === 'error' && (
        <div className="flex flex-col items-center gap-4 md:gap-6 max-w-md w-full bg-accent border border-red-500/30 p-5 md:p-10 rounded-[2rem] shadow-2xl">
          <AlertCircle className="h-16 md:h-20 w-20 text-red-500 mb-2" />
          <div>
            <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-foreground mb-3">
              Payment Issue
            </h2>
            <p className="text-muted-foreground font-medium text-lg leading-relaxed">
              {message}
            </p>
            <p className="text-red-400 text-sm mt-4">
              Your subscription has not been activated.
            </p>
          </div>

          <div className="w-full flex flex-col sm:flex-row gap-4 mt-6">
            <Button
              onClick={goBack}
              className="flex-1 h-16 text-black font-black uppercase text-lg rounded-xl transition-transform hover:scale-[1.02]"
              style={{ backgroundColor: accent }}
            >
              Go Back
            </Button>

            <Button
              variant="outline"
              onClick={() => router.push('/')}
              className="flex-1 h-16 border-border bg-transparent hover:bg-accent text-foreground font-black uppercase text-lg rounded-xl transition-transform hover:scale-[1.02]"
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
  const { gymData, isLoading } = useGym();
  const accent = gymData?.primaryColor || '#daa857';
  const logo = gymData?.logo;
  const gymName = gymData?.name || 'Gym';
  const gymInitials = gymName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-[#daa857]/30 selection:text-black font-sans flex flex-col relative overflow-hidden">
      {/* Background glow matching the gym's accent */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[120px] opacity-[0.03] pointer-events-none"
        style={{ backgroundColor: accent }}
      />
      
      <nav className="w-full bg-background/80 backdrop-blur-xl border-b border-border relative z-10">
        <div className="container mx-auto px-6 h-16 md:h-24 flex items-center justify-center">
          {isLoading ? (
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          ) : (
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 overflow-hidden rounded-full border flex items-center justify-center" style={{ borderColor: `${accent}4d`, backgroundColor: logo  ? 'white' : 'hsl(var(--card))' }}>
                {logo ? (
                  <Image 
                    src={logo} 
                    alt="Logo" 
                    fill
                    className="object-contain p-1"
                  />
                ) : (
                  <span className="font-black text-sm" style={{ color: accent }}>{gymInitials}</span>
                )}
              </div>
              <span className="text-2xl font-black uppercase tracking-tighter">
                {gymName.split(' ')[0]}
                <span style={{ color: accent }}>{gymName.split(' ').slice(1).join(' ')}</span>
              </span>
            </div>
          )}
        </div>
      </nav>

      <div className="flex-1 flex flex-col relative z-10">
        <Suspense fallback={<div className="flex-1 flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin" style={{ color: accent }} /></div>}>
          <SuccessContent />
        </Suspense>
      </div>
    </div>
  );
}