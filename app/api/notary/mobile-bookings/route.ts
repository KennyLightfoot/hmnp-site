import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Role, BookingStatus, LocationType } from '@/lib/prisma-types';
import type { Prisma } from '@/lib/prisma-types';

type LocationTypeValue = (typeof LocationType)[keyof typeof LocationType];
type BookingStatusValue = (typeof BookingStatus)[keyof typeof BookingStatus];

const isLocationType = (value: string): value is LocationTypeValue => {
  return Object.values(LocationType).includes(value as LocationTypeValue);
};

const isBookingStatus = (value: string): value is BookingStatusValue => {
  return Object.values(BookingStatus).includes(value as BookingStatusValue);
};

const bookingInclude = {
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
} satisfies Prisma.BookingInclude;

type MobileBooking = Prisma.BookingGetPayload<{ include: typeof bookingInclude }>;

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
    const locationTypeParam = searchParams.get('locationType');
    const statusParam = searchParams.get('status');
    const date = searchParams.get('date');

    const locationType = locationTypeParam && isLocationType(locationTypeParam)
      ? locationTypeParam
      : LocationType.CLIENT_SPECIFIED_ADDRESS;

    const whereClause: Prisma.BookingWhereInput = {
      locationType,
    };

    if (userWithRole.role === Role.NOTARY) {
      whereClause.notaryId = userWithRole.id;
    }

    if (statusParam && statusParam !== 'all' && isBookingStatus(statusParam)) {
      // Narrowed via isBookingStatus; safe to assign as BookingStatus enum value
      whereClause.status = statusParam as BookingStatus;
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

    const bookings: MobileBooking[] = await prisma.booking.findMany({
      where: whereClause,
      include: bookingInclude,
      orderBy: {
        scheduledDateTime: 'asc',
      },
    });

    const formattedBookings = bookings.map((booking) => {
      const serviceBasePrice = booking.service?.basePrice
        ? Number(booking.service.basePrice)
        : null;
      const finalPrice = booking.priceAtBooking
        ? Number(booking.priceAtBooking)
        : serviceBasePrice;

      return {
      id: booking.id,
      signerName: booking.User_Booking_signerIdToUser?.name || 'Unknown',
      signerEmail: booking.User_Booking_signerIdToUser?.email || '',
      addressStreet: booking.addressStreet,
      addressCity: booking.addressCity,
      addressState: booking.addressState,
      addressZip: booking.addressZip,
      scheduledDateTime: booking.scheduledDateTime?.toISOString(),
      status: booking.status,
        service: booking.service
          ? {
              name: booking.service.name,
              duration: booking.service.durationMinutes,
            }
          : null,
        finalPrice,
      notes: booking.notes,
      mileageMiles: booking.mileage_miles,
      estimatedCompletionTime: booking.estimated_completion_time?.toISOString(),
      notaryTravelTimeMinutes: booking.notary_travel_time_minutes,
      locationNotes: booking.locationNotes,
      };
    });

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
