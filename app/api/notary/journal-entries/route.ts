import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Role } from '@prisma/client';

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const month = searchParams.get('month');

    // Build where clause
    const whereClause: any = {};

    // Add notary filter for non-admin users
    if (userRole === Role.NOTARY) {
      whereClause.notaryId = (session.user as any).id;
    }

    // Add search filter
    if (search) {
      whereClause.OR = [
        { signerName: { contains: search, mode: 'insensitive' } },
        { documentType: { contains: search, mode: 'insensitive' } },
        { notarialActType: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Add month filter
    if (month && month !== 'all') {
      const currentYear = new Date().getFullYear();
      const monthNum = parseInt(month);
      const startDate = new Date(currentYear, monthNum - 1, 1);
      const endDate = new Date(currentYear, monthNum, 0);
      
      whereClause.entryDate = {
        gte: startDate,
        lte: endDate,
      };
    }

    // Fetch journal entries
    const entries = await prisma.notaryJournal.findMany({
      where: whereClause,
      include: {
        booking: {
          select: {
            id: true,
            User_Booking_signerIdToUser: {
              select: {
                name: true,
              },
            },
            service: {
              select: {
                name: true,
              },
            },
          },
        },
        notary: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        entryDate: 'desc',
      },
    });

    // Format entries for frontend
    const formattedEntries = entries.map(entry => ({
      id: entry.id,
      bookingId: entry.bookingId,
      notaryId: entry.notaryId,
      entryDate: entry.entryDate.toISOString(),
      journalNumber: entry.journalNumber,
      documentType: entry.documentType,
      signerName: entry.signerName,
      signerIdType: entry.signerIdType,
      signerIdState: entry.signerIdState,
      notarialActType: entry.notarialActType,
      feeCharged: entry.feeCharged ? Number(entry.feeCharged) : null,
      location: entry.location,
      additionalNotes: entry.additionalNotes,
      createdAt: entry.createdAt.toISOString(),
      booking: entry.booking ? {
        id: entry.booking.id,
        signerName: entry.booking.User_Booking_signerIdToUser?.name,
        service: {
          name: entry.booking.service.name,
        },
      } : null,
    }));

    return NextResponse.json({
      success: true,
      entries: formattedEntries,
      total: formattedEntries.length,
    });

  } catch (error) {
    console.error('Error fetching journal entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch journal entries' },
      { status: 500 }
    );
  }
}

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
    const {
      bookingId,
      documentType,
      signerName,
      signerIdType,
      signerIdState,
      notarialActType,
      feeCharged,
      location,
      additionalNotes,
    } = body;

    // Validate required fields
    if (!documentType || !signerName || !signerIdType || !notarialActType) {
      return NextResponse.json(
        { error: 'Required fields: documentType, signerName, signerIdType, notarialActType' },
        { status: 400 }
      );
    }

    const notaryId = (session.user as any).id;

    // Get the next journal number for this notary
    const lastEntry = await prisma.notaryJournal.findFirst({
      where: { notaryId },
      orderBy: { journalNumber: 'desc' },
    });

    const nextJournalNumber = (lastEntry?.journalNumber || 0) + 1;

    // Create the journal entry
    const journalEntry = await prisma.notaryJournal.create({
      data: {
        bookingId: bookingId || undefined,
        notaryId,
        entryDate: new Date(),
        journalNumber: nextJournalNumber,
        documentType,
        signerName,
        signerIdType,
        signerIdState: signerIdState || 'TX',
        notarialActType,
        feeCharged: feeCharged ? parseFloat(feeCharged.toString()) : null,
        location: location || 'Houston, TX',
        additionalNotes,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Journal entry created successfully',
      entry: {
        id: journalEntry.id,
        journalNumber: journalEntry.journalNumber,
        entryDate: journalEntry.entryDate.toISOString(),
      },
    });

  } catch (error) {
    console.error('Error creating journal entry:', error);
    return NextResponse.json(
      { error: 'Failed to create journal entry' },
      { status: 500 }
    );
  }
} 