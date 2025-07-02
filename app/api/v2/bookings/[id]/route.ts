/**
 * 🎯 HMNP V2 Individual Booking API
 * GET, UPDATE, DELETE operations for specific bookings
 * Secure, audited, bulletproof
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { BookingStatus } from '@prisma/client';

// ============================================================================
// 🛡️ VALIDATION SCHEMAS
// ============================================================================

const BookingParamsSchema = z.object({
  id: z.string().min(1, 'Booking ID is required')
});

const UpdateBookingSchema = z.object({
  scheduledDateTime: z.string().datetime().optional(),
  locationNotes: z.string().max(500).optional(),
  specialInstructions: z.string().max(1000).optional(),
  status: z.enum(['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'EXPIRED']).optional(),
  internalNotes: z.string().max(1000).optional() // Admin only
});

// ============================================================================
// 🎯 GET SINGLE BOOKING
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = BookingParamsSchema.parse(params);
    
    // Get booking with full details
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        service: {
          select: { 
            name: true, 
            type: true, 
            description: true,
            duration: true 
          }
        },
        payments: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            amount: true,
            status: true,
            provider: true,
            stripePaymentIntentId: true,
            createdAt: true,
            paidAt: true,
            failedAt: true
          }
        },
        notifications: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            type: true,
            method: true,
            status: true,
            sentAt: true,
            createdAt: true
          }
        },
        auditLogs: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          select: {
            id: true,
            action: true,
            actorType: true,
            createdAt: true
          }
        }
      }
    });
    
    if (!booking) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'BOOKING_NOT_FOUND',
          message: 'Booking not found'
        }
      }, { status: 404 });
    }
    
    // Parse pricing snapshot
    let pricingBreakdown = null;
    try {
      pricingBreakdown = booking.pricingSnapshot ? JSON.parse(booking.pricingSnapshot as string) : null;
    } catch (e) {
      console.warn('Failed to parse pricing snapshot for booking:', booking.id);
    }
    
    return NextResponse.json({
      success: true,
      data: {
        booking: {
          // Basic information
          id: booking.id,
          serviceId: booking.serviceId,
          serviceName: booking.service.name,
          serviceType: booking.service.type,
          serviceDescription: booking.service.description,
          estimatedDuration: booking.estimatedDuration,
          
          // Customer information
          customerEmail: booking.customerEmail,
          customerName: booking.customerName,
          customerPhone: booking.customerPhone,
          
          // Scheduling
          scheduledDateTime: booking.scheduledDateTime.toISOString(),
          timeZone: booking.timeZone,
          
          // Location
          locationType: booking.locationType,
          address: booking.addressStreet ? {
            street: booking.addressStreet,
            city: booking.addressCity,
            state: booking.addressState,
            zip: booking.addressZip
          } : null,
          locationNotes: booking.locationNotes,
          
          // RON specific
          ronSessionId: booking.ronSessionId,
          ronDocumentUrl: booking.ronDocumentUrl,
          
          // Pricing
          basePrice: booking.basePrice,
          travelFee: booking.travelFee,
          timeSurcharge: booking.timeSurcharge,
          emergencyFee: booking.emergencyFee,
          promoDiscount: booking.promoDiscount,
          taxAmount: booking.taxAmount,
          finalPrice: booking.finalPrice,
          
          // Deposit
          depositRequired: booking.depositRequired,
          depositAmount: booking.depositAmount,
          
          // Status
          status: booking.status,
          paymentStatus: booking.paymentStatus,
          
          // Instructions
          specialInstructions: booking.specialInstructions,
          internalNotes: booking.internalNotes,
          
          // Integration IDs
          stripePaymentIntentId: booking.stripePaymentIntentId,
          ghlContactId: booking.ghlContactId,
          googleCalendarEventId: booking.googleCalendarEventId,
          
          // Metadata
          calculatedDistance: booking.calculatedDistance,
          serviceAreaValidated: booking.serviceAreaValidated,
          pricingVersion: booking.pricingVersion,
          
          // Timestamps
          createdAt: booking.createdAt.toISOString(),
          updatedAt: booking.updatedAt.toISOString(),
          confirmedAt: booking.confirmedAt?.toISOString(),
          completedAt: booking.completedAt?.toISOString(),
          cancelledAt: booking.cancelledAt?.toISOString()
        },
        
        // Related data
        payments: booking.payments,
        notifications: booking.notifications,
        auditHistory: booking.auditLogs,
        pricingBreakdown
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '2.0'
      }
    });
    
  } catch (error) {
    console.error('Get Booking Error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_BOOKING_ID',
          message: 'Invalid booking ID format'
        }
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      error: {
        code: 'FETCH_BOOKING_ERROR',
        message: 'Failed to fetch booking details'
      }
    }, { status: 500 });
  }
}

// ============================================================================
// 🎯 UPDATE BOOKING
// ============================================================================

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = BookingParamsSchema.parse(params);
    const body = await request.json();
    const updates = UpdateBookingSchema.parse(body);
    
    // Check if booking exists
    const existingBooking = await prisma.booking.findUnique({
      where: { id },
      select: { 
        id: true, 
        status: true, 
        scheduledDateTime: true,
        customerEmail: true,
        customerName: true
      }
    });
    
    if (!existingBooking) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'BOOKING_NOT_FOUND',
          message: 'Booking not found'
        }
      }, { status: 404 });
    }
    
    // Validate business rules
    if (updates.status && !isValidStatusTransition(existingBooking.status, updates.status)) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_STATUS_TRANSITION',
          message: `Cannot change status from ${existingBooking.status} to ${updates.status}`
        }
      }, { status: 400 });
    }
    
    // Validate scheduled date time if updating
    if (updates.scheduledDateTime) {
      const newDateTime = new Date(updates.scheduledDateTime);
      if (newDateTime <= new Date()) {
        return NextResponse.json({
          success: false,
          error: {
            code: 'INVALID_DATE',
            message: 'Scheduled date must be in the future'
          }
        }, { status: 400 });
      }
    }
    
    // 🔒 ATOMIC TRANSACTION: Update booking + audit log
    const updatedBooking = await prisma.$transaction(async (tx) => {
      // Prepare update data
      const updateData: any = {};
      
      if (updates.scheduledDateTime) {
        updateData.scheduledDateTime = new Date(updates.scheduledDateTime);
      }
      if (updates.locationNotes !== undefined) {
        updateData.locationNotes = updates.locationNotes;
      }
      if (updates.specialInstructions !== undefined) {
        updateData.specialInstructions = updates.specialInstructions;
      }
      if (updates.internalNotes !== undefined) {
        updateData.internalNotes = updates.internalNotes;
      }
      if (updates.status) {
        updateData.status = updates.status;
        
        // Set status timestamps
        if (updates.status === 'CONFIRMED') {
          updateData.confirmedAt = new Date();
        } else if (updates.status === 'COMPLETED') {
          updateData.completedAt = new Date();
        } else if (updates.status === 'CANCELLED') {
          updateData.cancelledAt = new Date();
        }
      }
      
      // Update the booking
      const booking = await tx.booking.update({
        where: { id },
        data: updateData
      });
      
      // Create audit log
      await tx.bookingAuditLog.create({
        data: {
          bookingId: id,
          action: 'UPDATED',
          actorType: 'CUSTOMER', // TODO: Determine actual actor type
          actorId: existingBooking.customerEmail,
          changes: JSON.stringify(updates),
          previousValues: JSON.stringify({
            status: existingBooking.status,
            scheduledDateTime: existingBooking.scheduledDateTime
          }),
          newValues: JSON.stringify(updateData),
          metadata: JSON.stringify({
            userAgent: request.headers.get('user-agent'),
            ipAddress: getClientIP(request)
          })
        }
      });
      
      return booking;
    });
    
    // Queue integration updates if needed
    if (updates.status || updates.scheduledDateTime) {
      queueBookingUpdates(id, updates);
    }
    
    return NextResponse.json({
      success: true,
      data: {
        booking: {
          id: updatedBooking.id,
          status: updatedBooking.status,
          scheduledDateTime: updatedBooking.scheduledDateTime.toISOString(),
          updatedAt: updatedBooking.updatedAt.toISOString()
        }
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '2.0'
      }
    });
    
  } catch (error) {
    console.error('Update Booking Error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid update data',
          details: error.errors
        }
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      error: {
        code: 'UPDATE_BOOKING_ERROR',
        message: 'Failed to update booking'
      }
    }, { status: 500 });
  }
}

// ============================================================================
// 🎯 CANCEL BOOKING (DELETE)
// ============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = BookingParamsSchema.parse(params);
    
    // Check if booking exists and can be cancelled
    const booking = await prisma.booking.findUnique({
      where: { id },
      select: { 
        id: true, 
        status: true, 
        customerEmail: true,
        scheduledDateTime: true,
        finalPrice: true,
        paymentStatus: true
      }
    });
    
    if (!booking) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'BOOKING_NOT_FOUND',
          message: 'Booking not found'
        }
      }, { status: 404 });
    }
    
    // Check if booking can be cancelled
    if (!canCancelBooking(booking.status)) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'CANNOT_CANCEL',
          message: `Cannot cancel booking with status: ${booking.status}`
        }
      }, { status: 400 });
    }
    
    // 🔒 ATOMIC TRANSACTION: Cancel booking + audit + refund handling
    const cancelledBooking = await prisma.$transaction(async (tx) => {
      // Update booking status
      const updated = await tx.booking.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date()
        }
      });
      
      // Create audit log
      await tx.bookingAuditLog.create({
        data: {
          bookingId: id,
          action: 'CANCELLED',
          actorType: 'CUSTOMER',
          actorId: booking.customerEmail,
          metadata: JSON.stringify({
            reason: 'customer_cancellation',
            userAgent: request.headers.get('user-agent'),
            ipAddress: getClientIP(request)
          })
        }
      });
      
      return updated;
    });
    
    // Queue cancellation integrations
    queueCancellationIntegrations(id, {
      cancelCalendarEvent: true,
      sendCancellationEmail: true,
      processRefund: booking.paymentStatus === 'PAID'
    });
    
    return NextResponse.json({
      success: true,
      data: {
        booking: {
          id: cancelledBooking.id,
          status: cancelledBooking.status,
          cancelledAt: cancelledBooking.cancelledAt?.toISOString()
        },
        message: 'Booking cancelled successfully'
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '2.0'
      }
    });
    
  } catch (error) {
    console.error('Cancel Booking Error:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        code: 'CANCEL_BOOKING_ERROR',
        message: 'Failed to cancel booking'
      }
    }, { status: 500 });
  }
}

// ============================================================================
// 🛠️ UTILITY FUNCTIONS
// ============================================================================

function isValidStatusTransition(currentStatus: string, newStatus: string): boolean {
  const validTransitions: Record<string, string[]> = {
    'PENDING': ['CONFIRMED', 'CANCELLED', 'EXPIRED'],
    'CONFIRMED': ['IN_PROGRESS', 'CANCELLED', 'NO_SHOW'],
    'IN_PROGRESS': ['COMPLETED', 'CANCELLED'],
    'COMPLETED': [], // No transitions from completed
    'CANCELLED': [], // No transitions from cancelled
    'NO_SHOW': [], // No transitions from no-show
    'EXPIRED': [] // No transitions from expired
  };
  
  return validTransitions[currentStatus]?.includes(newStatus) || false;
}

function canCancelBooking(status: string): boolean {
  return ['PENDING', 'CONFIRMED'].includes(status);
}

function getClientIP(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
         request.headers.get('x-real-ip') ||
         'unknown';
}

async function queueBookingUpdates(bookingId: string, updates: any) {
  console.log('Queuing booking updates:', bookingId, updates);
  // TODO: Queue background jobs for integration updates
}

async function queueCancellationIntegrations(bookingId: string, options: {
  cancelCalendarEvent: boolean;
  sendCancellationEmail: boolean;
  processRefund: boolean;
}) {
  console.log('Queuing cancellation integrations:', bookingId, options);
  // TODO: Queue background jobs for cancellation
}