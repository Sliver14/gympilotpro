import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
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
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        email: email || undefined,
        phoneNumber: phoneNumber || undefined,
      }
    })

    // 2. Update Member Profile if it exists
    if (user.role === 'member') {
      await prisma.memberProfile.update({
        where: { userId: user.id },
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
