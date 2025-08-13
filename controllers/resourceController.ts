import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cloudinary } from '@/lib/config';
import { ResourceType } from '@/lib/generated/prisma';
import { CloudinaryUploadResult } from '@/types/cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export class ResourceController {
  // GET ALL RESOURCES
  static async getAllResources() {
    try {
      const resources = await prisma.resource.findMany({
        orderBy: {
          createdAt: 'desc',
        },
      });
      return NextResponse.json({ success: true, data: resources }, { status: 200 });
    } catch (error) {
      console.error('Error fetching resources:', error);
      return NextResponse.json({ error: 'Failed to fetch resources' }, { status: 500 });
    }
  }

  // GET RESOURCE BY ID
  static async getResourceById({ params }: { params: { id: string } }) {
    try {
      const id = Number(params.id);
      if (isNaN(id)) {
        return NextResponse.json({ error: 'Invalid resource ID' }, { status: 400 });
      }

      const resource = await prisma.resource.findUnique({ where: { id } });

      if (!resource) {
        return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true, data: resource }, { status: 200 });
    } catch (error) {
      console.error('Error fetching resource:', error);
      return NextResponse.json({ error: 'Failed to fetch resource' }, { status: 500 });
    }
  }

  // CREATE RESOURCE
static async createResource(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const resourceType = formData.get("resourceType") as ResourceType;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;

    if (!file || !resourceType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Determine Cloudinary resource type
    let cloudinaryResourceType: 'image' | 'video' | 'raw';
    switch (resourceType) {
      case 'video':
        cloudinaryResourceType = 'video';
        break;
      case 'image':
        cloudinaryResourceType = 'image';
        break;
      default:
        cloudinaryResourceType = 'raw';
        break;
    }

    // Set transformation options per type
    const uploadOptions: any = {
      resource_type: cloudinaryResourceType,
      folder: `${cloudinaryResourceType}-uploads`,
    };

    if (cloudinaryResourceType === 'image') {
      uploadOptions.transformation = [{ quality: 'auto', fetch_format: 'auto' }];
    } else if (cloudinaryResourceType === 'video') {
      uploadOptions.eager = [{ quality: 'auto', fetch_format: 'mp4' }];
      uploadOptions.eager_async = true;
      uploadOptions.eager_notification_url = `${process.env.NEXT_PUBLIC_BASE_URL}/resources/notification`;
    }

    const result = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error: any, result: any) => {
          if (error) reject(error);
          else resolve(result as CloudinaryUploadResult);
        }
      );
      uploadStream.end(buffer);
    });

    const resource = await prisma.resource.create({
      data: {
        title,
        description,
        url: result.secure_url,
        resourceType,
      },
    });

    return NextResponse.json({ success: true, data: resource }, { status: 201 });
  } catch (error) {
    console.error("Error creating resource:", error);
    return NextResponse.json({ error: "Failed to create resource" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

  // UPDATE RESOURCE
  static async updateResource(req: NextRequest, { params }: { params: { id: string } }) {
    try {
      const id = Number(params.id);
      if (isNaN(id)) {
        return NextResponse.json({ error: 'Invalid resource ID' }, { status: 400 });
      }

      const data = await req.json();

      const updatedResource = await prisma.resource.update({
        where: { id },
        data,
      });

      return NextResponse.json({ success: true, data: updatedResource }, { status: 200 });
    } catch (error) {
      console.error('Error updating resource:', error);
      return NextResponse.json({ error: 'Failed to update resource' }, { status: 500 });
    }
  }

}
