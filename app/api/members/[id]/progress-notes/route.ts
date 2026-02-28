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

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isStaff = ['admin', 'secretary', 'trainer'].includes(currentUser.role)
    const isOwner = currentUser.id === memberId

    if (!isStaff && !isOwner) {
      return NextResponse.json(
        { error: 'Unauthorized - you do not have permission to view these notes' },
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