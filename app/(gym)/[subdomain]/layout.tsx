import { ReactNode } from 'react'
import { GymProvider } from '@/components/gym-provider'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { Metadata } from 'next'

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ subdomain: string }> 
}): Promise<Metadata> {
  const { subdomain } = await params

  if (subdomain !== 'www' && subdomain !== 'localhost') {
    const cleanDomain = subdomain.replace(/^www\./, '')

    const gym = await prisma.gym.findFirst({
      where: {
        OR: [
          { slug: subdomain },
          { slug: cleanDomain },
          { customDomain: subdomain },
          { customDomain: cleanDomain },
          { customDomain: `www.${cleanDomain}` }
        ]
      },
      select: { name: true, favicon: true, tagline: true }
    })

    if (gym) {
      return {
        title: {
          template: `%s | ${gym.name}`,
          default: gym.name,
        },
        description: gym.tagline || 'Welcome to our premium fitness facility.',
        icons: gym.favicon ? {
          icon: gym.favicon,
          apple: gym.favicon,
        } : undefined
      }
    }
  }

  return {
    title: 'GymPilotPro',
  }
}

export default async function GymSubdomainLayout({
  children,
  params
}: {
  children: ReactNode
  params: Promise<{ subdomain: string }>
}) {
  const { subdomain } = await params

  if (subdomain !== 'www' && subdomain !== 'localhost') {
    const cleanDomain = subdomain.replace(/^www\./, '')

    const gym = await prisma.gym.findFirst({
      where: {
        OR: [
          { slug: subdomain },
          { slug: cleanDomain },
          { customDomain: subdomain },
          { customDomain: cleanDomain },
          { customDomain: `www.${cleanDomain}` }
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
      // If it's a custom domain (contains a dot), show the Domain Not Connected UI
      if (subdomain.includes('.')) {
        return (
          <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4 md:p-6 text-center font-sans">
            <div className="h-16 md:h-20 w-20 bg-orange-500/10 rounded-full flex items-center justify-center mb-6 border border-orange-500/20">
              <span className="text-orange-500 text-3xl font-black">!</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-black uppercase mb-4 tracking-tighter">Domain Not Connected</h1>
            <p className="text-muted-foreground max-w-md font-medium text-[10px] leading-relaxed">
              This domain is currently pointing to our servers but hasn't been verified or linked to any active gym yet.
            </p>
            <div className="mt-10 pt-10 border-t border-border w-full max-w-xs">
               <p className="text-[8px] text-muted-foreground font-black tracking-[0.5em]">GYMPILOTPRO SYSTEMS • 2026</p>
            </div>
          </div>
        )
      }
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
