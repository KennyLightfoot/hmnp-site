/**
 * Slot Reservation API - Houston Mobile Notary Pros
 * Temporarily reserves time slots to prevent double booking during checkout
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withRateLimit } from '@/lib/security/rate-limiting';
import { reserveSlot as engineReserveSlot, getReservationStatus } from '@/lib/slot-reservation';

// Validation schema for slot reservation
const SlotReservationSchema = z.object({
  datetime: z
    .string()
    .trim()
    .refine((val) => !isNaN(new Date(val).getTime()), 'Valid ISO datetime required'),
  serviceType: z.enum([
    'QUICK_STAMP_LOCAL',
    'STANDARD_NOTARY',
    'EXTENDED_HOURS',
    'LOAN_SIGNING',
    'RON_SERVICES',
    'BUSINESS_ESSENTIALS',
    'BUSINESS_GROWTH',
  ]),
  customerEmail: z
    .string()
    .trim()
    .email('Valid email required')
    .max(254, 'Email is too long'),
  estimatedDuration: z
    .number()
    .int()
    .min(15)
    .max(480), // 15 minutes to 8 hours
});

// Reservation expiry time (15 minutes)
const RESERVATION_EXPIRY_MINUTES = 15;

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = withRateLimit('public', 'reserve_slot')(async (request: NextRequest) => {
  try {
    const data = await request.json();
    const validatedData = SlotReservationSchema.parse(data);

    const { success, reservation, message, conflictingReservation } = await engineReserveSlot({
      datetime: validatedData.datetime,
      serviceType: validatedData.serviceType,
      customerEmail: validatedData.customerEmail,
      estimatedDuration: validatedData.estimatedDuration,
    });

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: message,
          conflictingReservation,
        },
        { status: 409 },
      );
    }

    return NextResponse.json({
      success: true,
      reservation,
      message,
    });
  } catch (error) {
    console.error('Slot reservation error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid reservation parameters', details: error.errors },
        { status: 400 },
      );
    }
    return NextResponse.json({ success: false, error: 'Failed to reserve time slot' }, { status: 500 });
  }
});

export const GET = withRateLimit('public', 'reserve_slot_status')(async (request: NextRequest) => {
  try {
    const { searchParams } = request.nextUrl;
    const reservationId = searchParams.get('id');
    if (!reservationId) {
      return NextResponse.json({ error: 'Reservation ID required' }, { status: 400 });
    }

    const status = await getReservationStatus(reservationId);
    if (!status.active) {
      return NextResponse.json({ success: false, error: 'Reservation not found or expired', expired: true }, { status: 404 });
    }
    return NextResponse.json({ success: true, reservation: status.reservation, timeRemaining: status.timeRemaining, warningZone: status.warningZone });
  } catch (error) {
    console.error('GET reservation error:', error);
    return NextResponse.json({ success: false, error: 'Failed to retrieve reservation' }, { status: 500 });
  }
});