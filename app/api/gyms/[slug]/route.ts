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
        },
        branches: {
          select: {
            id: true,
            name: true,
            address: true,
            isActive: true,
            isDefault: true,
          }
        }
      },
    })

    if (!gym) {
      return NextResponse.json(
        { error: 'Gym not found' },
        { status: 404 }
      )
    }

    const branchesWithSlug = gym.branches.map(b => ({
      ...b,
      slug: b.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    }));

    const { paystackSecretKey, ...safeGymData } = gym;
    safeGymData.branches = branchesWithSlug;

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
