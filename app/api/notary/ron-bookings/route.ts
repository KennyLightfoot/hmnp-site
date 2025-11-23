import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Role, BookingStatus, LocationType, Prisma } from '@/lib/prisma-types';

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

    const whereClause: any = {
      locationType: locationType || LocationType.REMOTE_ONLINE_NOTARIZATION,
    };

    if (userWithRole.role === Role.NOTARY) {
      whereClause.notaryId = userWithRole.id;
    }

    if (status && status !== 'all') {
      whereClause.status = status as BookingStatus;
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        service: true,
        User_Booking_signerIdToUser: true,
        User_Booking_notaryIdToUser: true,
      },
      orderBy: [
        { scheduledDateTime: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    const formattedBookings = bookings.map((booking: Prisma.BookingGetPayload<{
      include: {
        service: true;
        User_Booking_signerIdToUser: true;
        User_Booking_notaryIdToUser: true;
      };
    }>) => ({
      id: booking.id,
      signerName: booking.User_Booking_signerIdToUser?.name || 'Unknown',
      signerEmail: booking.User_Booking_signerIdToUser?.email || '',
      scheduledDateTime: booking.scheduledDateTime?.toISOString(),
      status: booking.status,
      service: {
        name: booking.service?.name || 'Unknown Service',
        duration: booking.service?.durationMinutes || 0,
      },
      finalPrice: Number(booking.priceAtBooking || booking.service?.basePrice || 0),
      proofSessionUrl: booking.proofSessionUrl,
      notes: booking.notes,
      createdAt: booking.createdAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      bookings: formattedBookings,
      total: formattedBookings.length,
    });

  } catch (error) {
    console.error('Error fetching RON bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch RON bookings' },
      { status: 500 }
    );
  }
}
