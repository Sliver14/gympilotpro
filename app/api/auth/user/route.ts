import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getGymFromRequest } from '@/lib/gym-context'

export async function GET(request: NextRequest) {
  try {
    const gym = await getGymFromRequest(request)
    if (!gym) {
      return NextResponse.json({ error: 'Gym not found' }, { status: 404 })
    }

    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
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

    return NextResponse.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      profileImage: user.profileImage || null,
      memberProfile: user.memberProfile || null,
      staffProfile: user.staffProfile || null,
      gym: {
        name: gym.name,
        slug: gym.slug,
        customDomain: gym.customDomain,
        domainVerified: gym.domainVerified,
        qrCodeUrl: gym.qrCodeUrl,
      }
    })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
