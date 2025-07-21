import { prisma } from '@/lib/prisma';
// Stripe removed – payment will be handled later
import { DateTime } from 'luxon';

interface CreateBookingParams {
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  serviceId: string;
  scheduledDateTime: string; // ISO string from client (America/Chicago by default)
  timezone?: string;
}

export class BookingService {
  /**
   * Create a booking + Stripe payment intent in one shot.
   * Simplified – no Redis, no queues, limited to essential fields only.
   */
  async createBooking(params: CreateBookingParams) {
    const {
      customerEmail,
      customerName,
      customerPhone,
      serviceId,
      scheduledDateTime,
      timezone = 'America/Chicago',
    } = params;

    // 1. Parse + validate datetime
    const appointmentTime = this.parseDateTime(scheduledDateTime, timezone);

    // 2. Basic availability check (database only)
    const available = await this.checkAvailability(serviceId, appointmentTime);
    if (!available) {
      throw new Error('Time slot no longer available');
    }

    // 3. Retrieve service for pricing
    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) {
      throw new Error('Service not found');
    }

    const basePrice = typeof service.basePrice === 'object' && 'toNumber' in service.basePrice
      ? (service.basePrice as any).toNumber()
      : Number(service.basePrice);

    // 4. Create booking record (PENDING_PAYMENT)
    const confirmationCode = this.generateConfirmationCode();

    const booking = await prisma.booking.create({
      data: {
        serviceId,
        customerEmail,
        scheduledDateTime: appointmentTime.toJSDate(),
        status: 'PAYMENT_PENDING',
        priceAtBooking: basePrice,
        notes: `confirmationCode:${confirmationCode}`,
        depositStatus: 'PENDING',
      },
    });

    // 5. Return booking – no payment intent
    return {
      booking: {
        id: booking.id,
        confirmationCode,
        scheduledDateTime: booking.scheduledDateTime,
        amount: basePrice,
        status: booking.status,
      },
      paymentClientSecret: null, // No client secret
    };
  }

  async checkAvailability(serviceId: string, appointmentTime: DateTime): Promise<boolean> {
    const existing = await prisma.booking.findFirst({
      where: {
        serviceId,
        scheduledDateTime: appointmentTime.toJSDate(),
        status: {
          in: ['CONFIRMED', 'PAYMENT_PENDING'],
        },
      },
    });
    return !existing;
  }

  async confirmBooking(paymentIntentId: string) {
    // Minimal confirmation logic – find booking by paymentIntentId in notes
    const booking = await prisma.booking.findFirst({
      where: {
        notes: {
          contains: `paymentIntent:${paymentIntentId}`,
        },
      },
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    return prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: 'CONFIRMED',
        depositStatus: 'COMPLETED',
      },
    });
  }

  private parseDateTime(input: string, timezone: string): DateTime {
    const dt = DateTime.fromISO(input, { zone: timezone });
    if (!dt.isValid) {
      throw new Error('Invalid date/time format');
    }
    if (dt <= DateTime.now().setZone(timezone)) {
      throw new Error('Appointment must be in the future');
    }
    return dt;
  }

  private generateConfirmationCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
} 