import { NextRequest, NextResponse } from 'next/server'
import { cancellationReschedulingService } from '@/lib/cancellation-rescheduling'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bookingId = params.id
    const body = await request.json()
    
    const { reason, requestedBy, cancellationFeeWaived } = body

    // Validate request
    if (!requestedBy || !['CLIENT', 'STAFF'].includes(requestedBy)) {
      return NextResponse.json(
        { error: 'Invalid requestedBy field. Must be CLIENT or STAFF' },
        { status: 400 }
      )
    }

    // Process cancellation
    const result = await cancellationReschedulingService.processCancellation({
      bookingId,
      reason,
      requestedBy,
      cancellationFeeWaived: cancellationFeeWaived || false
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: result.message,
      refundCalculation: result.refundCalculation,
      success: true
    })

  } catch (error) {
    console.error('Error in cancel booking API:', error)
    return NextResponse.json(
      { error: 'Failed to process cancellation' },
      { status: 500 }
    )
  }
}

// Get cancellation info (fees, refund calculation) without processing
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bookingId = params.id

    // Calculate what the refund would be
    const refundCalculation = await cancellationReschedulingService.calculateRefund(bookingId)

    return NextResponse.json({
      refundCalculation,
      cancellationPolicy: {
        "moreThan48Hours": "Full refund minus $10 processing fee",
        "24to48Hours": "$25 cancellation fee",
        "2to24Hours": "50% cancellation fee",
        "lessThan2Hours": "No refund"
      }
    })

  } catch (error) {
    console.error('Error calculating refund:', error)
    return NextResponse.json(
      { error: 'Failed to calculate refund' },
      { status: 500 }
    )
  }
} 