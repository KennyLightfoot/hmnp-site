import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Role, BookingStatus, LocationType } from '@prisma/client';

export async function POST(
  request: Request,
  context: { params: Promise<{ sessionId: string }> }
) {
  const session = await getServerSession(authOptions);
  const params = await context.params;
  const { sessionId } = params;

  // 1. Authorization Check
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = (session.user as any).id;

  try {
    // 2. Validate RON Booking (formerly NotarizationSession)
    const ronBooking = await prisma.booking.findUnique({
      where: { 
        id: sessionId,
        locationType: LocationType.REMOTE_ONLINE_NOTARIZATION
      },
      include: { NotarizationDocument: true }
    });

    if (!ronBooking) {
      return NextResponse.json({ error: 'RON booking not found' }, { status: 404 });
    }
    
    if (ronBooking.signerId !== userId) {
      return NextResponse.json({ error: 'Forbidden: You are not the signer for this RON booking.' }, { status: 403 });
    }

    // 3. Parse Request Body
    const body = await request.json();
    const { filename, fileSize, contentType } = body;

    if (!filename || !fileSize) {
      return NextResponse.json({ error: 'Missing required fields: filename, fileSize' }, { status: 400 });
    }

    // 4. Generate S3 Key and prepare for upload
    const timestamp = Date.now();
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const s3Key = `ron-documents/${sessionId}/${timestamp}-${sanitizedFilename}`;

    // 5. Create NotarizationDocument record
    const documentRecord = await prisma.NotarizationDocument.create({
      data: {
        id: `doc_${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
        s3Key: s3Key,
        originalFilename: filename,
        uploadedById: userId,
        bookingId: sessionId, // Link to the RON booking instead of sessionId
        updatedAt: new Date(),
      },
    });

    // 6. Update booking status if it's the first document
    if (ronBooking.status === BookingStatus.REQUESTED) {
      await prisma.booking.update({
        where: { id: sessionId },
        data: { status: BookingStatus.AWAITING_CLIENT_ACTION }, // Maps from AWAITING_DOCUMENTS
      });
    }

    // 7. Return upload details (in a real app, you'd generate S3 presigned URL here)
    return NextResponse.json({
      message: 'Document upload initiated successfully.',
      documentId: documentRecord.id,
      s3Key: s3Key,
      uploadUrl: `/api/s3/upload?key=${encodeURIComponent(s3Key)}`, // Placeholder
    });

  } catch (error) {
    console.error('Failed to initiate document upload:', error);
    return NextResponse.json({ error: 'Failed to initiate document upload.' }, { status: 500 });
  }
}
