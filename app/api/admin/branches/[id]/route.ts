import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getGymFromRequest } from '@/lib/gym-context';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const gym = await getGymFromRequest(request);
    if (!gym) {
      return NextResponse.json({ error: 'Gym not found' }, { status: 404 });
    }

    const { name, address, phone, coordinates, openingHours, manager, capacity, isActive, isDefault } = await request.json();

    if (isDefault) {
      // Unset other default branches for this gym
      await prisma.branch.updateMany({
        where: { gymId: gym.id, isDefault: true },
        data: { isDefault: false }
      });
    }

    const branch = await prisma.branch.update({
      where: {
        id,
        gymId: gym.id,
      },
      data: {
        name,
        address,
        phone,
        coordinates,
        openingHours,
        manager,
        capacity,
        isActive,
        isDefault,
      },
    });

    return NextResponse.json({ branch });
  } catch (error) {
    console.error('Failed to update branch:', error);
    return NextResponse.json(
      { error: 'Failed to update branch' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const gym = await getGymFromRequest(request);
    if (!gym) {
      return NextResponse.json({ error: 'Gym not found' }, { status: 404 });
    }

    // Check if it is the default branch
    const branch = await prisma.branch.findFirst({
      where: { id, gymId: gym.id }
    });

    if (!branch) {
      return NextResponse.json({ error: 'Branch not found' }, { status: 404 });
    }

    if (branch.isDefault) {
      return NextResponse.json(
        { error: 'Cannot delete the default branch. Please set another branch as default first.' },
        { status: 400 }
      );
    }

    // Prevent deleting the last branch
    const branchCount = await prisma.branch.count({
      where: { gymId: gym.id },
    });

    if (branchCount <= 1) {
      return NextResponse.json(
        { error: 'Cannot delete the last branch' },
        { status: 400 }
      );
    }

    // Prevent deleting a branch containing members
    const memberCount = await prisma.user.count({
      where: { branchId: id, role: 'member' }
    });

    if (memberCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete branch containing members. Please reassign the members first.' },
        { status: 400 }
      );
    }

    await prisma.branch.delete({
      where: {
        id,
        gymId: gym.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete branch:', error);
    return NextResponse.json(
      { error: 'Failed to delete branch' },
      { status: 500 }
    );
  }
}