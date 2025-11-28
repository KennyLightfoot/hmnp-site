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
    const year = searchParams.get('year') || new Date().getFullYear().toString();
    const format = searchParams.get('format') || 'csv';

    const whereClause: any = {};

    if (userWithRole.role === Role.NOTARY) {
      whereClause.notary_id = userWithRole.id;
    }

    const yearNum = parseInt(year);
    const startDate = new Date(yearNum, 0, 1);
    const endDate = new Date(yearNum + 1, 0, 1);

    whereClause.entry_date = {
      gte: startDate,
      lt: endDate,
    };

    const entries = await prisma.notary_journal.findMany({
      where: whereClause,
      include: {
        Booking: {
          select: {
            id: true,
            service: {
              select: {
                name: true,
              },
            },
          },
        },
        User: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: [
        { entry_date: 'asc' },
        { journal_number: 'asc' },
      ],
    });

    if (format === 'csv') {
      const csvHeaders = [
        'Journal Number', 'Entry Date', 'Document Type', 'Signer Name',
        'Signer ID Type', 'Signer ID State', 'Notarial Act Type', 'Fee Charged',
        'Location', 'Additional Notes', 'Booking ID', 'Service Name', 'Notary Name', 'Created At'
      ];

      const csvRows = entries.map((entry: any) => [
        entry.journal_number || '',
        entry.entry_date.toDateString(),
        entry.document_type || '',
        entry.signer_name || '',
        entry.signer_id_type || '',
        entry.signer_id_state || '',
        entry.notarial_act_type || '',
        entry.fee_charged ? `$${Number(entry.fee_charged).toFixed(2)}` : '',
        entry.location || '',
        entry.additional_notes || '',
        entry.booking_id || '',
        entry.Booking?.service?.name || '',
        entry.User.name || '',
        entry.created_at.toISOString(),
      ]);

      const escapeCsvValue = (value: any) => {
        const stringValue = String(value ?? '');
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      };

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map((row: unknown[]) => row.map(escapeCsvValue).join(',')),
      ].join('\n');

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="notary-journal-${year}.csv"`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      entries: entries.map((entry: any) => ({
        journal_number: entry.journal_number,
        entry_date: entry.entry_date.toISOString(),
        document_type: entry.document_type,
        signer_name: entry.signer_name,
        signer_id_type: entry.signer_id_type,
        signer_id_state: entry.signer_id_state,
        notarial_act_type: entry.notarial_act_type,
        fee_charged: entry.fee_charged ? Number(entry.fee_charged) : null,
        location: entry.location,
        additional_notes: entry.additional_notes,
        booking_id: entry.booking_id,
        service_name: entry.Booking?.service?.name,
        notary_name: entry.User.name,
        created_at: entry.created_at.toISOString(),
      })),
      total: entries.length,
      year: yearNum,
    });

  } catch (error) {
    console.error('Error exporting journal:', error);
    return NextResponse.json(
      { error: 'Failed to export journal' },
      { status: 500 }
    );
  }
}
