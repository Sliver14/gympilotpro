import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getGymFromRequest } from '@/lib/gym-context'
import { requireActiveGymSubscription } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const gym = await getGymFromRequest(req)

    if (!gym) {
      return NextResponse.json(
        { error: 'Gym not found', success: false, message: 'Invalid gym context' },
        { status: 400 }
      )
    }

    try {
      await requireActiveGymSubscription(gym.id);
    } catch (e: any) {
      return NextResponse.json(
        { error: 'Service Unavailable', success: false, message: 'Gym subscription expired' },
        { status: 403 }
      )
    }

    const { qrCode } = await req.json()

    if (!qrCode) {
      return NextResponse.json(
        { error: 'QR code is required', success: false, message: 'Invalid QR code' },
        { status: 400 }
      )
    }

    // Find member by QR code
    const memberProfile = await prisma.memberProfile.findUnique({
      where: { qrCode },
      include: {
        user: true,
        membership: true,
      },
    })

    if (!memberProfile || memberProfile.gymId !== gym.id) {
      return NextResponse.json({
        success: false,
        message: 'Member not found',
      })
    }

    // Check payment status
    if (memberProfile.paymentStatus === 'pending') {
      return NextResponse.json({
        success: false,
        message: 'Payment pending verification. Please contact admin.',
        memberName: `${memberProfile.user.firstName} ${memberProfile.user.lastName}`,
        membershipStatus: 'pending',
      })
    }

    // Check membership status
    const now = new Date()
    const expiryDate = new Date(memberProfile.expiryDate)
    const daysRemaining = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    let membershipStatus: 'active' | 'expiring' | 'expired' = 'active'
    if (daysRemaining < 0) {
      membershipStatus = 'expired'
    } else if (daysRemaining <= 7) {
      membershipStatus = 'expiring'
    }

    // Check for existing check-in today (if checked out, allow new check-in)
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)

    const existingCheckIn = await prisma.attendance.findFirst({
      where: {
        gymId: gym.id,
        userId: memberProfile.userId,
        checkInTime: {
          gte: todayStart,
          lte: todayEnd,
        },
        checkOutTime: null,
      },
    })

    if (existingCheckIn) {
      // Member is trying to check in while already checked in - do check-out instead
      await prisma.attendance.update({
        where: { id: existingCheckIn.id, gymId: gym.id },
        data: { checkOutTime: new Date() },
      })

      return NextResponse.json({
        success: true,
        message: `Checked out: ${memberProfile.user.firstName} ${memberProfile.user.lastName}`,
        memberName: `${memberProfile.user.firstName} ${memberProfile.user.lastName}`,
        membershipStatus,
        daysRemaining,
      })
    }

    // Log attendance
    const attendance = await prisma.attendance.create({
      data: {
        gymId: gym.id,
        userId: memberProfile.userId,
        checkInTime: new Date(),
        method: 'qr',
      },
    })

    return NextResponse.json({
      success: membershipStatus !== 'expired',
      message:
        membershipStatus === 'expired'
          ? `Membership expired. Contact admin. Checked in: ${memberProfile.user.firstName} ${memberProfile.user.lastName}`
          : `Checked in: ${memberProfile.user.firstName} ${memberProfile.user.lastName}`,
      memberName: `${memberProfile.user.firstName} ${memberProfile.user.lastName}`,
      membershipStatus,
      daysRemaining,
    })
  } catch (error) {
    console.error('Check-in error:', error)
    return NextResponse.json(
      { error: 'Internal server error', success: false, message: 'System error' },
      { status: 500 }
    )
  }
}
