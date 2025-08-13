import { prisma } from '@/lib/db'
import { convertToBooking } from '@/lib/slot-reservation'
import { processBookingJob } from '@/lib/bullmq/booking-processor'
import { createAppointment as createGhlAppointment } from '@/lib/ghl/appointments-adapter'
import { clearCalendarCache } from '@/lib/ghl-calendar'
import { createContact as createGhlContact, findContactByEmail } from '@/lib/ghl/contacts'
import { getCalendarIdForService } from '@/lib/ghl/calendar-mapping'
import type { Service } from '@prisma/client'
import { PaymentMethod, BookingStatus, ServiceType } from '@prisma/client'
import { logger } from '@/lib/logger'

export interface CreateBookingInput {
  validatedData: any
  rawBody: any
}

export interface CreateBookingResult {
  // Using a widened type here to avoid Prisma type inference drift during Next build
  booking: any
  service: Service
}

function normalizePaymentMethod(raw: unknown): PaymentMethod {
  const value = String(raw || 'pay_on_site').toUpperCase()
  switch (value) {
    case 'CARD':
      return PaymentMethod.CARD
    case 'ACH':
      return PaymentMethod.ACH
    case 'OTHER':
      return PaymentMethod.OTHER
    default:
      return PaymentMethod.PAY_ON_SITE
  }
}

async function hasOverlap(startTime: Date, serviceType: ServiceType, bufferMinutes: number): Promise<boolean> {
  const service = await prisma.service.findFirst({ where: { serviceType } })
  if (!service) return false
  const serviceDurationMinutes = (service as any)?.durationMinutes ?? 60
  const newEndTime = new Date(startTime.getTime() + (serviceDurationMinutes + bufferMinutes) * 60 * 1000)
  const windowBeforeMinutes = serviceDurationMinutes + bufferMinutes
  const overlapWindowStart = new Date(startTime.getTime() - windowBeforeMinutes * 60 * 1000)

  // Only block on statuses that truly occupy capacity
  const blockingStatuses: BookingStatus[] = [
    BookingStatus.SCHEDULED,
    BookingStatus.CONFIRMED,
    BookingStatus.READY_FOR_SERVICE,
    BookingStatus.IN_PROGRESS,
  ]

  const existing = await prisma.booking.findMany({
    where: {
      status: { in: blockingStatuses },
      scheduledDateTime: { gte: overlapWindowStart, lte: newEndTime },
    },
    include: { service: true },
  })

  const overlapFound = existing.some((b) => {
    const existingStart = b.scheduledDateTime as Date
    const existingDuration = (b as any)?.service?.durationMinutes ?? 60
    const existingEnd = new Date(existingStart.getTime() + (existingDuration + bufferMinutes) * 60 * 1000)
    const isOverlap = startTime < existingEnd && newEndTime > existingStart
    if (isOverlap) {
      try {
        logger.info('Overlap detected', {
          requestedStart: startTime.toISOString(),
          requestedEnd: newEndTime.toISOString(),
          bufferMinutes,
          serviceDurationMinutes,
          blockingBookingId: b.id,
          blockingStatus: b.status,
          blockingStart: existingStart.toISOString(),
          blockingEnd: existingEnd.toISOString(),
        })
      } catch {}
    }
    return isOverlap
  })

  return overlapFound
}

export async function createBookingFromForm({ validatedData, rawBody }: CreateBookingInput): Promise<CreateBookingResult> {
  const reservationId: string | undefined = typeof rawBody?.reservationId === 'string' ? rawBody.reservationId : undefined
  const paymentMethod = normalizePaymentMethod(rawBody?.paymentMethod)

  const service = await prisma.service.findFirst({ where: { serviceType: validatedData.serviceType } })
  if (!service) throw new Error('Service not found')

  const startTime = new Date(validatedData.scheduledDateTime)
  const bufferMinutes = Number(process.env.MIN_APPOINTMENT_GAP_MINUTES || '15')
  const overlap = await hasOverlap(startTime, service.serviceType as unknown as ServiceType, bufferMinutes)
  if (overlap) {
    const err = new Error('Selected time is no longer available. Please pick a different time.')
    ;(err as any).status = 409
    throw err
  }

  const computedTotal = Number((validatedData as any)?.pricing?.totalPrice || 0)
  const uploadedDocs = Array.isArray((rawBody as any)?.uploadedDocs) ? (rawBody as any).uploadedDocs : null

  const booking = await prisma.booking.create({
    data: {
      serviceId: service.id,
      customerName: validatedData.customerName,
      customerEmail: validatedData.customerEmail,
      scheduledDateTime: startTime,
      addressStreet: validatedData.locationAddress || undefined,
      priceAtBooking: isFinite(computedTotal) && computedTotal > 0 ? computedTotal : (service as any)?.basePrice ?? 0,
      depositStatus: 'PENDING',
      status: 'CONFIRMED',
      paymentMethod,
      notes: `payment_method:${paymentMethod}`,
      uploadedDocuments: uploadedDocs && uploadedDocs.length > 0 ? {
        create: uploadedDocs.map((d: any) => ({
          s3Key: d.key,
          filename: d.name || d.filename || 'document',
          contentType: d.contentType || null,
          sizeBytes: typeof d.sizeBytes === 'number' ? d.sizeBytes : null,
        })),
      } : undefined,
    },
  })

  if (reservationId) {
    await convertToBooking(reservationId, booking.id)
  }

  // Fire and forget
  await processBookingJob(booking.id)

  // Best-effort GHL appointment (can be disabled via env)
  try {
    const ghlDisabled = (process.env.DISABLE_GHL_APPOINTMENT_CREATE || '').toLowerCase() === 'true'
    if (ghlDisabled) {
      return { booking, service }
    }
    let calendarId = (service as any).externalCalendarId as string | null
    if (!calendarId) {
      try {
        calendarId = getCalendarIdForService(service.serviceType as unknown as string)
      } catch {}
    }
    let ghlContactId: string | null = null
    if (calendarId && booking.scheduledDateTime) {
      try {
        const existing = await findContactByEmail(validatedData.customerEmail)
        if (existing?.id) {
          ghlContactId = existing.id
        } else {
          const created = await createGhlContact({
            firstName: (validatedData.customerName || '').split(' ')[0] || '',
            lastName: (validatedData.customerName || '').split(' ').slice(1).join(' ') || '',
            email: validatedData.customerEmail,
            phone: (rawBody?.customerPhone as string) || undefined,
            source: 'Website Booking',
          })
          ghlContactId = (created as any)?.id || (created as any)?.contact?.id || null
        }
        // Persist the mapped GHL contact on the booking for downstream automations (reminders/workflows)
        if (ghlContactId) {
          try {
            await prisma.booking.update({
              where: { id: booking.id },
              data: { ghlContactId },
            })
          } catch {}
        }
      } catch {}

      const serviceDurationMinutes = (service as any)?.durationMinutes ?? 60
      const startIso = booking.scheduledDateTime.toISOString()
      const endIso = new Date(booking.scheduledDateTime.getTime() + serviceDurationMinutes * 60 * 1000).toISOString()
      try {
        await createGhlAppointment({
          calendarId,
          contactId: ghlContactId || undefined,
          title: `${(service as any).name} – ${validatedData.customerName}`,
          description: 'Created from HMNP booking form',
          startTime: startIso,
          endTime: endIso,
        })
        // Invalidate GHL free-slots cache for this calendar/date so UI updates immediately
        try {
          const day = startIso.split('T')[0]!
          clearCalendarCache() // global clear (simple + safe); can be optimized to key-based later
        } catch {}
      } catch {}
    }
  } catch {}

  return { booking, service }
}


