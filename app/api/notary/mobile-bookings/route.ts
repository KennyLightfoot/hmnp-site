import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Role, BookingStatus, LocationType } from '@prisma/client';

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
    const locationType = searchParams.get('locationType') as LocationType;
    const status = searchParams.get('status');
    const date = searchParams.get('date');

    // Build where clause
    const whereClause: any = {
      locationType: locationType || LocationType.CLIENT_SPECIFIED_ADDRESS,
    };

    // Add notary filter for non-admin users
    if (userRole === Role.NOTARY) {
      whereClause.notaryId = (session.user as any).id;
    }

    // Add status filter
    if (status && status !== 'all') {
      whereClause.status = status as BookingStatus;
    }

    // Add date filter
    if (date && date !== 'all') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      switch (date) {
        case 'today':
          whereClause.scheduledDateTime = {
            gte: today,
            lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
          };
          break;
        case 'tomorrow':
          const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
          whereClause.scheduledDateTime = {
            gte: tomorrow,
            lt: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000)
          };
          break;
        case 'week':
          const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
          whereClause.scheduledDateTime = {
            gte: today,
            lt: weekFromNow
          };
          break;
      }
    }

    // Fetch mobile bookings
    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        service: {
          select: {
            id: true,
            name: true,
            duration: true,
            price: true,
          },
        },
        signer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        notary: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        scheduledDateTime: 'asc',
      },
    });

    // Format bookings for mobile route board
    const formattedBookings = bookings.map(booking => ({
      id: booking.id,
      signerName: booking.signer?.name || 'Unknown',
      signerEmail: booking.signer?.email || '',
      signerPhone: booking.signer?.phone,
      addressStreet: booking.addressStreet,
      addressCity: booking.addressCity,
      addressState: booking.addressState,
      addressZip: booking.addressZip,
      scheduledDateTime: booking.scheduledDateTime?.toISOString(),
      status: booking.status,
      service: {
        name: booking.service.name,
        duration: booking.service.duration,
      },
      finalPrice: Number(booking.priceAtBooking || booking.service.price),
      notes: booking.notes,
      mileageMiles: booking.mileageMiles,
      estimatedCompletionTime: booking.estimatedCompletionTime?.toISOString(),
      notaryTravelTimeMinutes: booking.notaryTravelTimeMinutes,
      locationNotes: booking.locationNotes,
    }));

    return NextResponse.json({
      success: true,
      bookings: formattedBookings,
      total: formattedBookings.length,
    });

  } catch (error) {
    console.error('Error fetching mobile bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mobile bookings' },
      { status: 500 }
    );
  }
} 