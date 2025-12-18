import { setHours, setMinutes, getMinutes, addMinutes, isBefore, isAfter } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

interface BusinessHours { startTime: string; endTime: string }
const DEFAULT_DURATION_MINS = 60;
const DEFAULT_BUFFER_MINS = 15;
const SLOT_INTERVAL_MINS = 15;

type SlotGenerationParams = {
  businessHours: BusinessHours;
  requestedDate: Date;
  serviceId: string;
  existingBookings: any[];
  minimumBookingTime: Date;
  businessTimezone: string;
};

export async function generateAvailableSlots(params: SlotGenerationParams) {
  const { businessHours, requestedDate, existingBookings, minimumBookingTime, businessTimezone } = params;
  const durationMins = DEFAULT_DURATION_MINS;
  const bufferMins = DEFAULT_BUFFER_MINS;

  // Set start and end of business day
  let startOfDay = setHours(requestedDate, Number.parseInt(businessHours.startTime.split(':')[0]!));
  startOfDay = setMinutes(startOfDay, Number.parseInt(businessHours.startTime.split(':')[1]!));

  let endOfDay = setHours(requestedDate, Number.parseInt(businessHours.endTime.split(':')[0]!));
  endOfDay = setMinutes(endOfDay, Number.parseInt(businessHours.endTime.split(':')[1]!));

  const slots: any[] = [];
  let currentTime = isAfter(startOfDay, minimumBookingTime) ? startOfDay : minimumBookingTime;

  // Round up to next slot interval
  const remainder = getMinutes(currentTime) % SLOT_INTERVAL_MINS;
  if (remainder !== 0) {
    currentTime = addMinutes(currentTime, SLOT_INTERVAL_MINS - remainder);
  }

  while (!isAfter(addMinutes(currentTime, durationMins), endOfDay)) {
    const slotEnd = addMinutes(currentTime, durationMins);
    const isOverlapping = existingBookings.some((booking) => {
      const bookingStart = toZonedTime(booking.scheduledDateTime, businessTimezone);
      const bookingEnd = addMinutes(bookingStart, (booking.service.durationMinutes || 60) + (booking.service.bufferMinutes || 15));
      return isBefore(currentTime, bookingEnd) && isAfter(slotEnd, bookingStart);
    });
    slots.push({
      startTime: currentTime.toISOString(),
      endTime: slotEnd.toISOString(),
      available: !isOverlapping,
    });
    currentTime = addMinutes(currentTime, SLOT_INTERVAL_MINS);
  }
  return slots;
}