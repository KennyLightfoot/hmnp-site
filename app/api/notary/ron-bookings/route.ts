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

    // Build where clause for RON bookings
    const whereClause: any = {
      locationType: locationType || LocationType.REMOTE_ONLINE_NOTARIZATION,
    };

    // Add notary filter for non-admin users
    if (userRole === Role.NOTARY) {
      whereClause.notaryId = (session.user as any).id;
    }

    // Add status filter
    if (status && status !== 'all') {
      whereClause.status = status as BookingStatus;
    }

    // Fetch RON bookings
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
        notary: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [
        { scheduledDateTime: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    // Format bookings for RON session panel
    const formattedBookings = bookings.map(booking => ({
      id: booking.id,
      signerName: booking.User_Booking_signerIdToUser?.name || 'Unknown',
      signerEmail: booking.User_Booking_signerIdToUser?.email || '',
      signerPhone: null, // Phone field doesn't exist on User model,
      scheduledDateTime: booking.scheduledDateTime?.toISOString(),
      status: booking.status,
      service: {
        name: booking.service?.name || 'Unknown Service',
        duration: booking.service?.durationMinutes || 0,
      },
      finalPrice: Number(booking.priceAtBooking || booking.service?.basePrice || 0),
      proofTransactionId: null, // This property doesn't exist on booking model
      proofAccessLink: null, // This property doesn't exist on booking model
      proofStatus: null, // This property doesn't exist on booking model,
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