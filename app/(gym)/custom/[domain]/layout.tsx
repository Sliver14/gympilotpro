import { ReactNode } from 'react'
import { GymProvider } from '@/components/gym-provider'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'

export default async function CustomDomainLayout({
  children,
  params
}: {
  children: ReactNode
  params: Promise<{ domain: string }>
}) {
  const { domain } = await params

  if (domain !== 'www' && domain !== 'localhost') {
    const gym = await prisma.gym.findFirst({
      where: {
        OR: [
          { customDomain: domain },
          { slug: domain }
        ],
        domainVerified: true
      },
      include: {
        subscriptions: {
          orderBy: { endDate: 'desc' },
          take: 1
        }
      }
    })

    if (!gym) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6 text-center font-sans">
          <div className="h-20 w-20 bg-orange-500/10 rounded-full flex items-center justify-center mb-6 border border-orange-500/20">
            <span className="text-orange-500 text-3xl font-black">!</span>
          </div>
          <h1 className="text-4xl font-black uppercase italic mb-4 tracking-tighter">Domain Not Connected</h1>
          <p className="text-gray-400 max-w-md font-medium uppercase text-[10px] tracking-widest leading-relaxed">
            This domain is currently pointing to our servers but hasn't been verified or linked to any active gym yet.
          </p>
          <div className="mt-10 pt-10 border-t border-white/5 w-full max-w-xs">
             <p className="text-[8px] text-gray-700 font-black uppercase tracking-[0.5em]">GYMPILOTPRO SYSTEMS • 2026</p>
          </div>
        </div>
      )
    }

    // Calculate subscription status server-side
    const latestSub = gym.subscriptions[0];
    const now = new Date()
    const endDate = latestSub ? new Date(latestSub.endDate) : now
    const isExpired = !latestSub || endDate < now || latestSub.status === 'expired';

    const user = await getCurrentUser()

    return (
      <GymProvider 
        initialIsExpired={isExpired} 
        initialGymStatus={gym.status}
        initialCurrentPlan={latestSub?.plan || 'starter'}
        initialGymId={gym.id}
        initialAccent={gym.primaryColor || '#daa857'}
        userRole={user?.role || 'guest'}
      >
        {children}
      </GymProvider>
    )
  }

  return (
    <GymProvider>
      {children}
    </GymProvider>
  )
}
