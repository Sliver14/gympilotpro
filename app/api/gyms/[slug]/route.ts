import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const gym = await prisma.gym.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        address: true,
        phone: true,
        email: true,
        primaryColor: true,
        secondaryColor: true,
        heroTitle: true,
        heroSubtitle: true,
      },
    })

    if (!gym) {
      return NextResponse.json(
        { error: 'Gym not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(gym)
  } catch (error) {
    console.error('Fetch gym error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
