/**
 * 🚀 HMNP V2 Bookings API
 * Single source of truth for ALL booking operations
 * Atomic transactions, bulletproof reliability, zero data loss
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { BookingStatus, PaymentStatus, LocationType } from '@prisma/client';
import { calculatePricing, validatePricingCalculation } from '@/lib/v2/pricing-engine';
import { validateServiceId } from '@/app/api/v2/services/route';

// ============================================================================
// 🛡️ REQUEST VALIDATION SCHEMAS
// ============================================================================

const AddressSchema = z.object({
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().length(2, 'State must be 2 characters'),
  zip: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code format')
});

const CreateBookingSchema = z.object({
  // Service selection
  serviceId: z.string().min(1, 'Service ID is required'),
  
  // Customer information
  customerEmail: z.string().email('Valid email is required'),
  customerName: z.string().min(2, 'Customer name is required').max(100),
  customerPhone: z.string().regex(/^[\+]?[\d\s\(\)\-\.]{10,}$/, 'Valid phone number is required').optional(),
  
  // Scheduling
  scheduledDateTime: z.string().datetime('Invalid date format'),
  
  // Location (required for mobile services)
  locationType: z.enum(['CLIENT_SPECIFIED_ADDRESS', 'NOTARY_OFFICE', 'NEUTRAL_LOCATION', 'REMOTE_ONLINE']).optional(),
  address: AddressSchema.optional(),
  locationNotes: z.string().max(500).optional(),
  
  // RON specific
  ronDocumentUrl: z.string().url().optional(),
  
  // Optional enhancements
  promoCode: z.string().optional(),
  specialInstructions: z.string().max(1000).optional(),
  
  // Consent and agreements
  termsAccepted: z.boolean().refine(val => val === true, 'Terms must be accepted'),
  smsNotifications: z.boolean().optional().default(false),
  emailUpdates: z.boolean().optional().default(true),
  
  // Pricing snapshot (for validation)
  expectedFinalPrice: z.number().min(0).optional()
});

const UpdateBookingSchema = z.object({
  scheduledDateTime: z.string().datetime().optional(),
  locationType: z.enum(['CLIENT_SPECIFIED_ADDRESS', 'NOTARY_OFFICE', 'NEUTRAL_LOCATION', 'REMOTE_ONLINE']).optional(),
  address: AddressSchema.optional(),
  locationNotes: z.string().max(500).optional(),
  specialInstructions: z.string().max(1000).optional(),
  status: z.enum(['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'EXPIRED']).optional()
});

const BookingQuerySchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'EXPIRED']).optional(),
  customerEmail: z.string().email().optional(),
  serviceId: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  locationType: z.string().optional(), // Added for RON filtering
  limit: z.union([
    z.string().regex(/^\d+$/).transform(Number),
    z.number()
  ]).optional().default(50),
  offset: z.union([
    z.string().regex(/^\d+$/).transform(Number), 
    z.number()
  ]).optional().default(0)
});

// ============================================================================
// 🎯 CREATE BOOKING (POST)
// ============================================================================

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  
  try {
    const body = await request.json();
    
    // Validate request
    const validatedRequest = CreateBookingSchema.parse(body);
    
    // Validate service exists and is active
    if (!validateServiceId(validatedRequest.serviceId)) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_SERVICE',
          message: 'Service not found or inactive',
          field: 'serviceId',
          requestId
        }
      }, { status: 400 });
    }
    
    // Parse and validate scheduled date
    const scheduledDateTime = new Date(validatedRequest.scheduledDateTime);
    
    if (scheduledDateTime <= new Date()) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_DATE',
          message: 'Scheduled date must be in the future',
          field: 'scheduledDateTime',
          requestId
        }
      }, { status: 400 });
    }
    
    // Get service details for validation
    const service = await prisma.service.findUnique({
      where: { id: validatedRequest.serviceId }
    });
    
    if (!service) {
      return NextResponse.json({
        success: false,
        error: 'SERVICE_NOT_FOUND',
        message: 'The requested service was not found',
        meta: { requestId }
      }, { status: 404 });
    }
    if (service.serviceType === 'MOBILE' && !validatedRequest.address) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'ADDRESS_REQUIRED',
          message: 'Address is required for mobile services',
          field: 'address',
          requestId
        }
      }, { status: 400 });
    }
    
    // Calculate final pricing
    console.log('Calculating pricing for booking:', { serviceId: validatedRequest.serviceId, address: validatedRequest.address });
    
    const pricingCalculation = await calculatePricing({
      serviceId: validatedRequest.serviceId,
      address: validatedRequest.address,
      scheduledDateTime,
      promoCode: validatedRequest.promoCode
    });
    
    // Validate pricing integrity
    if (!validatePricingCalculation(pricingCalculation)) {
      throw new Error('Pricing calculation validation failed');
    }
    
    // Validate expected price (if provided)
    if (validatedRequest.expectedFinalPrice && 
        Math.abs(pricingCalculation.finalPrice - validatedRequest.expectedFinalPrice) > 0.01) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'PRICE_MISMATCH',
          message: 'Expected price does not match calculated price',
          details: {
            expected: validatedRequest.expectedFinalPrice,
            calculated: pricingCalculation.finalPrice
          },
          requestId
        }
      }, { status: 400 });
    }
    
    // Check for existing booking conflicts
    const existingBooking = await prisma.booking.findFirst({
      where: {
        customerEmail: validatedRequest.customerEmail,
        scheduledDateTime: scheduledDateTime,
        status: {
          in: ['REQUESTED', 'PAYMENT_PENDING', 'CONFIRMED', 'SCHEDULED']
        }
      }
    });
    
    if (existingBooking) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'BOOKING_CONFLICT',
          message: 'You already have a booking scheduled for this time',
          requestId
        }
      }, { status: 409 });
    }
    
    // 🔒 ATOMIC TRANSACTION: Create booking record
    const booking = await prisma.$transaction(async (tx) => {
      // Create the booking record with schema-compatible fields
      const newBooking = await tx.booking.create({
        data: {
          id: `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          serviceId: validatedRequest.serviceId,
          signerId: null, // TODO: Link to customer User record if exists
          customerEmail: validatedRequest.customerEmail,
          scheduledDateTime,
          updatedAt: new Date(),
          
          // Location data - map to schema-compatible LocationType
          locationType: (() => {
            if (validatedRequest.locationType === 'NOTARY_OFFICE') return 'OUR_OFFICE';
            if (validatedRequest.locationType === 'REMOTE_ONLINE') return 'REMOTE_ONLINE_NOTARIZATION';
            if (validatedRequest.locationType === 'NEUTRAL_LOCATION') return 'PUBLIC_PLACE';
            return validatedRequest.locationType as LocationType || 
                   (service.serviceType === 'RON' ? 'REMOTE_ONLINE_NOTARIZATION' : 'CLIENT_SPECIFIED_ADDRESS');
          })(),
          addressStreet: validatedRequest.address?.street,
          addressCity: validatedRequest.address?.city,
          addressState: validatedRequest.address?.state,
          addressZip: validatedRequest.address?.zip,
          locationNotes: validatedRequest.locationNotes,
          
          // Pricing (use schema-compatible fields)
          priceAtBooking: pricingCalculation.finalPrice,
          travelFee: pricingCalculation.travelFee,
          depositAmount: pricingCalculation.depositAmount,
          
          // Status (use schema-compatible fields)
          status: 'REQUESTED',
          depositStatus: 'PENDING',
          
          // Instructions
          notes: validatedRequest.specialInstructions,
          
          // Metadata
          calculatedDistance: pricingCalculation.distanceInfo?.distanceMiles,
          serviceAreaValidated: pricingCalculation.distanceInfo?.withinStandardArea || false,
          pricingVersion: pricingCalculation.pricingVersion,
          pricingBreakdown: pricingCalculation // Store full pricing as JSON
        }
      });
      
      // Log booking creation for monitoring
      console.log(`✅ Booking created: ${newBooking.id} for ${validatedRequest.customerEmail}`, {
        bookingId: newBooking.id,
        customerEmail: validatedRequest.customerEmail,
        customerName: validatedRequest.customerName,
        serviceId: validatedRequest.serviceId,
        scheduledDateTime: scheduledDateTime.toISOString(),
        pricing: pricingCalculation,
        requestId
      });
      
      return newBooking;
    });
    
    // 🚀 Queue background integrations using our V2 job system
    const { queueBookingConfirmation, queueBookingReminders } = await import('@/lib/v2/job-queue');
    
    const jobPayload = {
      bookingId: booking.id,
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      customerPhone: booking.customerPhone,
      serviceName: service.name,
      serviceType: service.type as 'MOBILE' | 'RON',
      scheduledDateTime: booking.scheduledDateTime.toISOString(),
      finalPrice: Number(booking.finalPrice),
      address: validatedRequest.address
    };

    // Queue confirmation jobs (immediate)
    await queueBookingConfirmation(jobPayload);
    
    // Queue reminder jobs (scheduled for future)
    await queueBookingReminders(jobPayload);
    
    // Return successful response
    return NextResponse.json({
      success: true,
      data: {
        booking: {
          id: booking.id,
          serviceId: booking.serviceId,
          serviceName: service.name,
          customerEmail: booking.customerEmail,
          customerName: validatedRequest.customerName, // From request since not in DB
          scheduledDateTime: booking.scheduledDateTime.toISOString(),
          status: booking.status,
          paymentStatus: booking.depositStatus, // Use schema field
          finalPrice: booking.priceAtBooking, // Use schema field
          depositRequired: Boolean(booking.depositAmount && booking.depositAmount > 0),
          depositAmount: booking.depositAmount,
          createdAt: booking.createdAt.toISOString()
        },
        pricing: pricingCalculation,
        nextSteps: {
          paymentRequired: Boolean(booking.depositAmount && booking.depositAmount > 0) || Boolean(booking.priceAtBooking && booking.priceAtBooking > 0),
          confirmationEmail: validatedRequest.emailUpdates,
          estimatedDuration: service.duration
        }
      },
      meta: {
        requestId,
        timestamp: new Date().toISOString(),
        version: '2.0'
      }
    }, { status: 201 });
    
  } catch (error) {
    console.error('Booking Creation Error:', error, { requestId });
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          })),
          requestId
        }
      }, { status: 400 });
    }
    
    // Handle known business logic errors
    if (error instanceof Error) {
      if (error.message.includes('Invalid service')) {
        return NextResponse.json({
          success: false,
          error: {
            code: 'INVALID_SERVICE',
            message: error.message,
            requestId
          }
        }, { status: 400 });
      }
      
      if (error.message.includes('Pricing calculation')) {
        return NextResponse.json({
          success: false,
          error: {
            code: 'PRICING_ERROR',
            message: 'Failed to calculate pricing',
            requestId
          }
        }, { status: 500 });
      }
    }
    
    // Generic error
    return NextResponse.json({
      success: false,
      error: {
        code: 'BOOKING_CREATION_ERROR',
        message: 'Failed to create booking',
        details: error instanceof Error ? error.message : 'Unknown error',
        requestId
      }
    }, { status: 500 });
  }
}

// ============================================================================
// 🎯 GET BOOKINGS (GET)
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = BookingQuerySchema.parse(Object.fromEntries(searchParams));
    
    // Build where clause
    const where: any = {};
    
    if (query.status) where.status = query.status;
    if (query.customerEmail) where.customerEmail = query.customerEmail;
    if (query.serviceId) where.serviceId = query.serviceId;
    if (query.locationType) where.locationType = query.locationType;
    
    if (query.dateFrom || query.dateTo) {
      where.scheduledDateTime = {};
      if (query.dateFrom) where.scheduledDateTime.gte = new Date(query.dateFrom);
      if (query.dateTo) where.scheduledDateTime.lte = new Date(query.dateTo);
    }
    
    // Get bookings with related data
    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        orderBy: { scheduledDateTime: 'desc' },
        take: query.limit,
        skip: query.offset,
        include: {
          Service: {
            select: { name: true, serviceType: true }
          },
          Payment: {
            select: { id: true, amount: true, status: true, paidAt: true }
          },
          User_Booking_signerIdToUser: {
            select: { firstName: true, lastName: true, email: true }
          }
        }
      }),
      prisma.booking.count({ where })
    ]);
    
    return NextResponse.json({
      success: true,
      data: {
        bookings: bookings.map(booking => ({
          id: booking.id,
          serviceId: booking.serviceId,
          serviceName: booking.Service?.name,
          serviceType: booking.Service?.serviceType,
          customerEmail: booking.customerEmail || booking.User_Booking_signerIdToUser?.email,
          customerName: booking.User_Booking_signerIdToUser 
            ? `${booking.User_Booking_signerIdToUser.firstName || ''} ${booking.User_Booking_signerIdToUser.lastName || ''}`.trim()
            : booking.customerEmail || 'Unknown',
          scheduledDateTime: booking.scheduledDateTime?.toISOString(),
          status: booking.status,
          depositStatus: booking.depositStatus,
          priceAtBooking: booking.priceAtBooking,
          locationType: booking.locationType,
          addressStreet: booking.addressStreet,
          addressCity: booking.addressCity,
          addressState: booking.addressState,
          addressZip: booking.addressZip,
          locationNotes: booking.locationNotes,
          notes: booking.notes,
          createdAt: booking.createdAt.toISOString(),
          updatedAt: booking.updatedAt.toISOString(),
          payments: booking.Payment
        })),
        pagination: {
          total,
          limit: query.limit,
          offset: query.offset,
          hasMore: query.offset + query.limit < total
        }
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '2.0'
      }
    });
    
  } catch (error) {
    console.error('Get Bookings Error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid query parameters',
          details: error.errors
        }
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      error: {
        code: 'FETCH_BOOKINGS_ERROR',
        message: 'Failed to fetch bookings'
      }
    }, { status: 500 });
  }
}

// ============================================================================
// 🛠️ UTILITY FUNCTIONS
// ============================================================================

function generateRequestId(): string {
  return `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function getClientIP(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
         request.headers.get('x-real-ip') ||
         'unknown';
}

async function queueBookingIntegrations(bookingId: string, options: {
  createGHLContact: boolean;
  createCalendarEvent: boolean;
  sendConfirmationEmail: boolean;
  sendConfirmationSMS: boolean;
}) {
  // In production, this would queue background jobs
  // For now, just log the integration requirements
  console.log('Queuing integrations for booking:', bookingId, options);
  
  // TODO: Implement background job queue
  // - Create GHL contact
  // - Create Google Calendar event
  // - Send confirmation email
  // - Send confirmation SMS
}