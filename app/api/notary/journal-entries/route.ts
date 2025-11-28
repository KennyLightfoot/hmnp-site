import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Role } from '@/lib/prisma-types';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userWithRole = session.user as { id: string; role: Role };
    if (userWithRole.role !== Role.NOTARY && userWithRole.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const month = searchParams.get('month');

    const whereClause: any = {};

    if (userWithRole.role === Role.NOTARY) {
      whereClause.notary_id = userWithRole.id;
    }

    if (search) {
      whereClause.OR = [
        { signer_name: { contains: search, mode: 'insensitive' } },
        { document_type: { contains: search, mode: 'insensitive' } },
        { notarial_act_type: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (month && month !== 'all') {
      const currentYear = new Date().getFullYear();
      const monthNum = parseInt(month);
      const startDate = new Date(currentYear, monthNum - 1, 1);
      const endDate = new Date(currentYear, monthNum, 0);

      whereClause.entry_date = {
        gte: startDate,
        lte: endDate,
      };
    }

    const entries = await prisma.notary_journal.findMany({
      where: whereClause,
      include: {
        Booking: {
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
        User: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        entry_date: 'desc',
      },
    });

    const formattedEntries = entries.map((entry: any) => ({
      id: entry.id,
      booking_id: entry.booking_id,
      notary_id: entry.notary_id,
      entry_date: entry.entry_date.toISOString(),
      journal_number: entry.journal_number,
      document_type: entry.document_type,
      signer_name: entry.signer_name,
      signer_id_type: entry.signer_id_type,
      signer_id_state: entry.signer_id_state,
      notarial_act_type: entry.notarial_act_type,
      fee_charged: entry.fee_charged ? Number(entry.fee_charged) : null,
      location: entry.location,
      additional_notes: entry.additional_notes,
      created_at: entry.created_at.toISOString(),
      booking: entry.Booking ? {
        id: entry.Booking.id,
        signer_name: entry.Booking.User_Booking_signerIdToUser?.name,
        service: {
          name: entry.Booking.service.name,
        },
      } : null,
      notary_name: entry.User?.name,
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

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userWithRole = session.user as { id: string; role: Role };
    if (userWithRole.role !== Role.NOTARY && userWithRole.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const {
      booking_id,
      document_type,
      signer_name,
      signer_id_type,
      signer_id_state,
      notarial_act_type,
      fee_charged,
      location,
      additional_notes,
    } = body;

    if (!document_type || !signer_name || !signer_id_type || !notarial_act_type) {
      return NextResponse.json(
        { error: 'Required fields: document_type, signer_name, signer_id_type, notarial_act_type' },
        { status: 400 }
      );
    }

    const notary_id = userWithRole.id;

    const lastEntry = await prisma.notary_journal.findFirst({
      where: { notary_id },
      orderBy: { journal_number: 'desc' },
    });

    const nextJournalNumber = (lastEntry?.journal_number || 0) + 1;

    const journalEntry = await prisma.notary_journal.create({
      data: {
        booking_id: booking_id || undefined,
        notary_id,
        entry_date: new Date(),
        journal_number: nextJournalNumber,
        document_type,
        signer_name,
        signer_id_type,
        signer_id_state: signer_id_state || 'TX',
        notarial_act_type,
        fee_charged: fee_charged ? parseFloat(fee_charged.toString()) : null,
        location: location || 'Houston, TX',
        additional_notes,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Journal entry created successfully',
      entry: {
        id: journalEntry.id,
        journal_number: journalEntry.journal_number,
        entry_date: journalEntry.entry_date.toISOString(),
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
