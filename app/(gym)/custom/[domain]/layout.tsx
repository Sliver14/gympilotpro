import { ReactNode } from 'react'
import { GymProvider } from '@/components/gym-provider'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'

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
          { slug: domain } // Fallback just in case
        ],
        domainVerified: true
      }
    })

    if (!gym) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6 text-center">
          <h1 className="text-4xl font-black uppercase italic mb-4">Domain Not Connected</h1>
          <p className="text-gray-400 max-w-md">
            This domain is currently pointing to GymPilotPro but hasn't been verified or linked to any active gym yet.
          </p>
        </div>
      )
    }
  }

  return (
    <GymProvider>
      {children}
    </GymProvider>
  )
}
