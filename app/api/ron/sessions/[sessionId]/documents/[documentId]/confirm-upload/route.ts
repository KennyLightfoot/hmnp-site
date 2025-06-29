import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Role, BookingStatus, LocationType } from '@prisma/client';

export async function POST(
  request: Request,
  context: { params: Promise<{ sessionId: string; documentId: string }> }
) {
  const session = await getServerSession(authOptions);
  const params = await context.params;
  const { sessionId, documentId } = params;

  // 1. Authorization Check
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = (session.user as any).id;

  try {
    // 2. Validate RON Booking and User
    const ronBooking = await prisma.booking.findUnique({
      where: { 
        id: sessionId,
        locationType: LocationType.REMOTE_ONLINE_NOTARIZATION
      },
      include: { NotarizationDocument: true }, // Include documents to check count later
    });

    if (!ronBooking) {
      return NextResponse.json({ error: 'RON booking not found' }, { status: 404 });
    }
    if (ronBooking.signerId !== userId) {
      return NextResponse.json({ error: 'Forbidden: You are not the signer for this RON booking.' }, { status: 403 });
    }

    // 3. Validate Document
    const documentRecord = await prisma.NotarizationDocument.findUnique({
      where: { id: documentId },
    });

    if (!documentRecord) {
      return NextResponse.json({ error: 'Document record not found' }, { status: 404 });
    }
    if (documentRecord.bookingId !== sessionId) {
      return NextResponse.json({ error: 'Document does not belong to this RON booking' }, { status: 400 });
    }
    if (documentRecord.uploadedById !== userId) {
      return NextResponse.json({ error: 'Forbidden: You did not initiate this document upload.' }, { status: 403 });
    }

    // 4. Update Document Record (e.g., mark as confirmed)
    // For now, we'll just update the 'updatedAt' timestamp as a proxy for confirmation.
    // In a real scenario, you might add a specific status field or check S3.
    const updatedDocument = await prisma.NotarizationDocument.update({
      where: { id: documentId },
      data: {
        updatedAt: new Date(), // Simulate confirmation by updating timestamp
      },
    });

    // 5. Optionally, update booking status if all expected docs are uploaded
    // This is a simplified check. A real app might need more complex logic
    // (e.g., knowing how many documents are expected).
    // For now, we'll assume if at least one document is confirmed, the status can move.
    if (ronBooking.status === BookingStatus.AWAITING_CLIENT_ACTION || 
        ronBooking.status === BookingStatus.REQUESTED || 
        ronBooking.status === BookingStatus.CONFIRMED) {
      
      // Check if this confirmed document is part of the booking's documents
      const allBookingDocsConfirmed = ronBooking.NotarizationDocument.every(doc => 
        doc.id === documentId || 
        (doc.updatedAt.getTime() > doc.createdAt.getTime()) // A naive check for 'confirmed'
      );

      if(allBookingDocsConfirmed && ronBooking.NotarizationDocument.length > 0) {
        await prisma.booking.update({
            where: { id: sessionId },
            data: { status: BookingStatus.READY_FOR_SERVICE }, // Maps from DOCUMENTS_UPLOADED
        });
      }
    }

    return NextResponse.json({ 
      message: 'Document upload confirmed successfully.',
      documentId: updatedDocument.id,
      newStatus: ronBooking.status === BookingStatus.READY_FOR_SERVICE ? BookingStatus.READY_FOR_SERVICE : ronBooking.status
    });

  } catch (error) {
    console.error('Failed to confirm document upload:', error);
    return NextResponse.json({ error: 'Failed to confirm document upload.' }, { status: 500 });
  }
}
