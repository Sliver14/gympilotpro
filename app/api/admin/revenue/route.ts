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

    // Get last 12 months of revenue data
    const months: Array<{
      month: string
      revenue: number
      payments: number
    }> = []

    for (let i = 11; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)

      const payments = await prisma.payment.findMany({
        where: {
          status: 'completed',
          createdAt: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
      })

      const revenue = payments.reduce((sum, p) => sum + p.amount, 0)
      const monthName = monthStart.toLocaleString('default', { month: 'short', year: '2-digit' })

      months.push({
        month: monthName,
        revenue,
        payments: payments.length,
      })
    }

    return NextResponse.json(months)
  } catch (error) {
    console.error('Revenue data error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
