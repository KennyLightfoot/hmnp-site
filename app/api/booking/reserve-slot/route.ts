/**
 * Championship Booking System - Slot Reservation API
 * Houston Mobile Notary Pros
 * 
 * API endpoint for the psychological slot reservation system.
 * Creates urgency and prevents booking conflicts.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { slotReservationEngine } from '@/lib/slot-reservation';
import { logger } from '@/lib/logger';
import { headers } from 'next/headers';

// Request schemas
const ReserveSlotSchema = z.object({
  datetime: z.string().datetime(),
  serviceType: z.enum(['STANDARD_NOTARY', 'EXTENDED_HOURS', 'LOAN_SIGNING', 'RON_SERVICES']),
  userId: z.string().optional(),
  customerEmail: z.string().email().optional(),
  estimatedDuration: z.number().min(15).max(180).default(60),
  metadata: z.record(z.any()).optional()
});

const ExtendReservationSchema = z.object({
  reservationId: z.string(),
  userId: z.string().optional(),
  customerEmail: z.string().email().optional(),
  reason: z.string().max(200).optional()
});

const CheckStatusSchema = z.object({
  reservationId: z.string()
});

const ReleaseReservationSchema = z.object({
  reservationId: z.string(),
  userId: z.string().optional(),
  customerEmail: z.string().email().optional()
});

// Rate limiting for reservation requests
const reservationLimitMap = new Map<string, { count: number; timestamp: number }>();
const RESERVATION_RATE_LIMIT = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10       // 10 reservation attempts per minute per IP
};

function checkReservationRateLimit(ip: string): boolean {
  const now = Date.now();
  const userLimit = reservationLimitMap.get(ip);
  
  if (!userLimit || now - userLimit.timestamp > RESERVATION_RATE_LIMIT.windowMs) {
    reservationLimitMap.set(ip, { count: 1, timestamp: now });
    return true;
  }
  
  if (userLimit.count >= RESERVATION_RATE_LIMIT.maxRequests) {
    return false;
  }
  
  userLimit.count++;
  return true;
}

// POST: Reserve a slot
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let requestData: any;
  
  try {
    // Get client information
    const headersList = headers();
    const ip = headersList.get('x-forwarded-for') || 
                headersList.get('x-real-ip') || 
                'unknown';
    const userAgent = headersList.get('user-agent') || 'unknown';
    
    // Rate limiting for reservations
    if (!checkReservationRateLimit(ip)) {
      logger.warn('Reservation rate limit exceeded', { ip });
      return NextResponse.json(
        { 
          success: false,
          message: 'Too many reservation attempts. Please wait a moment.',
          code: 'RATE_LIMIT_EXCEEDED'
        },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await request.json();
    requestData = body;
    
    // Determine the action
    const action = body.action || 'reserve';
    
    switch (action) {
      case 'reserve': {
        const validatedRequest = ReserveSlotSchema.parse(body);
        
        // Validate future datetime
        const requestedTime = new Date(validatedRequest.datetime);
        const now = new Date();
        
        if (requestedTime <= now) {
          return NextResponse.json({
            success: false,
            message: 'Cannot reserve slots in the past'
          }, { status: 400 });
        }
        
        // Add metadata
        const enhancedRequest = {
          ...validatedRequest,
          metadata: {
            ...validatedRequest.metadata,
            ip: ip.substring(0, 10) + '...', // Partial IP
            userAgent: userAgent.substring(0, 100), // Limited user agent
            requestedAt: new Date().toISOString()
          }
        };
        
        logger.info('Slot reservation request', {
          datetime: validatedRequest.datetime,
          serviceType: validatedRequest.serviceType,
          customerEmail: validatedRequest.customerEmail ? 
            validatedRequest.customerEmail.replace(/(.{2}).*(@.*)/, '$1***$2') : undefined,
          ip: ip.substring(0, 10) + '...'
        });
        
        const result = await slotReservationEngine.reserveSlot(enhancedRequest);
        
        const processingTime = Date.now() - startTime;
        
        logger.info('Slot reservation result', {
          success: result.success,
          reservationId: result.reservation?.id,
          processingTime
        });
        
        return NextResponse.json({
          ...result,
          metadata: {
            processingTime,
            timestamp: new Date().toISOString()
          }
        });
      }
      
      case 'extend': {
        const validatedRequest = ExtendReservationSchema.parse(body);
        
        logger.info('Reservation extension request', {
          reservationId: validatedRequest.reservationId,
          reason: validatedRequest.reason
        });
        
        const result = await slotReservationEngine.extendReservation(validatedRequest);
        
        return NextResponse.json(result);
      }
      
      case 'release': {
        const validatedRequest = ReleaseReservationSchema.parse(body);
        
        logger.info('Reservation release request', {
          reservationId: validatedRequest.reservationId
        });
        
        const result = await slotReservationEngine.releaseReservation(validatedRequest.reservationId);
        
        return NextResponse.json({
          success: result,
          message: result ? 'Reservation released successfully' : 'Failed to release reservation'
        });
      }
      
      default:
        return NextResponse.json({
          success: false,
          message: `Unknown action: ${action}`
        }, { status: 400 });
    }

  } catch (error) {
    const processingTime = Date.now() - startTime;
    
    if (error instanceof z.ZodError) {
      logger.warn('Slot reservation validation error', {
        errors: error.errors,
        requestData: requestData ? JSON.stringify(requestData).substring(0, 500) : undefined,
        processingTime
      });
      
      return NextResponse.json({
        success: false,
        message: 'Invalid request data',
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      }, { status: 400 });
    }

    logger.error('Slot reservation failed', {
      error: error.message,
      stack: error.stack,
      requestData: requestData ? JSON.stringify(requestData).substring(0, 500) : undefined,
      processingTime
    });

    return NextResponse.json({
      success: false,
      message: 'Unable to process reservation request. Please try again.'
    }, { status: 500 });
  }
}

// GET: Check reservation status or availability
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reservationId = searchParams.get('reservationId');
    const datetime = searchParams.get('datetime');
    const serviceType = searchParams.get('serviceType');
    const action = searchParams.get('action') || 'status';
    
    switch (action) {
      case 'status': {
        if (!reservationId) {
          return NextResponse.json({
            success: false,
            message: 'Reservation ID is required'
          }, { status: 400 });
        }
        
        const status = await slotReservationEngine.getReservationStatus(reservationId);
        
        return NextResponse.json({
          success: true,
          data: status
        });
      }
      
      case 'availability': {
        if (!datetime || !serviceType) {
          return NextResponse.json({
            success: false,
            message: 'DateTime and serviceType are required for availability check'
          }, { status: 400 });
        }
        
        const available = await slotReservationEngine.isSlotAvailable(datetime, serviceType);
        
        return NextResponse.json({
          success: true,
          data: {
            datetime,
            serviceType,
            available,
            message: available ? 'Slot is available' : 'Slot is already reserved'
          }
        });
      }
      
      default:
        return NextResponse.json({
          success: false,
          message: `Unknown action: ${action}`
        }, { status: 400 });
    }

  } catch (error) {
    logger.error('Slot reservation GET request failed', {
      error: error.message,
      url: request.url
    });

    return NextResponse.json({
      success: false,
      message: 'Unable to process request'
    }, { status: 500 });
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}