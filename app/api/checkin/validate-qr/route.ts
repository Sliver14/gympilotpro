import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth' // CORRECTED: Using the function suggested by the compiler

export async function POST(req: NextRequest) {
  try {
    // 1. Authentication & Role-Based Authorization
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: No session found' }, { status: 401 })
    }

    if (!['admin', 'secretary', 'trainer'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 })
    }

    // 2. Validate Request Body
    const body = await req.json()
    const { qrCodeData } = body

    if (!qrCodeData) {
      return NextResponse.json({ error: 'Bad Request: qrCodeData is required' }, { status: 400 })
    }

    // 3. Find Member by QR Code
    const memberProfile = await prisma.memberProfile.findUnique({
      where: { qrCode: qrCodeData },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    if (!memberProfile) {
      return NextResponse.json({
        isValid: false,
        message: 'Invalid QR Code. Member not found.',
      }, { status: 404 })
    }

    // 4. Check Membership Status
    const now = new Date()
    const isExpired = memberProfile.expiryDate < now

    if (isExpired) {
      // Still return a 200 OK because the QR was valid, but the membership status is not.
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

    // 5. Log Attendance on Successful Check-in
    await prisma.attendance.create({
      data: {
        userId: memberProfile.userId,
        checkInTime: now,
        method: 'qr',
      },
    })

    // 6. Return Success Response
    return NextResponse.json({
      isValid: true,
      message: 'Valid. Access granted.',
      member: {
        fullName: `${memberProfile.user.firstName} ${memberProfile.user.lastName}`,
        profileImage: memberProfile.profileImage,
        expiryDate: memberProfile.expiryDate.toISOString(),
      },
    })
  } catch (error) {
    // Gracefully handle JSON parsing errors or other unexpected issues
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Bad Request: Invalid JSON format' }, { status: 400 });
    }
    
    console.error('QR Validation Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
