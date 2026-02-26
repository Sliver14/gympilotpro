import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const memberships = await prisma.membershipPackage.findMany({
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
