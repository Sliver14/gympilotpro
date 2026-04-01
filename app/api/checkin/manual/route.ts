import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getGymFromRequest } from '@/lib/gym-context'
import { requireActiveGymSubscription } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required', success: false, message: 'Email is required' },
        { status: 400 }
      )
    }

    const gym = await getGymFromRequest(req)
    if (!gym) {
      return NextResponse.json({ error: 'Gym not found', success: false, message: 'Gym not found' }, { status: 404 })
    }

    try {
      await requireActiveGymSubscription(gym.id);
    } catch (e: any) {
      return NextResponse.json(
        { error: 'Service Unavailable', success: false, message: 'Gym subscription expired' },
        { status: 403 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Find member by email and gymId
    const user = await prisma.user.findFirst({
      where: { 
        email: normalizedEmail,
        gymId: gym.id,
      },
      include: {
        memberProfile: {
          include: {
            membership: true,
          },
        },
      },
    })

    if (!user || !user.memberProfile) {
      return NextResponse.json({
        success: false,
        message: 'Member not found in this gym',
      })
    }

    // Check membership status
    const now = new Date()
    const expiryDate = new Date(user.memberProfile.expiryDate)
    const daysRemaining = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    let membershipStatus: 'active' | 'expiring' | 'expired' = 'active'
    if (daysRemaining < 0) {
      membershipStatus = 'expired'
    } else if (daysRemaining <= 3) {
      membershipStatus = 'expiring'
    }

    // Check for existing check-in today
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)

    const existingCheckIn = await prisma.attendance.findFirst({
      where: {
        userId: user.id,
        gymId: gym.id,
        checkInTime: {
          gte: todayStart,
          lte: todayEnd,
        },
        checkOutTime: null,
      },
    })

    if (existingCheckIn) {
      // Do check-out instead
      await prisma.attendance.update({
        where: { id: existingCheckIn.id },
        data: { checkOutTime: new Date() },
      })

      return NextResponse.json({
        success: true,
        message: `Checked out: ${user.firstName} ${user.lastName}`,
        memberName: `${user.firstName} ${user.lastName}`,
        membershipStatus,
        daysRemaining,
      })
    }

    // Log attendance
    await prisma.attendance.create({
      data: {
        userId: user.id,
        gymId: gym.id,
        checkInTime: new Date(),
        method: 'manual',
      },
    })

    return NextResponse.json({
      success: membershipStatus !== 'expired',
      message:
        membershipStatus === 'expired'
          ? `Membership expired. Contact admin. Checked in: ${user.firstName} ${user.lastName}`
          : `Checked in: ${user.firstName} ${user.lastName}`,
      memberName: `${user.firstName} ${user.lastName}`,
      membershipStatus,
      daysRemaining,
    })
  } catch (error) {
    console.error('Manual check-in error:', error)
    return NextResponse.json(
      { error: 'Internal server error', success: false, message: 'System error' },
      { status: 500 }
    )
  }
}
