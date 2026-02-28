import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const staff = await getCurrentUser()

    if (!staff || !['admin', 'secretary', 'trainer'].includes(staff.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { memberId, membershipId, paymentMethod } = body

    if (!memberId || !membershipId || !paymentMethod) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // 1. Get member profile
    const memberProfile = await prisma.memberProfile.findUnique({
      where: { userId: memberId },
      include: { user: true },
    })

    if (!memberProfile) {
      return NextResponse.json({ error: 'Member profile not found' }, { status: 404 })
    }

    // 2. Get membership details
    const membership = await prisma.membershipPackage.findUnique({
      where: { id: membershipId },
    })

    if (!membership) {
      return NextResponse.json({ error: 'Membership package not found' }, { status: 400 })
    }

    const now = new Date()
    let newExpiryDate: Date

    // If already expired, start from now. If active, extend it.
    if (new Date(memberProfile.expiryDate) < now) {
      newExpiryDate = new Date(now)
    } else {
      newExpiryDate = new Date(memberProfile.expiryDate)
    }
    newExpiryDate.setDate(newExpiryDate.getDate() + membership.duration)

    // 3. Update in transaction
    await prisma.$transaction([
      // Create approved Payment record
      prisma.payment.create({
        data: {
          userId: memberId,
          amount: membership.price,
          status: 'approved',
          paymentMethod: paymentMethod,
          description: `Admin Manual Renewal: ${membership.name}`,
          reference: `ADMIN-RENEW-${Date.now()}`,
          approvedById: staff.id,
          approvedAt: now,
        },
      }),
      // Update MemberProfile
      prisma.memberProfile.update({
        where: { userId: memberId },
        data: {
          verified: true,
          paymentStatus: 'approved',
          membershipId: membershipId,
          expiryDate: newExpiryDate,
        },
      }),
    ])

    return NextResponse.json({
      success: true,
      message: `Membership successfully renewed for ${memberProfile.user.firstName}. New expiry: ${newExpiryDate.toLocaleDateString()}`,
    })
  } catch (error: any) {
    console.error('Manual renewal error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
