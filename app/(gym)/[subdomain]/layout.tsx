import { ReactNode } from 'react'
import { GymProvider } from '@/components/gym-provider'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'

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
      }
    })

    if (!gym) {
      return notFound()
    }
  }

  return (
    <GymProvider>
      {children}
    </GymProvider>
  )
}
