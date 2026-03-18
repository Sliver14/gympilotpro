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

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (user.gymId !== gym.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Calculate date range for last 12 months
    const now = new Date()
    const twelveMonthsAgo = new Date()
    twelveMonthsAgo.setMonth(now.getMonth() - 11)
    twelveMonthsAgo.setDate(1)
    twelveMonthsAgo.setHours(0, 0, 0, 0)

    // Single query to get all payments from last 12 months
    const payments = await prisma.payment.findMany({
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
    })

    // Group by month using a Map for O(n) performance
    const monthMap = new Map<string, { revenue: number; payments: number; monthName: string }>()

    // Initialize all 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date()
      date.setMonth(now.getMonth() - i)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const monthName = date.toLocaleString('default', { month: 'short', year: '2-digit' })
      monthMap.set(monthKey, { revenue: 0, payments: 0, monthName })
    }

    // Aggregate payments by month
    payments.forEach((payment: { amount: number; createdAt: Date }) => {
      const date = new Date(payment.createdAt)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const monthData = monthMap.get(monthKey)
      if (monthData) {
        monthData.revenue += payment.amount
        monthData.payments += 1
      }
    })

    // Convert to array format
    const months = Array.from(monthMap.entries())
      .map(([key, data]) => ({
        month: data.monthName,
        revenue: data.revenue,
        payments: data.payments,
      }))
      .sort((a, b) => {
        // Sort by month order
        const aDate = new Date(a.month)
        const bDate = new Date(b.month)
        return aDate.getTime() - bDate.getTime()
      })

    return NextResponse.json(months)
  } catch (error) {
    console.error('Revenue data error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}