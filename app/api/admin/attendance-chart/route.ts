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

    // Calculate date range for last 30 days
    const now = new Date()
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(now.getDate() - 29)
    thirtyDaysAgo.setHours(0, 0, 0, 0)

    // Single query to get all attendance from last 30 days
    const attendance = await prisma.attendance.findMany({
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
    })

    // Group by day using a Map for O(n) performance
    const dayMap = new Map<string, { checkins: number; checkouts: number; dateLabel: string }>()

    // Initialize all 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date()
      date.setDate(now.getDate() - i)
      date.setHours(0, 0, 0, 0)
      const dayKey = date.toISOString().split('T')[0] // YYYY-MM-DD
      const dateLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      dayMap.set(dayKey, { checkins: 0, checkouts: 0, dateLabel })
    }

    // Aggregate attendance by day
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

    // Convert to array format
    const days = Array.from(dayMap.entries())
      .map(([key, data]) => ({
        date: data.dateLabel,
        checkins: data.checkins,
        checkouts: data.checkouts,
      }))
      .sort((a, b) => {
        // Sort by date order
        const aDate = new Date(a.date)
        const bDate = new Date(b.date)
        return aDate.getTime() - bDate.getTime()
      })

    return NextResponse.json(days)
  } catch (error) {
    console.error('Attendance chart error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}