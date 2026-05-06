import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { getGymFromRequest } from '@/lib/gym-context'
import { rateLimit, getClientIP } from '@/lib/rate-limit'
import { sendPasswordResetEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const gym = await getGymFromRequest(req)
    if (!gym) {
      return NextResponse.json({ error: 'Gym not found' }, { status: 404 })
    }

    const { email } = await req.json()

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim()
    const ip = await getClientIP()

    // 1. Rate Limiting
    // Limit by IP: Max 10 requests per hour
    const ipLimit = await rateLimit(`forgot-password:ip:${ip}`, 10, 3600)
    if (!ipLimit.success) {
      return NextResponse.json(
        { error: 'Too many requests from this IP. Please try again in an hour.' },
        { status: 429 }
      )
    }

    // Limit by Email: Max 3 requests per hour
    const emailLimit = await rateLimit(`forgot-password:email:${normalizedEmail}`, 3, 3600)
    if (!emailLimit.success) {
      return NextResponse.json(
        { error: 'Too many reset requests for this email. Please check your inbox or try again later.' },
        { status: 429 }
      )
    }

    // 2. Check if user exists (scoped by gymId)
    const user = await prisma.user.findFirst({
      where: { 
        email: normalizedEmail,
        gymId: gym.id
      },
    })

    // For security: always return success message
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, you will receive a reset link shortly.',
      })
    }

    // 2. Generate secure token
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 3600000) // 1 hour

    // 3. Delete any old reset tokens for this email (prevents spam)
    await prisma.passwordResetToken.deleteMany({
      where: { email: normalizedEmail },
    })

    // 4. Save new token
    await prisma.passwordResetToken.create({
      data: {
        email: normalizedEmail,
        token,
        expiresAt,
      },
    })

    // 5. Build reset link (use gym-specific URL)
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/${gym.slug}/reset-password?token=${token}`

    // 6. Send email via centralized helper
    await sendPasswordResetEmail({
      email: normalizedEmail,
      firstName: user.firstName || 'Member',
      gymName: gym.name,
      resetLink,
    });

    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, you will receive a reset link shortly.',
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}