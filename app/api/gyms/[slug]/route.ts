import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const gym = await prisma.gym.findFirst({
      where: {
        OR: [
          { slug },
          { customDomain: slug }
        ]
      },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        address: true,
        phone: true,
        email: true,
        status: true,
        primaryColor: true,
        secondaryColor: true,
        heroTitle: true,
        heroSubtitle: true,
        paystackSecretKey: true,
        subscriptions: {
          orderBy: { endDate: 'desc' },
          take: 1
        }
      },
    })

    if (!gym) {
      return NextResponse.json(
        { error: 'Gym not found' },
        { status: 404 }
      )
    }

    const { paystackSecretKey, ...safeGymData } = gym;

    return NextResponse.json({
      ...safeGymData,
      hasPaystack: !!paystackSecretKey
    })
  } catch (error) {
    console.error('Fetch gym error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
