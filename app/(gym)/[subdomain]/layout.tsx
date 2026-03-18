import { ReactNode } from 'react'
import { GymProvider } from '@/components/gym-provider'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { headers } from 'next/headers'
import { SubscriptionBanner } from '@/components/subscription-banner'
import { ExpiredSubscriptionOverlay } from '@/components/expired-subscription-overlay'

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
    
    const isExpired = !latestSub || endDate < now || latestSub.status === 'expired';
    const daysUntilExpiry = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    
    // Add a 3-day grace period
    const finalGraceDate = new Date(endDate)
    finalGraceDate.setDate(finalGraceDate.getDate() + 3)
    const isGracePeriod = isExpired && now <= finalGraceDate
    const isHardExpired = isExpired && !isGracePeriod

    // Check pathname
    const headersList = await headers()
    const pathname = headersList.get('x-pathname') || ''
    
    const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.includes(route))

    if (!isPublicRoute && (isHardExpired || isGracePeriod)) {
      const user = await getCurrentUser()
      
      // Admin/Owner view (allows entry but shows banner)
      if (user?.role === 'admin' || user?.role === 'owner') {
        return (
          <GymProvider>
            <div className="flex flex-col min-h-screen">
              <SubscriptionBanner 
                isExpired={isHardExpired} 
                isGracePeriod={isGracePeriod} 
                daysUntilExpiry={isGracePeriod ? Math.max(0, Math.ceil((finalGraceDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : 0}
                accent={gym.primaryColor || '#daa857'} 
              />
              <div className="flex-1">
                {children}
              </div>
            </div>
          </GymProvider>
        )
      }

      // Member/Staff view (Full screen block if hard expired, warning if grace period)
      if (isHardExpired) {
        return (
          <GymProvider>
            <ExpiredSubscriptionOverlay role={user?.role || 'guest'} accent={gym.primaryColor || '#daa857'} />
          </GymProvider>
        )
      }
      
      // If grace period for members/staff, allow access but let banner show (or just allow silently)
    }
  }

  return (
    <GymProvider>
      {children}
    </GymProvider>
  )
}
