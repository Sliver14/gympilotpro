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

    if (!staff || !['admin', 'secretary', 'trainer'].includes(staff.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse body for optional startDate
    let startDate: Date | null = null
    try {
      const body = await req.json()
      if (body.startDate) {
        startDate = new Date(body.startDate)
      }
    } catch (e) {
      // Body might be empty, that's fine
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
    const baseDate = startDate || now
    let newJoinDate = memberProfile.joinDate
    let newExpiryDate: Date

    const isRenewal = description.includes('Renewal') || memberProfile.verified;

    if (!isRenewal) {
      // It's an initial signup approval
      newJoinDate = baseDate
      newExpiryDate = new Date(baseDate)
      newExpiryDate.setDate(newExpiryDate.getDate() + targetMembership.duration)
    } else {
      // It's a renewal approval
      // Consistent with renew-manual: extension logic
      const currentExpiry = new Date(memberProfile.expiryDate)
      
      // If current expiry is in the past compared to baseDate, start from baseDate.
      // Otherwise extend from current expiry.
      if (currentExpiry < baseDate) {
        newExpiryDate = new Date(baseDate)
      } else {
        newExpiryDate = new Date(currentExpiry)
      }
      newExpiryDate.setDate(newExpiryDate.getDate() + targetMembership.duration)
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
