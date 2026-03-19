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
