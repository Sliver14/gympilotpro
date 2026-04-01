import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { getGymFromRequest } from '@/lib/gym-context'

export async function GET(req: NextRequest) {
  try {
    const gym = await getGymFromRequest(req)

    if (!gym) {
      return NextResponse.json({ error: 'Gym not found' }, { status: 400 })
    }

    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Define the time window (Last 30 days for a more stable/active leaderboard)
    const now = new Date()
    const thirtyDaysAgo = new Date(now)
    thirtyDaysAgo.setDate(now.getDate() - 30)

    // 1. Fetch all attendances for the gym in the last 30 days
    const attendanceGroups = await prisma.attendance.groupBy({
      by: ['userId'],
      where: {
        gymId: gym.id,
        checkInTime: {
          gte: thirtyDaysAgo,
          lte: now,
        },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
    })

    // Rank them in memory to handle ties
    let currentRank = 1
    let previousVisits = -1

    const rankedGroups = attendanceGroups.map((group, index) => {
      if (group._count.id !== previousVisits) {
        currentRank = index + 1
        previousVisits = group._count.id
      }
      return {
        userId: group.userId,
        visits: group._count.id,
        rank: currentRank
      }
    })

    // Find the top 10 users plus the current user
    const top10 = rankedGroups.slice(0, 10)
    const currentUserGroup = rankedGroups.find(g => g.userId === user.id)
    
    // Get total member count to show a realistic rank for inactive users
    const totalGymMembers = await prisma.user.count({
      where: { gymId: gym.id, role: 'member', deletedAt: null }
    })

    // Create a Set of user IDs we need to fetch details for
    const userIdsToFetch = new Set(top10.map(g => g.userId))
    userIdsToFetch.add(user.id)

    const users = await prisma.user.findMany({
      where: { id: { in: Array.from(userIdsToFetch) } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        profileImage: true,
      }
    })

    // Build the Top 10 Leaderboard
    const leaderboard = top10.map(group => {
      const u = users.find(u => u.id === group.userId)
      return {
        id: group.userId,
        rank: group.rank,
        name: u ? `${u.firstName} ${u.lastName?.[0] || ''}.` : 'Anonymous Member',
        profileImage: u?.profileImage || null,
        visits: group.visits,
        isCurrentUser: group.userId === user.id
      }
    })

    // Calculate current user's monthly stats
    let currentUserStats
    if (currentUserGroup) {
      currentUserStats = {
        id: user.id,
        rank: currentUserGroup.rank,
        name: `${user.firstName} ${user.lastName?.[0] || ''}.`,
        profileImage: user.profileImage,
        visits: currentUserGroup.visits,
        isCurrentUser: true
      }
    } else {
      currentUserStats = {
        id: user.id,
        // If they have 0 visits, they are ranked at the bottom
        rank: rankedGroups.length + 1,
        name: `${user.firstName} ${user.lastName?.[0] || ''}.`,
        profileImage: user.profileImage,
        visits: 0,
        isCurrentUser: true,
        unranked: true
      }
    }

    // 3. Calculate Workout Streak (Consecutive days attended)
    // Fetch user's distinct check-in days in descending order
    const allUserAttendances = await prisma.attendance.findMany({
      where: { userId: user.id, gymId: gym.id },
      select: { checkInTime: true },
      orderBy: { checkInTime: 'desc' },
    })

    // Extract unique days (YYYY-MM-DD)
    const uniqueVisitDays = Array.from(new Set(
      allUserAttendances.map(a => {
        // Adjust for locale / simple UTC date string
        const date = new Date(a.checkInTime)
        // using local date elements to match how the user experiences their days
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      })
    )).sort((a, b) => b.localeCompare(a)) // Sort Descending YYYY-MM-DD

    let currentStreak = 0

    if (uniqueVisitDays.length > 0) {
      const today = new Date()
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
      
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`

      if (uniqueVisitDays[0] === todayStr || uniqueVisitDays[0] === yesterdayStr) {
        currentStreak = 1
        let currentDate = new Date(uniqueVisitDays[0] + 'T12:00:00') // Add noon to avoid timezone shift on parsing

        for (let i = 1; i < uniqueVisitDays.length; i++) {
          currentDate.setDate(currentDate.getDate() - 1)
          const expectedDateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`
          
          if (uniqueVisitDays[i] === expectedDateStr) {
            currentStreak++
          } else {
            break // Gap found, streak ends
          }
        }
      }
    }

    // 4. Fetch Recent Activity Feed (Last 10 check-ins across the gym)
    const recentAttendancesRaw = await prisma.attendance.findMany({
      where: { gymId: gym.id },
      orderBy: { checkInTime: 'desc' },
      take: 10,
      select: {
        id: true,
        checkInTime: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          }
        }
      }
    })

    const recentActivity = recentAttendancesRaw.map(a => ({
      id: a.id,
      name: a.user ? `${a.user.firstName} ${a.user.lastName?.[0] || ''}.` : 'Anonymous Member',
      profileImage: a.user?.profileImage || null,
      time: a.checkInTime.toISOString(),
      type: 'check-in',
      isCurrentUser: a.user?.id === user.id
    }))

    // Return the top 10 for the community board, the current user's specific stats, and recent activity
    return NextResponse.json({
      leaderboard: leaderboard.slice(0, 10),
      currentUser: {
        ...currentUserStats,
        streak: currentStreak
      },
      recentActivity
    })

  } catch (error) {
    console.error('Community leaderboard error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
