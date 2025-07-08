/**
 * Slot Reservation API - Houston Mobile Notary Pros
 * Temporarily reserves time slots to prevent double booking during checkout
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { redis } from '@/lib/redis';

// Validation schema for slot reservation
const SlotReservationSchema = z.object({
  datetime: z.string().datetime('Valid ISO datetime required'),
  serviceType: z.enum(['QUICK_STAMP_LOCAL', 'STANDARD_NOTARY', 'EXTENDED_HOURS', 'LOAN_SIGNING', 'RON_SERVICES', 'BUSINESS_ESSENTIALS', 'BUSINESS_GROWTH']),
  customerEmail: z.string().email('Valid email required'),
  estimatedDuration: z.number().min(15).max(480), // 15 minutes to 8 hours
});

// Reservation expiry time (15 minutes)
const RESERVATION_EXPIRY_MINUTES = 15;

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validate input data
    const validatedData = SlotReservationSchema.parse(data);
    
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
    if (error.message.includes('Redis') || error.message.includes('ECONNREFUSED')) {
      console.error('Redis connection failed, allowing reservation to proceed');
      
      // If Redis is down, create a temporary reservation without persistence
      const reservedAt = new Date();
      const expiresAt = new Date(reservedAt.getTime() + (RESERVATION_EXPIRY_MINUTES * 60 * 1000));
      
      return NextResponse.json({
        success: true,
        reservation: {
          id: `tmp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          datetime: request.body?.datetime || new Date().toISOString(),
          serviceType: request.body?.serviceType || 'STANDARD_NOTARY',
          estimatedDuration: request.body?.estimatedDuration || 60,
          reservedAt: reservedAt.toISOString(),
          expiresAt: expiresAt.toISOString(),
          expiresInMinutes: RESERVATION_EXPIRY_MINUTES,
        },
        warning: 'Reservation created without persistence due to system unavailability'
      });
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to reserve time slot',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
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
    
    const reservation = await redis.get(`reservation:${reservationId}`);
    
    if (!reservation) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Reservation not found or expired',
          expired: true
        },
        { status: 404 }
      );
    }
    
    const reservationData = JSON.parse(reservation);
    const now = new Date();
    const expiresAt = new Date(reservationData.expiresAt);
    
    return NextResponse.json({
      success: true,
      reservation: reservationData,
      isExpired: now > expiresAt,
      timeRemaining: Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000))
    });
    
  } catch (error) {
    console.error('Error checking reservation:', error);
    return NextResponse.json(
      { error: 'Failed to check reservation' },
      { status: 500 }
    );
  }
} 