import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Calculate all date ranges upfront
    const now = new Date()
    const todayStart = new Date(now)
    todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date(now)
    todayEnd.setHours(23, 59, 59, 999)

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    monthStart.setHours(0, 0, 0, 0)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    monthEnd.setHours(23, 59, 59, 999)

    const thirtyDaysAgo = new Date(now)
    thirtyDaysAgo.setDate(now.getDate() - 29)
    thirtyDaysAgo.setHours(0, 0, 0, 0)

    const twelveMonthsAgo = new Date(now)
    twelveMonthsAgo.setMonth(now.getMonth() - 11)
    twelveMonthsAgo.setDate(1)
    twelveMonthsAgo.setHours(0, 0, 0, 0)

    // Execute all queries in parallel
    const [
      totalMembers,
      activeMembers,
      todayCheckins,
      monthlyRevenueResult,
      payments,
      attendance,
    ] = await Promise.all([
      // Total members
      prisma.user.count({
        where: { role: 'member', deletedAt: null },
      }),
      // Active members
      prisma.memberProfile.count({
        where: {
          expiryDate: {
            gt: now,
          },
        },
      }),
      // Today's check-ins
      prisma.attendance.count({
        where: {
          checkInTime: {
            gte: todayStart,
            lte: todayEnd,
          },
        },
      }),
      // Monthly revenue (aggregate)
      prisma.payment.aggregate({
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
      }),
      // Revenue data for last 12 months
      prisma.payment.findMany({
        where: {
          status: 'approved',
          createdAt: {
            gte: twelveMonthsAgo,
          },
        },
        select: {
          amount: true,
          createdAt: true,
        },
      }),
      // Attendance data for last 30 days
      prisma.attendance.findMany({
        where: {
          checkInTime: {
            gte: thirtyDaysAgo,
          },
        },
        select: {
          checkInTime: true,
          checkOutTime: true,
        },
      }),
    ])

    // Process revenue data by month
    const monthMap = new Map<string, { revenue: number; payments: number; monthName: string }>()
    for (let i = 11; i >= 0; i--) {
      const date = new Date()
      date.setMonth(now.getMonth() - i)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const monthName = date.toLocaleString('default', { month: 'short', year: '2-digit' })
      monthMap.set(monthKey, { revenue: 0, payments: 0, monthName })
    }

    payments.forEach((payment: { amount: number; createdAt: Date }) => {
      const date = new Date(payment.createdAt)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const monthData = monthMap.get(monthKey)
      if (monthData) {
        monthData.revenue += payment.amount
        monthData.payments += 1
      }
    })

    const revenueData = Array.from(monthMap.entries())
      .map(([key, data]) => ({
        month: data.monthName,
        revenue: data.revenue,
        payments: data.payments,
      }))
      .sort((a, b) => {
        const aDate = new Date(a.month)
        const bDate = new Date(b.month)
        return aDate.getTime() - bDate.getTime()
      })

    // Process attendance data by day
    const dayMap = new Map<string, { checkins: number; checkouts: number; dateLabel: string }>()
    for (let i = 29; i >= 0; i--) {
      const date = new Date()
      date.setDate(now.getDate() - i)
      date.setHours(0, 0, 0, 0)
      const dayKey = date.toISOString().split('T')[0]
      const dateLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      dayMap.set(dayKey, { checkins: 0, checkouts: 0, dateLabel })
    }

    attendance.forEach((record: { checkInTime: Date; checkOutTime: Date | null }) => {
      const date = new Date(record.checkInTime)
      date.setHours(0, 0, 0, 0)
      const dayKey = date.toISOString().split('T')[0]
      const dayData = dayMap.get(dayKey)
      if (dayData) {
        dayData.checkins += 1
        if (record.checkOutTime) {
          dayData.checkouts += 1
        }
      }
    })

    const attendanceData = Array.from(dayMap.entries())
      .map(([key, data]) => ({
        date: data.dateLabel,
        checkins: data.checkins,
        checkouts: data.checkouts,
      }))
      .sort((a, b) => {
        const aDate = new Date(a.date)
        const bDate = new Date(b.date)
        return aDate.getTime() - bDate.getTime()
      })

    return NextResponse.json({
      stats: {
        totalMembers,
        activeMembers,
        todayCheckins,
        monthlyRevenue: monthlyRevenueResult._sum.amount || 0,
      },
      revenueData,
      attendanceData,
    })
  } catch (error) {
    console.error('Admin dashboard error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

