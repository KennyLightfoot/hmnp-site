import { DateTime } from 'luxon';
import { prisma } from '@/lib/prisma';
import { roundToQuarter } from '@/lib/utils/time';

// Minimal subset needed for slot generation
interface BusinessHours {
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
  dayOfWeek: number; // 0-6 or 1-7 (not used here)
}

const DEFAULT_BUFFER_MINS = 15;

interface SlotGenerationParams {
  businessHours: BusinessHours;
  requestedDate: DateTime;
  serviceId: string;
  existingBookings: any[];
  minimumBookingTime: DateTime;
  businessTimezone: string;
}

export async function generateAvailableSlots(params: SlotGenerationParams) {
  const {
    businessHours,
    requestedDate,
    serviceId,
    existingBookings,
    minimumBookingTime,
    businessTimezone,
  } = params;

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  const durationMins = service?.durationMinutes ?? 60;
  const bufferMins = (service as any)?.bufferMinutes ?? DEFAULT_BUFFER_MINS;
  const totalSlotTime = durationMins + bufferMins;

  const startOfDay = requestedDate.set({
    hour: parseInt(businessHours.startTime.split(':')[0]),
    minute: parseInt(businessHours.startTime.split(':')[1]),
  });

  const endOfDay = requestedDate.set({
    hour: parseInt(businessHours.endTime.split(':')[0]),
    minute: parseInt(businessHours.endTime.split(':')[1]),
  });

  const slots = [];
  let currentTime = roundToQuarter(startOfDay > minimumBookingTime ? startOfDay : minimumBookingTime);

  while (currentTime.plus({ minutes: totalSlotTime }) <= endOfDay) {
    const slotEnd = currentTime.plus({ minutes: durationMins });

    const isOverlapping = existingBookings.some(booking => {
      const bookingStart = DateTime.fromJSDate(booking.scheduledDateTime, { zone: businessTimezone });
      const bookingEnd = bookingStart.plus({ minutes: booking.service.durationMinutes + ((booking.service as any)?.bufferMinutes ?? DEFAULT_BUFFER_MINS) });
      return currentTime < bookingEnd && slotEnd > bookingStart;
    });

    if (!isOverlapping) {
      slots.push({
        startTime: currentTime.toISO(),
        endTime: slotEnd.toISO(),
      });
    }

    currentTime = currentTime.plus({ minutes: 15 });
  }

  return slots;
} 