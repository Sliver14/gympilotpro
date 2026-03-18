import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { fullName, gymName, email, phone, plan } = await req.json();

    if (!fullName || !gymName || !email || !phone || !plan) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
    }

    // Generate a unique slug for the gym
    const baseSlug = gymName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    let slug = baseSlug;
    let slugCounter = 1;
    while (await prisma.gym.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${slugCounter}`;
      slugCounter++;
    }

    // Split fullName into first and last name
    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

    // Generate a default temporary password
    const hashedPassword = await bcrypt.hash('ChangeMe123!', 10);

    // Create the Gym and User in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the pending Gym
      const gym = await tx.gym.create({
        data: {
          name: gymName,
          slug: slug,
          email: email,
          phone: phone,
          status: 'pending',
        },
      });

      // 2. Create the inactive User
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          phoneNumber: phone,
          role: 'admin',
          status: 'inactive',
          gymId: gym.id,
        },
      });

      return { gym, user };
    });

    return NextResponse.json({ 
      success: true, 
      gymId: result.gym.id, 
      userId: result.user.id,
      message: 'Account created pending payment'
    });

  } catch (error: any) {
    console.error('Registration Error:', error);
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
}
