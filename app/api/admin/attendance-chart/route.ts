import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { Attendance } from '@prisma/client'  // ← added this import

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get last 30 days of attendance data
    const days: Array<{
      date: string
      checkins: number
      checkouts: number
    }> = []

    for (let i = 29; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)

      const dayStart = new Date(date)
      const dayEnd = new Date(date)
      dayEnd.setHours(23, 59, 59, 999)

      const attendance = await prisma.attendance.findMany({
        where: {
          checkInTime: {
            gte: dayStart,
            lte: dayEnd,
          },
        },
      })

      const checkins = attendance.length
      const checkouts = attendance.filter((a: Attendance) => !!a.checkOutTime).length  // ← fixed here

      days.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        checkins,
        checkouts,
      })
    }

    return NextResponse.json(days)
  } catch (error) {
    console.error('Attendance chart error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}