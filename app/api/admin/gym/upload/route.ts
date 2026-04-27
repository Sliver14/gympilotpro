import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !['admin', 'owner'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (!user.gymId) {
      return NextResponse.json({ error: 'User does not belong to a gym' }, { status: 400 });
    }

    const formData = await req.formData();
    const file = formData.get('file');
    const fieldName = formData.get('field') as string;

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No valid file uploaded' }, { status: 400 });
    }

    const MAX_SIZE = 20 * 1024 * 1024; // 20MB limit for video/images
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large (max 20MB)' }, { status: 400 });
    }

    const isVideo = file.type.startsWith('video/');
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const publicId = `gym_${user.gymId}_${fieldName}_${Date.now()}`;

    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: `klimarx/${user.gymId}/assets`,
            public_id: publicId,
            resource_type: isVideo ? 'video' : 'image',
            overwrite: true,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result!);
          }
        )
        .end(buffer);
    });

    const assetUrl = result.secure_url;

    // Save directly to Gym model
    await prisma.gym.update({
      where: { id: user.gymId },
      data: { [fieldName]: assetUrl },
    });

    return NextResponse.json({ success: true, url: assetUrl });
  } catch (error: any) {
    console.error('Gym asset upload failed:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

export const maxDuration = 60; // Allow more time for large video uploads
