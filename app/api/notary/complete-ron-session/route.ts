import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { BookingStatus, Role } from '@/lib/prisma-types';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and has notary role
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userWithRole = session.user as { id: string; role: Role };
    if (userWithRole.role !== Role.NOTARY && userWithRole.role !== Role.ADMIN) {
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
        service: true,
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

    const notaryId = userWithRole.id;

    // Start transaction to ensure consistency
    const result = await prisma.$transaction(async (tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0]) => {
      // Update booking to completed
      const updatedBooking = await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: BookingStatus.COMPLETED,
          notes: completionNotes
            ? (booking.notes ? `${booking.notes}\n\nCompletion Notes: ${completionNotes}` : `Completion Notes: ${completionNotes}`)
            : booking.notes,
          updatedAt: new Date(),
        },
      });

      // Get the next journal number for this notary
      const lastEntry = await tx.notary_journal.findFirst({
        where: { notary_id: notaryId },
        orderBy: { journal_number: 'desc' },
      });

      const nextJournalNumber = (lastEntry?.journal_number || 0) + 1;

      // Create journal entry
      const journalEntry = await tx.notary_journal.create({
        data: {
          booking_id: booking.id,
          notary_id: notaryId,
          entry_date: new Date(),
          journal_number: nextJournalNumber,
          document_type: `${booking.service.name} - RON Session`,
          signer_name: booking.User_Booking_signerIdToUser?.name || 'Unknown',
          signer_id_type: 'VERIFIED_VIA_PROOF', // Since this is RON, ID was verified via Proof
          signer_id_state: booking.addressState || 'TX',
          notarial_act_type: 'REMOTE_ONLINE_NOTARIZATION',
          fee_charged: booking.priceAtBooking || booking.service.basePrice,
          location: 'Remote Online Notarization (Proof.co)',
          additional_notes: completionNotes || 'RON session completed successfully via Proof.co platform',
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
      },
      journalEntry: {
        id: result.journalEntry.id,
        journal_number: result.journalEntry.journal_number,
        entry_date: result.journalEntry.entry_date,
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
