import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { id: paymentId } = await context.params
    const staff = await getCurrentUser()

    if (!staff || !['admin', 'secretary'].includes(staff.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 1. Get payment record
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        user: {
          include: {
            memberProfile: {
              include: {
                membership: true,
              },
            },
          },
        },
      },
    })

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    if (payment.status !== 'pending') {
      return NextResponse.json({ error: 'Payment is not pending' }, { status: 400 })
    }

    const { user } = payment
    const { memberProfile } = user

    if (!memberProfile) {
      return NextResponse.json({ error: 'User does not have a member profile' }, { status: 400 })
    }

    // 2. Identify target membership package
    let targetMembershipId = memberProfile.membershipId
    const description = payment.description || ''
    // Try to extract membershipId from description for renewals: "Renewal: Name (ID)"
    const match = description.match(/\(([^)]+)\)$/) 
    if (match && match[1]) {
      targetMembershipId = match[1]
    }

    const targetMembership = await prisma.membershipPackage.findUnique({
      where: { id: targetMembershipId },
    })

    if (!targetMembership) {
      return NextResponse.json({ error: 'Invalid membership package' }, { status: 400 })
    }

    // 3. Calculate new dates
    const now = new Date()
    let newJoinDate = memberProfile.joinDate
    let newExpiryDate: Date

    const isRenewal = description.includes('Renewal') || memberProfile.verified;

    if (!isRenewal) {
      // It's an initial signup approval
      newJoinDate = now
      newExpiryDate = new Date(now)
      newExpiryDate.setDate(newExpiryDate.getDate() + targetMembership.duration)
    } else {
      // It's a renewal approval
      const currentExpiry = new Date(memberProfile.expiryDate)
      if (currentExpiry < now) {
        // Already expired, start from now
        newExpiryDate = new Date(now)
        newExpiryDate.setDate(newExpiryDate.getDate() + targetMembership.duration)
      } else {
        // Still active, extend current expiry
        newExpiryDate = new Date(currentExpiry)
        newExpiryDate.setDate(newExpiryDate.getDate() + targetMembership.duration)
      }
    }

    // 4. Execute transaction
    await prisma.$transaction([
      prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: 'approved',
          approvedById: staff.id,
          approvedAt: now,
        },
      }),
      prisma.memberProfile.update({
        where: { userId: user.id },
        data: {
          verified: true,
          paymentStatus: 'approved',
          membershipId: targetMembershipId,
          joinDate: newJoinDate,
          expiryDate: newExpiryDate,
        },
      }),
    ])

    return NextResponse.json({
      success: true,
      message: isRenewal 
        ? `Renewal approved for ${user.firstName}. New expiry: ${newExpiryDate.toLocaleDateString()}`
        : `Signup approved for ${user.firstName}. Welcome!`,
    })
  } catch (error: any) {
    console.error('Payment approval error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
