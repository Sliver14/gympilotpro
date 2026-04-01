import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { getGymFromRequest } from '@/lib/gym-context'

export async function GET(request: NextRequest) {
  try {
    const gym = await getGymFromRequest(request)
    if (!gym) {
      return NextResponse.json({ error: 'Gym not found' }, { status: 404 })
    }

    const user = await getCurrentUser()

    if (!user || !['admin', 'secretary', 'trainer'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (user.gymId !== gym.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Total members
    const totalMembers = await prisma.user.count({
      where: { role: 'member', deletedAt: null, gymId: gym.id },
    })

    // Active members (valid membership)
    const now = new Date()
    const next3Days = new Date(now)
    next3Days.setDate(now.getDate() + 3)

    const sevenDaysAgo = new Date(now)
    sevenDaysAgo.setDate(now.getDate() - 7)

    const activeMembers = await prisma.memberProfile.count({
      where: {
        gymId: gym.id,
        expiryDate: {
          gt: now,
        },
      },
    })

    // Expiring soon
    const expiringSoon = await prisma.memberProfile.count({
      where: {
        gymId: gym.id,
        expiryDate: {
          gt: now,
          lte: next3Days,
        },
      },
    })

    // New signups
    const newSignups = await prisma.user.count({
      where: {
        gymId: gym.id,
        role: 'member',
        deletedAt: null,
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
    })

    // Today's check-ins
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)

    const todayCheckins = await prisma.attendance.count({
      where: {
        gymId: gym.id,
        checkInTime: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    })

    // Current occupancy
    const currentOccupancy = await prisma.attendance.count({
      where: {
        gymId: gym.id,
        checkInTime: {
          gte: todayStart,
          lte: todayEnd,
        },
        checkOutTime: null,
      },
    })

    // Monthly revenue
    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)
    const monthEnd = new Date()
    monthEnd.setMonth(monthEnd.getMonth() + 1)
    monthEnd.setDate(0)
    monthEnd.setHours(23, 59, 59, 999)

    // Optimize: Use aggregate instead of fetching all payments
    const monthlyRevenueResult = await prisma.payment.aggregate({
      where: {
        gymId: gym.id,
        status: 'approved',
        createdAt: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
      _sum: {
        amount: true,
      },
    })

    const monthlyRevenue = monthlyRevenueResult._sum.amount || 0

    return NextResponse.json({
      totalMembers,
      activeMembers,
      todayCheckins,
      monthlyRevenue,
      expiringSoon,
      newSignups,
      currentOccupancy,
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
