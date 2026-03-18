import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getGymFromRequest } from '@/lib/gym-context'

export async function GET(req: NextRequest) {
  try {
    const gym = await getGymFromRequest(req)

    if (!gym) {
      return NextResponse.json(
        { error: 'Gym not found' },
        { status: 400 }
      )
    }

    const memberships = await prisma.membershipPackage.findMany({
      where: { gymId: gym.id },
      orderBy: { price: 'asc' },
    })

    return NextResponse.json(memberships)
  } catch (error) {
    console.error('Fetch memberships error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
