import { prisma } from '@/lib/db'
import { logger } from '@/lib/logger'

export interface NotaryInfo {
  name?: string | null
  phone?: string | null
  email?: string | null
  commission_number?: string | null
  estimatedArrival?: string | null
}

export async function getNotaryInfoForBooking(bookingId: string): Promise<NotaryInfo | null> {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        User_Booking_notaryIdToUser: {
          include: { notary_profiles: true },
        },
      },
    })

    if (booking?.User_Booking_notaryIdToUser) {
      const notary = booking.User_Booking_notaryIdToUser
      const phoneValue = (notary.customer_preferences as any)?.phone
      const phone = typeof phoneValue === 'string' ? phoneValue : null
      return {
        name: notary.name,
        email: notary.email,
        phone,
        commission_number: notary.notary_profiles?.commission_number ?? null,
        estimatedArrival: null,
      }
    }

    return null
  } catch (error) {
    logger.error('Failed to get notary info', 'ENHANCED_BOOKING', error as Error)
    return null
  }
}


