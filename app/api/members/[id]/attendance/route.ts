import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const currentUser = await getCurrentUser()

    if (!currentUser || currentUser.id !== id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const attendance = await prisma.attendance.findMany({
      where: { userId: id },
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