import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { Resend } from 'resend'
import { getGymFromRequest } from '@/lib/gym-context'
import { rateLimit, getClientIP } from '@/lib/rate-limit'

// Initialize Resend (do this once at module level)
const resend = new Resend(process.env.RESEND_API_KEY)

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
      // For security, we might want to return 200 but not send an email
      // However, usually 429 is fine for forgot-password
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

    // 6. Send email via Resend
    const { data, error } = await resend.emails.send({
      from: `${gym.name} <noreply@klimarsspace.com>`,
      to: normalizedEmail,
      subject: `Reset Your ${gym.name} Password`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #10b981;">Password Reset Request</h2>
          <p>Hello ${user.firstName || 'Member'},</p>
          <p>We received a request to reset your password for your ${gym.name} account.</p>
          <p>Click the button below to set a new password:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" 
               style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            This link will expire in 1 hour for security reasons.<br>
            If you did not request a password reset, please ignore this email or contact support immediately.
          </p>
          
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #888; font-size: 12px; text-align: center;">
            ${gym.name}<br>
            ${gym.address || ''}
          </p>
        </div>
      `,
      text: `Password Reset Request\n\nHello ${user.firstName || 'Member'},\n\nClick here to reset your password for ${gym.name}: ${resetLink}\n\nThis link expires in 1 hour.\n\nIf you didn't request this, ignore this email.\n\n${gym.name} Team`,
    })

    if (error) {
      console.error('Resend error:', error)
      // Still return success to user (security)
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, you will receive a reset link shortly.',
      })
    }

    // Log success (optional)
    console.log(`Password reset email sent to ${normalizedEmail}`)

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