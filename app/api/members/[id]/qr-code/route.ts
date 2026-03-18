import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import QRCode from 'qrcode'
import { getGymFromRequest } from '@/lib/gym-context'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ← correct Promise type
) {
  try {
    // Critical fix: await the params Promise
    const { id: memberId } = await params

    if (!memberId) {
      return NextResponse.json(
        { error: 'Member ID is required' },
        { status: 400 }
      )
    }

    const gym = await getGymFromRequest(req)
    if (!gym) {
      return NextResponse.json({ error: 'Gym not found' }, { status: 404 })
    }

    // Fetch only the qrCode field (efficient)
    const memberProfile = await prisma.memberProfile.findFirst({
      where: { 
        userId: memberId,
        gymId: gym.id,
      }, // assuming userId stores the member/user ID
      select: { qrCode: true },
    })

    if (!memberProfile?.qrCode) {
      return NextResponse.json(
        { error: 'QR code data not found for this member in this gym' },
        { status: 404 }
      )
    }

    // Generate fresh QR image as base64 data URL
    // (You could also just return the stored qrCode string if it's already a data URL)
    const qrCodeDataURL = await QRCode.toDataURL(memberProfile.qrCode, {
      width: 256,
      margin: 2,
      errorCorrectionLevel: 'H', // high error correction
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    })

    return NextResponse.json({ qrCode: qrCodeDataURL })

  } catch (error) {
    console.error('Failed to generate QR code:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}