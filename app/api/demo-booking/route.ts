import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { gymName, phoneNumber, memberCount } = body

    if (!gymName || !phoneNumber || !memberCount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const lead = await prisma.lead.create({
      data: {
        gymName,
        phoneNumber,
        memberCount,
      },
    })

    return NextResponse.json({ success: true, lead })
  } catch (error) {
    console.error('[DEMO_BOOKING_ERROR]', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
