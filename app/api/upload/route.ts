import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getGymFromRequest } from '@/lib/gym-context';

// Best to configure Cloudinary **once** outside the handler (top of file or in a separate config file)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  // Optional but recommended in production:
  // secure: true,   // already default in recent versions
});

export async function POST(req: NextRequest) {
  try {
    const gym = await getGymFromRequest(req)
    if (!gym) {
      return NextResponse.json({ error: 'Gym not found' }, { status: 404 })
    }

    // Check for missing Cloudinary configuration
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('Cloudinary environment variables are missing');
      return NextResponse.json({ error: 'Upload service configuration missing' }, { status: 500 });
    }

    // Attempt to get current user, but don't fail if not found (needed for signup)
    const user = await getCurrentUser();

    // If user is logged in, verify they belong to this gym
    if (user && user.gymId !== gym.id) {
      return NextResponse.json(
        { error: 'Unauthorized for this gym' },
        { status: 403 }
      )
    }

    const formData = await req.formData();
    const file = formData.get('file');

    // Better type guard + existence check
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No valid file uploaded' }, { status: 400 });
    }

    // Reduced to 4MB to stay safely within Vercel's 4.5MB serverless limit
    const MAX_SIZE = 4 * 1024 * 1024; // 4MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File too large (max 4MB allowed)' },
        { status: 400 }
      );
    }

    // Optional but useful: only allow images
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only image files are allowed' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Use a specific ID for logged-in users, or a unique temp ID for signups
    const publicId = user?.id 
      ? `profile_${user.id}` 
      : `signup_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Use async/await style with Promise — cleaner than .end()
    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: `klimarx/${gym.slug}/profiles`,
            public_id: publicId,
            overwrite: true,
            // You can also do eager transformations, but inline is fine
            transformation: [
              { width: 400, height: 400, crop: 'fill', gravity: 'face' },
              // Optional: more aggressive optimization
              { quality: 'auto:good', fetch_format: 'auto' },
            ],
            // Very useful in production:
            resource_type: 'image',
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result!);
          }
        )
        .end(buffer);
    });

    // result.secure_url is usually what you want (https)
    const imageUrl = result.secure_url;

    // ONLY update the database if we have a logged-in user context
    if (user?.id) {
      await prisma.user.update({
        where: { 
          id: user.id,
          gymId: gym.id
        },
        data: {
          profileImage: imageUrl,
        },
      });
    }

    return NextResponse.json({
      success: true,
      imageUrl,
    });
  } catch (error: any) {
    console.error('Profile image upload failed:', {
      error: error.message,
      stack: error.stack?.slice(0, 300),
      userId: (await getCurrentUser())?.id,
    });

    // In production you might want to hide technical details from client
    return NextResponse.json(
      { error: 'Failed to upload image. Please try again.' },
      { status: 500 }
    );
  }
}

// Optional: Add runtime config if you expect large uploads
export const maxDuration = 30; // Increase if you allow bigger/slower uploads
