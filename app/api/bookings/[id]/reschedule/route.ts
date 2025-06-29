import { NextRequest, NextResponse } from 'next/server'
import { cancellationReschedulingService } from '@/lib/cancellation-rescheduling'
import { prisma } from '@/lib/prisma'
import { BookingStatus } from '@prisma/client'
import { z } from 'zod'
import * as ghl from '@/lib/ghl'

// Enhanced validation schema
const rescheduleSchema = z.object({
  newDateTime: z.string().datetime('Valid datetime is required'),
  reason: z.string().optional(),
  requestedBy: z.enum(['CLIENT', 'STAFF']).default('CLIENT'),
  newAddress: z.string().optional(),
})

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const bookingId = params.id
    const body = await request.json()
    
    // Enhanced validation
    const validatedData = rescheduleSchema.parse(body)
    const { newDateTime, reason, requestedBy, newAddress } = validatedData

    const newDate = new Date(newDateTime)
    const now = new Date()

    // Additional validations
    if (newDate <= now) {
      return NextResponse.json(
        { error: 'New appointment time must be in the future' },
        { status: 400 }
      )
    }

    // Get booking details for fee calculation
    const existingBooking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        service: true,
        User_Booking_signerIdToUser: true
      }
    })

    if (!existingBooking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Calculate reschedule fee
    let rescheduleFee = 0
    const originalDateTime = existingBooking.scheduledDateTime
    let hoursUntilOriginal = 0
    if (originalDateTime) {
      hoursUntilOriginal = Math.floor((originalDateTime.getTime() - now.getTime()) / (1000 * 60 * 60))
      if (hoursUntilOriginal < 24 && hoursUntilOriginal > 0) {
        rescheduleFee = 25 // $25 fee for reschedules within 24 hours
      }
    }

    // Process rescheduling through service
    const result = await cancellationReschedulingService.processRescheduling({
      bookingId,
      newDateTime: newDate,
      reason: reason || `Requested by ${requestedBy}`,
      requestedBy
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      )
    }

    // Get updated booking for response
    const updatedBooking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        service: true,
        User_Booking_signerIdToUser: true
      }
    })

    if (!updatedBooking) {
      return NextResponse.json(
        { error: 'Failed to retrieve updated booking' },
        { status: 500 }
      )
    }

    // Enhanced GHL integration
    if (existingBooking.ghlContactId) {
      try {
        // Add reschedule tags
        const tagsToAdd = [
          'action:booking_rescheduled',
          `rescheduled:by_${requestedBy.toLowerCase()}`,
          hoursUntilOriginal && hoursUntilOriginal < 24 ? 'reschedule:short_notice' : 'reschedule:advance_notice'
        ].filter(Boolean)

        if (rescheduleFee > 0) {
          tagsToAdd.push('fees:reschedule_fee_applied')
        }

        await ghl.addTagsToContact(existingBooking.ghlContactId, tagsToAdd)

        // Update custom fields
        const customFields: any = {
          cf_appointment_date: newDate.toLocaleDateString('en-US'),
          cf_appointment_time: newDate.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          }),
          cf_reschedule_date: now.toLocaleDateString('en-US'),
          cf_reschedule_reason: reason || `Requested by ${requestedBy}`,
          cf_reschedule_fee: rescheduleFee.toString(),
          cf_total_amount: updatedBooking.priceAtBooking?.toString() || '0'
        }

        if (newAddress) {
          customFields.cf_service_address = newAddress
        }

        await ghl.updateContact({
          id: existingBooking.ghlContactId,
          customField: customFields,
          locationId: process.env.GHL_LOCATION_ID || ""
        })

        console.log('✅ GHL contact updated with reschedule details')
      } catch (ghlError) {
        console.error('❌ Failed to update GHL contact:', ghlError)
        // Don't fail the reschedule for GHL errors
      }
    }

    // Enhanced response format
    const responseData = {
      bookingId: updatedBooking.id,
      originalDateTime: originalDateTime,
      newDateTime: newDate,
      newDateFormatted: newDate.toLocaleDateString('en-US'),
      newTimeFormatted: newDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }),
      serviceName: updatedBooking.service?.name || 'Mobile Notary Service',
      serviceAddress: [
        updatedBooking.addressStreet, 
        updatedBooking.addressCity, 
        updatedBooking.addressState
      ].filter(Boolean).join(', ') || 'Address TBD',
      rescheduleFee: rescheduleFee,
      totalAmount: Number(updatedBooking.priceAtBooking || 0),
      reason: reason || `Requested by ${requestedBy}`,
      hoursUntilOriginal: hoursUntilOriginal || 0,
      customer: {
        name: updatedBooking.User_Booking_signerIdToUser?.name || 'Unknown',
        email: updatedBooking.User_Booking_signerIdToUser?.email || '',
        phone: ''
      },
      message: rescheduleFee > 0 
        ? `Booking rescheduled successfully. A reschedule fee of $${rescheduleFee} has been added due to short notice.`
        : 'Booking rescheduled successfully.'
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      newBookingDetails: result.newBookingDetails,
      data: responseData
    })

  } catch (error) {
    console.error('Error in reschedule booking API:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation error',
          details: error.errors 
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to process rescheduling',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET endpoint to check reschedule availability
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const bookingId = params.id
    const { searchParams } = new URL(request.url)
    const proposedDateTime = searchParams.get('dateTime')
    
    // Find the booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { service: true, User_Booking_signerIdToUser: true }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Check basic availability
    let availability = {
      canReschedule: true,
      reasons: [] as string[],
      fees: 0,
      suggestedTimes: [] as string[]
    }

    // Check if booking status allows rescheduling
    if (booking.status === BookingStatus.CANCELLED_BY_CLIENT || 
        booking.status === BookingStatus.CANCELLED_BY_STAFF ||
        booking.status === BookingStatus.COMPLETED) {
      availability.canReschedule = false
      availability.reasons.push('Booking cannot be rescheduled in its current status')
    }

    // If specific time is requested, check it
    if (proposedDateTime) {
      const proposedTime = new Date(proposedDateTime)
      const now = new Date()
      
      if (proposedTime <= now) {
        availability.canReschedule = false
        availability.reasons.push('Proposed time must be in the future')
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
      })

      if (conflictingBooking) {
        availability.canReschedule = false
        availability.reasons.push('Proposed time conflicts with another booking')
      }

      // Calculate fees based on notice period
      const originalDateTime = booking.scheduledDateTime
      if (originalDateTime) {
        const hoursUntilOriginal = Math.floor((originalDateTime.getTime() - now.getTime()) / (1000 * 60 * 60))
        if (hoursUntilOriginal < 24 && hoursUntilOriginal > 0) {
          availability.fees = 25
        }
      }
    }

    // Generate suggested times if no specific time requested
    if (!proposedDateTime) {
      const now = new Date()
      const suggestedTimes = []
      
      // Suggest next 6 available business day slots
      for (let i = 1; i <= 7; i++) {
        const date = new Date(now)
        date.setDate(date.getDate() + i)
        
        // Skip weekends
        if (date.getDay() === 0 || date.getDay() === 6) continue
        
        // Morning slot (9 AM)
        const morningSlot = new Date(date)
        morningSlot.setHours(9, 0, 0, 0)
        
        // Afternoon slot (2 PM)
        const afternoonSlot = new Date(date)
        afternoonSlot.setHours(14, 0, 0, 0)
        
        suggestedTimes.push(morningSlot.toISOString(), afternoonSlot.toISOString())
        
        if (suggestedTimes.length >= 6) break
      }
      
      availability.suggestedTimes = suggestedTimes
    }

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        currentDateTime: booking.scheduledDateTime,
        serviceName: booking.service?.name,
        customerName: booking.User_Booking_signerIdToUser?.name
      },
      availability
    })

  } catch (error) {
    console.error('Error checking reschedule availability:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to check availability',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 