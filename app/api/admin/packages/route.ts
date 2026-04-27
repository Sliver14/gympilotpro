import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

const DEFAULT_PACKAGES = [
  { name: 'Daily Pass', duration: 1, price: 3000, description: '24 hours access' },
  { name: 'Bi-Weekly Pass', duration: 14, price: 10000, description: '14 days access' },
  { name: 'Monthly Pass', duration: 30, price: 20000, description: '30 days access' },
  { name: 'Quarterly Pass', duration: 90, price: 55000, description: '90 days access' },
  { name: 'Semi Annual Pass', duration: 180, price: 110000, description: '180 days access' },
  { name: 'Annual Pass', duration: 365, price: 220000, description: '365 days access' },
];

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !['admin', 'owner'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (!user.gymId) {
      return NextResponse.json({ error: 'User does not belong to a gym' }, { status: 400 });
    }

    const gymId = user.gymId;

    let packages = await prisma.membershipPackage.findMany({
      where: { gymId },
      orderBy: { price: 'asc' },
    });

    if (packages.length === 0) {
      // Seed default packages, ensuring name uniqueness by appending short gymId
      await prisma.membershipPackage.createMany({
        data: DEFAULT_PACKAGES.map(pkg => ({
          ...pkg,
          name: `${pkg.name} - ${gymId.slice(0, 4)}`, // Workaround for global @unique name
          gymId: gymId,
        }))
      });

      packages = await prisma.membershipPackage.findMany({
        where: { gymId },
        orderBy: { price: 'asc' },
      });
    }

    return NextResponse.json({ success: true, packages });
  } catch (error: any) {
    console.error('Fetch packages error:', error);
    return NextResponse.json({ error: 'Failed to fetch packages' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !['admin', 'owner'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (!user.gymId) {
      return NextResponse.json({ error: 'User does not belong to a gym' }, { status: 400 });
    }

    const gymId = user.gymId;

    const { name, duration, price, description } = await req.json();

    if (!name || !duration || !price || !description) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const newPackage = await prisma.membershipPackage.create({
      data: {
        name: `${name} - ${gymId.slice(0, 4)}`, // Workaround for global @unique name
        duration: parseInt(duration),
        price: parseFloat(price),
        description,
        gymId: gymId,
      },
    });

    return NextResponse.json({ success: true, package: newPackage });
  } catch (error: any) {
    console.error('Create package error:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Package name already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create package' }, { status: 500 });
  }
}
