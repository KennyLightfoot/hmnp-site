import { NextRequest, NextResponse } from 'next/server';
import { getErrorMessage } from '@/lib/utils/error-utils';
import { prisma } from '@/lib/db';
// import { validateBusinessRules } from '@/lib/business-rules/engine';
// import { pricingEngine } from '@/lib/pricing-engine';
import { convertToBooking } from '@/lib/slot-reservation';
import { bookingSchemas } from '@/lib/validation/schemas';
import { processBookingJob } from '@/lib/bullmq/booking-processor';
import { ServiceType, BookingStatus } from '@prisma/client';
import { z } from 'zod';

export const BookingSchema = bookingSchemas.createBookingFromForm;

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
        status: { notIn: [BookingStatus.CANCELLED] },
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

    const booking = await prisma.booking.create({
      data: {
        serviceId: service.id,
        customerName: validatedData.customerName,
        customerEmail: validatedData.customerEmail,
        scheduledDateTime: new Date(validatedData.scheduledDateTime),
        addressStreet: validatedData.locationAddress || undefined,
        priceAtBooking: 0, //pricingResult.totalPrice,
        depositStatus: 'COMPLETED',
        status: 'CONFIRMED',
      },
    });

    // Link reservation to booking if provided
    if (reservationId) {
      await convertToBooking(reservationId, booking.id);
    }

    await processBookingJob(booking.id);

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
