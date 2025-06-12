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

export async function GET(request: NextRequest) {
  console.log('📋 Pending Payments Query: Request received');
  
  try {
    // Verify webhook signature if secret is configured (for GHL automation requests)
    if (process.env.GHL_WEBHOOK_SECRET) {
      const signature = request.headers.get('x-ghl-signature');
      if (signature) {
        const authHeader = request.headers.get('authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
          const token = authHeader.substring(7);
          // For GET requests with query params, we'll use a different verification approach
          const queryString = request.url.split('?')[1] || '';
          const isValid = verifyGHLWebhook(queryString, signature, process.env.GHL_WEBHOOK_SECRET);
          if (!isValid) {
            console.error('❌ Invalid webhook signature for GET request');
            return NextResponse.json({ 
              success: false, 
              error: 'Invalid webhook signature' 
            }, { status: 401 });
          }
        }
      }
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    const validatedQuery = pendingPaymentsQuerySchema.parse(queryParams);

    console.log('✅ Pending Payments Query: Parameters validated', validatedQuery);

    // Build the where clause
    const whereClause: any = {
      status: BookingStatus.PAYMENT_PENDING,
    };

    // Filter by creation date if 'since' is provided
    if (validatedQuery.since) {
      whereClause.createdAt = {
        gte: new Date(validatedQuery.since)
      };
    }

    // Filter by GHL contact ID if provided
    if (validatedQuery.contactId) {
      whereClause.ghlContactId = validatedQuery.contactId;
    }

    // Filter by service name if provided
    if (validatedQuery.serviceName) {
      whereClause.service = {
        name: {
          contains: validatedQuery.serviceName,
          mode: 'insensitive'
        }
      };
    }

    // Handle expired bookings filter
    if (!validatedQuery.includeExpired) {
      // Exclude bookings older than 72 hours (configurable)
      const expirationHours = parseInt(process.env.PAYMENT_EXPIRATION_HOURS || '72');
      const expirationDate = new Date();
      expirationDate.setHours(expirationDate.getHours() - expirationHours);
      
      whereClause.createdAt = {
        ...whereClause.createdAt,
        gte: expirationDate
      };
    }

    // Sort configuration
    const orderBy: any = {};
    orderBy[validatedQuery.sortBy] = validatedQuery.sortOrder;

    // Query pending payment bookings
    const pendingBookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        service: {
          select: {
            id: true,
            name: true,
            basePrice: true,
            depositAmount: true,
            requiresDeposit: true
          }
        },
        User_Booking_signerIdToUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy,
      take: validatedQuery.limit
    });

    console.log(`✅ Found ${pendingBookings.length} pending payment bookings`);

    // Transform data for GHL consumption
    const transformedBookings = pendingBookings.map(booking => {
      const hoursOld = Math.floor((Date.now() - booking.createdAt.getTime()) / (1000 * 60 * 60));
      const isExpired = hoursOld >= parseInt(process.env.PAYMENT_EXPIRATION_HOURS || '72');
      
      return {
        bookingId: booking.id,
        ghlContactId: booking.ghlContactId,
        customerName: booking.User_Booking_signerIdToUser?.name || 'Guest',
        customerEmail: booking.User_Booking_signerIdToUser?.email || booking.customerEmail,
        serviceName: booking.service.name,
        servicePrice: booking.service.basePrice.toNumber(),
        depositAmount: booking.service.depositAmount?.toNumber() || 0,
        scheduledDateTime: booking.scheduledDateTime,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
        locationInfo: {
          type: booking.locationType,
          address: [
            booking.addressStreet,
            booking.addressCity,
            booking.addressState,
            booking.addressZip
          ].filter(Boolean).join(', '),
          notes: booking.locationNotes
        },
        paymentInfo: {
          hoursOld,
          isExpired,
          requiresDeposit: booking.service.requiresDeposit,
          urgencyLevel: hoursOld < 2 ? 'new' : hoursOld < 24 ? 'medium' : hoursOld < 48 ? 'high' : 'critical'
        },
        metadata: {
          leadSource: booking.leadSource,
          campaignName: booking.campaignName,
          workflowId: booking.workflowId,
          notes: booking.notes
        }
      };
    });

    // Calculate summary statistics
    const summary = {
      totalPending: transformedBookings.length,
      newBookings: transformedBookings.filter(b => b.paymentInfo.urgencyLevel === 'new').length,
      mediumUrgency: transformedBookings.filter(b => b.paymentInfo.urgencyLevel === 'medium').length,
      highUrgency: transformedBookings.filter(b => b.paymentInfo.urgencyLevel === 'high').length,
      criticalUrgency: transformedBookings.filter(b => b.paymentInfo.urgencyLevel === 'critical').length,
      expiredBookings: transformedBookings.filter(b => b.paymentInfo.isExpired).length,
      totalValue: transformedBookings.reduce((sum, b) => sum + b.servicePrice, 0),
      totalDepositValue: transformedBookings.reduce((sum, b) => sum + b.depositAmount, 0),
    };

    return NextResponse.json({
      success: true,
      query: validatedQuery,
      summary,
      bookings: transformedBookings,
      pagination: {
        limit: validatedQuery.limit,
        total: transformedBookings.length,
        hasMore: transformedBookings.length === validatedQuery.limit
      },
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Pending Payments Query error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Validation error',
        issues: error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message
        }))
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  console.log('📝 Pending Payments Update: Request received');
  
  try {
    // Get raw body for signature verification
    const rawBody = await request.text();
    let body: any;
    
    try {
      body = JSON.parse(rawBody);
    } catch (parseError) {
      console.error('❌ Failed to parse request body:', parseError);
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid JSON payload' 
      }, { status: 400 });
    }

    // Verify webhook signature if secret is configured
    if (process.env.GHL_WEBHOOK_SECRET) {
      const signature = request.headers.get('x-ghl-signature');
      if (!signature) {
        console.error('❌ Missing webhook signature');
        return NextResponse.json({ 
          success: false, 
          error: 'Missing webhook signature' 
        }, { status: 401 });
      }

      const isValid = verifyGHLWebhook(rawBody, signature, process.env.GHL_WEBHOOK_SECRET);
      if (!isValid) {
        console.error('❌ Invalid webhook signature');
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid webhook signature' 
        }, { status: 401 });
      }
    }

    // Validate input data
    const validatedData = updateBookingStatusSchema.parse(body);
    console.log('✅ Pending Payments Update: Data validated', {
      bookingId: validatedData.bookingId,
      action: validatedData.action
    });

    // Find the booking
    const booking = await prisma.booking.findUnique({
      where: { id: validatedData.bookingId },
      include: {
        service: true,
        User_Booking_signerIdToUser: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!booking) {
      return NextResponse.json({
        success: false,
        error: 'Booking not found'
      }, { status: 404 });
    }

    if (booking.status !== BookingStatus.PAYMENT_PENDING) {
      return NextResponse.json({
        success: false,
        error: `Booking is not in PAYMENT_PENDING status. Current status: ${booking.status}`
      }, { status: 400 });
    }

    // Process the action
    let updateData: any = {
      updatedAt: new Date(),
    };

    let ghlTagsToAdd: string[] = [];
    let ghlTagsToRemove: string[] = [];
    let actionResult = '';

    switch (validatedData.action) {
      case 'send_reminder':
        ghlTagsToAdd.push(`Action:Reminder_Sent_${validatedData.reminderType || 'email'}`);
        actionResult = `Reminder sent via ${validatedData.reminderType || 'email'}`;
        break;

      case 'mark_contacted':
        ghlTagsToAdd.push('Action:Customer_Contacted');
        actionResult = 'Customer marked as contacted';
        break;

      case 'extend_payment_deadline':
        if (validatedData.newDeadline) {
          updateData.paymentDeadline = new Date(validatedData.newDeadline);
          ghlTagsToAdd.push('Action:Payment_Deadline_Extended');
          actionResult = `Payment deadline extended to ${validatedData.newDeadline}`;
        }
        break;

      case 'mark_expired':
        updateData.status = BookingStatus.CANCELLED;
        updateData.cancellationReason = 'Payment expired';
        ghlTagsToRemove.push('Status:Booking_PAYMENT_PENDING');
        ghlTagsToAdd.push('Status:Booking_Payment_Expired');
        actionResult = 'Booking marked as expired due to non-payment';
        break;

      case 'send_final_notice':
        ghlTagsToAdd.push('Action:Final_Payment_Notice_Sent');
        actionResult = 'Final payment notice sent';
        break;

      default:
        return NextResponse.json({
          success: false,
          error: `Unknown action: ${validatedData.action}`
        }, { status: 400 });
    }

    // Add notes if provided
    if (validatedData.notes) {
      updateData.notes = booking.notes ? `${booking.notes}\n\n[${new Date().toISOString()}] ${validatedData.notes}` : validatedData.notes;
    }

    // Update the booking
    const updatedBooking = await prisma.booking.update({
      where: { id: validatedData.bookingId },
      data: updateData,
      include: {
        service: true
      }
    });

    console.log('✅ Booking updated successfully:', updatedBooking.id);

    // Update GHL contact tags
    if (booking.ghlContactId && (ghlTagsToAdd.length > 0 || ghlTagsToRemove.length > 0)) {
      try {
        if (ghlTagsToAdd.length > 0) {
          await ghl.addTagsToContact(booking.ghlContactId, ghlTagsToAdd);
          console.log('✅ GHL tags added:', ghlTagsToAdd);
        }
        
        if (ghlTagsToRemove.length > 0) {
          await ghl.removeTagsFromContact(booking.ghlContactId, ghlTagsToRemove);
          console.log('✅ GHL tags removed:', ghlTagsToRemove);
        }
      } catch (ghlError) {
        console.error('❌ Failed to update GHL tags:', ghlError);
        // Don't fail the operation for GHL errors
      }
    }

    return NextResponse.json({
      success: true,
      bookingId: updatedBooking.id,
      action: validatedData.action,
      result: actionResult,
      data: {
        bookingId: updatedBooking.id,
        status: updatedBooking.status,
        updatedAt: updatedBooking.updatedAt,
        ghlTagsAdded: ghlTagsToAdd,
        ghlTagsRemoved: ghlTagsToRemove,
      }
    });

  } catch (error) {
    console.error('❌ Pending Payments Update error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Validation error',
        issues: error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message
        }))
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
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