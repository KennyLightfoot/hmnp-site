import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { promoCodeService } from '@/lib/services/promo-code';
import { settingsService } from '@/lib/services/settings';
import { addMinutes, startOfDay, format, parse } from 'date-fns';

export async function POST(request: NextRequest) {
  try {
    const {
      serviceId,
      scheduledDateTime,
      customerName,
      customerEmail,
      customerPhone,
      locationType,
      addressStreet,
      addressCity,
      addressState,
      addressZip,
      locationNotes,
      notes,
      promoCode
    } = await request.json();

    // Validate required fields
    if (!serviceId || !scheduledDateTime || !customerName || !customerEmail) {
      return NextResponse.json(
        { error: 'ServiceId, scheduledDateTime, customerName, and customerEmail are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Get service details
    const service = await prisma.service.findUnique({
      where: { id: serviceId }
    });

    if (!service || !service.active) {
      return NextResponse.json(
        { error: 'Service not found or inactive' },
        { status: 404 }
      );
    }

    const requestedDateTime = new Date(scheduledDateTime);
    if (isNaN(requestedDateTime.getTime())) {
      return NextResponse.json(
        { error: 'Invalid scheduledDateTime format' },
        { status: 400 }
      );
    }

    // Re-validate availability (double-check to prevent race conditions)
    const bookingSettings = await settingsService.getBookingSettings();
    const dayName = requestedDateTime.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const daySettings = bookingSettings.businessHours[dayName as keyof typeof bookingSettings.businessHours];
    
    if (!daySettings?.enabled) {
      return NextResponse.json(
        { error: 'Selected date is not available for bookings' },
        { status: 400 }
      );
    }

    // Check if time slot is still available
    const startOfRequestedDay = startOfDay(requestedDateTime);
    const endTime = addMinutes(startOfRequestedDay, 24 * 60); // End of day
    
    const conflictingBookings = await prisma.booking.findMany({
      where: {
        scheduledDateTime: {
          gte: startOfRequestedDay,
          lt: endTime
        },
        status: {
          in: ['CONFIRMED', 'SCHEDULED', 'PAYMENT_PENDING', 'READY_FOR_SERVICE', 'IN_PROGRESS']
        }
      },
      include: {
        service: {
          select: {
            durationMinutes: true
          }
        }
      }
    });

    // Check for conflicts
    const hasConflict = conflictingBookings.some(booking => {
      const bookingStart = new Date(booking.scheduledDateTime!);
      const bookingEnd = addMinutes(bookingStart, booking.service.duration + bookingSettings.bufferTimeMinutes);
      const requestedStart = requestedDateTime;
      const requestedEnd = addMinutes(requestedDateTime, service.duration + bookingSettings.bufferTimeMinutes);
      
      return (
        (requestedStart >= bookingStart && requestedStart < bookingEnd) ||
        (requestedEnd > bookingStart && requestedEnd <= bookingEnd) ||
        (requestedStart <= bookingStart && requestedEnd >= bookingEnd)
      );
    });

    if (hasConflict) {
      return NextResponse.json(
        { error: 'Selected time slot is no longer available' },
        { status: 409 }
      );
    }

    // Handle promo code validation if provided
    let promoCodeData: any = null;
    let discountAmount = 0;
    let depositAmount = Number(service.depositAmount);

    if (promoCode) {
      const validationResult = await promoCodeService.validatePromoCode(
        promoCode,
        serviceId,
        depositAmount,
        customerEmail
      );

      if (!validationResult.isValid) {
        return NextResponse.json(
          { error: validationResult.error },
          { status: 400 }
        );
      }

      promoCodeData = validationResult.promoCode;
      discountAmount = validationResult.discountAmount || 0;
      depositAmount = validationResult.finalAmount || depositAmount;
    }

    // Create or get user
    let user = await prisma.user.findUnique({
      where: { email: customerEmail }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: customerName,
          email: customerEmail,
          role: 'SIGNER'
        }
      });
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        signerId: user.id,
        serviceId,
        scheduledDateTime: requestedDateTime,
        status: 'PAYMENT_PENDING',
        locationType: locationType || 'CLIENT_SPECIFIED_ADDRESS',
        addressStreet,
        addressCity,
        addressState,
        addressZip,
        locationNotes,
        priceAtBooking: service.price,
        depositAmount,
        depositStatus: 'PENDING',
        promoCodeId: promoCodeData?.id,
        promoCodeDiscount: discountAmount,
        notes
      },
      include: {
        service: true,
        signer: true,
        promoCode: true
      }
    });

    // If promo code was used, apply it (increment usage count)
    if (promoCodeData) {
      await promoCodeService.applyPromoCode(promoCodeData.id, booking.id);
    }

    return NextResponse.json({
      booking: {
        id: booking.id,
        scheduledDateTime: booking.scheduledDateTime,
        status: booking.status,
        service: {
          name: booking.service.name,
                  duration: booking.service.duration,
        price: booking.service.price
        },
        customer: {
                  name: booking.signer?.name,
        email: booking.signer?.email
        },
        depositAmount: booking.depositAmount,
        promoCode: promoCodeData ? {
          code: promoCodeData.code,
          discountAmount
        } : null,
        location: {
          type: booking.locationType,
          address: {
            street: booking.addressStreet,
            city: booking.addressCity,
            state: booking.addressState,
            zip: booking.addressZip
          },
          notes: booking.locationNotes
        }
      }
    });

  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 