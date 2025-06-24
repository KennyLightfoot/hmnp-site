import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { BookingStatus } from '@prisma/client';
import { z } from 'zod';
import * as ghl from '@/lib/ghl';
import { calculateServiceEndTime } from '@/lib/utils';

// API key verification
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || 'mav+PpkGCyAADIyUlTUBGIk194KCa3U4';

// Request validation schema for booking reschedule
const rescheduleSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  newDateTime: z.string().datetime('Valid datetime is required'),
  newAddress: z.string().optional(),
  reason: z.string().optional(),
  requestedBy: z.enum(['customer', 'provider', 'system']).default('customer')
});

export async function POST(request: NextRequest) {
  console.log('📅 Processing booking reschedule');
  
  try {
    const body = await request.json();
    
    // Verify API key for security
    const apiKey = request.headers.get('x-api-key');
    if (apiKey !== process.env.INTERNAL_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate request data
    const { bookingId, newDateTime, newAddress, reason, requestedBy } = rescheduleSchema.parse(body);
    console.log(`✅ Reschedule request validated for booking: ${bookingId}`);

    const newAppointmentTime = new Date(newDateTime);
    const now = new Date();

    // Validate new datetime is in the future
    if (newAppointmentTime <= now) {
      return NextResponse.json({
        success: false,
        error: 'New appointment time must be in the future'
      }, { status: 400 });
    }

    // Find the booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        Service: true,
        User_Booking_signerIdToUser: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    if (!booking) {
      return NextResponse.json({
        success: false,
        error: 'Booking not found'
      }, { status: 404 });
    }

    // Check if booking can be rescheduled
    if (booking.status === BookingStatus.CANCELLED_BY_CLIENT || 
        booking.status === BookingStatus.CANCELLED_BY_STAFF ||
        booking.status === BookingStatus.COMPLETED) {
      return NextResponse.json({
        success: false,
        error: 'Booking cannot be rescheduled in its current status'
      }, { status: 400 });
    }

    // Store original appointment details for comparison
    const originalDateTime = booking.scheduledDateTime;
    
    // Check for reschedule fee policy
    let rescheduleFee = 0;
    const hoursDifference = Math.abs(
      (newAppointmentTime.getTime() - (originalDateTime?.getTime() || now.getTime())) / (1000 * 60 * 60)
    );
    
    const hoursUntilOriginal = originalDateTime ? 
      Math.floor((originalDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)) : 0;

    // Reschedule fee policy (can be customized)
    if (hoursUntilOriginal < 24 && hoursUntilOriginal > 0) {
      rescheduleFee = 25; // $25 fee for reschedules within 24 hours
    }

    // Update booking with new details
    const updateData: any = {
      scheduledDateTime: newAppointmentTime,
      updatedAt: now,
      notes: booking.notes ? 
        `${booking.notes}\n\n[${now.toISOString()}] Rescheduled: ${reason || `Requested by ${requestedBy}`}` :
        `Rescheduled: ${reason || `Requested by ${requestedBy}`}`
    };

    // Update address if provided
    if (newAddress) {
      updateData.addressStreet = newAddress;
    }

    // Add reschedule fee if applicable
    if (rescheduleFee > 0) {
      updateData.priceAtBooking = Number(booking.priceAtBooking || 0) + rescheduleFee;
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: updateData,
      include: {
        Service: true,
        User_Booking_signerIdToUser: true
      }
    });

    console.log(`✅ Booking ${bookingId} rescheduled successfully`);

    // Update GHL contact
    if (booking.ghlContactId) {
      try {
        // Add reschedule tags
        const tagsToAdd = [
          'action:booking_rescheduled',
          `rescheduled:by_${requestedBy}`,
          hoursUntilOriginal < 24 ? 'reschedule:short_notice' : 'reschedule:advance_notice'
        ];

        if (rescheduleFee > 0) {
          tagsToAdd.push('fees:reschedule_fee_applied');
        }

        await ghl.addTagsToContact(booking.ghlContactId, tagsToAdd);

        // Update custom fields
        const customFields: any = {
          cf_appointment_date: newAppointmentTime.toLocaleDateString('en-US'),
          cf_appointment_time: newAppointmentTime.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          }),
          cf_reschedule_date: now.toLocaleDateString('en-US'),
          cf_reschedule_reason: reason || `Requested by ${requestedBy}`,
          cf_reschedule_fee: rescheduleFee.toString(),
          cf_total_amount: updatedBooking.priceAtBooking?.toString() || '0'
        };

        if (newAddress) {
          customFields.cf_service_address = newAddress;
        }

        await ghl.updateContact({
          id: booking.ghlContactId,
          customField: customFields,
          locationId: process.env.GHL_LOCATION_ID || ""
        });

        console.log('✅ GHL contact updated with reschedule details');
      } catch (ghlError) {
        console.error('❌ Failed to update GHL contact:', ghlError);
        // Don't fail the reschedule for GHL errors
      }
    }

    // Prepare response data
    const responseData = {
      bookingId: updatedBooking.id,
      originalDateTime: originalDateTime,
      newDateTime: newAppointmentTime,
      newDateFormatted: newAppointmentTime.toLocaleDateString('en-US'),
      newTimeFormatted: newAppointmentTime.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }),
      serviceName: updatedBooking.Service?.name || 'Mobile Notary Service',
      serviceAddress: [updatedBooking.addressStreet, updatedBooking.addressCity, updatedBooking.addressState].filter(Boolean).join(', ') || 'Address TBD',
      rescheduleFee: rescheduleFee,
      totalAmount: Number(updatedBooking.priceAtBooking || 0),
      reason: reason || `Requested by ${requestedBy}`,
      hoursUntilOriginal: hoursUntilOriginal,
      customer: {
        name: updatedBooking.User_Booking_signerIdToUser?.name || 'Unknown',
        email: updatedBooking.User_Booking_signerIdToUser?.email || '',
        phone: ''
      },
      message: rescheduleFee > 0 
        ? `Booking rescheduled successfully. A reschedule fee of $${rescheduleFee} has been added due to short notice.`
        : 'Booking rescheduled successfully.'
    };

    return NextResponse.json({
      success: true,
      message: 'Booking rescheduled successfully',
      data: responseData
    });

  } catch (error) {
    console.error('❌ Error processing reschedule:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation error',
          details: error.errors 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process reschedule',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check reschedule availability
export async function GET(request: NextRequest) {
  console.log('📋 Checking reschedule availability');
  
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');
    const proposedDateTime = searchParams.get('dateTime');
    
    // Verify API key
    const apiKey = request.headers.get('x-api-key');
    if (apiKey !== process.env.INTERNAL_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!bookingId) {
      return NextResponse.json({
        success: false,
        error: 'Booking ID is required'
      }, { status: 400 });
    }

    // Find the booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { Service: true }
    });

    if (!booking) {
      return NextResponse.json({
        success: false,
        error: 'Booking not found'
      }, { status: 404 });
    }

    // Check basic availability
    let availability = {
      canReschedule: true,
      reasons: [] as string[],
      fees: 0,
      suggestedTimes: [] as string[]
    };

    // Check if booking status allows rescheduling
    if (booking.status === BookingStatus.CANCELLED_BY_CLIENT || 
        booking.status === BookingStatus.CANCELLED_BY_STAFF ||
        booking.status === BookingStatus.COMPLETED) {
      availability.canReschedule = false;
      availability.reasons.push('Booking cannot be rescheduled in its current status');
    }

    // If specific time is requested, check it
    if (proposedDateTime) {
      const proposedTime = new Date(proposedDateTime);
      const now = new Date();
      
      if (proposedTime <= now) {
        availability.canReschedule = false;
        availability.reasons.push('Proposed time must be in the future');
      }

      // Check for conflicts with other bookings
      const conflictingBooking = await prisma.booking.findFirst({
        where: {
          scheduledDateTime: proposedTime,
          status: {
            in: [BookingStatus.CONFIRMED, BookingStatus.PAYMENT_PENDING, BookingStatus.IN_PROGRESS]
          },
          id: {
            not: bookingId
          }
        }
      });

      if (conflictingBooking) {
        availability.canReschedule = false;
        availability.reasons.push('Proposed time conflicts with another booking');
      }

      // Calculate fees based on notice period
      const originalDateTime = booking.scheduledDateTime;
      if (originalDateTime) {
        const hoursUntilOriginal = Math.floor((originalDateTime.getTime() - now.getTime()) / (1000 * 60 * 60));
        if (hoursUntilOriginal < 24 && hoursUntilOriginal > 0) {
          availability.fees = 25;
        }
      }
    }

    // Generate suggested times if no specific time requested
    if (!proposedDateTime) {
      const now = new Date();
      const suggestedTimes = [];
      
      // Suggest next 5 available business day slots
      for (let i = 1; i <= 7; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() + i);
        
        // Skip weekends (simple check)
        if (date.getDay() === 0 || date.getDay() === 6) continue;
        
        // Morning slot (9 AM)
        const morningSlot = new Date(date);
        morningSlot.setHours(9, 0, 0, 0);
        
        // Afternoon slot (2 PM)
        const afternoonSlot = new Date(date);
        afternoonSlot.setHours(14, 0, 0, 0);
        
        suggestedTimes.push(morningSlot.toISOString(), afternoonSlot.toISOString());
        
        if (suggestedTimes.length >= 6) break;
      }
      
      availability.suggestedTimes = suggestedTimes;
    }

    return NextResponse.json({
      success: true,
      data: {
        bookingId: booking.id,
        currentDateTime: booking.scheduledDateTime,
        availability: availability
      }
    });

  } catch (error) {
    console.error('❌ Error checking reschedule availability:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to check availability',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 