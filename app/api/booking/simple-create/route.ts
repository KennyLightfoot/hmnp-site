import { NextResponse } from 'next/server';
import { withDebug } from '@/lib/api-debug';
import { BookingService } from '@/lib/booking/booking-service';

const bookingService = new BookingService();

async function handler(request: Request) {
  try {
    const body = await request.json();

    const result = await bookingService.createBooking(body);

    return NextResponse.json(
      {
        success: true,
        booking: result.booking,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error('❌ Booking creation failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message ?? 'Failed to create booking',
      },
      { status: 400 },
    );
  }
}

export const POST = withDebug(handler); 