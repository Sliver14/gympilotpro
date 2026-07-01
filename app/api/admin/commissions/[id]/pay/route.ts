import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'superadmin') {
      return NextResponse.json({ error: 'Unauthorized: Superadmins only' }, { status: 403 })
    }

    const { id } = await params;

    const commission = await prisma.commission.findUnique({
      where: { id }
    })

    if (!commission) {
      return NextResponse.json({ error: 'Commission record not found' }, { status: 404 })
    }

    if (commission.status === 'paid') {
      return NextResponse.json({ success: true, message: 'Already marked as paid' })
    }

    await prisma.commission.update({
      where: { id },
      data: {
        status: 'paid',
        paidAt: new Date()
      }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Mark commission paid error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
