import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { getGymFromRequest } from '@/lib/gym-context'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    const gym = await getGymFromRequest(request)

    // Ensure authorized access
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized: Only admins can access advanced analytics' },
        { status: 401 }
      )
    }

    if (!gym) {
      return NextResponse.json(
        { error: 'Gym not found' },
        { status: 404 }
      )
    }

    // Dates for calculations
    const now = new Date()
    const thirtyDaysAgo = new Date(now)
    thirtyDaysAgo.setDate(now.getDate() - 30)

    const sixtyDaysAgo = new Date(now)
    sixtyDaysAgo.setDate(now.getDate() - 60)

    // 1. Fetch detailed members for the exportable table
    const memberDataRaw = await prisma.user.findMany({
      where: {
        gymId: gym.id,
        role: 'member',
        deletedAt: null,
      },
      include: {
        memberProfile: {
          include: {
            membership: true
          }
        },
        payments: {
          where: { status: 'approved' },
          select: { amount: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Process members
    const members = memberDataRaw.map(m => {
      const profile = m.memberProfile
      let status = 'expired'
      
      if (profile && profile.expiryDate) {
        const timeDiff = new Date(profile.expiryDate).getTime() - now.getTime()
        const daysToExpiry = Math.ceil(timeDiff / (1000 * 3600 * 24))
        
        if (daysToExpiry > 7) status = 'active'
        else if (daysToExpiry > 0 && daysToExpiry <= 7) status = 'expiring'
      }

      const totalPaid = m.payments.reduce((sum, p) => sum + p.amount, 0)

      return {
        id: m.id,
        name: `${m.firstName} ${m.lastName}`.trim() || 'Unnamed',
        email: m.email,
        status,
        package: profile?.membership?.name || 'No Package',
        joinDate: m.createdAt.toISOString(),
        expiryDate: profile?.expiryDate ? profile.expiryDate.toISOString() : 'N/A',
        totalPaid
      }
    })

    // 2. Package Breakdown & Projected MRR
    let mrr = 0
    const packageMap = new Map<string, { count: number, revenue: number }>()

    members.forEach(m => {
      if (m.status === 'active' || m.status === 'expiring') {
        const pkgName = m.package
        if (pkgName !== 'No Package') {
          // Attempt to find package to normalize monthly cost
          const pkgRaw = memberDataRaw.find(md => md.id === m.id)?.memberProfile?.membership
          let monthlyValue = 0
          
          if (pkgRaw) {
             // Basic MRR normalization (e.g. if annual, divide by 12)
             if (pkgRaw.duration >= 360) monthlyValue = pkgRaw.price / 12
             else if (pkgRaw.duration >= 90) monthlyValue = pkgRaw.price / 3
             else if (pkgRaw.duration >= 28) monthlyValue = pkgRaw.price
             else monthlyValue = pkgRaw.price * (30 / pkgRaw.duration) // Daily/Weekly scaled up
          }
          
          mrr += monthlyValue

          const current = packageMap.get(pkgName) || { count: 0, revenue: 0 }
          packageMap.set(pkgName, { 
            count: current.count + 1, 
            revenue: current.revenue + monthlyValue 
          })
        }
      }
    })

    const packageBreakdown = Array.from(packageMap.entries()).map(([name, data]) => ({
      name,
      count: data.count,
      revenue: data.revenue
    })).sort((a, b) => b.revenue - a.revenue) // Sort highest revenue first

    // 3. Churn & Retention Rates (Last 30 Days)
    const membersExpiringLast30Days = await prisma.memberProfile.count({
      where: {
        gymId: gym.id,
        expiryDate: {
          gte: thirtyDaysAgo,
          lte: now,
        }
      }
    })

    const activeMembers = members.filter(m => m.status === 'active' || m.status === 'expiring').length
    const totalMembersStartOfMonth = activeMembers + membersExpiringLast30Days

    let churnRate = 0
    let retentionRate = 100

    if (totalMembersStartOfMonth > 0) {
      churnRate = (membersExpiringLast30Days / totalMembersStartOfMonth) * 100
      retentionRate = 100 - churnRate
    }

    return NextResponse.json({
      mrr: Math.round(mrr),
      churnRate,
      retentionRate,
      packageBreakdown,
      members
    })

  } catch (error) {
    console.error('Admin advanced analytics error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
