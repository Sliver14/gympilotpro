// import { NextRequest, NextResponse } from 'next/server'
// import { prisma } from '@/lib/prisma'
// import { getCurrentUser } from '@/lib/auth'

// export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
//   try {
//     const currentUser = await getCurrentUser()

//     if (!currentUser || currentUser.id !== params.id) {
//       return NextResponse.json(
//         { error: 'Unauthorized' },
//         { status: 401 }
//       )
//     }

//     const member = await prisma.user.findUnique({
//       where: { id: params.id },
//       include: {
//         memberProfile: {
//           include: {
//             membership: true,
//           },
//         },
//       },
//     })

//     if (!member) {
//       return NextResponse.json(
//         { error: 'Member not found' },
//         { status: 404 }
//       )
//     }

//     return NextResponse.json(member)
//   } catch (error) {
//     console.error('Get member error:', error)
//     return NextResponse.json(
//       { error: 'Internal server error' },
//       { status: 500 }
//     )
//   }
// }

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { getGymFromRequest } from '@/lib/gym-context'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const gym = await getGymFromRequest(request)
    if (!gym) {
      return NextResponse.json({ error: 'Gym not found' }, { status: 404 })
    }

    const { id } = await params

    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify current user belongs to this gym
    if (currentUser.gymId !== gym.id) {
      return NextResponse.json({ error: 'Unauthorized for this gym' }, { status: 403 })
    }

    const isStaff = ['admin', 'secretary', 'trainer'].includes(currentUser.role)
    const isOwner = currentUser.id === id

    if (!isStaff && !isOwner) {
      return NextResponse.json(
        { error: 'Unauthorized - you do not have permission to view this member' },
        { status: 401 }
      )
    }

    // Scope member lookup by gymId
    const member = await prisma.user.findFirst({
      where: { 
        id,
        gymId: gym.id
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        profileImage: true,
        memberProfile: {
          select: {
            expiryDate: true,
            verified: true,
            paymentStatus: true,
            fitnessGoals: true,
            emergencyContact: true,
            emergencyPhone: true,
            membership: {
              select: {
                name: true,
                price: true,
              },
            },
          },
        },
      },
    })

    if (!member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(member)
  } catch (error) {
    console.error('Get member error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}