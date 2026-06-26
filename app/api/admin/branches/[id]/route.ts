import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getGymFromRequest } from '@/lib/gym-context';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const gym = await getGymFromRequest(request);
    if (!gym) return NextResponse.json({ error: 'Gym not found' }, { status: 404 });

    const data = await request.json();

    const branch = await prisma.branch.update({
      where: { id: params.id, gymId: gym.id },
      data
    });

    return NextResponse.json({ branch });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update branch' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const gym = await getGymFromRequest(request);
    if (!gym) return NextResponse.json({ error: 'Gym not found' }, { status: 404 });

    // Prevent deleting the last branch
    const branchCount = await prisma.branch.count({ where: { gymId: gym.id } });
    if (branchCount <= 1) {
      return NextResponse.json({ error: 'Cannot delete the last branch' }, { status: 400 });
    }

    await prisma.branch.delete({
      where: { id: params.id, gymId: gym.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete branch' }, { status: 500 });
  }
}