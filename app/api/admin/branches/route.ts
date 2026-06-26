import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'
import { getGymFromRequest } from '@/lib/gym-context';

export async function GET(request: NextRequest) {
  try {
    const gym = await getGymFromRequest(request);
    if (!gym) return NextResponse.json({ error: 'Gym not found' }, { status: 404 });

    const startOfToday = new Date()
    startOfToday.setHours(0,0,0,0)

    const rawBranches = await prisma.branch.findMany({
      where: { gymId: gym.id },
      include: {
        _count: {
          select: {
            attendances: {
              where: {
                checkInTime: {
                  gte: startOfToday
                }
              }
            }
          }
        },
        users: {
          select: {
            role: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    const branches = rawBranches.map(b => {
      const membersCount = b.users.filter(u => u.role === 'member').length
      const trainersCount = b.users.filter(u => u.role === 'trainer' || u.role === 'secretary' || u.role === 'admin' || u.role === 'owner').length
      return {
        id: b.id,
        name: b.name,
        address: b.address,
        phone: b.phone,
        manager: b.manager,
        capacity: b.capacity,
        isActive: b.isActive,
        isDefault: b.isDefault,
        createdAt: b.createdAt,
        memberCount: membersCount,
        trainerCount: trainersCount,
        attendanceToday: b._count.attendances,
      }
    });

    return NextResponse.json({ branches });
  } catch (error) {
    console.error('Failed to fetch branches:', error);
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

    const { name, address, phone, coordinates, openingHours, manager, capacity, isDefault } = await request.json();

    // If setting as default or if it's the first branch, unset other default branches for this gym
    const shouldBeDefault = isDefault || branchCount === 0;

    if (shouldBeDefault) {
      await prisma.branch.updateMany({
        where: { gymId: gym.id, isDefault: true },
        data: { isDefault: false }
      });
    }

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
        isDefault: shouldBeDefault,
      }
    });

    return NextResponse.json({ branch });
  } catch (error) {
    console.error('Failed to create branch:', error);
    return NextResponse.json({ error: 'Failed to create branch' }, { status: 500 });
  }
}