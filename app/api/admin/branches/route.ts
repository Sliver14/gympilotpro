import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getGymFromRequest } from '@/lib/gym-context';

export async function GET(request: NextRequest) {
  try {
    const gym = await getGymFromRequest(request);
    if (!gym) return NextResponse.json({ error: 'Gym not found' }, { status: 404 });

    const branches = await prisma.branch.findMany({
      where: { gymId: gym.id },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json({ branches });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch branches' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const gym = await getGymFromRequest(request);
    if (!gym) return NextResponse.json({ error: 'Gym not found' }, { status: 404 });

    // Check Elite plan + branch limit
    const branchCount = await prisma.branch.count({ where: { gymId: gym.id } });
    if (branchCount >= (gym.maxBranches || 5)) {
      return NextResponse.json({ error: 'Maximum branches reached for your plan' }, { status: 403 });
    }

    const { name, address, phone, coordinates, openingHours, manager, capacity } = await request.json();

    const branch = await prisma.branch.create({
      data: {
        gymId: gym.id,
        name,
        address,
        phone,
        coordinates,
        openingHours,
        manager,
        capacity: capacity || 0,
      }
    });

    return NextResponse.json({ branch });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create branch' }, { status: 500 });
  }
}