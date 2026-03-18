import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, verifyPassword, getCurrentUser } from '@/lib/auth'
import { getGymFromRequest } from '@/lib/gym-context'

export async function POST(req: NextRequest) {
  try {
    const gym = await getGymFromRequest(req)
    if (!gym) {
      return NextResponse.json({ error: 'Gym not found' }, { status: 404 })
    }

    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user belongs to this gym
    if (user.gymId !== gym.id) {
      return NextResponse.json(
        { error: 'Unauthorized for this gym' },
        { status: 403 }
      )
    }

    const { currentPassword, newPassword } = await req.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Current and new passwords are required' }, { status: 400 })
    }

    if (newPassword.length < 4) {
      return NextResponse.json({ error: 'New password must be at least 4 characters long' }, { status: 400 })
    }

    // Verify current password
    const passwordValid = await verifyPassword(currentPassword, user.password)

    if (!passwordValid) {
      return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 })
    }

    // Update password
    const hashedPassword = await hashPassword(newPassword)

    await prisma.user.update({
      where: { 
        id: user.id,
        gymId: gym.id
      },
      data: { password: hashedPassword },
    })

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully',
    })
  } catch (error) {
    console.error('Change password error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
