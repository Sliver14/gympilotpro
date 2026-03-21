import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { getGymFromRequest } from '@/lib/gym-context'
import { rateLimit, getClientIP } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  try {
    const gym = await getGymFromRequest(req)
    if (!gym) {
      return NextResponse.json({ error: 'Gym not found' }, { status: 404 })
    }

    const ip = await getClientIP()
    const limit = await rateLimit(`reset-password:ip:${ip}`, 10, 3600)
    if (!limit.success) {
      return NextResponse.json(
        { error: 'Too many attempts. Please try again in an hour.' },
        { status: 429 }
      )
    }

    const { token, password } = await req.json()

    if (!token || !password) {
      return NextResponse.json({ error: 'Token and password are required' }, { status: 400 })
    }

    if (password.length < 4) {
      return NextResponse.json({ error: 'Password must be at least 4 characters long' }, { status: 400 })
    }

    // 1. Find and validate token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    })

    if (!resetToken || resetToken.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 })
    }

    // 2. Find user in THIS gym
    const user = await prisma.user.findFirst({
      where: { 
        email: resetToken.email,
        gymId: gym.id
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found in this gym' }, { status: 404 })
    }

    // 3. Update user password
    const hashedPassword = await hashPassword(password)

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    })

    // 4. Delete the used token
    await prisma.passwordResetToken.delete({
      where: { id: resetToken.id },
    })

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.',
    })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
