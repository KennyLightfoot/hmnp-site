# Date Library Migration Guide
**Consolidating to date-fns**

## Overview

The project currently uses three date/time libraries:
- `moment` + `moment-timezone` (2 packages)
- `luxon` + `@types/luxon` (2 packages)
- `date-fns` + `date-fns-tz` (2 packages - KEEP THESE)

This guide helps migrate all moment and luxon usage to date-fns.

---

## Why date-fns?

1. ✅ Already on v4 (most modern)
2. ✅ Tree-shakeable (smaller bundle)
3. ✅ Functional, immutable API
4. ✅ TypeScript native support
5. ✅ Active development
6. ✅ Comprehensive timezone support via `date-fns-tz`

---

## Common Migration Patterns

### From Moment.js

```typescript
// ❌ OLD - Moment
import moment from 'moment';
import 'moment-timezone';

const now = moment();
const formatted = moment().format('YYYY-MM-DD HH:mm:ss');
const isBefore = moment(date1).isBefore(date2);
const added = moment().add(7, 'days');
const startOf = moment().startOf('day');
const tz = moment.tz(date, 'America/Chicago');

// ✅ NEW - date-fns
import {
  format,
  isBefore,
  addDays,
  startOfDay,
  parseISO
} from 'date-fns';
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';

const now = new Date();
const formatted = format(now, 'yyyy-MM-dd HH:mm:ss');
const isBeforeResult = isBefore(date1, date2);
const added = addDays(now, 7);
const startOf = startOfDay(now);
const tz = toZonedTime(date, 'America/Chicago');
```

### From Luxon

```typescript
// ❌ OLD - Luxon
import { DateTime } from 'luxon';

const now = DateTime.now();
const formatted = DateTime.now().toFormat('yyyy-MM-dd HH:mm:ss');
const isBefore = dt1 < dt2;
const added = DateTime.now().plus({ days: 7 });
const startOf = DateTime.now().startOf('day');
const tz = DateTime.now().setZone('America/Chicago');

// ✅ NEW - date-fns
import {
  format,
  isBefore,
  addDays,
  startOfDay,
  parseISO
} from 'date-fns';
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';

const now = new Date();
const formatted = format(now, 'yyyy-MM-dd HH:mm:ss');
const isBeforeResult = isBefore(date1, date2);
const added = addDays(now, 7);
const startOf = startOfDay(now);
const tz = toZonedTime(now, 'America/Chicago');
```

---

## Format String Conversion

### Moment → date-fns

| Moment | date-fns | Description |
|--------|----------|-------------|
| `YYYY` | `yyyy` | 4-digit year |
| `YY` | `yy` | 2-digit year |
| `M` | `M` | Month (1-12) |
| `MM` | `MM` | Month (01-12) |
| `MMM` | `MMM` | Month short name |
| `MMMM` | `MMMM` | Month full name |
| `D` | `d` | Day of month |
| `DD` | `dd` | Day of month (01-31) |
| `d` | `i` | Day of week (0-6) |
| `dd` | `eeeeee` | Day of week min |
| `ddd` | `eee` | Day of week short |
| `dddd` | `eeee` | Day of week full |
| `H` | `H` | Hour (0-23) |
| `HH` | `HH` | Hour (00-23) |
| `h` | `h` | Hour (1-12) |
| `hh` | `hh` | Hour (01-12) |
| `m` | `m` | Minute |
| `mm` | `mm` | Minute (00-59) |
| `s` | `s` | Second |
| `ss` | `ss` | Second (00-59) |
| `A` | `a` | AM/PM |
| `Z` | `XXX` | Timezone offset |
| `ZZ` | `XX` | Timezone offset |

---

## Step-by-Step Migration

### 1. Create Utility Helpers

Create `lib/utils/date-helpers.ts`:

```typescript
import {
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
  differenceInMinutes
} from 'date-fns';
import {
  formatInTimeZone,
  toZonedTime,
  fromZonedTime,
  getTimezoneOffset
} from 'date-fns-tz';

// Constants
export const DEFAULT_TIMEZONE = 'America/Chicago';
export const DATE_FORMAT = 'yyyy-MM-dd';
export const DATETIME_FORMAT = 'yyyy-MM-dd HH:mm:ss';
export const TIME_FORMAT = 'HH:mm';

// Format helpers
export const formatDate = (date: Date | string, formatStr = DATE_FORMAT): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, formatStr);
};

export const formatDateTime = (date: Date | string, formatStr = DATETIME_FORMAT): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, formatStr);
};

export const formatInTz = (
  date: Date | string,
  timezone = DEFAULT_TIMEZONE,
  formatStr = DATETIME_FORMAT
): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatInTimeZone(d, timezone, formatStr);
};

// Timezone helpers
export const toTimezone = (date: Date | string, timezone = DEFAULT_TIMEZONE): Date => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return toZonedTime(d, timezone);
};

export const fromTimezone = (date: Date | string, timezone = DEFAULT_TIMEZONE): Date => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return fromZonedTime(d, timezone);
};

// Comparison helpers
export const isBeforeDate = (date1: Date | string, date2: Date | string): boolean => {
  const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
  const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
  return isBefore(d1, d2);
};

export const isAfterDate = (date1: Date | string, date2: Date | string): boolean => {
  const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
  const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
  return isAfter(d1, d2);
};

// Addition helpers
export const addDaysToDate = (date: Date | string, amount: number): Date => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return addDays(d, amount);
};

export const addHoursToDate = (date: Date | string, amount: number): Date => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return addHours(d, amount);
};

// Start/End helpers
export const getStartOfDay = (date: Date | string): Date => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return startOfDay(d);
};

export const getEndOfDay = (date: Date | string): Date => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return endOfDay(d);
};

// Difference helpers
export const getDaysBetween = (date1: Date | string, date2: Date | string): number => {
  const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
  const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
  return differenceInDays(d2, d1);
};

export const getHoursBetween = (date1: Date | string, date2: Date | string): number => {
  const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
  const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
  return differenceInHours(d2, d1);
};

// Validation
export const isValidDate = (date: Date | string): boolean => {
  if (typeof date === 'string') {
    const parsed = parseISO(date);
    return isValid(parsed);
  }
  return isValid(date);
};

// Current time helpers
export const now = (): Date => new Date();

export const nowInTz = (timezone = DEFAULT_TIMEZONE): Date => {
  return toZonedTime(new Date(), timezone);
};

export const todayInTz = (timezone = DEFAULT_TIMEZONE): Date => {
  return startOfDay(toZonedTime(new Date(), timezone));
};
```

### 2. Find and Replace in Files

Use these grep commands to find usages:

```bash
# Find moment usage
grep -r "moment()" --include="*.{ts,tsx,js,jsx}" .

# Find luxon usage
grep -r "DateTime\." --include="*.{ts,tsx,js,jsx}" .

# Find specific patterns
grep -r "\.format(" --include="*.{ts,tsx,js,jsx}" .
grep -r "\.add(" --include="*.{ts,tsx,js,jsx}" .
grep -r "\.subtract(" --include="*.{ts,tsx,js,jsx}" .
```

### 3. Example File Migration

**Before (lib/hours.ts):**
```typescript
import moment from 'moment-timezone';

export function isBusinessOpen() {
  const now = moment().tz('America/Chicago');
  const hour = now.hour();
  const day = now.day();

  // Business hours: Mon-Fri 9am-5pm
  if (day === 0 || day === 6) return false;
  return hour >= 9 && hour < 17;
}
```

**After:**
```typescript
import { getHours, getDay } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

export function isBusinessOpen() {
  const now = toZonedTime(new Date(), 'America/Chicago');
  const hour = getHours(now);
  const day = getDay(now);

  // Business hours: Mon-Fri 9am-5pm
  if (day === 0 || day === 6) return false;
  return hour >= 9 && hour < 17;
}
```

### 4. Test Each Migration

After migrating each file:

```bash
# Type check
pnpm type-check

# Run relevant tests
pnpm test:unit

# Test the specific functionality manually
```

---

## Files to Migrate

Based on grep results, these files need migration (38 files total):

### High Priority (Core Logic)
- `lib/hours.ts` - Business hours logic
- `lib/utils/time.ts` - Time utilities
- `lib/availability/generateSlots.ts` - Booking slots
- `lib/booking/booking-service.ts` - Booking service
- `lib/ghl/appointments.ts` - Appointments
- `lib/stripe.ts` - Payment processing

### Medium Priority (Features)
- `components/unified-booking-calendar.tsx` - Calendar UI
- `components/booking/BookingForm.tsx` - Booking form
- `lib/email/templates.ts` - Email templates
- `lib/analytics/weekly-report.ts` - Analytics

### Lower Priority (Tests & Scripts)
- `tests/unit/booking-logic.test.ts`
- `tests/e2e/analytics-smoke.spec.ts`
- `scripts/manual-ghl-booking.ts`

---

## Testing Checklist

After migration, thoroughly test:

- [ ] Booking system (slot generation, availability)
- [ ] Business hours checking
- [ ] Email template date formatting
- [ ] Admin dashboard date displays
- [ ] Analytics date ranges
- [ ] Appointment scheduling
- [ ] Timezone conversions (especially America/Chicago)
- [ ] Date comparisons (isBefore, isAfter)
- [ ] Date arithmetic (adding/subtracting days)
- [ ] All unit tests pass
- [ ] All E2E tests pass

---

## Common Pitfalls

### 1. String Parsing
```typescript
// ❌ moment automatically parses many formats
moment('2024-12-17')

// ✅ date-fns requires parseISO for ISO strings
parseISO('2024-12-17')

// ✅ Or use parse with a format
parse('12/17/2024', 'MM/dd/yyyy', new Date())
```

### 2. Mutability
```typescript
// ❌ moment mutates (careful!)
const date = moment();
date.add(1, 'day'); // mutates date!

// ✅ date-fns is immutable
const date = new Date();
const newDate = addDays(date, 1); // returns new date, original unchanged
```

### 3. Timezone Handling
```typescript
// ❌ moment-timezone
moment.tz('America/Chicago')

// ✅ date-fns-tz
toZonedTime(new Date(), 'America/Chicago')
```

---

## Rollback Plan

If migration causes issues:

1. Keep a git branch before migration
2. Can temporarily add moment/luxon back:
   ```bash
   pnpm add moment moment-timezone luxon @types/luxon
   git checkout [previous-branch] [problematic-file]
   ```
3. Fix issues incrementally rather than rolling back entirely

---

## Resources

- [date-fns documentation](https://date-fns.org/)
- [date-fns-tz documentation](https://github.com/marnusw/date-fns-tz)
- [Format string reference](https://date-fns.org/docs/format)
- [Migration from moment](https://github.com/you-dont-need/You-Dont-Need-Momentjs)

---

## Estimated Effort

- **Create utility helpers:** 1-2 hours
- **Migrate core files (6 files):** 3-4 hours
- **Migrate medium priority (4 files):** 2-3 hours
- **Migrate remaining files:** 2-3 hours
- **Testing & fixes:** 3-4 hours
- **Total:** 11-16 hours

**Recommendation:** Migrate incrementally over 2-3 days, testing thoroughly after each batch.
