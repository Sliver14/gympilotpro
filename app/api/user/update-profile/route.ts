import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { getGymFromRequest } from '@/lib/gym-context'

export async function POST(req: NextRequest) {
  try {
    const gym = await getGymFromRequest(req)
    if (!gym) {
      return NextResponse.json({ error: 'Gym not found' }, { status: 404 })
    }

    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify user belongs to this gym
    if (user.gymId !== gym.id) {
      return NextResponse.json(
        { error: 'Unauthorized for this gym' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { 
      firstName, 
      lastName, 
      email, 
      phoneNumber, 
      birthday, 
      gender, 
      fitnessGoals, 
      fitnessGoalsDetails 
    } = body

    // 1. Update User base data
    // Use updateMany to ensure gymId is verified in the query as per requirements
    await prisma.user.updateMany({
      where: { 
        id: user.id,
        gymId: gym.id
      },
      data: {
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        email: email || undefined,
        phoneNumber: phoneNumber || undefined,
      }
    })

    // Fetch the updated user to return it
    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id }
    })

    // 2. Update Member Profile if it exists
    if (user.role === 'member') {
      await prisma.memberProfile.updateMany({
        where: { 
          userId: user.id,
          gymId: gym.id
        },
        data: {
          birthday: birthday || undefined,
          gender: gender || undefined,
          fitnessGoals: fitnessGoals || undefined,
          fitnessGoalsDetails: fitnessGoalsDetails || undefined,
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    })

  } catch (error: any) {
    console.error('Update profile error:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Email already in use' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
