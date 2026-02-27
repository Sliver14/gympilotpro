import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ← Correct type: Promise
) {
  try {
    // Await params (required in dynamic routes)
    const { id: memberId } = await params

    const currentUser = await getCurrentUser()

    if (!currentUser || currentUser.id !== memberId) {
      return NextResponse.json(
        { error: 'Unauthorized - you can only view your own progress notes' },
        { status: 401 }
      )
    }

    const notes = await prisma.progressNote.findMany({
      where: { memberId },
      include: {
        trainer: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json(notes)
  } catch (error) {
    console.error('Get progress notes error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}