import { NextRequest, NextResponse } from 'next/server'
import { cancellationReschedulingService } from '@/lib/cancellation-rescheduling'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const bookingId = params.id
    const body = await request.json()
    
    const { newDateTime, reason, requestedBy } = body

    // Validate request
    if (!newDateTime) {
      return NextResponse.json(
        { error: 'newDateTime is required' },
        { status: 400 }
      )
    }

    if (!requestedBy || !['CLIENT', 'STAFF'].includes(requestedBy)) {
      return NextResponse.json(
        { error: 'Invalid requestedBy field. Must be CLIENT or STAFF' },
        { status: 400 }
      )
    }

    const newDate = new Date(newDateTime)
    if (isNaN(newDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      )
    }

    // Process rescheduling
    const result = await cancellationReschedulingService.processRescheduling({
      bookingId,
      newDateTime: newDate,
      reason,
      requestedBy
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: result.message,
      newBookingDetails: result.newBookingDetails,
      success: true
    })

  } catch (error) {
    console.error('Error in reschedule booking API:', error)
    return NextResponse.json(
      { error: 'Failed to process rescheduling' },
      { status: 500 }
    )
  }
} 