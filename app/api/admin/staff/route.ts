import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, getCurrentUser } from '@/lib/auth'
import { getGymFromRequest } from '@/lib/gym-context'
import { sendWelcomeEmail } from '@/lib/email'

export async function GET(request: NextRequest) {
  try {
    const gym = await getGymFromRequest(request)
    if (!gym) {
      return NextResponse.json({ error: 'Gym not found' }, { status: 404 })
    }

    const user = await getCurrentUser()

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (user.gymId !== gym.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const staff = await prisma.user.findMany({
      where: {
        gymId: gym.id,
        role: { in: ['admin', 'secretary', 'trainer'] },
        deletedAt: null,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        profileImage: true,
        role: true,
        createdAt: true,
        staffProfile: {
          select: {
            specialization: true,
            joinDate: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(staff)
  } catch (error) {
    console.error('Admin staff error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const gym = await getGymFromRequest(req)
    if (!gym) {
      return NextResponse.json({ error: 'Gym not found' }, { status: 404 })
    }

    const currentUser = await getCurrentUser()

    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (currentUser.gymId !== gym.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    let {
      email,
      firstName,
      lastName,
      phoneNumber,
      role, // admin, secretary, trainer
      specialization,
    } = body

    if (!email || !firstName || !lastName || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Normalize email
    email = email.toLowerCase().trim()

    // Basic email check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // Existing user? (Email is globally unique in schema)
    if (await prisma.user.findUnique({ where: { email } })) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

    const defaultPassword = "12345678"
    const hashedPassword = await hashPassword(defaultPassword)

    const user = await prisma.user.create({
      data: {
        gymId: gym.id,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phoneNumber,
        role,
        status: 'active', // Staff added by admin are active by default
        staffProfile: {
          create: {
            gymId: gym.id,
            specialization: specialization || null,
          },
        },
      },
    })

    // Generate login URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://gympilotpro.com';
    const loginUrl = gym.customDomain && gym.domainVerified 
      ? `https://${gym.customDomain}/login`
      : `${baseUrl.replace('://', `://${gym.slug}.`)}/login`;

    // Send Welcome Email
    await sendWelcomeEmail({
      email: user.email,
      firstName: user.firstName,
      role: user.role,
      gymName: gym.name,
      loginUrl,
      password: defaultPassword
    });

    return NextResponse.json({
      success: true,
      message: 'Staff member registered successfully',
      userId: user.id,
    })
  } catch (error) {
    console.error('Admin staff create error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
