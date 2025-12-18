/**
 * Date Utility Helpers using date-fns
 * Provides a consistent interface for date operations across the application
 */

import {
  format,
  parseISO,
  isValid,
  isBefore,
  isAfter,
  addDays,
  addHours,
  addMinutes,
  addWeeks,
  addMonths,
  subDays,
  subHours,
  subMinutes,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInSeconds,
  getHours,
  getMinutes,
  getDay,
  setHours,
  setMinutes,
  parse,
} from 'date-fns';
import {
  formatInTimeZone,
  toZonedTime,
  fromZonedTime,
  getTimezoneOffset,
} from 'date-fns-tz';

// Constants
export const DEFAULT_TIMEZONE = 'America/Chicago';
export const DATE_FORMAT = 'yyyy-MM-dd';
export const DATETIME_FORMAT = 'yyyy-MM-dd HH:mm:ss';
export const TIME_FORMAT = 'HH:mm';
export const DISPLAY_DATE_FORMAT = 'MMM dd, yyyy';
export const DISPLAY_DATETIME_FORMAT = 'MMM dd, yyyy h:mm a';

// Type helpers
type DateInput = Date | string | number;

const parseDate = (date: DateInput): Date => {
  if (date instanceof Date) return date;
  if (typeof date === 'string') return parseISO(date);
  if (typeof date === 'number') return new Date(date);
  throw new Error('Invalid date input');
};

// Format helpers
export const formatDate = (date: DateInput, formatStr = DATE_FORMAT): string => {
  const d = parseDate(date);
  return format(d, formatStr);
};

export const formatDateTime = (date: DateInput, formatStr = DATETIME_FORMAT): string => {
  const d = parseDate(date);
  return format(d, formatStr);
};

export const formatTime = (date: DateInput, formatStr = TIME_FORMAT): string => {
  const d = parseDate(date);
  return format(d, formatStr);
};

export const formatDisplayDate = (date: DateInput): string => {
  return formatDate(date, DISPLAY_DATE_FORMAT);
};

export const formatDisplayDateTime = (date: DateInput): string => {
  return formatDate(date, DISPLAY_DATETIME_FORMAT);
};

// Timezone helpers
export const formatInTz = (
  date: DateInput,
  timezone = DEFAULT_TIMEZONE,
  formatStr = DATETIME_FORMAT
): string => {
  const d = parseDate(date);
  return formatInTimeZone(d, timezone, formatStr);
};

export const toTimezone = (date: DateInput, timezone = DEFAULT_TIMEZONE): Date => {
  const d = parseDate(date);
  return toZonedTime(d, timezone);
};

export const fromTimezone = (date: DateInput, timezone = DEFAULT_TIMEZONE): Date => {
  const d = parseDate(date);
  return fromZonedTime(d, timezone);
};

export const getTimezoneOffsetMs = (timezone = DEFAULT_TIMEZONE): number => {
  return getTimezoneOffset(timezone);
};

// Comparison helpers
export const isBeforeDate = (date1: DateInput, date2: DateInput): boolean => {
  const d1 = parseDate(date1);
  const d2 = parseDate(date2);
  return isBefore(d1, d2);
};

export const isAfterDate = (date1: DateInput, date2: DateInput): boolean => {
  const d1 = parseDate(date1);
  const d2 = parseDate(date2);
  return isAfter(d1, d2);
};

export const isSameOrBefore = (date1: DateInput, date2: DateInput): boolean => {
  const d1 = parseDate(date1);
  const d2 = parseDate(date2);
  return isBefore(d1, d2) || d1.getTime() === d2.getTime();
};

export const isSameOrAfter = (date1: DateInput, date2: DateInput): boolean => {
  const d1 = parseDate(date1);
  const d2 = parseDate(date2);
  return isAfter(d1, d2) || d1.getTime() === d2.getTime();
};

// Addition helpers
export const addDaysToDate = (date: DateInput, amount: number): Date => {
  const d = parseDate(date);
  return addDays(d, amount);
};

export const addHoursToDate = (date: DateInput, amount: number): Date => {
  const d = parseDate(date);
  return addHours(d, amount);
};

export const addMinutesToDate = (date: DateInput, amount: number): Date => {
  const d = parseDate(date);
  return addMinutes(d, amount);
};

export const addWeeksToDate = (date: DateInput, amount: number): Date => {
  const d = parseDate(date);
  return addWeeks(d, amount);
};

export const addMonthsToDate = (date: DateInput, amount: number): Date => {
  const d = parseDate(date);
  return addMonths(d, amount);
};

// Subtraction helpers
export const subDaysFromDate = (date: DateInput, amount: number): Date => {
  const d = parseDate(date);
  return subDays(d, amount);
};

export const subHoursFromDate = (date: DateInput, amount: number): Date => {
  const d = parseDate(date);
  return subHours(d, amount);
};

export const subMinutesFromDate = (date: DateInput, amount: number): Date => {
  const d = parseDate(date);
  return subMinutes(d, amount);
};

// Start/End helpers
export const getStartOfDay = (date: DateInput): Date => {
  const d = parseDate(date);
  return startOfDay(d);
};

export const getEndOfDay = (date: DateInput): Date => {
  const d = parseDate(date);
  return endOfDay(d);
};

export const getStartOfWeek = (date: DateInput): Date => {
  const d = parseDate(date);
  return startOfWeek(d);
};

export const getEndOfWeek = (date: DateInput): Date => {
  const d = parseDate(date);
  return endOfWeek(d);
};

export const getStartOfMonth = (date: DateInput): Date => {
  const d = parseDate(date);
  return startOfMonth(d);
};

export const getEndOfMonth = (date: DateInput): Date => {
  const d = parseDate(date);
  return endOfMonth(d);
};

// Difference helpers
export const getDaysBetween = (date1: DateInput, date2: DateInput): number => {
  const d1 = parseDate(date1);
  const d2 = parseDate(date2);
  return differenceInDays(d2, d1);
};

export const getHoursBetween = (date1: DateInput, date2: DateInput): number => {
  const d1 = parseDate(date1);
  const d2 = parseDate(date2);
  return differenceInHours(d2, d1);
};

export const getMinutesBetween = (date1: DateInput, date2: DateInput): number => {
  const d1 = parseDate(date1);
  const d2 = parseDate(date2);
  return differenceInMinutes(d2, d1);
};

export const getSecondsBetween = (date1: DateInput, date2: DateInput): number => {
  const d1 = parseDate(date1);
  const d2 = parseDate(date2);
  return differenceInSeconds(d2, d1);
};

// Get/Set helpers
export const getHour = (date: DateInput): number => {
  const d = parseDate(date);
  return getHours(d);
};

export const getMinute = (date: DateInput): number => {
  const d = parseDate(date);
  return getMinutes(d);
};

export const getDayOfWeek = (date: DateInput): number => {
  const d = parseDate(date);
  return getDay(d);
};

export const setHour = (date: DateInput, hours: number): Date => {
  const d = parseDate(date);
  return setHours(d, hours);
};

export const setMinute = (date: DateInput, minutes: number): Date => {
  const d = parseDate(date);
  return setMinutes(d, minutes);
};

// Validation
export const isValidDate = (date: DateInput): boolean => {
  try {
    const d = parseDate(date);
    return isValid(d);
  } catch {
    return false;
  }
};

// Current time helpers
export const now = (): Date => new Date();

export const nowInTz = (timezone = DEFAULT_TIMEZONE): Date => {
  return toZonedTime(new Date(), timezone);
};

export const todayInTz = (timezone = DEFAULT_TIMEZONE): Date => {
  return startOfDay(toZonedTime(new Date(), timezone));
};

// Parsing helpers
export const parseCustomFormat = (
  dateString: string,
  formatString: string,
  referenceDate = new Date()
): Date => {
  return parse(dateString, formatString, referenceDate);
};

// Business hours helpers (common use case)
export const isBusinessHours = (
  date: DateInput = new Date(),
  timezone = DEFAULT_TIMEZONE,
  startHour = 9,
  endHour = 17
): boolean => {
  const d = toZonedTime(parseDate(date), timezone);
  const hour = getHours(d);
  const day = getDay(d);

  // Monday = 1, Friday = 5, Saturday = 6, Sunday = 0
  if (day === 0 || day === 6) return false;
  return hour >= startHour && hour < endHour;
};

// Date range helpers
export const isWithinRange = (
  date: DateInput,
  startDate: DateInput,
  endDate: DateInput
): boolean => {
  const d = parseDate(date);
  const start = parseDate(startDate);
  const end = parseDate(endDate);

  return !isBefore(d, start) && !isAfter(d, end);
};

// Export all date-fns functions for advanced use
export {
  format,
  parseISO,
  isValid,
  isBefore,
  isAfter,
  addDays,
  addHours,
  addMinutes,
  startOfDay,
  endOfDay,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  parse,
} from 'date-fns';

export {
  formatInTimeZone,
  toZonedTime,
  fromZonedTime,
  getTimezoneOffset,
} from 'date-fns-tz';
