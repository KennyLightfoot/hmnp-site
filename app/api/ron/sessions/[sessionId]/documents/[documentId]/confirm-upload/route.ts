import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';
import { Role, NotarizationStatus } from '@prisma/client';

export async function POST(
  request: Request,
  { params }: { params: { sessionId: string; documentId: string } }
) {
  const session = await getServerSession(authOptions);
  const { sessionId, documentId } = params;

  // 1. Authorization Check
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = (session.user as any).id;

  try {
    // 2. Validate Session and User
    const notarizationSession = await prisma.notarizationSession.findUnique({
      where: { id: sessionId },
      include: { documents: true }, // Include documents to check count later
    });

    if (!notarizationSession) {
      return NextResponse.json({ error: 'Notarization session not found' }, { status: 404 });
    }
    if (notarizationSession.signerId !== userId) {
      return NextResponse.json({ error: 'Forbidden: You are not the signer for this session.' }, { status: 403 });
    }

    // 3. Validate Document
    const documentRecord = await prisma.notarizationDocument.findUnique({
      where: { id: documentId },
    });

    if (!documentRecord) {
      return NextResponse.json({ error: 'Document record not found' }, { status: 404 });
    }
    if (documentRecord.sessionId !== sessionId) {
      return NextResponse.json({ error: 'Document does not belong to this session' }, { status: 400 });
    }
    if (documentRecord.uploadedById !== userId) {
      return NextResponse.json({ error: 'Forbidden: You did not initiate this document upload.' }, { status: 403 });
    }

    // 4. Update Document Record (e.g., mark as confirmed)
    // For now, we'll just update the 'updatedAt' timestamp as a proxy for confirmation.
    // In a real scenario, you might add a specific status field or check S3.
    const updatedDocument = await prisma.notarizationDocument.update({
      where: { id: documentId },
      data: {
        updatedAt: new Date(), // Simulate confirmation by updating timestamp
      },
    });

    // 5. Optionally, update session status if all expected docs are uploaded
    // This is a simplified check. A real app might need more complex logic
    // (e.g., knowing how many documents are expected).
    // For now, we'll assume if at least one document is confirmed, the status can move.
    if (notarizationSession.status === NotarizationStatus.AWAITING_DOCUMENTS || 
        notarizationSession.status === NotarizationStatus.PENDING_CONFIRMATION || 
        notarizationSession.status === NotarizationStatus.CONFIRMED) {
      
      // Check if this confirmed document is part of the session's documents
      const allSessionDocsConfirmed = notarizationSession.documents.every(doc => 
        doc.id === documentId || 
        (doc.updatedAt.getTime() > doc.createdAt.getTime()) // A naive check for 'confirmed'
      );

      if(allSessionDocsConfirmed && notarizationSession.documents.length > 0) {
        await prisma.notarizationSession.update({
            where: { id: sessionId },
            data: { status: NotarizationStatus.DOCUMENTS_UPLOADED },
        });
      }
    }

    return NextResponse.json({ 
      message: 'Document upload confirmed successfully.',
      documentId: updatedDocument.id,
      newStatus: notarizationSession.status === NotarizationStatus.DOCUMENTS_UPLOADED ? NotarizationStatus.DOCUMENTS_UPLOADED : notarizationSession.status
    });

  } catch (error) {
    console.error('Failed to confirm document upload:', error);
    return NextResponse.json({ error: 'Failed to confirm document upload.' }, { status: 500 });
  }
}
