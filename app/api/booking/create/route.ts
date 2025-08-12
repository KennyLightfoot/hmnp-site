import { NextRequest, NextResponse } from 'next/server';
import { getErrorMessage } from '@/lib/utils/error-utils';
import { prisma } from '@/lib/db';
import { bookingSchemas } from '@/lib/validation/schemas';
import { ServiceType } from '@prisma/client';
import { z } from 'zod';
import { createBookingFromForm } from '@/lib/booking/create';
import { withRateLimit } from '@/lib/security/rate-limiting';

export const BookingSchema = bookingSchemas.createBookingFromForm;
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = withRateLimit('booking_create', 'booking_create')(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const validatedData = bookingSchemas.createBookingFromForm.parse(body);

    const { booking, service } = await createBookingFromForm({ validatedData, rawBody: body });
    const bookingId = (booking as any)?.id;
    const scheduled = (booking as any)?.scheduledDateTime;
    const totalAmount = (booking as any)?.priceAtBooking;

    return NextResponse.json({
      success: true,
      booking: {
        id: bookingId,
        confirmationNumber: bookingId,
        scheduledDateTime: scheduled,
        totalAmount,
        service: {
          name: service.name as any,
          serviceType: service.serviceType as any,
        },
      },
    });
  } catch (error: any) {
    console.error('Error in POST /api/booking/create:', error);
    if (error.name === 'ZodError') {
      return NextResponse.json({ message: 'Validation failed', errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ message: 'Internal Server Error', error: getErrorMessage(error) }, { status: 500 });
  }
});
