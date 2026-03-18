import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { getGymFromRequest } from '@/lib/gym-context'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const gym = await getGymFromRequest(request)
    if (!gym) {
      return NextResponse.json({ error: 'Gym not found' }, { status: 404 })
    }

    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Ensure current user belongs to this gym
    if (currentUser.gymId !== gym.id) {
       return NextResponse.json({ error: 'Unauthorized - you do not belong to this gym' }, { status: 401 })
    }

    const isStaff = ['admin', 'secretary', 'trainer'].includes(currentUser.role)
    const isOwner = currentUser.id === id

    if (!isStaff && !isOwner) {
      return NextResponse.json(
        { error: 'Unauthorized - you do not have permission to view this attendance' },
        { status: 401 }
      )
    }

    // Verify target member belongs to this gym
    const targetMember = await prisma.user.findFirst({
      where: {
        id,
        gymId: gym.id,
      },
    })

    if (!targetMember) {
      return NextResponse.json({ error: 'Member not found in this gym' }, { status: 404 })
    }

    const attendance = await prisma.attendance.findMany({
      where: { 
        userId: id,
        gymId: gym.id,
      },
      select: {
        id: true,
        checkInTime: true,
        checkOutTime: true,
        method: true,
      },
      orderBy: { checkInTime: 'desc' },
      take: 100,
    })

    return NextResponse.json(attendance)
  } catch (error) {
    console.error('Get attendance error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}