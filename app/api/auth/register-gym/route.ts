import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { Resend } from 'resend';
import QRCode from 'qrcode';

const resend = new Resend(process.env.RESEND_API_KEY);

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
      // 1. Create the active Gym
      const gym = await tx.gym.create({
        data: {
          name: gymName,
          slug: slug,
          email: email,
          phone: phone,
          status: 'active',
          qrCodeUrl: qrCodeUrl,
        },
      });

      // 2. Create the active User
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          phoneNumber: phone,
          role: 'admin',
          status: 'active',
          gymId: gym.id,
        },
      });

      // 3. Create initial 30-day trial subscription
      const now = new Date();
      const trialEndDate = new Date(now);
      trialEndDate.setDate(trialEndDate.getDate() + 30);

      await tx.gymSubscription.create({
        data: {
          gymId: gym.id,
          plan: plan,
          status: 'active',
          startDate: now,
          endDate: trialEndDate,
        }
      });

      return { gym, user };
    });

    // Send a welcome email (async so it doesn't block the response)
    resend.emails.send({
      from: 'GymPilotPro <noreply@klimarsspace.com>',
      to: email,
      subject: `Your 30-Day Free Trial is Live, ${firstName}!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #f97316;">Welcome to GymPilotPro!</h2>
          <p>Hi ${firstName},</p>
          <p>Your 30-day free trial for <strong>${gymName}</strong> is now active!</p>
          <p>We've waived the setup fee ($0) and activated your dashboard immediately so you can start protecting your revenue today.</p>
          <p><strong>Dashboard Login:</strong> <a href="https://${slug}.gympilotpro.com/login">https://${slug}.gympilotpro.com/login</a></p>
          <p>Your temporary password is: <code>ChangeMe123!</code> (Please change this after your first login).</p>
          <br/>
          <p>Best regards,<br/>The GymPilotPro Team</p>
        </div>
      `,
    }).catch(err => console.error('Failed to send welcome email:', err));

    return NextResponse.json({ 
      success: true, 
      gymId: result.gym.id, 
      userId: result.user.id,
      slug: slug,
      message: 'Account created and 30-day trial activated'
    });

  } catch (error: any) {
    console.error('Registration Error:', error);
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
}
