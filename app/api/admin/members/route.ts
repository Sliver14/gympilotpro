import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { getGymFromRequest } from '@/lib/gym-context'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    const gym = await getGymFromRequest(request)

    if (!user || !['admin', 'secretary', 'trainer'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!gym) {
      return NextResponse.json(
        { error: 'Gym not found' },
        { status: 404 }
      )
    }

    // Security check: Ensure user belongs to this gym
    if (user.gymId !== gym.id) {
       return NextResponse.json(
        { error: 'Access denied: User does not belong to this gym' },
        { status: 403 }
      )
    }

    const members = await prisma.user.findMany({
      where: { 
        gymId: gym.id,
        role: 'member', 
        deletedAt: null 
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        profileImage: true,
        createdAt: true,
        memberProfile: {
          select: {
            expiryDate: true,
            membership: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(members)
  } catch (error) {
    console.error('Admin members error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
