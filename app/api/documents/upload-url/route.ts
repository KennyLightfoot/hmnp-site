import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { nanoid } from 'nanoid';

// Configure AWS S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'hmnp-documents';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'video/mp4',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

export async function POST(request: NextRequest) {
  try {
    // Check authentication (optional for guest bookings)
    const session = await getServerSession(authOptions);
    
    const body = await request.json();
    const { fileName, fileType, fileSize, bookingId } = body;

    // Validate input
    if (!fileName || !fileType || !fileSize) {
      return NextResponse.json(
        { error: 'Missing required fields: fileName, fileType, fileSize' },
        { status: 400 }
      );
    }

    // Validate file size
    if (fileSize > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit` },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(fileType)) {
      return NextResponse.json(
        { error: 'File type not allowed' },
        { status: 400 }
      );
    }

    // Generate unique file key
    const fileExtension = fileName.split('.').pop();
    const timestamp = Date.now();
    const randomId = nanoid(8);
    const s3Key = bookingId 
      ? `bookings/${bookingId}/documents/${timestamp}-${randomId}.${fileExtension}`
      : `temp-uploads/${timestamp}-${randomId}.${fileExtension}`;

    // Create PutObjectCommand for presigned URL generation
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
      ContentType: fileType,
    });

    // Generate presigned URL for upload
    const uploadUrl = await getSignedUrl(s3Client, command, { 
      expiresIn: 300, // 5 minutes
    });

    // Return upload details
    return NextResponse.json({
      uploadUrl,
      s3Key,
      s3Bucket: BUCKET_NAME,
      expiresIn: 300,
    });

  } catch (error) {
    console.error('Document upload URL generation error:', error);
    
    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve document download URL
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const s3Key = searchParams.get('s3Key');
    const bookingId = searchParams.get('bookingId');

    if (!s3Key) {
      return NextResponse.json(
        { error: 'Missing s3Key parameter' },
        { status: 400 }
      );
    }

    // TODO: Add authorization check - verify user has access to this document/booking

    // Create GetObjectCommand for presigned URL generation
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
    });

    // Generate presigned URL for download
    const downloadUrl = await getSignedUrl(s3Client, command, { 
      expiresIn: 300, // 5 minutes
    });

    return NextResponse.json({
      downloadUrl,
      expiresIn: 300,
    });

  } catch (error) {
    console.error('Document download URL generation error:', error);
    
    return NextResponse.json(
      { error: 'Failed to generate download URL' },
      { status: 500 }
    );
  }
} 