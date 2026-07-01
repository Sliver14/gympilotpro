import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import QRCode from 'qrcode';
import { sendGymRegistrationTrialEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const { fullName, gymName, email, phone, plan, referralCode } = await req.json();

    if (!fullName || !gymName || !email || !phone || !plan) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate referral code if provided
    let affiliateId: string | null = null;
    if (referralCode) {
      const affiliate = await prisma.affiliate.findUnique({
        where: { referralCode: referralCode.trim().toUpperCase() }
      });
      if (!affiliate) {
        return NextResponse.json({ error: 'Invalid referral code' }, { status: 400 });
      }
      affiliateId = affiliate.id;
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

    // Generate Gym QR Code
    const gymUrl = `https://${slug}.gympilotpro.com`;
    const qrCodeUrl = await QRCode.toDataURL(gymUrl, {
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
      margin: 1,
      width: 400,
    });

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
          qrCodeUrl: qrCodeUrl,
          referredById: affiliateId || undefined
        },
      });

      // 2. Create the pending User
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          phoneNumber: phone,
          role: 'admin',
          status: 'pending',
          gymId: gym.id,
        },
      });

      // 3. Create initial pending subscription with no free trial period
      const now = new Date();

      await tx.gymSubscription.create({
        data: {
          gymId: gym.id,
          plan: plan,
          status: 'pending',
          startDate: now,
          endDate: now,
        }
      });

      return { gym, user };
    });

    // Send a welcome email (centralized helper)
    await sendGymRegistrationTrialEmail({
      email,
      firstName,
      gymName,
      loginUrl: `https://${slug}.gympilotpro.com/login`,
    });

    return NextResponse.json({ 
      success: true, 
      gymId: result.gym.id, 
      userId: result.user.id,
      slug: slug,
      message: 'Account created. Please complete setup by paying.'
    });

  } catch (error: any) {
    console.error('Registration Error:', error);
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
}

