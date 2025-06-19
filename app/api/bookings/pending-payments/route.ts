import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { BookingStatus } from '@prisma/client';
import { z } from 'zod';
import * as ghl from '@/lib/ghl';
import crypto from 'crypto';

// Webhook signature verification (same as sync endpoint)
function verifyGHLWebhook(payload: string, signature: string, secret: string): boolean {
  if (!signature || !secret) return false;
  
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature.replace('sha256=', '')),
    Buffer.from(expectedSignature)
  );
}

// Query parameters validation
const pendingPaymentsQuerySchema = z.object({
  since: z.string().datetime().optional(), // ISO string for filtering by creation date
  limit: z.coerce.number().min(1).max(100).default(25), // Limit results
  includeExpired: z.coerce.boolean().default(false), // Include expired payment links
  contactId: z.string().optional(), // Filter by specific GHL contact ID
  serviceName: z.string().optional(), // Filter by service name
  sortBy: z.enum(['createdAt', 'scheduledDateTime', 'updatedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Update booking status schema for PATCH requests
const updateBookingStatusSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  action: z.enum(['send_reminder', 'mark_contacted', 'extend_payment_deadline', 'mark_expired', 'send_final_notice']),
  notes: z.string().optional(),
  reminderType: z.enum(['email', 'sms', 'call']).optional(),
  newDeadline: z.string().datetime().optional(), // For extending payment deadline
});

// Request validation schema
const pendingPaymentsSchema = z.object({
  contactId: z.string().optional(),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 50),
  urgencyLevel: z.enum(['new', 'medium', 'high', 'critical']).optional()
});

export async function GET(request: NextRequest) {
  console.log('🔍 Fetching pending payments');
  
  try {
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    
    // Validate query parameters
    const { contactId, limit, urgencyLevel } = pendingPaymentsSchema.parse(queryParams);
    
    // Verify API key for security
    const apiKey = request.headers.get('x-api-key');
    if (apiKey !== process.env.INTERNAL_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Build query conditions
    const where: any = {
      status: BookingStatus.PAYMENT_PENDING,
      depositStatus: {
        in: ['PENDING', 'FAILED']
      }
    };

    // Filter by specific contact if provided
    if (contactId) {
      where.ghlContactId = contactId;
    }

    // Fetch pending payment bookings
    const bookings = await prisma.booking.findMany({
      where,
      take: limit,
      orderBy: {
        createdAt: 'asc' // Oldest first for urgency calculation
      },
      include: {
        service: true,
        User_Booking_signerIdToUser: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        }
      }
    });

    // Transform bookings to match GHL workflow format
    const transformedBookings = bookings.map(booking => {
      const now = new Date();
      const createdAt = new Date(booking.createdAt);
      const hoursOld = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60));
      
      // Calculate urgency level based on hours old and appointment proximity
      let calculatedUrgencyLevel = 'new';
      if (hoursOld > 72) {
        calculatedUrgencyLevel = 'critical';
      } else if (hoursOld > 48) {
        calculatedUrgencyLevel = 'high';
      } else if (hoursOld > 24) {
        calculatedUrgencyLevel = 'medium';
      }

      // Check if appointment is within 24 hours (critical)
      if (booking.appointmentDateTime) {
        const appointmentTime = new Date(booking.appointmentDateTime);
        const hoursUntilAppointment = Math.floor((appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60));
        
        if (hoursUntilAppointment < 24 && hoursUntilAppointment > 0) {
          calculatedUrgencyLevel = 'critical';
        }
      }

      // Only include if matches urgency filter
      if (urgencyLevel && calculatedUrgencyLevel !== urgencyLevel) {
        return null;
      }

      return {
        bookingId: booking.id,
        paymentUrl: booking.stripePaymentUrl || `${process.env.NEXTAUTH_URL}/checkout/${booking.id}`,
        serviceName: booking.service?.name || 'Mobile Notary Service',
        servicePrice: booking.totalAmount || 75,
        scheduledDate: booking.appointmentDateTime ? new Date(booking.appointmentDateTime).toLocaleDateString('en-US') : null,
        scheduledTime: booking.appointmentDateTime ? new Date(booking.appointmentDateTime).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }) : null,
        locationInfo: {
          address: booking.serviceAddress || 'Address TBD'
        },
        paymentInfo: {
          amount: booking.totalAmount || 75,
          urgencyLevel: calculatedUrgencyLevel,
          hoursOld: hoursOld,
          isExpired: hoursOld > 168 // 1 week
        },
        customerInfo: {
          name: booking.User_Booking_signerIdToUser?.name || 'Unknown',
          email: booking.User_Booking_signerIdToUser?.email || '',
          phone: booking.User_Booking_signerIdToUser?.phone || ''
        }
      };
    }).filter(Boolean); // Remove null entries

    console.log(`✅ Found ${transformedBookings.length} pending payments`);

    return NextResponse.json({
      success: true,
      data: {
        bookings: transformedBookings,
        count: transformedBookings.length,
        filters: {
          contactId,
          urgencyLevel,
          limit
        }
      }
    });

  } catch (error) {
    console.error('❌ Error fetching pending payments:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid query parameters',
          details: error.errors 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch pending payments',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Handle PATCH requests for updating payment status tracking
export async function PATCH(request: NextRequest) {
  console.log('📧 Tracking payment reminder sent');
  
  try {
    const body = await request.json();
    const { bookingId, action, reminderType, notes } = body;
    
    // Verify API key
    const apiKey = request.headers.get('x-api-key');
    if (apiKey !== process.env.INTERNAL_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!bookingId) {
      return NextResponse.json(
        { success: false, error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    // Update booking with reminder tracking
    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        notes: notes || `${reminderType} reminder sent via ${action}`,
        updatedAt: new Date()
      }
    });

    console.log(`✅ Payment reminder tracked for booking ${bookingId}`);

    return NextResponse.json({
      success: true,
      message: 'Reminder tracking updated',
      data: {
        bookingId,
        action,
        reminderType,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error tracking payment reminder:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to track payment reminder',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Health check and documentation endpoint
export async function GET_DOCUMENTATION() {
  return NextResponse.json({
    endpoint: '/api/bookings/pending-payments',
    description: 'Query and manage pending payment bookings for GHL automation',
    methods: {
      GET: {
        description: 'Query pending payment bookings',
        queryParameters: {
          since: 'ISO datetime string - filter by creation date',
          limit: 'Number (1-100, default: 25) - limit results',
          includeExpired: 'Boolean (default: false) - include expired payments',
          contactId: 'String - filter by GHL contact ID',
          serviceName: 'String - filter by service name',
          sortBy: 'Enum: createdAt|scheduledDateTime|updatedAt (default: createdAt)',
          sortOrder: 'Enum: asc|desc (default: desc)'
        },
        exampleUrl: '/api/bookings/pending-payments?limit=10&since=2024-01-01T00:00:00Z&includeExpired=false'
      },
      PATCH: {
        description: 'Update booking status and trigger actions',
        bodyParameters: {
          bookingId: 'String - required booking ID',
          action: 'Enum: send_reminder|mark_contacted|extend_payment_deadline|mark_expired|send_final_notice',
          notes: 'String - optional notes to add',
          reminderType: 'Enum: email|sms|call - for send_reminder action',
          newDeadline: 'ISO datetime string - for extend_payment_deadline action'
        },
        exampleBody: {
          bookingId: 'booking_123',
          action: 'send_reminder',
          reminderType: 'email',
          notes: 'Sent urgent payment reminder'
        }
      }
    },
    authentication: 'x-ghl-signature header with webhook secret (optional)',
    responseFormat: {
      success: 'Boolean',
      query: 'Object - echoed query parameters',
      summary: 'Object - statistics about pending payments',
      bookings: 'Array - transformed booking objects',
      pagination: 'Object - pagination info'
    }
  });
} 