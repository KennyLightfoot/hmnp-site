import { BookingStatus, Prisma, Role } from '@/lib/prisma-types'
import { differenceInMinutes, isSameDay, startOfDay, endOfDay } from 'date-fns'

import { prisma } from '../prisma'
import { getDistanceBetweenZips } from './distance'
import { logger } from '../logger'

interface DispatchCandidate {
  profileId: string
  userId: string
  name: string | null
  email: string | null
  serviceRadius: number
  skills: string[]
  baseZip: string | null
  distanceMiles: number
  assignmentsToday: number
  score: number
  preferredZipMatch: boolean
  availabilityPenalty: number
}

interface DispatchOptions {
  dryRun?: boolean
  requireSkills?: boolean
}

const DEFAULT_SCORE = -1000
const DISTANCE_CONFLICT_THRESHOLD_MINUTES = 90

function extractZip(value?: string | null): string | null {
  if (!value) return null
  const match = value.match(/(\d{5})/)
  return match?.[1] ?? null
}

function calculateCandidateScore(
  distanceMiles: number,
  assignmentsToday: number,
  capacity: number,
  sameZip: boolean,
  preferredZipHit: boolean,
  availabilityPenalty: number,
  preferredZipListDefined: boolean
): number {
  const distancePenalty = Math.min(distanceMiles, 60)
  const loadRatio = capacity > 0 ? assignmentsToday / capacity : 1
  const loadPenalty = loadRatio * 25
  let score = 100 - distancePenalty - loadPenalty
  if (sameZip) score += 10
  if (preferredZipHit) score += 15
  if (!preferredZipHit && preferredZipListDefined) score -= 10
  score -= Math.min(availabilityPenalty, 60)
  return score
}

function determineRequiredSkills(serviceType?: string | null): string[] {
  const skills: string[] = []
  if (!serviceType) return skills
  if (serviceType === 'LOAN_SIGNING' || serviceType === 'LOAN_SIGNING_SPECIALIST') {
    skills.push('LOAN_SIGNING')
  }
  if (serviceType === 'RON_SERVICES' || serviceType === 'REMOTE_ONLINE_NOTARIZATION') {
    skills.push('RON_SERVICES')
    skills.push('RON')
  }
  if (serviceType === 'EXTENDED_HOURS') {
    skills.push('EXTENDED_HOURS')
  }
  if (serviceType === 'SPECIALTY_NOTARY') {
    skills.push('SPECIALTY_NOTARY')
  }
  return skills
}

function matchesSkills(candidateSkills: string[], requiredSkills: string[], requireSkills: boolean): boolean {
  if (requiredSkills.length === 0) return true
  if (candidateSkills.length === 0) {
    return !requireSkills
  }
  return requiredSkills.every((skill) => candidateSkills.includes(skill))
}

function getCentralHour(date?: Date | null): number | null {
  if (!date) return null
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      hour12: false,
      timeZone: 'America/Chicago',
    })
    const formatted = formatter.format(date)
    const hour = Number(formatted)
    return Number.isFinite(hour) ? hour : null
  } catch {
    return null
  }
}

function calculateAvailabilityPenalty(
  scheduledHour: number | null,
  startHour?: number | null,
  endHour?: number | null
): number {
  if (scheduledHour === null || scheduledHour === undefined) return 0
  const start = (startHour ?? 7) % 24
  const end = (endHour ?? 21) % 24

  // Simple window assuming start < end (standard availability)
  if (start < end) {
    if (scheduledHour >= start && scheduledHour < end) return 0
    const distance = scheduledHour < start ? start - scheduledHour : scheduledHour - end
    return Math.min(distance * 10, 50)
  }

  // Overnight window (e.g., 20 -> 4)
  if (scheduledHour >= start || scheduledHour < end) return 0
  const distance = scheduledHour < start ? start - scheduledHour : scheduledHour - end
  return Math.min(distance * 10, 50)
}

async function getAssignmentsForDay(userId: string, scheduled: Date): Promise<{ count: number; conflicts: boolean }> {
  const dayStart = startOfDay(scheduled)
  const dayEnd = endOfDay(scheduled)
  const assignments = await prisma.booking.findMany({
    where: {
      notaryId: userId,
      scheduledDateTime: {
        gte: dayStart,
        lte: dayEnd,
      },
      status: {
        notIn: [BookingStatus.CANCELLED_BY_CLIENT, BookingStatus.CANCELLED_BY_STAFF, BookingStatus.ARCHIVED],
      },
    },
    select: {
      id: true,
      scheduledDateTime: true,
    },
  })

  const hasConflict = assignments.some((assignment: (typeof assignments)[number]) => {
    if (!assignment.scheduledDateTime) return false
    const diff = Math.abs(differenceInMinutes(assignment.scheduledDateTime, scheduled))
    return diff < DISTANCE_CONFLICT_THRESHOLD_MINUTES
  })

  return {
    count: assignments.length,
    conflicts: hasConflict,
  }
}

async function buildDispatchCandidates(booking: Prisma.BookingGetPayload<{ include: { service: true } }>, options: DispatchOptions): Promise<DispatchCandidate[]> {
  const bookingZip = extractZip(booking.addressZip)
  const requiredSkills = determineRequiredSkills(booking.service?.serviceType as string | undefined)
  const profiles = await prisma.notary_profiles.findMany({
    where: {
      is_active: true,
      User: {
        role: Role.NOTARY,
      },
    },
    include: {
      User: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  })

  const candidates: DispatchCandidate[] = []

  for (const profile of profiles) {
    const userId = profile.User?.id
    if (!userId) continue
    if (booking.notaryId && booking.notaryId === userId) continue

    if (!matchesSkills(profile.preferred_service_types || [], requiredSkills, Boolean(options.requireSkills))) {
      continue
    }

    const baseZip = extractZip(profile.base_zip || profile.base_address)
    const preferredZipCodes = Array.isArray(profile.preferred_zip_codes)
      ? profile.preferred_zip_codes.filter((zip: string) => typeof zip === 'string' && zip.trim().length >= 5)
      : []
    const preferredZipListDefined = preferredZipCodes.length > 0
    const preferredZipHit = Boolean(bookingZip && preferredZipCodes.includes(bookingZip))

    const distanceMiles = await getDistanceBetweenZips(baseZip, bookingZip)

    if (!Number.isFinite(distanceMiles)) {
      continue
    }

    if (profile.service_radius_miles && distanceMiles > profile.service_radius_miles) {
      continue
    }

    if (!booking.scheduledDateTime) {
      continue
    }

    const scheduledHour = getCentralHour(booking.scheduledDateTime)
    const availabilityPenalty = calculateAvailabilityPenalty(
      scheduledHour,
      profile.preferred_start_hour,
      profile.preferred_end_hour
    )

    const { count: assignmentsToday, conflicts } = await getAssignmentsForDay(userId, booking.scheduledDateTime)
    if (conflicts) {
      continue
    }

    const capacity = profile.daily_capacity ?? 8
    const sameZip = Boolean(baseZip && bookingZip && baseZip === bookingZip)
    const score = calculateCandidateScore(
      distanceMiles,
      assignmentsToday,
      capacity,
      sameZip,
      preferredZipHit,
      availabilityPenalty,
      preferredZipListDefined
    )

    candidates.push({
      profileId: profile.id,
      userId,
      name: profile.User?.name ?? null,
      email: profile.User?.email ?? null,
      serviceRadius: profile.service_radius_miles ?? 25,
      skills: profile.preferred_service_types || [],
      baseZip,
      distanceMiles,
      assignmentsToday,
      score,
      preferredZipMatch: preferredZipHit,
      availabilityPenalty,
    })
  }

  return candidates.sort((a, b) => b.score - a.score)
}

export async function autoDispatchBooking(bookingId: string, options: DispatchOptions = {}) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { service: true },
  })

  if (!booking) {
    logger.warn(`Dispatch skipped: booking ${bookingId} not found`, 'AUTO_DISPATCH')
    return { assigned: false }
  }

  if (booking.notaryId) {
    logger.info(`Dispatch skipped: booking ${bookingId} already has notary ${booking.notaryId}`, 'AUTO_DISPATCH')
    return { assigned: false }
  }

  if (!booking.scheduledDateTime) {
    logger.warn(`Dispatch skipped: booking ${bookingId} missing scheduled time`, 'AUTO_DISPATCH')
    return { assigned: false }
  }

  const candidates = await buildDispatchCandidates(booking, options)
  const topCandidate = candidates[0]

  if (!topCandidate) {
    logger.warn(`Dispatch pending: no qualified notary for booking ${bookingId}`, 'AUTO_DISPATCH', {
      bookingId,
      serviceType: booking.service?.serviceType,
      addressZip: booking.addressZip,
    })
    return { assigned: false, reason: 'NO_CANDIDATE' }
  }

  if (options.dryRun) {
    return { assigned: false, candidate: topCandidate, dryRun: true }
  }

  const assignment = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const updatedBooking = await tx.booking.update({
      where: { id: bookingId },
      data: {
        notaryId: topCandidate.userId,
        status: booking.status === BookingStatus.CONFIRMED ? BookingStatus.SCHEDULED : booking.status,
      },
      include: { service: true },
    })

    await tx.dispatchAssignment.create({
      data: {
        bookingId,
        notaryId: topCandidate.userId,
        score: topCandidate.score,
        notes: `Auto-dispatch ${new Date().toISOString()}`,
      },
    })

    return updatedBooking
  })

  logger.info(`Booking ${bookingId} auto-dispatched to notary ${topCandidate.userId}`, 'AUTO_DISPATCH', {
    bookingId,
    notaryId: topCandidate.userId,
    score: topCandidate.score,
    distanceMiles: topCandidate.distanceMiles,
    preferredZipMatch: topCandidate.preferredZipMatch,
    availabilityPenalty: topCandidate.availabilityPenalty,
  })

  return { assigned: true, booking: assignment, candidate: topCandidate }
}

export async function autoDispatchPendingBookings(options: DispatchOptions = {}) {
  const referenceDate = new Date()
  const bookings = await prisma.booking.findMany({
    where: {
      notaryId: null,
      scheduledDateTime: {
        gte: referenceDate,
      },
      status: {
        in: [BookingStatus.CONFIRMED, BookingStatus.SCHEDULED, BookingStatus.PAYMENT_PENDING],
      },
    },
    orderBy: {
      scheduledDateTime: 'asc',
    },
    include: {
      service: true,
    },
  })

  const results = [] as Array<{ bookingId: string; assigned: boolean; reason?: string }>

  for (const booking of bookings) {
    try {
      const result = await autoDispatchBooking(booking.id, options)
      results.push({ bookingId: booking.id, assigned: Boolean(result.assigned), reason: result.reason })
    } catch (error) {
      logger.error(`Auto-dispatch failed for booking ${booking.id}`, 'AUTO_DISPATCH', error as Error)
      results.push({ bookingId: booking.id, assigned: false, reason: 'ERROR' })
    }
  }

  return results
}
