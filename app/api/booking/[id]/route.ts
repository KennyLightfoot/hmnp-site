import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getErrorMessage } from '@/lib/utils/error-utils'

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const id = params?.id
    if (!id) {
      return NextResponse.json({ error: 'Missing booking id' }, { status: 400 })
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        service: true,
      },
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Normalize shape for the Success page expectations
    const payload = {
      id: booking.id,
      serviceType: (booking as any).service?.serviceType || (booking as any).serviceType || 'STANDARD_NOTARY',
      customerName: (booking as any).customerName || '',
      customerEmail: (booking as any).customerEmail || '',
      scheduledDateTime: booking.scheduledDateTime?.toISOString?.() || (booking as any).scheduledDateTime || '',
      addressStreet: (booking as any).addressStreet || (booking as any).locationAddress || '',
      addressCity: (booking as any).addressCity || '',
      addressState: (booking as any).addressState || '',
      addressZip: (booking as any).addressZip || '',
    }

    return NextResponse.json({ booking: payload })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to retrieve booking', message: getErrorMessage(error) },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withRateLimit } from '@/lib/security/rate-limiting';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Role } from '@prisma/client';
import { z } from 'zod';
import { logger as log } from '@/lib/logger';

const paramsSchema = z.object({
  id: z.string().min(1, { message: 'A valid booking ID is required' }),
});

export const GET = withRateLimit('public', 'booking_detail')(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;

  log.info(`[API] Received request for booking details for id: ${id}`);

  // Validate the booking ID from the URL
  const validation = paramsSchema.safeParse({ id });
  if (!validation.success) {
    // Detailed logging for validation failure
    log.error('[API] Booking ID validation failed', {
      error: validation.error.errors,
      bookingId: id,
    });
    return NextResponse.json(
      { error: validation.error.errors[0]?.message || 'Invalid booking ID' },
      { status: 400 }
    );
  }

  try {
    const rawBooking = await prisma.booking.findUnique({
      where: { id: validation.data.id },
      select: {
        id: true,
        customerEmail: true,
        customerName: true,
        scheduledDateTime: true,
        addressStreet: true,
        addressCity: true,
        addressState: true,
        addressZip: true,
        service: {
          select: {
            serviceType: true,
          },
        },
      },
    });

    if (!rawBooking) {
      log.warn(`[API] Booking not found: ${id}`);
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Role-aware PII masking
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role as Role | undefined;
    const isAdminOrStaff = role === Role.ADMIN || role === Role.STAFF;
    const maskedEmail = rawBooking.customerEmail ? rawBooking.customerEmail.replace(/(^.).*(@.*$)/, '$1***$2') : null;
    const maskedName = rawBooking.customerName ? `${rawBooking.customerName[0]}***` : null;

    const booking = {
      id: rawBooking.id,
      customerEmail: isAdminOrStaff ? rawBooking.customerEmail : maskedEmail,
      customerName: isAdminOrStaff ? rawBooking.customerName : maskedName,
      scheduledDateTime: rawBooking.scheduledDateTime,
      addressStreet: isAdminOrStaff ? rawBooking.addressStreet : undefined,
      addressCity: rawBooking.addressCity,
      addressState: rawBooking.addressState,
      addressZip: isAdminOrStaff ? rawBooking.addressZip : undefined,
      serviceType: (rawBooking as any).service?.serviceType || 'UNKNOWN',
    } as any;

    log.info(`[API] Successfully retrieved booking: ${id}`);
    return NextResponse.json({ booking });
  } catch (error) {
    log.error('[API] Error fetching booking details', error as Error);
    return NextResponse.json(
      { error: 'An internal error occurred' },
      { status: 500 }
    );
  }
});