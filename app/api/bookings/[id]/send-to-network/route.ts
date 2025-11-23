import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Role } from '@/lib/prisma-types'
import { createJobOffers } from '@/lib/services/job-offer-service'
import { logger } from '@/lib/logger'

type SendToNetworkContext = {
  params: Promise<{ id: string }>
}

export async function POST(
  request: NextRequest,
  context: SendToNetworkContext
) {
  try {
    const { id: bookingId } = await context.params

    const session = await getServerSession(authOptions)
    const userRole = (session?.user as any)?.role

    // Only admin and staff can send bookings to network
    if (!session?.user || (userRole !== Role.ADMIN && userRole !== Role.STAFF)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    if (booking.notaryId) {
      return NextResponse.json(
        { error: 'Booking already has a notary assigned' },
        { status: 400 }
      )
    }

    // Mark booking for network distribution
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        sendToNetwork: true,
        networkOfferExpiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
      },
    })

    // Create job offers for eligible notaries
    const result = await createJobOffers(bookingId, 30)

    if (result.errors.length > 0) {
      logger.warn('Some errors occurred creating job offers', {
        bookingId,
        errors: result.errors,
      })
    }

    return NextResponse.json({
      success: true,
      offersCreated: result.created,
      errors: result.errors,
    })
  } catch (error) {
    logger.error('Error sending booking to network', { error })
    return NextResponse.json(
      { error: 'Failed to send booking to network' },
      { status: 500 }
    )
  }
}
