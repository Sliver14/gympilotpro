import { ReactNode } from 'react'
import { GymProvider } from '@/components/gym-provider'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { headers } from 'next/headers'
import { SubscriptionLockScreen } from '@/components/subscription-lock-screen'

// Define unauthenticated routes that should ALWAYS be accessible
const PUBLIC_ROUTES = ['/login', '/signup', '/forgot-password', '/reset-password', '/setup']

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

    // Calculate subscription status
    const latestSub = gym.subscriptions[0];
    const now = new Date()
    const endDate = latestSub ? new Date(latestSub.endDate) : now
    
    // Strict block if the date has passed or status is explicitly expired
    const isExpired = !latestSub || endDate < now || latestSub.status === 'expired';

    // Check pathname
    const headersList = await headers()
    const pathname = headersList.get('x-pathname') || ''
    
    const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.includes(route))

    if (!isPublicRoute && isExpired) {
      const user = await getCurrentUser()
      
      // Completely replace the dashboard with the lock screen for all roles
      return (
        <GymProvider>
          <SubscriptionLockScreen 
            role={user?.role || 'guest'} 
            gymId={gym.id} 
            gymStatus={gym.status}
            currentPlan={latestSub?.plan || 'starter'}
            accent={gym.primaryColor || '#daa857'} 
          />
        </GymProvider>
      )
    }
  }

  return (
    <GymProvider>
      {children}
    </GymProvider>
  )
}
