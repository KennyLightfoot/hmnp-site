import { parseISO, addMinutes, setMinutes, setSeconds, setMilliseconds } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { logger } from '@/lib/logger';
import { createAppointment as _createAppointment, AppointmentData } from './management';

interface CreateGhlAppointmentOpts {
  calendarId: string;
  contactId: string;
  start: string; // ISO in America/Chicago
  durationMins: number;
  bufferMins: number;
  title: string;
  address?: string;
}

/**
 * Round a Date to the nearest upper 15-minute boundary.
 */
export function roundToQuarter(dt: Date): Date {
  const minutes = dt.getMinutes();
  const rounded = Math.ceil(minutes / 15) * 15;
  const baseDate = setMilliseconds(setSeconds(setMinutes(dt, 0), 0), 0);
  return addMinutes(baseDate, rounded);
}

export async function createGhlAppointment(opts: CreateGhlAppointmentOpts) {
  const tz = 'America/Chicago';
  const startDT = roundToQuarter(toZonedTime(parseISO(opts.start), tz));
  const endDT = addMinutes(startDT, opts.durationMins + opts.bufferMins);

  const payload: AppointmentData = {
    calendarId: opts.calendarId,
    contactId: opts.contactId,
    startTime: startDT.toISOString(),
    endTime: endDT.toISOString(),
    title: opts.title,
    appointmentStatus: 'confirmed',
    address: opts.address ?? 'Remote/Online Service',
    ignoreDateRange: false,
    toNotify: true,
  } as const;

  logger.info('Creating GHL appointment', 'GHL_APPOINTMENTS', { payload });

  return _createAppointment(payload);
} 