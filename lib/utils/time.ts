import { DateTime } from 'luxon';

/**
 * Round a DateTime **up** to the next 15-minute boundary.
 * e.g., 10:01 -> 10:15, 10:15 -> 10:15, 10:16 -> 10:30
 */
export function roundToQuarter(dt: DateTime): DateTime {
  const minute = dt.minute;
  if (minute % 15 === 0) return dt; // Already on a boundary

  const rounded = Math.ceil(minute / 15) * 15;
  return dt.set({ minute: 0, second: 0, millisecond: 0 }).plus({ minutes: rounded });
} 