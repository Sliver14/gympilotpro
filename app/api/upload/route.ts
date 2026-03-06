import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file');

    // Better type guard + existence check
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No valid file uploaded' }, { status: 400 });
    }

    // Optional: Add size/type validation (very recommended!)
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File too large (max 5MB allowed)' },
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

    // Use async/await style with Promise — cleaner than .end()
    const result = await new Promise<cloudinary.UploadApiResponse>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: 'klimarx/profiles',
            public_id: `profile_${user.id}`,
            overwrite: true,
            // You can also do eager transformations, but inline is fine
            transformation: [
              { width: 400, height: 400, crop: 'fill', gravity: 'face' },
              // Optional: more aggressive optimization
              { quality: 'auto:good', fetch_format: 'auto' },
            ],
            // Very useful in production:
            resource_type: 'image',
            // You can add tags for later management
            // tags: ['profile', 'user-upload'],
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

    // Optional: store a smaller version / thumbnail if needed later
    // const thumbnailUrl = result.eager?.[0]?.secure_url ?? imageUrl;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        profileImage: imageUrl,
        // Optional: updatedAt: new Date() — Prisma usually handles this
      },
    });

    return NextResponse.json({
      success: true,
      imageUrl,
      // You can also return width, height, public_id, version, etc. if frontend needs them
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
export const config = {
  api: {
    bodyParser: false,           // Important when handling FormData manually
    maxDuration: 30,             // Increase if you allow bigger/slower uploads
  },
};