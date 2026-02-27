import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { id: memberUserId } = await context.params

    const user = await getCurrentUser()

    // 1. Authorization
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!['admin', 'secretary'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Forbidden: Insufficient permissions' },
        { status: 403 }
      )
    }

    if (!memberUserId) {
      return NextResponse.json(
        { error: 'Bad Request: Member ID is required' },
        { status: 400 }
      )
    }

    // 2. Update member profile
    const updatedProfile = await prisma.memberProfile.update({
      where: { userId: memberUserId },
      data: {
        verified: true,
        paymentStatus: 'approved',
        approvedById: user.id,
        approvedAt: new Date(),
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: `Payment approved for ${updatedProfile.user.firstName} ${updatedProfile.user.lastName}. Member is now verified.`,
      profile: {
        userId: updatedProfile.userId,
        verified: updatedProfile.verified,
        paymentStatus: updatedProfile.paymentStatus,
      },
    })
  } catch (error: any) {
    console.error('Approve Payment Error:', error)

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Member profile not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to approve payment' },
      { status: 500 }
    )
  }
}