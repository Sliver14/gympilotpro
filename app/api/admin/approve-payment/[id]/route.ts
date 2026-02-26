import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

interface RouteContext {
  params: { id: string }
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser()

    // 1. Authorization: Ensure user is a logged-in staff member
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (!['admin', 'secretary'].includes(user.role)) {
      // We restrict this to admin/secretary as they handle payments
      return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 })
    }

    const memberUserId = context.params.id

    if (!memberUserId) {
        return NextResponse.json({ error: 'Bad Request: Member ID is required' }, { status: 400 })
    }

    // 2. Update the member's profile to verified status
    const updatedProfile = await prisma.memberProfile.update({
      where: { userId: memberUserId },
      data: {
        verified: true,
        paymentStatus: 'approved',
        approvedById: user.id, // Record which staff member approved it
        approvedAt: new Date(),
      },
      include: {
        user: {
            select: {
                firstName: true,
                lastName: true,
            }
        }
      }
    })

    // 3. Optionally, you could trigger a welcome email here

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
    if (error.code === 'P2025') { // Prisma code for record not found
        return NextResponse.json({ error: 'Member profile not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to approve payment' }, { status: 500 })
  }
}
