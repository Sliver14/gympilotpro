import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { getGymFromRequest } from '@/lib/gym-context'

export async function GET(request: NextRequest) {
  try {
    const gym = await getGymFromRequest(request)
    if (!gym) {
      return NextResponse.json({ error: 'Gym not found' }, { status: 404 })
    }

    const user = await getCurrentUser()

    if (!user || !['admin', 'secretary', 'trainer'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (user.gymId !== gym.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const now = new Date()

    const expiredMembers = await prisma.user.findMany({
      where: {
        gymId: gym.id,
        role: 'member',
        deletedAt: null,
        memberProfile: {
          expiryDate: {
            lt: now,
          },
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        memberProfile: {
          select: {
            expiryDate: true,
            membership: {
              select: {
                id: true,
                name: true,
                price: true,
              },
            },
          },
        },
      },
      orderBy: {
        memberProfile: {
          expiryDate: 'asc',
        },
      },
    })

    return NextResponse.json(expiredMembers)
  } catch (error) {
    console.error('Expired members fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
