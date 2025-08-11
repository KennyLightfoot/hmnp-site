import { NextRequest, NextResponse } from 'next/server';
import { getErrorMessage } from '@/lib/utils/error-utils';
import { prisma } from '@/lib/db';
import { bookingSchemas } from '@/lib/validation/schemas';
import { ServiceType } from '@prisma/client';
import { z } from 'zod';
import { createBookingFromForm } from '@/lib/booking/create';

export const BookingSchema = bookingSchemas.createBookingFromForm;
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = bookingSchemas.createBookingFromForm.parse(body);

    const { booking, service } = await createBookingFromForm({ validatedData, rawBody: body });

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        confirmationNumber: booking.id,
        scheduledDateTime: booking.scheduledDateTime,
        totalAmount: booking.priceAtBooking,
        service: {
          name: service.name,
          serviceType: service.serviceType,
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
}
