import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Role, BookingStatus, LocationType } from '@prisma/client';

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
    const locationType = searchParams.get('locationType') as LocationType;
    const status = searchParams.get('status');
    const date = searchParams.get('date');

    const whereClause: any = {
      locationType: locationType || LocationType.CLIENT_SPECIFIED_ADDRESS,
    };

    if (userWithRole.role === Role.NOTARY) {
      whereClause.notaryId = userWithRole.id;
    }

    if (status && status !== 'all') {
      whereClause.status = status as BookingStatus;
    }

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

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        service: {
          select: {
            id: true,
            name: true,
            durationMinutes: true,
            basePrice: true,
          },
        },
        User_Booking_signerIdToUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        User_Booking_notaryIdToUser: {
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

    const formattedBookings = bookings.map(booking => ({
      id: booking.id,
      signerName: booking.User_Booking_signerIdToUser?.name || 'Unknown',
      signerEmail: booking.User_Booking_signerIdToUser?.email || '',
      addressStreet: booking.addressStreet,
      addressCity: booking.addressCity,
      addressState: booking.addressState,
      addressZip: booking.addressZip,
      scheduledDateTime: booking.scheduledDateTime?.toISOString(),
      status: booking.status,
      service: {
        name: booking.service.name,
        duration: booking.service.durationMinutes,
      },
      finalPrice: Number(booking.priceAtBooking || booking.service.basePrice),
      notes: booking.notes,
      mileageMiles: booking.mileage_miles,
      estimatedCompletionTime: booking.estimated_completion_time?.toISOString(),
      notaryTravelTimeMinutes: booking.notary_travel_time_minutes,
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
