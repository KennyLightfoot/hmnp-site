import { NextRequest, NextResponse } from 'next/server';
import { getErrorMessage } from '@/lib/utils/error-utils';
import { prisma } from '@/lib/db';
// import { validateBusinessRules } from '@/lib/business-rules/engine';
// import { pricingEngine } from '@/lib/pricing-engine';
import { convertToBooking } from '@/lib/slot-reservation';
import { bookingSchemas } from '@/lib/validation/schemas';
import { processBookingJob } from '@/lib/bullmq/booking-processor';
import { createAppointment as createGhlAppointment, createContact as createGhlContact, findContactByEmail, createOpportunity as createGhlOpportunity, getServiceValue as getGhlServiceValue } from '@/lib/ghl/api';
import { getCalendarIdForService } from '@/lib/ghl/calendar-mapping';
import { ServiceType, BookingStatus } from '@prisma/client';
import { z } from 'zod';

export const BookingSchema = bookingSchemas.createBookingFromForm;
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = bookingSchemas.createBookingFromForm.parse(body);
    const reservationId: string | undefined = typeof body?.reservationId === 'string' ? body.reservationId : undefined;

    const service = await prisma.service.findFirst({
      where: { serviceType: validatedData.serviceType },
    });

    if (!service) {
      return NextResponse.json({ message: 'Service not found' }, { status: 404 });
    }

    // Prevent overlapping bookings (server-side hard lock)
    const startTime = new Date(validatedData.scheduledDateTime);
    const serviceDurationMinutes = (service as any)?.durationMinutes ?? 60;
    const bufferMinutes = Number(process.env.MIN_APPOINTMENT_GAP_MINUTES || '15');
    const newEndTime = new Date(startTime.getTime() + (serviceDurationMinutes + bufferMinutes) * 60 * 1000);

    // Look for potentially overlapping bookings around the requested time
    const windowBeforeMinutes = serviceDurationMinutes + bufferMinutes;
    const overlapWindowStart = new Date(startTime.getTime() - windowBeforeMinutes * 60 * 1000);

    const existing = await prisma.booking.findMany({
      where: {
        status: { notIn: [
          BookingStatus.CANCELLED_BY_CLIENT,
          BookingStatus.CANCELLED_BY_STAFF,
        ] },
        scheduledDateTime: {
          gte: overlapWindowStart,
          lte: newEndTime,
        },
      },
      include: { service: true },
    });

    const hasOverlap = existing.some((b) => {
      const existingStart = b.scheduledDateTime as Date;
      const existingDuration = (b as any)?.service?.durationMinutes ?? 60;
      const existingEnd = new Date(existingStart.getTime() + (existingDuration + bufferMinutes) * 60 * 1000);
      return startTime < existingEnd && newEndTime > existingStart;
    });

    if (hasOverlap) {
      return NextResponse.json({ message: 'Selected time is no longer available. Please pick a different time.' }, { status: 409 });
    }

    const computedTotal = Number((validatedData as any)?.pricing?.totalPrice || 0);

    const booking = await prisma.booking.create({
      data: {
        serviceId: service.id,
        customerName: validatedData.customerName,
        customerEmail: validatedData.customerEmail,
        scheduledDateTime: new Date(validatedData.scheduledDateTime),
        addressStreet: validatedData.locationAddress || undefined,
        priceAtBooking: isFinite(computedTotal) && computedTotal > 0 ? computedTotal : (service as any)?.basePrice ?? 0,
        // No prepayment required; confirm immediately
        depositStatus: 'PENDING',
        status: 'CONFIRMED',
        // Optional: record intended payment method if provided by client
        paymentMethod: (body?.paymentMethod as any) || 'pay_on_site',
      },
    });

    // Link reservation to booking if provided
    if (reservationId) {
      await convertToBooking(reservationId, booking.id);
    }

    // Enqueue background processing (emails, etc.)
    await processBookingJob(booking.id);

    // Also create GHL appointment immediately (serverless-safe)
    try {
      // Prefer DB-mapped calendar; if missing, fall back to env mapping by serviceType
      let calendarId = service.externalCalendarId as string | null;
      if (!calendarId) {
        try {
          calendarId = getCalendarIdForService(service.serviceType as unknown as string);
        } catch (e) {
          console.warn('Missing calendar mapping for serviceType; will fall back to opportunity workflow', {
            serviceType: service.serviceType,
          });
        }
      }

      let ghlContactId: string | null = null;

      if (calendarId && booking.scheduledDateTime) {
        // Ensure contact exists in GHL
        try {
          const existing = await findContactByEmail(validatedData.customerEmail);
          if (existing?.id) {
            ghlContactId = existing.id;
          } else {
            const created = await createGhlContact({
              firstName: (validatedData.customerName || '').split(' ')[0] || '',
              lastName: (validatedData.customerName || '').split(' ').slice(1).join(' ') || '',
              email: validatedData.customerEmail,
              phone: (body?.customerPhone as string) || undefined,
              source: 'Website Booking'
            });
            ghlContactId = created?.id || created?.contact?.id || null;
          }
        } catch (e) {
          console.error('GHL contact ensure failed (non-blocking):', e);
        }

        const startIso = booking.scheduledDateTime.toISOString();
        const endIso = new Date(
          booking.scheduledDateTime.getTime() + serviceDurationMinutes * 60 * 1000
        ).toISOString();

        try {
          await createGhlAppointment({
            calendarId,
            contactId: ghlContactId || undefined,
            title: `${service.name} – ${validatedData.customerName}`,
            description: 'Created from HMNP booking form',
            startTime: startIso,
            endTime: endIso,
          });
        } catch (e) {
          console.error('GHL appointment creation failed – evaluating opportunity fallback (non-blocking):', e);
          // Only create an Opportunity if the failure is due to the slot not being available per free-slots
          const BYPASS_PREFLIGHT = (process.env.BOOKING_BYPASS_PREFLIGHT || '').toLowerCase() === 'true';
          const code = (e as any)?.code || (e as any)?.message || '';
          const isSlotUnavailable = typeof code === 'string' && code.includes('SLOT_UNAVAILABLE');
          if (isSlotUnavailable && !BYPASS_PREFLIGHT) {
            try {
              if (!ghlContactId) {
                // Best-effort ensure contact for opportunity creation
                const created = await createGhlContact({
                  firstName: (validatedData.customerName || '').split(' ')[0] || '',
                  lastName: (validatedData.customerName || '').split(' ').slice(1).join(' ') || '',
                  email: validatedData.customerEmail,
                  phone: (body?.customerPhone as string) || undefined,
                  source: 'Website Booking'
                });
                ghlContactId = created?.id || created?.contact?.id || null;
              }
              if (ghlContactId) {
                await createGhlOpportunity(ghlContactId, {
                  name: `${service.name} – ${validatedData.customerName}`,
                  status: 'open',
                  source: 'Website Booking',
                  monetaryValue: getGhlServiceValue(String(service.serviceType).toLowerCase().replace(/_/g, '-'), 1),
                });
              }
            } catch (opErr) {
              console.error('GHL opportunity fallback failed (non-blocking):', opErr);
            }
          } else {
            console.warn('Skipping opportunity fallback because failure was not due to slot availability');
          }
        }
      }
    } catch (e) {
      console.error('GHL immediate create (wrapper) failed (non-blocking):', e);
    }

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        confirmationNumber: booking.id,
        scheduledDateTime: booking.scheduledDateTime,
        totalAmount: booking.priceAtBooking,
        service: {
          name: service.name,
          serviceType: service.serviceType,
        },
      },
    });
  } catch (error: any) {
    console.error('Error in POST /api/booking/create:', error);
    if (error.name === 'ZodError') {
      return NextResponse.json({ message: 'Validation failed', errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ message: 'Internal Server Error', error: getErrorMessage(error) }, { status: 500 });
  }
}
