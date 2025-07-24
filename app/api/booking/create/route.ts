import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { validateBusinessRules } from '@/lib/business-rules/engine';
import { pricingEngine } from '@/lib/pricing';
import { convertToBooking } from '@/lib/slot-reservation';
import { BookingCreateRequestSchema } from '@/lib/validation/booking';
import { processBookingJob } from '@/lib/bullmq/booking-processor';

const STATE_REGEX = /^[A-Za-z\s]{2,100}$/;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = BookingCreateRequestSchema.parse(body);

    const service = await prisma.service.findUnique({
      where: { id: validatedData.serviceId },
    });

    if (!service) {
      return NextResponse.json({ message: 'Service not found' }, { status: 404 });
    }

    const pricingResult = await pricingEngine.calculatePrice({
      serviceType: service.serviceType,
      scheduledDateTime: validatedData.scheduledDateTime,
      documentCount: validatedData.numberOfDocuments,
      signerCount: validatedData.numberOfSigners,
      options: {
        priority: validatedData.priority,
        sameDay: validatedData.sameDay,
      },
    });

    if (!pricingResult.success) {
      return NextResponse.json({ message: 'Price calculation failed', errors: pricingResult.errors }, { status: 400 });
    }

    const { isValid, violations } = await validateBusinessRules({
      serviceType: service.serviceType,
      documentCount: validatedData.numberOfDocuments,
      scheduledDateTime: validatedData.scheduledDateTime,
    });

    if (!isValid) {
      return NextResponse.json({ message: 'Business rule validation failed', errors: violations }, { status: 400 });
    }

    const booking = await prisma.booking.create({
      data: {
        serviceId: validatedData.serviceId,
        customerName: validatedData.customerName,
        customerEmail: validatedData.customerEmail,
        scheduledDateTime: validatedData.scheduledDateTime,
        addressStreet: validatedData.addressStreet || undefined,
        addressCity: validatedData.addressCity || undefined,
        addressState: validatedData.addressState || undefined,
        addressZip: validatedData.addressZip || undefined,
        priceAtBooking: pricingResult.totalPrice,
        depositStatus: 'COMPLETED',
        status: 'CONFIRMED',
      },
    });

    if (validatedData.reservationId) {
      await convertToBooking(validatedData.reservationId, booking.id);
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
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}