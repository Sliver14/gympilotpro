import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !['admin', 'owner'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (!user.gymId) {
      return NextResponse.json({ error: 'User does not belong to a gym' }, { status: 400 });
    }

    const gym = await prisma.gym.findUnique({
      where: { id: user.gymId },
      include: {
        subscriptions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        }
      }
    });

    if (!gym) {
      return NextResponse.json({ error: 'Gym not found' }, { status: 404 });
    }

    const currentPlan = gym.subscriptions[0]?.plan || 'Free';

    return NextResponse.json({ success: true, gym, currentPlan });
  } catch (error: any) {
    console.error('Fetch gym error:', error);
    return NextResponse.json({ error: 'Failed to fetch gym' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !['admin', 'owner'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (!user.gymId) {
      return NextResponse.json({ error: 'User does not belong to a gym' }, { status: 400 });
    }

    const data = await req.json();
    
    // Only allow updating specific branding fields and payment integration keys
    const { 
      name, tagline, heroTitle, heroSubtitle, 
      primaryColor, secondaryColor, 
      paystackPublicKey, paystackSecretKey,
      bankName, accountNumber, accountName
    } = data;

    const gym = await prisma.gym.update({
      where: { id: user.gymId },
      data: {
        ...(name && { name }),
        ...(tagline !== undefined && { tagline }),
        ...(heroTitle !== undefined && { heroTitle }),
        ...(heroSubtitle !== undefined && { heroSubtitle }),
        ...(primaryColor && { primaryColor }),
        ...(secondaryColor && { secondaryColor }),
        ...(paystackPublicKey !== undefined && { paystackPublicKey }),
        ...(paystackSecretKey !== undefined && { paystackSecretKey }),
        ...(bankName !== undefined && { bankName }),
        ...(accountNumber !== undefined && { accountNumber }),
        ...(accountName !== undefined && { accountName }),
      },
    });

    return NextResponse.json({ success: true, gym });
  } catch (error: any) {
    console.error('Update gym error:', error);
    return NextResponse.json({ error: 'Failed to update gym' }, { status: 500 });
  }
}
