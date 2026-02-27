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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const currentUser = await getCurrentUser()

    if (!currentUser || currentUser.id !== id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const member = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        memberProfile: {
          select: {
            expiryDate: true,
            verified: true,
            paymentStatus: true,
            fitnessGoals: true,
            profileImage: true,
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