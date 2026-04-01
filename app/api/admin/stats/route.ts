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

    // Expired members
    const expiredMembers = await prisma.memberProfile.count({
      where: {
        gymId: gym.id,
        expiryDate: {
          lt: now,
        },
        user: {
          deletedAt: null,
          role: 'member'
        }
      },
    })

    const sevenDaysAgo = new Date(now)
    sevenDaysAgo.setDate(now.getDate() - 7)

    const activeMembers = await prisma.memberProfile.count({
      where: {
        gymId: gym.id,
        expiryDate: {
          gte: now,
        },
        user: {
          deletedAt: null,
          role: 'member'
        }
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
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)

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

    // Monthly revenue (Total for the current calendar month)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
    // The next month at index 0 is the LAST day of the current month
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

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
      expiredMembers,
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
