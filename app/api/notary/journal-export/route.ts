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
    const year = searchParams.get('year') || new Date().getFullYear().toString();
    const format = searchParams.get('format') || 'csv';

    // Build where clause
    const whereClause: any = {};

    // Add notary filter for non-admin users
    if (userRole === Role.NOTARY) {
      whereClause.notaryId = (session.user as any).id;
    }

    // Add year filter
    const yearNum = parseInt(year);
    const startDate = new Date(yearNum, 0, 1);
    const endDate = new Date(yearNum + 1, 0, 1);
    
    whereClause.entryDate = {
      gte: startDate,
      lt: endDate,
    };

    // Fetch journal entries for export
    const entries = await prisma.notaryJournal.findMany({
      where: whereClause,
      include: {
        booking: {
          select: {
            id: true,
            User_Booking_signerIdToUser: {
              select: {
                name: true,
                email: true,
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
            name: true,
            email: true,
          },
        },
      },
      orderBy: [
        { entryDate: 'asc' },
        { journalNumber: 'asc' },
      ],
    });

    if (format === 'csv') {
      // Generate CSV content
      const csvHeaders = [
        'Journal Number',
        'Entry Date',
        'Document Type',
        'Signer Name',
        'Signer ID Type',
        'Signer ID State',
        'Notarial Act Type',
        'Fee Charged',
        'Location',
        'Additional Notes',
        'Booking ID',
        'Service Name',
        'Notary Name',
        'Created At',
      ];

      const csvRows = entries.map(entry => [
        entry.journalNumber || '',
        entry.entryDate.toDateString(),
        entry.documentType || '',
        entry.signerName || '',
        entry.signerIdType || '',
        entry.signerIdState || '',
        entry.notarialActType || '',
        entry.feeCharged ? `$${Number(entry.feeCharged).toFixed(2)}` : '',
        entry.location || '',
        entry.additionalNotes || '',
        entry.bookingId || '',
        entry.booking?.service?.name || '',
        entry.notary.name || '',
        entry.createdAt.toISOString(),
      ]);

      // Escape CSV values
      const escapeCsvValue = (value: string) => {
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      };

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.map(escapeCsvValue).join(',')),
      ].join('\n');

      // Return CSV file
      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="notary-journal-${year}.csv"`,
        },
      });
    }

    // Default JSON response
    return NextResponse.json({
      success: true,
      entries: entries.map(entry => ({
        journalNumber: entry.journalNumber,
        entryDate: entry.entryDate.toISOString(),
        documentType: entry.documentType,
        signerName: entry.signerName,
        signerIdType: entry.signerIdType,
        signerIdState: entry.signerIdState,
        notarialActType: entry.notarialActType,
        feeCharged: entry.feeCharged ? Number(entry.feeCharged) : null,
        location: entry.location,
        additionalNotes: entry.additionalNotes,
        bookingId: entry.bookingId,
        serviceName: entry.booking?.service?.name,
        notaryName: entry.notary.name,
        createdAt: entry.createdAt.toISOString(),
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