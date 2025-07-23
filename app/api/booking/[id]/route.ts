import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database-connection';
import { z } from 'zod';
import { logger as log } from '@/lib/logger';

const paramsSchema = z.object({
  id: z.string().cuid({ message: 'A valid booking ID is required' }),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  log.info(`[API] Received request for booking details: ${id}`);

  // Validate the booking ID from the URL
  const validation = paramsSchema.safeParse(params);
  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error.errors[0].message },
      { status: 400 }
    );
  }

  try {
    const rawBooking = await prisma.booking.findUnique({
      where: { id: validation.data.id },
      select: {
        id: true,
        customerEmail: true,
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

    const booking = {
      ...rawBooking,
      serviceType: (rawBooking as any).service?.serviceType || 'UNKNOWN',
      customerName: (rawBooking as any).customerName ?? 'Valued Customer',
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
} 