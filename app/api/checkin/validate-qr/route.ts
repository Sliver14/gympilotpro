import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    // 1. Authentication & Role Check (staff only)
    const staff = await getCurrentUser()

    if (!staff) {
      return NextResponse.json({ error: 'Unauthorized: No session found' }, { status: 401 })
    }

    if (!['admin', 'secretary', 'trainer'].includes(staff.role)) {
      return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 })
    }

    // 2. Parse request body
    const body = await req.json()
    const { qrCodeData, memberId } = body

    if (!qrCodeData && !memberId) {
      return NextResponse.json(
        { error: 'Bad Request: Provide either qrCodeData or memberId' },
        { status: 400 }
      )
    }

    // 3. Find member profile (by QR or by memberId)
    let memberProfile

    if (qrCodeData) {
      memberProfile = await prisma.memberProfile.findUnique({
        where: { qrCode: qrCodeData.trim() },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      })
    } else {
      // Manual check-in via memberId (user ID)
      memberProfile = await prisma.memberProfile.findFirst({
        where: { userId: memberId },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      })
    }

    if (!memberProfile) {
      return NextResponse.json({
        isValid: false,
        message: 'Member not found.',
      }, { status: 404 })
    }

    const now = new Date()
    const todayStart = new Date(now.toISOString().split('T')[0] + 'T00:00:00Z')

    // 4. Check membership expiry
    if (memberProfile.expiryDate < now) {
      return NextResponse.json({
        isValid: false,
        message: 'Membership has expired.',
        member: {
          fullName: `${memberProfile.user.firstName} ${memberProfile.user.lastName}`,
          profileImage: memberProfile.profileImage,
          expiryDate: memberProfile.expiryDate.toISOString(),
        },
      })
    }

    // 5. Prevent duplicate check-ins within 2 hours on the same day
    const recentCheckIn = await prisma.attendance.findFirst({
      where: {
        userId: memberProfile.userId,
        checkInTime: {
          gte: todayStart,
        },
      },
      orderBy: {
        checkInTime: 'desc', // most recent first
      },
    })

    if (recentCheckIn) {
      const timeSinceLast = now.getTime() - recentCheckIn.checkInTime.getTime()
      const twoHoursMs = 2 * 60 * 60 * 1000 // 2 hours

      if (timeSinceLast < twoHoursMs) {
        const lastTime = recentCheckIn.checkInTime.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })

        const nextAllowed = new Date(recentCheckIn.checkInTime.getTime() + twoHoursMs)
        const nextAllowedStr = nextAllowed.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })

        return NextResponse.json({
          isValid: false,
          message: `Already checked in today at ${lastTime}. Next scan allowed after ${nextAllowedStr}.`,
          member: {
            fullName: `${memberProfile.user.firstName} ${memberProfile.user.lastName}`,
            profileImage: memberProfile.profileImage,
            expiryDate: memberProfile.expiryDate.toISOString(),
          },
        })
      }
    }

    // 6. Log new attendance (only if all checks pass)
    await prisma.attendance.create({
      data: {
        userId: memberProfile.userId,
        checkInTime: now,
        method: qrCodeData ? 'qr' : 'manual', // differentiate method
      },
    })

    // 7. Success response
    return NextResponse.json({
      isValid: true,
      message: 'Valid. Access granted.',
      member: {
        fullName: `${memberProfile.user.firstName} ${memberProfile.user.lastName}`,
        profileImage: memberProfile.profileImage,
        expiryDate: memberProfile.expiryDate.toISOString(),
      },
    })
  } catch (error: any) {
    console.error('Check-in Error:', error)

    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Bad Request: Invalid JSON format' }, { status: 400 })
    }

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}