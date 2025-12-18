import { addMinutes, setMinutes, setSeconds, setMilliseconds } from 'date-fns';

/**
 * Round a Date **up** to the next 15-minute boundary.
 * e.g., 10:01 -> 10:15, 10:15 -> 10:15, 10:16 -> 10:30
 */
export function roundToQuarter(dt: Date): Date {
  const minutes = dt.getMinutes();
  const rounded = Math.ceil(minutes / 15) * 15;
  const baseDate = setMilliseconds(setSeconds(setMinutes(dt, 0), 0), 0);
  return addMinutes(baseDate, rounded);
} 