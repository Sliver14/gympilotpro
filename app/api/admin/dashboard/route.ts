import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { getGymFromRequest } from '@/lib/gym-context'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    const gym = await getGymFromRequest(request)

    if (!user || !['admin', 'secretary', 'trainer'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!gym) {
      return NextResponse.json(
        { error: 'Gym not found' },
        { status: 404 }
      )
    }

    // Security check: Ensure user belongs to this gym
    if (user.gymId !== gym.id) {
       return NextResponse.json(
        { error: 'Access denied: User does not belong to this gym' },
        { status: 403 }
      )
    }

    // Calculate all date ranges upfront
    const now = new Date()
    
    // Explicit Local Time Bounds to avoid wrapping issues
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

    const thirtyDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30, 0, 0, 0, 0)

    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1, 0, 0, 0, 0)

    const sevenDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7, 0, 0, 0, 0)

    // Execute all queries in parallel
    const [
      totalMembers,
      activeMembers,
      todayCheckins,
      pendingPaymentsCount,
      monthlyRevenueResult,
      payments,
      attendance,
      expiringSoon,
      newSignups,
      currentOccupancy,
    ] = await Promise.all([
      // Total members
      prisma.user.count({
        where: { gymId: gym.id, role: 'member', deletedAt: null },
      }),
      // Active members
      prisma.memberProfile.count({
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
      }),
      // Today's check-ins
      prisma.attendance.count({
        where: {
          gymId: gym.id,
          checkInTime: {
            gte: todayStart,
            lte: todayEnd,
          },
        },
      }),
      // Pending payments
      prisma.payment.count({
        where: {
          gymId: gym.id,
          status: 'pending',
        },
      }),
      // Monthly revenue (aggregate for current month)
      prisma.payment.aggregate({
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
      }),
      // Revenue data for last 12 months
      prisma.payment.findMany({
        where: {
          gymId: gym.id,
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
          gymId: gym.id,
          checkInTime: {
            gte: thirtyDaysAgo,
          },
        },
        select: {
          checkInTime: true,
          checkOutTime: true,
        },
      }),
      // Expired members
      prisma.memberProfile.count({
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
      }),
      // New signups
      prisma.user.count({
        where: {
          gymId: gym.id,
          role: 'member',
          deletedAt: null,
          createdAt: {
            gte: sevenDaysAgo,
          },
        },
      }),
      // Current occupancy (checked in today, not checked out)
      prisma.attendance.count({
        where: {
          gymId: gym.id,
          checkInTime: {
            gte: todayStart,
            lte: todayEnd,
          },
          checkOutTime: null,
        },
      }),
    ])

    // Process revenue data by month
    const monthMap = new Map<string, { revenue: number; payments: number; monthName: string }>()
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1) // Day 1 prevents month wrapping bug
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
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
      const dayKey = date.toISOString().split('T')[0]
      const dateLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      dayMap.set(dayKey, { checkins: 0, checkouts: 0, dateLabel })
    }

    attendance.forEach((record: { checkInTime: Date; checkOutTime: Date | null }) => {
      const date = new Date(record.checkInTime)
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

    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const currentMonthRevenue = monthMap.get(currentMonthKey)?.revenue || 0

    return NextResponse.json({
      stats: {
        totalMembers,
        activeMembers,
        todayCheckins,
        pendingPayments: pendingPaymentsCount,
        monthlyRevenue: currentMonthRevenue,
        expiredMembers: expiringSoon, // Alias for ease of frontend migration
        newSignups,
        currentOccupancy,
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

