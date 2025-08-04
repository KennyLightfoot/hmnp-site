import { DateTime } from 'luxon';
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
 * Round a DateTime to the nearest upper 15-minute boundary in the same zone.
 */
export function roundToQuarter(dt: DateTime): DateTime {
  const minutes = dt.minute;
  const rounded = Math.ceil(minutes / 15) * 15;
  return dt.set({ minute: 0, second: 0, millisecond: 0 }).plus({ minutes: rounded });
}

export async function createGhlAppointment(opts: CreateGhlAppointmentOpts) {
  const tz = 'America/Chicago';
  const startDT = roundToQuarter(DateTime.fromISO(opts.start, { zone: tz }));
  const endDT = startDT.plus({ minutes: opts.durationMins + opts.bufferMins });

  const payload: AppointmentData = {
    calendarId: opts.calendarId,
    contactId: opts.contactId,
    startTime: startDT.toISO({ suppressSeconds: true, suppressMilliseconds: true }) || '',
    endTime: endDT.toISO({ suppressSeconds: true, suppressMilliseconds: true }) || '',
    title: opts.title,
    appointmentStatus: 'confirmed',
    address: opts.address ?? 'Remote/Online Service',
    ignoreDateRange: false,
    toNotify: true,
  } as const;

  logger.info('Creating GHL appointment', 'GHL_APPOINTMENTS', { payload });

  return _createAppointment(payload);
} 