import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, getCurrentUser } from '@/lib/auth'
import { getGymFromRequest } from '@/lib/gym-context'

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
      password,
      firstName,
      lastName,
      phoneNumber,
      role, // admin, secretary, trainer
      specialization,
    } = body

    if (!email || !password || !firstName || !lastName || !role) {
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

    const hashedPassword = await hashPassword(password)

    const user = await prisma.user.create({
      data: {
        gymId: gym.id,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phoneNumber,
        role,
        staffProfile: {
          create: {
            gymId: gym.id,
            specialization: specialization || null,
          },
        },
      },
    })

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
