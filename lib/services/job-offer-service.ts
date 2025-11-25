import { prisma } from '@/lib/db'
import {
  Prisma,
  Role,
  NotaryOnboardingStatus,
  NotaryAvailabilityStatus,
  JobOfferStatus,
} from '@/lib/prisma-types'
import { logger } from '@/lib/logger'

interface EligibleNotary {
  id: string;
  name: string | null;
  email: string | null;
  notary_profiles: any | null
}

type BookingWithLocation = {
  id: string
  addressZip?: string | null
  addressState?: string | null
}

interface JobOfferEligibilityCriteria {
  booking: any
  maxDistanceMiles?: number
  requireActiveCommission?: boolean
  requireEOInsurance?: boolean
}

/**
 * Find eligible notaries for a job offer based on booking criteria
 */
export async function findEligibleNotaries(
  criteria: JobOfferEligibilityCriteria
): Promise<EligibleNotary[]> {
  const {
    booking,
    maxDistanceMiles = 50,
    requireActiveCommission = true,
    requireEOInsurance = true,
  } = criteria

  // Base query for active notaries
  const notaryProfileFilters: Prisma.notary_profilesWhereInput = {
    is_active: true,
    onboarding_status: NotaryOnboardingStatus.COMPLETE,
    availability_status: NotaryAvailabilityStatus.AVAILABLE,
  }

  // Filter by commission expiry if required
  if (requireActiveCommission) {
    notaryProfileFilters.OR = [
      { commission_expiry: null },
      { commission_expiry: { gte: new Date() } },
    ]
  }

  // Filter by E&O insurance expiry if required
  if (requireEOInsurance) {
    const existingAnd = notaryProfileFilters.AND
    const andArray = Array.isArray(existingAnd) 
      ? existingAnd 
      : existingAnd 
        ? [existingAnd] 
        : []
    
    notaryProfileFilters.AND = [
      ...andArray,
      { eo_insurance_provider: { not: null } },
      {
        OR: [
          { eo_insurance_expiry: null },
          { eo_insurance_expiry: { gte: new Date() } },
        ],
      },
    ]
  }

  const where: Prisma.UserWhereInput = {
    role: Role.NOTARY,
    notary_profiles: {
      is: notaryProfileFilters,
    },
  }

  // Get all active notaries
  const notaries = await prisma.user.findMany({
    where,
    include: {
      notary_profiles: true,
    },
  }) as EligibleNotary[]

  const bookingWithLocation = booking as BookingWithLocation

  // Filter by geographic eligibility if booking has location
  if (bookingWithLocation.addressZip && bookingWithLocation.addressState) {
    return notaries.filter((notary: EligibleNotary) => {
      const profile = notary.notary_profiles
      if (!profile) return false

      // Check if notary serves this state
      if (profile.states_licensed && profile.states_licensed.length > 0) {
        if (!profile.states_licensed.includes(bookingWithLocation.addressState!)) {
          return false
        }
      }

      // Check if notary serves this ZIP code or is within service radius
      if (profile.preferred_zip_codes && profile.preferred_zip_codes.length > 0) {
        // If they have preferred ZIPs, check if booking ZIP is in their list
        if (!profile.preferred_zip_codes.includes(bookingWithLocation.addressZip!)) {
          // Could add distance calculation here if needed
          // For now, if they have preferred ZIPs and booking ZIP isn't in list, skip
          return false
        }
      }

      // Check service radius if base ZIP is available
      if (profile.base_zip && bookingWithLocation.addressZip) {
        // Simple ZIP-based check - in production, use actual distance calculation
        // For now, assume if both ZIPs exist and notary has service radius, they're eligible
        // TODO: Implement actual distance calculation using Google Maps API
        return true
      }

      return true
    })
  }

  // If no location, return all eligible notaries
  return notaries
}

/**
 * Create job offers for eligible notaries
 */
export async function createJobOffers(
  bookingId: string,
  offerExpiryMinutes: number = 30
): Promise<{ created: number; errors: string[] }> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  })

  if (!booking) {
    throw new Error('Booking not found')
  }

  if (!booking.sendToNetwork) {
    throw new Error('Booking is not marked for network distribution')
  }

  // Check if offers already exist
  const existingOffers = await prisma.jobOffer.findMany({
    where: { bookingId },
  })

  if (existingOffers.length > 0) {
    logger.warn('Job offers already exist for this booking', { bookingId })
    return { created: 0, errors: ['Offers already exist for this booking'] }
  }

  // Find eligible notaries
  // The booking from Prisma includes all fields we need for eligibility checks.
  const eligibleNotaries = await findEligibleNotaries({
    booking,
    requireActiveCommission: true,
    requireEOInsurance: true,
  })

  if (eligibleNotaries.length === 0) {
    logger.warn('No eligible notaries found for booking', { bookingId })
    return { created: 0, errors: ['No eligible notaries found'] }
  }

  // Calculate expiry time
  const expiresAt = new Date()
  expiresAt.setMinutes(expiresAt.getMinutes() + offerExpiryMinutes)

  // Create offers for all eligible notaries
  const offers = eligibleNotaries.map((notary) => ({
    bookingId,
    notaryId: notary.id,
    status: JobOfferStatus.PENDING,
    expiresAt,
  }))

  try {
    const result = await prisma.jobOffer.createMany({
      data: offers,
      skipDuplicates: true,
    })

    logger.info('Job offers created', {
      bookingId,
      offersCreated: result.count,
      totalEligible: eligibleNotaries.length,
    })

    // Send notifications to notaries
    try {
      const { sendJobOfferNotification } = await import('@/lib/email/templates/job-offer')
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { service: true },
      })

      if (booking) {
        const location = booking.addressStreet
          ? `${booking.addressStreet}${booking.addressCity ? `, ${booking.addressCity}` : ''}${booking.addressState ? ` ${booking.addressState}` : ''}${booking.addressZip ? ` ${booking.addressZip}` : ''}`
          : 'Location TBD'

        const scheduledDateTime = booking.scheduledDateTime
          ? new Date(booking.scheduledDateTime).toLocaleString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })
          : 'To be scheduled'

        await Promise.all(
          eligibleNotaries.map((notary) =>
            sendJobOfferNotification({
              notaryName: notary.name || 'Notary',
              notaryEmail: notary.email || '',
              bookingId,
              serviceName: booking.service.name,
              scheduledDateTime,
              location,
              price: booking.priceAtBooking.toNumber(),
              expiresInMinutes: offerExpiryMinutes,
            }).catch((error) => {
              logger.error('Failed to send job offer notification', {
                error,
                notaryId: notary.id,
                bookingId,
              })
            })
          )
        )
      }
    } catch (error) {
      logger.error('Error sending job offer notifications', { error, bookingId })
      // Don't fail if notifications fail
    }

    return {
      created: result.count,
      errors: [],
    }
  } catch (error) {
    logger.error('Error creating job offers', { error, bookingId })
    return {
      created: 0,
      errors: [error instanceof Error ? error.message : 'Failed to create offers'],
    }
  }
}

/**
 * Accept a job offer (first-come-first-serve)
 */
export async function acceptJobOffer(
  offerId: string,
  notaryId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Use a transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Get the offer and verify it belongs to this notary
      const offer = await tx.jobOffer.findUnique({
        where: { id: offerId },
        include: { Booking: true },
      })

      if (!offer) {
        throw new Error('Job offer not found')
      }

      if (offer.notaryId !== notaryId) {
        throw new Error('Unauthorized: This offer does not belong to you')
      }

      if (offer.status !== JobOfferStatus.PENDING) {
        throw new Error(`Offer is no longer available (status: ${offer.status})`)
      }

      if (new Date() > offer.expiresAt) {
        throw new Error('Offer has expired')
      }

      // Check if booking already has a notary assigned
      if (offer.Booking.notaryId) {
        throw new Error('Booking already has a notary assigned')
      }

      // Accept this offer
      await tx.jobOffer.update({
        where: { id: offerId },
        data: {
          status: JobOfferStatus.ACCEPTED,
          acceptedAt: new Date(),
        },
      })

      // Assign notary to booking
      await tx.booking.update({
        where: { id: offer.Booking.id },
        data: {
          notaryId: notaryId,
          sendToNetwork: false, // Mark as no longer needing network distribution
        },
      })

      // Cancel/expire all other offers for this booking
      await tx.jobOffer.updateMany({
        where: {
          bookingId: offer.Booking.id,
          id: { not: offerId },
          status: JobOfferStatus.PENDING,
        },
        data: {
          status: JobOfferStatus.CANCELLED,
        },
      })

      return { success: true }
    })

    logger.info('Job offer accepted', { offerId, notaryId })

    // TODO: Send notifications
    // - Notify admin that offer was accepted
    // - Notify customer that notary has been assigned
    // - Notify other notaries that offer is no longer available

    return result
  } catch (error) {
    logger.error('Error accepting job offer', { error, offerId, notaryId })
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to accept offer',
    }
  }
}

/**
 * Decline a job offer
 */
export async function declineJobOffer(
  offerId: string,
  notaryId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const offer = await prisma.jobOffer.findUnique({
      where: { id: offerId },
    })

    if (!offer) {
      return { success: false, error: 'Job offer not found' }
    }

    if (offer.notaryId !== notaryId) {
      return { success: false, error: 'Unauthorized' }
    }

    if (offer.status !== JobOfferStatus.PENDING) {
      return { success: false, error: 'Offer is no longer available' }
    }

    await prisma.jobOffer.update({
      where: { id: offerId },
      data: {
        status: JobOfferStatus.DECLINED,
        declinedAt: new Date(),
      },
    })

    logger.info('Job offer declined', { offerId, notaryId })

    return { success: true }
  } catch (error) {
    logger.error('Error declining job offer', { error, offerId, notaryId })
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to decline offer',
    }
  }
}

