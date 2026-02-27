import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    // Await dynamic params (required in Next.js App Router)
    const { id: memberUserId } = await context.params

    // 1. Get current staff user
    const staff = await getCurrentUser()

    if (!staff) {
      return NextResponse.json({ error: 'Unauthorized - no session' }, { status: 401 })
    }

    // Only admin & secretary can approve payments
    if (!['admin', 'secretary'].includes(staff.role)) {
      return NextResponse.json(
        { error: 'Forbidden: Only admin or secretary can approve payments' },
        { status: 403 }
      )
    }

    // 2. Validate memberUserId
    if (!memberUserId) {
      return NextResponse.json({ error: 'Member user ID is required' }, { status: 400 })
    }

    // Optional: parse body if you want to support extra data later (status, notes, etc.)
    // const body = await req.json()

    // 3. Update member profile to approved/verified
    const updatedProfile = await prisma.memberProfile.update({
      where: { userId: memberUserId },
      data: {
        verified: true,
        paymentStatus: 'approved',
        approvedById: staff.id,
        approvedAt: new Date(),
      },
      select: {
        userId: true,
        verified: true,
        paymentStatus: true,
        approvedAt: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    // 4. Optional: you could also create/update a Payment record here if needed
    // await prisma.payment.create({ ... })  // if you track payments separately

    return NextResponse.json({
      success: true,
      message: `Payment approved for ${updatedProfile.user.firstName} ${updatedProfile.user.lastName}. Member is now verified.`,
      profile: {
        userId: updatedProfile.userId,
        verified: updatedProfile.verified,
        paymentStatus: updatedProfile.paymentStatus,
        approvedAt: updatedProfile.approvedAt?.toISOString(),
      },
    })
  } catch (error: any) {
    console.error('Approve Payment Error:', error)

    if (error.code === 'P2025') {
      // Prisma "not found" error
      return NextResponse.json(
        { error: 'Member profile not found' },
        { status: 404 }
      )
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to approve payment' },
      { status: 500 }
    )
  }
}