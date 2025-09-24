import { DateTime } from "luxon";

interface BusinessHours { startTime: string; endTime: string }
const DEFAULT_DURATION_MINS = 60;
const DEFAULT_BUFFER_MINS = 15;
const SLOT_INTERVAL_MINS = 15;

type SlotGenerationParams = {
  businessHours: BusinessHours;
  requestedDate: DateTime;
  serviceId: string;
  existingBookings: any[];
  minimumBookingTime: DateTime;
  businessTimezone: string;
};

export async function generateAvailableSlots(params: SlotGenerationParams) {
  const { businessHours, requestedDate, existingBookings, minimumBookingTime, businessTimezone } = params;
  const durationMins = DEFAULT_DURATION_MINS;
  const bufferMins = DEFAULT_BUFFER_MINS;
  const startOfDay = requestedDate.set({
    hour: Number.parseInt(businessHours.startTime.split(':')[0]!),
    minute: Number.parseInt(businessHours.startTime.split(':')[1]!),
  });
  const endOfDay = requestedDate.set({
    hour: Number.parseInt(businessHours.endTime.split(':')[0]!),
    minute: Number.parseInt(businessHours.endTime.split(':')[1]!),
  });
  const slots: any[] = [];
  let currentTime = startOfDay > minimumBookingTime ? startOfDay : minimumBookingTime;
  const remainder = currentTime.minute % SLOT_INTERVAL_MINS;
  if (remainder !== 0) currentTime = currentTime.plus({ minutes: SLOT_INTERVAL_MINS - remainder });
  while (currentTime.plus({ minutes: durationMins }) <= endOfDay) {
    const slotEnd = currentTime.plus({ minutes: durationMins });
    const isOverlapping = existingBookings.some((booking) => {
      const bookingStart = DateTime.fromJSDate(booking.scheduledDateTime, { zone: businessTimezone });
      const bookingEnd = bookingStart.plus({ minutes: (booking.service.durationMinutes || 60) + (booking.service.bufferMinutes || 15) });
      return currentTime < bookingEnd && slotEnd > bookingStart;
    });
    slots.push({
      startTime: currentTime.toISO(),
      endTime: slotEnd.toISO(),
      available: !isOverlapping,
    });
    currentTime = currentTime.plus({ minutes: SLOT_INTERVAL_MINS });
  }
  return slots;
}