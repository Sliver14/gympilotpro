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

    // Define the time window (current month)
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

    // 1. Fetch all attendances for the gym this month to calculate the leaderboard
    // We use groupBy to count visits per user efficiently
    const attendanceGroups = await prisma.attendance.groupBy({
      by: ['userId'],
      where: {
        gymId: gym.id,
        checkInTime: {
          gte: monthStart,
          lte: monthEnd,
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
      take: 100, // Top 100 members to rank
    })

    // Fetch user details for the top members (to get names/avatars)
    const userIds = attendanceGroups.map(g => g.userId)
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        profileImage: true,
      }
    })

    // Map the aggregated data to the user details
    const leaderboard = attendanceGroups.map((group, index) => {
      const u = users.find(user => user.id === group.userId)
      return {
        id: group.userId,
        rank: index + 1,
        // Privacy: Only show First Name and Last Initial
        name: u ? `${u.firstName} ${u.lastName?.[0] || ''}.` : 'Anonymous Member',
        profileImage: u?.profileImage,
        visits: group._count.id,
        isCurrentUser: group.userId === user.id
      }
    })

    // 2. Find Current User's Stats
    let currentUserStats = leaderboard.find(l => l.id === user.id)
    
    // If the user hasn't visited this month or isn't in the top 100, calculate their stats specifically
    if (!currentUserStats) {
      const userVisits = await prisma.attendance.count({
        where: {
          userId: user.id,
          gymId: gym.id,
          checkInTime: {
            gte: monthStart,
            lte: monthEnd,
          },
        }
      })
      
      // Calculate rank based on where their visit count would fall (rough estimate if outside top 100)
      const usersWithMoreVisits = await prisma.attendance.groupBy({
        by: ['userId'],
        where: {
          gymId: gym.id,
          checkInTime: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        having: {
          id: {
            _count: {
              gt: userVisits
            }
          }
        }
      })

      currentUserStats = {
        id: user.id,
        rank: usersWithMoreVisits.length + 1,
        name: `${user.firstName} ${user.lastName?.[0] || ''}.`,
        profileImage: user.profileImage,
        visits: userVisits,
        isCurrentUser: true
      }
    }

    // 3. Calculate Workout Streak (Consecutive days attended)
    // Fetch user's distinct check-in days in descending order
    const allUserAttendances = await prisma.attendance.findMany({
      where: { userId: user.id, gymId: gym.id },
      select: { checkInTime: true },
      orderBy: { checkInTime: 'desc' },
    })

    let currentStreak = 0
    let checkDate = new Date()
    checkDate.setHours(0, 0, 0, 0)

    // Check if they visited today
    const visitedToday = allUserAttendances.some(a => {
      const d = new Date(a.checkInTime)
      d.setHours(0,0,0,0)
      return d.getTime() === checkDate.getTime()
    })

    // If not visited today, check if they visited yesterday to see if streak is still alive
    let streakAlive = true
    if (!visitedToday) {
      checkDate.setDate(checkDate.getDate() - 1)
      const visitedYesterday = allUserAttendances.some(a => {
        const d = new Date(a.checkInTime)
        d.setHours(0,0,0,0)
        return d.getTime() === checkDate.getTime()
      })
      
      if (!visitedYesterday) {
        // Streak is dead (0) if they didn't visit today OR yesterday
        streakAlive = false
      }
    }

    // If streak might be alive, calculate it
    if (streakAlive) {
      // Create a Set of all unique date strings the user visited (YYYY-MM-DD)
      const uniqueVisitDays = new Set(
        allUserAttendances.map(a => {
          const d = new Date(a.checkInTime)
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
        })
      )

      // Start counting backwards from today (or yesterday if they haven't visited today yet)
      let countDate = new Date()
      if (!visitedToday) {
        countDate.setDate(countDate.getDate() - 1)
      }

      while (true) {
        const dateString = `${countDate.getFullYear()}-${String(countDate.getMonth() + 1).padStart(2, '0')}-${String(countDate.getDate()).padStart(2, '0')}`
        if (uniqueVisitDays.has(dateString)) {
          currentStreak++
          countDate.setDate(countDate.getDate() - 1) // Move back one day
        } else {
          break // Gap found, streak ends
        }
      }
    }

    // Return the top 10 for the community board, and the current user's specific stats
    return NextResponse.json({
      leaderboard: leaderboard.slice(0, 10),
      currentUser: {
        ...currentUserStats,
        streak: currentStreak
      }
    })

  } catch (error) {
    console.error('Community leaderboard error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
