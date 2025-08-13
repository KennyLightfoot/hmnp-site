import { NextRequest, NextResponse } from 'next/server';
import { getErrorMessage } from '@/lib/utils/error-utils';
import { prisma } from '@/lib/db';
import { bookingSchemas } from '@/lib/validation/schemas';
import { ServiceType } from '@prisma/client';
import { z } from 'zod';
import { createBookingFromForm } from '@/lib/booking/create';
import { withRateLimit } from '@/lib/security/rate-limiting';
import { withBookingSecurity } from '@/lib/security/comprehensive-security';

export const BookingSchema = bookingSchemas.createBookingFromForm;
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = withBookingSecurity(async (request: NextRequest) => {
  try {
    // Handle both JSON and form submissions
    const contentType = request.headers.get('content-type') || ''
    let body: any
    if (contentType.includes('application/json')) {
      body = await request.json()
    } else if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
      const form = await request.formData()
      body = Object.fromEntries(form as any)
    } else {
      body = await request.json().catch(() => ({}))
    }
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
    const status = (error as any)?.status || 500
    if (status === 409) {
      return NextResponse.json({
        error: 'TIME_UNAVAILABLE',
        message: error?.message || 'Selected time is no longer available. Please pick a different time.',
        code: 'TIME_CONFLICT',
      }, { status })
    }
    return NextResponse.json({ message: 'Internal Server Error', error: getErrorMessage(error) }, { status });
  }
});

// CORS preflight to support deploy previews and prevent null-origin 403s when CSRF is valid
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_BASE_URL || '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-csrf-token',
      'Access-Control-Max-Age': '86400',
    },
  });
}
