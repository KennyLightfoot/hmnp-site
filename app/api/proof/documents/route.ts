import { NextRequest, NextResponse } from 'next/server';
import { getErrorMessage } from '@/lib/utils/error-utils';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/database-connection';
import { proofAPI } from '@/lib/proof/api';
import { logger } from '@/lib/logger';

/**
 * POST /api/proof/documents
 * Upload documents to Proof for a notarization transaction
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const bookingId = formData.get('bookingId') as string;
    const file = formData.get('file') as File;
    const documentName = formData.get('documentName') as string || file.name;
    const requirement = formData.get('requirement') as string || 'notarization';

    if (!bookingId || !file) {
      return NextResponse.json(
        { error: 'Booking ID and file are required' }, 
        { status: 400 }
      );
    }

    // Get the booking and verify access
    const booking = await prisma.booking.findUnique({
      where: { 
        id: bookingId,
        signerId: (session.user as any).id
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

    // Convert file to base64 for Proof API
    const fileBuffer = await file.arrayBuffer();
    const base64File = Buffer.from(fileBuffer).toString('base64');
    const base64Data = `data:${file.type};base64,${base64File}`;

    // Upload document to Proof
    await proofAPI.addDocument(booking.proofSessionUrl, {
      name: documentName,
      content: base64File,
      contentType: file.type,
      requiresNotarization: true
    });

    // Create local document record for tracking
    const documentRecord = await prisma.notarizationDocument.create({
      data: {
        id: `proof_doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        s3Key: `proof-docs/${booking.proofSessionUrl}/${documentName}`,
        originalFilename: documentName,
        uploadedById: (session.user as any).id,
        bookingId: bookingId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    logger.info('Document uploaded to Proof successfully', {
      bookingId,
      proofSessionUrl: booking.proofSessionUrl,
      documentName,
      documentId: documentRecord.id,
      userId: (session.user as any).id
    });

    return NextResponse.json({
      success: true,
      document: {
        id: documentRecord.id,
        name: documentName,
        uploadedAt: documentRecord.createdAt
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
}

/**
 * GET /api/proof/documents?bookingId=xxx
 * Get documents for a Proof transaction
 */
export async function GET(request: NextRequest) {
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
} 
