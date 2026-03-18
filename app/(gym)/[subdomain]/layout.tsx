import { ReactNode } from 'react'
import { GymProvider } from '@/components/gym-provider'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'

export default async function GymSubdomainLayout({
  children,
  params
}: {
  children: ReactNode
  params: Promise<{ subdomain: string }>
}) {
  const { subdomain } = await params

  if (subdomain !== 'www' && subdomain !== 'localhost') {
    const gym = await prisma.gym.findFirst({
      where: {
        OR: [
          { slug: subdomain },
          { customDomain: subdomain }
        ]
      },
      include: {
        subscriptions: {
          orderBy: { endDate: 'desc' },
          take: 1
        }
      }
    })

    if (!gym) {
      return notFound()
    }

    const latestSub = gym.subscriptions[0];
    const isExpired = !latestSub || new Date(latestSub.endDate) < new Date() || latestSub.status === 'expired';

    if (isExpired) {
      const user = await getCurrentUser();
      
      // If Admin: Show a hard gate asking them to renew
      if (user?.role === 'admin' || user?.role === 'owner' || user?.role === 'staff') {
        return (
          <div className="flex min-h-screen items-center justify-center bg-black text-white p-4 font-sans selection:bg-red-500/30">
            <div className="text-center space-y-6 p-10 border border-red-500/20 bg-red-500/5 rounded-[2.5rem] max-w-lg w-full shadow-2xl shadow-red-500/10 relative overflow-hidden">
              <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-red-500/10 blur-[80px]" />
              
              <div className="relative z-10">
                <div className="h-24 w-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-red-500/20 shadow-xl shadow-red-500/20">
                  <span className="text-red-500 text-5xl font-black italic">!</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-black text-red-500 uppercase tracking-tighter mb-4">Subscription Expired</h1>
                <p className="text-gray-400 font-medium leading-relaxed mb-8">
                  Your gym's SaaS plan has expired. Please renew your subscription to restore platform access for your members and staff.
                </p>
                <a href="https://gympilotpro.com" target="_blank" rel="noopener noreferrer" className="inline-block w-full mt-4 p-5 bg-red-500 hover:bg-red-600 text-white font-black uppercase tracking-[0.2em] rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-red-500/20">
                  Renew Plan Now
                </a>
                <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.3em] mt-10">GymPilotPro Systems © 2026</p>
              </div>
            </div>
          </div>
        );
      }

      // If Member or Unauthenticated (Login/Signup): Block entirely
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] text-white p-4 font-sans">
          <div className="text-center space-y-4">
            <div className="h-20 w-20 bg-[#111] rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-white/5 shadow-2xl">
              <span className="text-gray-600 text-3xl font-black">⚡</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-black text-gray-400 uppercase tracking-tighter italic">Service Unavailable</h1>
            <p className="text-gray-600 font-black tracking-[0.3em] text-[10px] uppercase">This facility is currently offline.</p>
          </div>
        </div>
      );
    }
  }

  return (
    <GymProvider>
      {children}
    </GymProvider>
  )
}
