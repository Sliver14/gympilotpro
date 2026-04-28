import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, createSession, requireActiveGymSubscription } from '@/lib/auth'
import { cookies } from 'next/headers'
import { getGymFromRequest } from '@/lib/gym-context'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    const gym = await getGymFromRequest(req)

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    if (!gym) {
       return NextResponse.json(
        { error: 'Gym context is required for login' },
        { status: 400 }
      )
    }

    // Deliberately NOT checking requireActiveGymSubscription() here
    // Everyone (Admin/Staff/Members) should be able to log in.
    // The UI layout and API routes will enforce access restrictions after login.

    const normalizedEmail = email.toLowerCase().trim()

    const user = await prisma.user.findFirst({
      where: { 
        email: normalizedEmail,
        gymId: gym.id 
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    const passwordValid = await verifyPassword(password, user.password)

    if (!passwordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    const token = await createSession(user.id)
    const cookieStore = await cookies()
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        gymSlug: gym.slug,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
