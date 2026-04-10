import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { getGymFromRequest } from '@/lib/gym-context'

export async function GET(request: NextRequest) {
  try {
    const gym = await getGymFromRequest(request)
    if (!gym) {
      return NextResponse.json({ error: 'Gym not found' }, { status: 404 })
    }

    const user = await getCurrentUser()

    if (!user || !['admin', 'secretary', 'trainer'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (user.gymId !== gym.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const pendingPayments = await prisma.payment.findMany({
      where: {
        gymId: gym.id,
        status: 'pending',
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
            memberProfile: {
              select: {
                membershipId: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Fetch the current prices for the memberships associated with these payments
    const memberships = await prisma.membershipPackage.findMany({
      where: { gymId: gym.id }
    })

    const paymentsWithCurrentPrice = pendingPayments.map(payment => {
      let targetMembershipId = payment.user?.memberProfile?.membershipId
      
      // Try to extract membershipId from description for renewals: "Renewal: Name (ID)"
      const match = payment.description?.match(/\(([^)]+)\)$/) 
      if (match && match[1]) {
        targetMembershipId = match[1]
      }

      const currentPackage = memberships.find(m => m.id === targetMembershipId)

      return {
        ...payment,
        currentPackagePrice: currentPackage?.price || payment.amount
      }
    })

    return NextResponse.json(paymentsWithCurrentPrice)
  } catch (error) {
    console.error('Pending payments fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
