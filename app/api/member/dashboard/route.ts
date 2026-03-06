import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Fetch all member data in parallel with optimized selects
    const [memberData, attendanceData] = await Promise.all([
      // Get member profile with only needed fields
      prisma.user.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          phoneNumber: true,
          memberProfile: {
            select: {
              expiryDate: true,
              verified: true,
              paymentStatus: true,
              fitnessGoals: true,
              emergencyContact: true,
              emergencyPhone: true,
              membership: {
                select: {
                  name: true,
                  price: true,
                },
              },
            },
          },
        },
      }),
      // Get recent attendance (last 100 records) with only needed fields
      prisma.attendance.findMany({
        where: { userId: user.id },
        select: {
          id: true,
          checkInTime: true,
          checkOutTime: true,
          method: true,
        },
        orderBy: { checkInTime: 'desc' },
        take: 100,
      }),
    ])

    if (!memberData || !memberData.memberProfile) {
      // If the user exists but has no member profile, they might be a staff member
      const role = user.role || 'user'
      return NextResponse.json(
        { error: `Member profile not found. Your account role is ${role}.` },
        { status: 404 }
      )
    }

    // Calculate monthly visits
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthlyVisits = attendanceData.filter((a: { checkInTime: Date }) => {
      const checkIn = new Date(a.checkInTime)
      return checkIn >= monthStart
    }).length

    return NextResponse.json({
      member: memberData,
      attendance: attendanceData,
      monthlyVisits,
    })
  } catch (error) {
    console.error('Member dashboard error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

