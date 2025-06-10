import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } // Changed to Promise type for NextJS 15
) {
  const params = await context.params; // Await the params
  const bookingId = params.id; // Access id via awaited params

  const session = await getServerSession(authOptions);
  if (!session && process.env.NODE_ENV !== 'development') { 
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!bookingId) {
    return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
  }

  try {
    const booking = await prisma.booking.findUnique({
      where: {
        id: bookingId,
        // Optional: Add security check to ensure the user owns this booking or is an admin
        // userId: session.user.id, // Uncomment if bookings are directly tied to users and you want to enforce ownership
      },
      include: {
        service: true, // Include related service details
        Payment: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
        User_Booking_signerIdToUser: true,
        User_Booking_notaryIdToUser: true
        // You might want to include client details if they are stored separately
        // and not directly on the booking, or if you need more than what's on session.user
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Optional: Further check if the logged-in user is authorized to view this booking
    // This is important if bookings aren't directly linked via userId in the query
    // or if there are other authorization rules (e.g. client making booking vs. assigned notary)
    // For now, we assume that if a user is authenticated and the booking exists, they can view it.
    // A more robust check might involve comparing booking.userId or booking.signerId with session.user.id
    // For example:
    // if (booking.signerId !== session.user.id && session.user.role !== 'ADMIN') {
    //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    // }

    return NextResponse.json(booking);
  } catch (error) {
    console.error(`Error fetching booking ${bookingId}:`, error);
    return NextResponse.json({ error: 'Failed to fetch booking details' }, { status: 500 });
  }
} 