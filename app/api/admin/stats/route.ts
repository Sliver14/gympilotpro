import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user || !['admin', 'secretary', 'trainer'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Total members
    const totalMembers = await prisma.user.count({
      where: { role: 'member', deletedAt: null },
    })

    // Active members (valid membership)
    const now = new Date()
    const activeMembers = await prisma.memberProfile.count({
      where: {
        expiryDate: {
          gt: now,
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
        checkInTime: {
          gte: todayStart,
          lte: todayEnd,
        },
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
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
