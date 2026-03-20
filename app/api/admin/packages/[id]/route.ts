import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user || !['admin', 'owner'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const { name, duration, price, description } = await req.json();

    const existingPackage = await prisma.membershipPackage.findUnique({
      where: { id }
    });

    if (!existingPackage || existingPackage.gymId !== user.gymId) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    }

    const updatedPackage = await prisma.membershipPackage.update({
      where: { id },
      data: {
        name: name !== existingPackage.name.split(' - ')[0] 
          ? `${name} - ${user.gymId.slice(0, 4)}` 
          : existingPackage.name,
        duration: parseInt(duration),
        price: parseFloat(price),
        description,
      },
    });

    return NextResponse.json({ success: true, package: updatedPackage });
  } catch (error: any) {
    console.error('Update package error:', error);
    return NextResponse.json({ error: 'Failed to update package' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user || !['admin', 'owner'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;

    const existingPackage = await prisma.membershipPackage.findUnique({
      where: { id }
    });

    if (!existingPackage || existingPackage.gymId !== user.gymId) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    }

    await prisma.membershipPackage.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete package error:', error);
    return NextResponse.json({ error: 'Failed to delete package. It may be in use by members.' }, { status: 500 });
  }
}
