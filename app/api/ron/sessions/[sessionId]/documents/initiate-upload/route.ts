import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';
import { Role } from '@prisma/client';
import { randomUUID } from 'crypto'; // For generating unique S3 keys

import { s3 } from '@/lib/s3';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export async function POST(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  const session = await getServerSession(authOptions);
  const { sessionId } = params;

  // 1. Authorization Check
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = (session.user as any).id;

  try {
    const notarizationSession = await prisma.notarizationSession.findUnique({
      where: { id: sessionId },
    });

    if (!notarizationSession) {
      return NextResponse.json({ error: 'Notarization session not found' }, { status: 404 });
    }

    // Ensure the user is the signer for this session
    if (notarizationSession.signerId !== userId) {
      return NextResponse.json({ error: 'Forbidden: You are not the signer for this session.' }, { status: 403 });
    }

    // 2. Get filename and contentType from request body
    const body = await request.json();
    const { filename, contentType } = body;

    if (!filename || !contentType) {
      return NextResponse.json({ error: 'Filename and contentType are required' }, { status: 400 });
    }

    // 3. Generate a unique key for S3
    const s3Key = `ron_documents/${sessionId}/${randomUUID()}-${filename.replace(/\s+/g, '_')}`;

    // 4. Create NotarizationDocument record (before generating presigned URL)
    const documentRecord = await prisma.notarizationDocument.create({
      data: {
        sessionId: sessionId,
        s3Key: s3Key,
        originalFilename: filename,
        uploadedById: userId,
        // isSigned, signedS3Key, signedAt will be updated later
      },
    });

    // 5. Generate Presigned URL
    const expires_in_seconds = 300; // URL valid for 5 minutes

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET, // Ensure S3_BUCKET is set in your .env file
      Key: s3Key,
      ContentType: contentType,
      ServerSideEncryption: 'AES256', // Recommended for S3-managed encryption
    });

    const presignedUrl = await getSignedUrl(s3, command, {
      expiresIn: expires_in_seconds,
    });
    // const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: expires_in_seconds });

    return NextResponse.json({
      presignedUrl,
      documentId: documentRecord.id,
      s3Key, // good for client to know where it *should* go
      expiresIn: expires_in_seconds,
    });

  } catch (error) {
    console.error('Failed to initiate document upload:', error);
    if (error instanceof SyntaxError) { // For invalid JSON body
        return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to initiate document upload.' }, { status: 500 });
  }
}
