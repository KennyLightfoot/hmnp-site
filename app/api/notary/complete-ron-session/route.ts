import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { BookingStatus, Role } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and has notary role
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    if (userRole !== Role.NOTARY && userRole !== Role.ADMIN) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { bookingId, completionNotes } = body;

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    // Get the booking with related data
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        Service: true,
        User_Booking_signerIdToUser: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check if booking is in progress
    if (booking.status !== BookingStatus.IN_PROGRESS) {
      return NextResponse.json(
        { error: 'Booking must be in progress to complete' },
        { status: 400 }
      );
    }

    const notaryId = (session.user as any).id;

    // Start transaction to ensure consistency
    const result = await prisma.$transaction(async (tx) => {
      // Update booking to completed
      const updatedBooking = await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: BookingStatus.COMPLETED,
          completedAt: new Date(),
          notes: completionNotes ? 
            (booking.notes ? `${booking.notes}\n\nCompletion Notes: ${completionNotes}` : `Completion Notes: ${completionNotes}`) 
            : booking.notes,
          updatedAt: new Date(),
        },
      });

      // Get the next journal number for this notary
      const lastEntry = await tx.NotaryJournal.findFirst({
        where: { notaryId },
        orderBy: { journalNumber: 'desc' },
      });

      const nextJournalNumber = (lastEntry?.journalNumber || 0) + 1;

      // Create journal entry
      const journalEntry = await tx.NotaryJournal.create({
        data: {
          bookingId: booking.id,
          notaryId,
          entryDate: new Date(),
          journalNumber: nextJournalNumber,
          documentType: `${booking.Service.name} - RON Session`,
          signerName: booking.User_Booking_signerIdToUser?.name || booking.signerName || 'Unknown',
          signerIdType: 'VERIFIED_VIA_PROOF', // Since this is RON, ID was verified via Proof
          signerIdState: booking.addressState || 'TX',
          notarialActType: 'REMOTE_ONLINE_NOTARIZATION',
          feeCharged: booking.finalPrice || booking.priceAtBooking || booking.Service.price,
          location: 'Remote Online Notarization (Proof.co)',
          additionalNotes: completionNotes || 'RON session completed successfully via Proof.co platform',
        },
      });

      return { updatedBooking, journalEntry };
    });

    return NextResponse.json({
      success: true,
      message: 'RON session completed successfully',
      booking: {
        id: result.updatedBooking.id,
        status: result.updatedBooking.status,
        completedAt: result.updatedBooking.completedAt,
      },
      journalEntry: {
        id: result.journalEntry.id,
        journalNumber: result.journalEntry.journalNumber,
        entryDate: result.journalEntry.entryDate,
      },
    });

  } catch (error) {
    console.error('Error completing RON session:', error);
    return NextResponse.json(
      { error: 'Failed to complete RON session' },
      { status: 500 }
    );
  }
} 