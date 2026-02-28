import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // 1. Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    })

    // For security, don't reveal if user exists or not
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, you will receive a reset link shortly.',
      })
    }

    // 2. Generate token
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 3600000) // 1 hour from now

    // 3. Save token to DB (Delete any old tokens for this email first)
    await prisma.passwordResetToken.deleteMany({
      where: { email },
    })

    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expiresAt,
      },
    })

    // 4. Send Email (Placeholder)
    // In production, use a service like Resend, SendGrid, or Supabase SMTP
    const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`
    
    console.log(`Password reset requested for ${email}. Link: ${resetLink}`)
    
    /* 
    EXAMPLE WITH RESEND:
    await resend.emails.send({
      from: 'Klimarx Space <noreply@klimarx.space>',
      to: email,
      subject: 'Reset Your Password',
      html: `<p>Click <a href="${resetLink}">here</a> to reset your password. This link expires in 1 hour.</p>`
    });
    */

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
