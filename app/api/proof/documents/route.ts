import { NextRequest, NextResponse } from 'next/server';
import { withRateLimit } from '@/lib/security/rate-limiting';
import { getErrorMessage } from '@/lib/utils/error-utils';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { proofAPI } from '@/lib/proof/api';
import { logger } from '@/lib/logger';

/**
 * POST /api/proof/documents
 * Upload documents to Proof for a notarization transaction
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = withRateLimit('api_general', 'proof_documents')(async (request: NextRequest) => {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB hard cap for Proof upload path
    const ALLOWED_TYPES = ['application/pdf', 'image/png', 'image/jpeg'];

    const formData = await request.formData();
    const bookingId = formData.get('bookingId') as string;
    const file = formData.get('file') as File;
    const documentName = (formData.get('documentName') as string) || file?.name || 'document';
    const requirement = (formData.get('requirement') as string) || 'notarization';

    if (!bookingId || !file) {
      return NextResponse.json(
        { error: 'Booking ID and file are required' }, 
        { status: 400 }
      );
    }

    // Get the booking and verify access
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId, signerId: (session.user as any).id },
      select: { id: true, proofSessionUrl: true, locationType: true }
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found or access denied' }, 
        { status: 404 }
      );
    }

    if (!booking.proofSessionUrl) {
      return NextResponse.json(
        { error: 'No Proof session found for this booking' }, 
        { status: 400 }
      );
    }

    // Only allow Proof uploads for RON bookings
    if (booking.locationType !== 'REMOTE_ONLINE_NOTARIZATION') {
      return NextResponse.json(
        { error: 'This endpoint is only for RON uploads. Use the in-person upload endpoint for on-site notarizations.' },
        { status: 400 }
      );
    }

    // Enforce size/type limits
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: 'File too large. Max 10MB.' }, { status: 413 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Unsupported file type. Use PDF, PNG, or JPEG.' }, { status: 415 });
    }

    // Forward directly to Proof (no internal storage)
    const arrayBuf = await file.arrayBuffer();
    const base64File = Buffer.from(arrayBuf).toString('base64');
    await proofAPI.addDocument(booking.proofSessionUrl, {
      name: documentName,
      content: base64File,
      contentType: file.type,
      requiresNotarization: true
    });

    logger.info('Document uploaded to Proof successfully (no local storage)', {
      bookingId,
      proofSessionUrl: booking.proofSessionUrl,
      documentName,
      userId: (session.user as any).id
    });

    return NextResponse.json({
      success: true,
      document: {
        name: documentName,
        uploadedAt: new Date().toISOString()
      },
      message: 'Document uploaded to Proof successfully'
    });

  } catch (error) {
    logger.error('Failed to upload document to Proof:', error instanceof Error ? error : new Error(String(error)));
    
    return NextResponse.json(
      { 
        error: 'Failed to upload document',
        details: error instanceof Error ? getErrorMessage(error) : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
})

/**
 * GET /api/proof/documents?bookingId=xxx
 * Get documents for a Proof transaction
 */
export const GET = withRateLimit('api_general', 'proof_documents_get')(async (request: NextRequest) => {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' }, 
        { status: 400 }
      );
    }

    // Get the booking and verify access
    const booking = await prisma.booking.findUnique({
      where: { 
        id: bookingId,
        signerId: (session.user as any).id
      },
      include: {
        NotarizationDocument: true
      }
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found or access denied' }, 
        { status: 404 }
      );
    }

    if (!booking.proofSessionUrl) {
      return NextResponse.json(
        { error: 'No Proof session found for this booking' }, 
        { status: 400 }
      );
    }

    // Get latest session details from Proof
    const proofSession = await proofAPI.getTransaction(booking.proofSessionUrl);

    return NextResponse.json({
      documents: proofSession?.documents || [],
      localDocuments: booking.NotarizationDocument,
      sessionStatus: proofSession?.status || 'unknown'
    });

  } catch (error) {
    logger.error('Failed to get Proof documents:', error instanceof Error ? error : new Error(String(error)));
    
    return NextResponse.json(
      { 
        error: 'Failed to get documents',
        details: error instanceof Error ? getErrorMessage(error) : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
})
