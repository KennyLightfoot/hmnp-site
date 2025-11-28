import { prisma } from '@/lib/db'
import { convertToBooking } from '@/lib/slot-reservation'
import { processBookingJob } from '@/lib/bullmq/booking-processor'
import { clearCalendarCache } from '@/lib/ghl-calendar'
import { createContact as createGhlContact, findContactByEmail, addTagsToContact } from '@/lib/ghl/contacts'
import { addContactToWorkflow, createAppointment } from '@/lib/ghl/management'
import { getCalendarIdForService } from '@/lib/ghl/calendar-mapping'
import { PaymentMethod, BookingStatus, ServiceType } from '@/lib/prisma-types'
import { logger } from '@/lib/logger'
import { autoDispatchBooking } from '@/lib/dispatch/auto-dispatch'

export interface CreateBookingInput {
  validatedData: any
  rawBody: any
}

export interface CreateBookingResult {
  // Using a widened type here to avoid Prisma type inference drift during Next build
  booking: any
  service: any
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

  const overlapFound = existing.some((b: (typeof existing)[number]) => {
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
  const disableOverlapCheck = String(process.env.DISABLE_OVERLAP_CHECK || '').toLowerCase() === 'true'
  
  // If a valid reservation exists for this user/time/service, honor the hold and skip conflict
  let overlap = false
  if (!disableOverlapCheck) {
    try {
      if (reservationId) {
        // Verify reservation matches the requested slot/service before skipping overlap
        const { getReservationStatus } = await import('@/lib/slot-reservation')
        const status = await getReservationStatus(reservationId)
        const resv = (status as any)?.reservation
        const isActive = !!status?.active
        // Allow small tolerance for clock/format differences
        let timeMatches = false
        try {
          if (resv?.datetime && validatedData?.scheduledDateTime) {
            const resvMs = new Date(resv.datetime).getTime()
            const reqMs = startTime.getTime()
            timeMatches = Number.isFinite(resvMs) && Number.isFinite(reqMs) && Math.abs(resvMs - reqMs) <= 60_000
          }
        } catch {}
        const serviceMatches = String(resv?.serviceType || '').toUpperCase() === String((service.serviceType as unknown as string) || '').toUpperCase()
        const matches = isActive && timeMatches && serviceMatches
        if (!matches) {
          overlap = await hasOverlap(startTime, service.serviceType as unknown as ServiceType, bufferMinutes)
        }
      } else {
        overlap = await hasOverlap(startTime, service.serviceType as unknown as ServiceType, bufferMinutes)
      }
    } catch {
      // On any error verifying reservation, fall back to overlap check
      overlap = await hasOverlap(startTime, service.serviceType as unknown as ServiceType, bufferMinutes)
    }
  }
  if (overlap) {
    // Idempotency: if the overlapping booking already exists for the same customer and time, return it as success
    try {
      const oneMinuteMs = 60 * 1000
      const windowStart = new Date(startTime.getTime() - oneMinuteMs)
      const windowEnd = new Date(startTime.getTime() + oneMinuteMs)
      const existingForCustomer = await prisma.booking.findFirst({
        where: {
          customerEmail: validatedData.customerEmail,
          scheduledDateTime: { gte: windowStart, lte: windowEnd },
          status: { notIn: ['CANCELLED_BY_CLIENT', 'CANCELLED_BY_STAFF'] as any }
        }
      })
      if (existingForCustomer) {
        return { booking: existingForCustomer, service }
      }
    } catch {}

    const err = new Error('Selected time is no longer available. Please pick a different time.')
    ;(err as any).status = 409
    throw err
  }

  const computedTotal = Number((validatedData as any)?.pricing?.totalPrice || 0)
  const uploadedDocs = Array.isArray((rawBody as any)?.uploadedDocs) ? (rawBody as any).uploadedDocs : null
  const utmParameters = (rawBody as any)?.utmParameters || null
  const referrer = typeof (rawBody as any)?.referrer === 'string' ? (rawBody as any).referrer : null

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
      notes: [
        `payment_method:${paymentMethod}`,
        referrer ? `referrer:${referrer}` : null,
        utmParameters?.utm_source ? `utm_source:${utmParameters.utm_source}` : null,
        utmParameters?.utm_medium ? `utm_medium:${utmParameters.utm_medium}` : null,
        utmParameters?.utm_campaign ? `utm_campaign:${utmParameters.utm_campaign}` : null,
        utmParameters?.utm_term ? `utm_term:${utmParameters.utm_term}` : null,
        utmParameters?.utm_content ? `utm_content:${utmParameters.utm_content}` : null,
        utmParameters?.gclid ? `gclid:${utmParameters.gclid}` : null,
        utmParameters?.msclkid ? `msclkid:${utmParameters.msclkid}` : null,
        utmParameters?.fbclid ? `fbclid:${utmParameters.fbclid}` : null,
      ].filter(Boolean).join('|'),
      // Map primary attribution to available fields
      leadSource: utmParameters?.utm_source || utmParameters?.gclid ? 'paid' : (utmParameters?.utm_source || 'website'),
      campaignName: utmParameters?.utm_campaign || undefined,
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

  // RON sessions are now handled via Notary Hub UI, not via Proof.com.
  // We intentionally do NOT create any external RON session here. This branch
  // is kept as a reminder that RON bookings exist, and as a future hook for
  // Notary Hub integration.
  try {
    const isRON = String(service.serviceType || '') === 'RON_SERVICES'
    if (isRON) {
      try {
        console.info(
          '[RON] Booking created for RON_SERVICES. External RON session must be scheduled via Notary Hub UI; no Proof.com session is created by the site.',
        )
      } catch {}
    }
  } catch {
    // Best-effort logging only; never break booking creation.
  }

  // Always create or link GHL contact and trigger configured workflow/tags (independent of calendar)
  try {
    const enableGhl = String(process.env.ENABLE_GHL_INTEGRATION || 'true').toLowerCase() !== 'false'
    if (!enableGhl) {
      try { console.info('[GHL] Skipping contact/workflow: ENABLE_GHL_INTEGRATION is false') } catch {}
    }
    if (enableGhl) {
      const customerEmail: string = validatedData.customerEmail
      const customerName: string = validatedData.customerName
      const customerPhone: string | undefined = (rawBody?.customerPhone as string) || undefined
      let ghlContactId: string | null = null

      try {
        const existing = await findContactByEmail(customerEmail)
        if (existing?.id) {
          ghlContactId = existing.id
        } else {
          const created = await createGhlContact({
            firstName: (customerName || '').split(' ')[0] || '',
            lastName: (customerName || '').split(' ').slice(1).join(' ') || '-',
            email: customerEmail,
            phone: customerPhone,
            source: 'Website Booking'
          })
          ghlContactId = (created as any)?.id || (created as any)?.contact?.id || null
        }
      } catch (e) {
        try { console.warn('[GHL] find/create contact failed (will skip workflow tag/trigger in this block)', (e as any)?.message || String(e)) } catch {}
      }

      if (ghlContactId) {
        try {
          await prisma.booking.update({ where: { id: booking.id }, data: { ghlContactId } })
        } catch {}

        // Add helpful tags if present in account
        try {
          await addTagsToContact(ghlContactId, [
            'Source:Website_Booking',
            'status:booking_confirmed'
          ])
        } catch {}

        // Trigger a configured workflow if provided via env
        try {
          const workflowId = process.env.GHL_NEW_BOOKING_WORKFLOW_ID
            || process.env.GHL_BOOKING_CONFIRMATION_WORKFLOW_ID
            || process.env.GHL_BOOKING_CONFIRMED_WORKFLOW_ID

          try { console.info('[GHL] Resolved booking workflowId:', workflowId ? '[SET]' : '[MISSING]') } catch {}

          if (workflowId) {
            try {
              const wfResp = await addContactToWorkflow(ghlContactId, workflowId)
              try { console.info('[GHL] addContactToWorkflow success', { contactId: ghlContactId, workflowId }) } catch {}
            } catch (err) {
              try { console.warn('[GHL] addContactToWorkflow failed', { contactId: ghlContactId, workflowId, error: (err as any)?.message || String(err) }) } catch {}
            }
          } else {
            try { console.info('[GHL] Skipping workflow trigger: no workflowId configured') } catch {}
          }
        } catch (e) {
          try { console.warn('[GHL] Workflow trigger block threw', (e as any)?.message || String(e)) } catch {}
        }
      }
    }
  } catch {}

  // Fire and forget
  await processBookingJob(booking.id)

  try {
    await autoDispatchBooking(booking.id)
  } catch (dispatchError) {
    try { console.warn('[DISPATCH] Auto-assign failed', (dispatchError as any)?.message || String(dispatchError)) } catch {}
  }

  // Best-effort GHL appointment (can be disabled via env)
  try {
    // Only skip inline appointment creation when a background worker is actually enabled.
    // On Vercel (no persistent worker), always create inline so appointments exist immediately.
    const workerEnabled = String(process.env.WORKER_MODE || 'false').toLowerCase() === 'true'
    const ghlDisabledEnv = String(process.env.DISABLE_GHL_APPOINTMENT_CREATE || '').toLowerCase() === 'true'
    const ghlDisabled = workerEnabled && ghlDisabledEnv
    if (ghlDisabled) {
      try { console.info('[GHL] Skipping appointment create: handled by worker (WORKER_MODE=true & DISABLE_GHL_APPOINTMENT_CREATE=true)') } catch {}
      return { booking, service }
    } else if (ghlDisabledEnv && !workerEnabled) {
      try { console.warn('[GHL] Inline appointment forced: worker not enabled (WORKER_MODE=false)') } catch {}
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
      } catch (e) {
        try { console.warn('[GHL] Appointment flow: find/create contact failed', (e as any)?.message || String(e)) } catch {}
      }

      const serviceDurationMinutes = (service as any)?.durationMinutes ?? 60
      const startIso = booking.scheduledDateTime.toISOString()
      const endIso = new Date(booking.scheduledDateTime.getTime() + serviceDurationMinutes * 60 * 1000).toISOString()
      try {
        if (!ghlContactId) {
          try { console.warn('[GHL] Skipping appointment create: missing contactId') } catch {}
          return { booking, service }
        }
        await createAppointment({
          calendarId,
          contactId: ghlContactId || "",
          title: `${(service as any).name} – ${validatedData.customerName}`,
          
          startTime: startIso,
          endTime: endIso,
          appointmentStatus: "confirmed",
          address: validatedData.locationAddress || "Remote/Online Service",
          ignoreDateRange: false,
          toNotify: true,
        })
        try { console.info('[GHL] Appointment created successfully') } catch {}
        // Invalidate GHL free-slots cache for this calendar/date so UI updates immediately
        try {
          const day = startIso.split('T')[0]!
          clearCalendarCache() // global clear (simple + safe); can be optimized to key-based later
        } catch {}
      } catch (e) {
        try { console.error('[GHL] Appointment create failed', (e as any)?.message || String(e)) } catch {}
      }
    }
  } catch {}

  return { booking, service }
}


