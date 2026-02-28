import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user || !['admin', 'secretary', 'trainer'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const now = new Date()

    const expiredMembers = await prisma.user.findMany({
      where: {
        role: 'member',
        deletedAt: null,
        memberProfile: {
          expiryDate: {
            lt: now,
          },
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        memberProfile: {
          select: {
            expiryDate: true,
            membership: {
              select: {
                id: true,
                name: true,
                price: true,
              },
            },
          },
        },
      },
      orderBy: {
        memberProfile: {
          expiryDate: 'asc',
        },
      },
    })

    return NextResponse.json(expiredMembers)
  } catch (error) {
    console.error('Expired members fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
