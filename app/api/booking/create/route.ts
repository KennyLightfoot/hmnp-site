import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { businessRulesEngine } from '@/lib/business-rules';
import { pricingEngine } from '@/lib/pricing';
import { slotReservation } from '@/lib/slot-reservation';
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

    const businessRulesResult = await businessRulesEngine.validate({
      serviceType: service.serviceType,
      documentCount: validatedData.numberOfDocuments,
      signerCount: validatedData.numberOfSigners,
      scheduledDateTime: validatedData.scheduledDateTime,
    });

    if (!businessRulesResult.isValid) {
      return NextResponse.json({ message: 'Business rule validation failed', errors: businessRulesResult.violations }, { status: 400 });
    }

    const booking = await prisma.booking.create({
      data: {
        serviceId: validatedData.serviceId,
        customerName: validatedData.customerName,
        customerEmail: validatedData.customerEmail,
        customerPhone: validatedData.customerPhone || undefined,
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

    await slotReservation.confirmReservation(validatedData.reservationId);

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