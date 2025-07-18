/**
 * Slot Reservation API - Houston Mobile Notary Pros
 * Temporarily reserves time slots to prevent double booking during checkout
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { redis } from '@/lib/redis';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

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

export async function POST(request: NextRequest) {
  let requestData: any = null;
  try {
    requestData = await request.json();

    // Validate input data
    const validatedData = SlotReservationSchema.parse(requestData);
    
    console.log(`🔒 Attempting to reserve slot: ${validatedData.datetime} for ${validatedData.customerEmail}`);
    
    // Create a unique slot key for Redis
    const slotKey = `slot:${validatedData.serviceType}:${validatedData.datetime}`;
    
    // Check if slot is already reserved
    const existingReservation = await redis.get(slotKey);
    if (existingReservation) {
      const reservation = JSON.parse(existingReservation);
      console.log(`❌ Slot already reserved: ${slotKey} by ${reservation.customerEmail}`);
      
      return NextResponse.json(
        { 
          success: false,
          error: 'This time slot is already reserved by another customer',
          details: {
            datetime: validatedData.datetime,
            serviceType: validatedData.serviceType,
            reservedBy: reservation.customerEmail !== validatedData.customerEmail ? 'another customer' : 'you',
            expiresAt: reservation.expiresAt
          }
        },
        { status: 409 }
      );
    }
    
    // Create reservation data
    const reservedAt = new Date();
    const expiresAt = new Date(reservedAt.getTime() + (RESERVATION_EXPIRY_MINUTES * 60 * 1000));
    
    const reservation = {
      id: `res_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      datetime: validatedData.datetime,
      serviceType: validatedData.serviceType,
      customerEmail: validatedData.customerEmail,
      estimatedDuration: validatedData.estimatedDuration,
      reservedAt: reservedAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };
    
    // Store reservation in Redis with expiry
    await redis.setex(
      slotKey,
      RESERVATION_EXPIRY_MINUTES * 60, // Expire in 15 minutes
      JSON.stringify(reservation)
    );
    
    // Also store by reservation ID for lookup
    await redis.setex(
      `reservation:${reservation.id}`,
      RESERVATION_EXPIRY_MINUTES * 60,
      JSON.stringify(reservation)
    );
    
    console.log(`✅ Slot reserved successfully: ${reservation.id} for ${validatedData.customerEmail}`);
    
    return NextResponse.json({
      success: true,
      reservation: {
        id: reservation.id,
        datetime: reservation.datetime,
        serviceType: reservation.serviceType,
        estimatedDuration: reservation.estimatedDuration,
        reservedAt: reservation.reservedAt,
        expiresAt: reservation.expiresAt,
        expiresInMinutes: RESERVATION_EXPIRY_MINUTES,
      },
      message: `Time slot reserved for ${RESERVATION_EXPIRY_MINUTES} minutes`
    });
    
  } catch (error) {
    console.error('❌ Slot reservation error:', error);
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid reservation parameters',
          details: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
        },
        { status: 400 }
      );
    }
    
    // Handle Redis connection errors
    if ((error as any).message?.includes('Redis') || (error as any).message?.includes('ECONNREFUSED')) {
      logger.warn('Redis unavailable - using database fallback for reservation');

      const reservedAt = new Date();
      const expiresAt = new Date(reservedAt.getTime() + (RESERVATION_EXPIRY_MINUTES * 60 * 1000));

      const record = await prisma.slotReservationFallback.create({
        data: {
          datetime: new Date(requestData?.datetime || new Date()),
          serviceType: requestData?.serviceType || 'STANDARD_NOTARY',
          customerEmail: requestData?.customerEmail || 'unknown',
          estimatedDuration: requestData?.estimatedDuration || 60,
          reservedAt,
          expiresAt,
        }
      });

      return NextResponse.json({
        success: true,
        reservation: {
          id: record.id,
          datetime: record.datetime.toISOString(),
          serviceType: record.serviceType,
          estimatedDuration: record.estimatedDuration,
          reservedAt: record.reservedAt.toISOString(),
          expiresAt: record.expiresAt.toISOString(),
          expiresInMinutes: RESERVATION_EXPIRY_MINUTES,
        },
        warning: 'Reservation stored in database due to Redis outage'
      });
    }
    
    logger.error('Slot reservation failed', error as Error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to reserve time slot',
        message: process.env.NODE_ENV === 'development' ? (error as any).message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// Optional: Add GET method to check reservation status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const reservationId = searchParams.get('id');
    
    if (!reservationId) {
      return NextResponse.json(
        { error: 'Reservation ID required' },
        { status: 400 }
      );
    }
    
    let reservationData: any = null;
    try {
      const reservation = await redis.get(`reservation:${reservationId}`);
      if (reservation) {
        reservationData = JSON.parse(reservation);
      }
    } catch (err) {
      logger.warn('Redis unavailable while checking reservation', err as Error);
    }

    if (!reservationData) {
      const record = await prisma.slotReservationFallback.findUnique({ where: { id: reservationId } });
      if (!record || record.expiresAt < new Date()) {
        return NextResponse.json(
          {
            success: false,
            error: 'Reservation not found or expired',
            expired: true
          },
          { status: 404 }
        );
      }
      reservationData = {
        id: record.id,
        datetime: record.datetime.toISOString(),
        serviceType: record.serviceType,
        estimatedDuration: record.estimatedDuration,
        reservedAt: record.reservedAt.toISOString(),
        expiresAt: record.expiresAt.toISOString()
      };
      logger.info('Returned reservation from fallback database', { id: reservationId });
    }
    
    const now = new Date();
    const expiresAt = new Date(reservationData.expiresAt);
    
    return NextResponse.json({
      success: true,
      reservation: reservationData,
      isExpired: now > expiresAt,
      timeRemaining: Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000))
    });
    
  } catch (error) {
    logger.error('Error checking reservation', error as Error);
    return NextResponse.json(
      { error: 'Failed to check reservation' },
      { status: 500 }
    );
  }
} 