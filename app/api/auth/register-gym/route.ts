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
      // 1. Create the pending Gym
      const gym = await tx.gym.create({
        data: {
          name: gymName,
          slug: slug,
          email: email,
          phone: phone,
          status: 'pending',
          qrCodeUrl: qrCodeUrl,
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

    // Send a welcome email (async so it doesn't block the response)
    resend.emails.send({
      from: 'GymPilotPro <noreply@klimarsspace.com>',
      to: email,
      subject: `Welcome to GymPilotPro, ${firstName}!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #f97316;">Welcome to GymPilotPro!</h2>
          <p>Hi ${firstName},</p>
          <p>We've successfully received your registration for <strong>${gymName}</strong>.</p>
          <p>To finalize your setup and activate your gym's dashboard, please complete your payment on the next screen.</p>
          <p>If you have any questions, feel free to reply to this email.</p>
          <br/>
          <p>Best regards,<br/>The GymPilotPro Team</p>
        </div>
      `,
    }).catch(err => console.error('Failed to send welcome email:', err));

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
