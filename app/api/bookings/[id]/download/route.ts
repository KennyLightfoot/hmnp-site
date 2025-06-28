import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { proofAPI } from '@/lib/proof/api'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const bookingId = params.id

    // Get the booking with related data
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        signerId: session.user.id // Ensure user owns the booking
      },
      include: {
        Service: true,
        ProofTransaction: true
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    if (booking.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Booking is not completed yet' },
        { status: 400 }
      )
    }

    // Handle RON bookings (Proof integration)
    if (booking.ProofTransaction && booking.ProofTransaction.length > 0) {
      const proofTransaction = booking.ProofTransaction[0]
      
      try {
        // Get the completed document from Proof
        const document = await proofAPI.getCompletedDocument(proofTransaction.proofTransactionId)
        
        if (!document || !document.downloadUrl) {
          return NextResponse.json(
            { error: 'Document not yet available for download' },
            { status: 404 }
          )
        }

        // Redirect to Proof's signed URL
        return NextResponse.redirect(document.downloadUrl)
      } catch (error) {
        console.error('Error fetching Proof document:', error)
        return NextResponse.json(
          { error: 'Unable to retrieve document' },
          { status: 500 }
        )
      }
    }

    // Handle Mobile bookings (local storage)
    if (booking.documentUrl) {
      // If we have a direct document URL (S3 or similar)
      return NextResponse.redirect(booking.documentUrl)
    }

    // Fallback: generate a basic booking receipt
    const receiptData = {
      bookingId: booking.id,
      serviceName: booking.Service?.name || 'Notary Service',
      date: booking.scheduledDateTime,
      amount: booking.priceAtBooking?.toNumber() || 0,
      status: booking.status,
      customerName: session.user.name || session.user.email,
      address: [booking.addressStreet, booking.addressCity, booking.addressState]
        .filter(Boolean)
        .join(', ')
    }

    // Return JSON receipt if no document is available
    return NextResponse.json({
      message: 'No document available for download',
      receipt: receiptData,
      downloadUrl: null
    })

  } catch (error) {
    console.error('Document download error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 