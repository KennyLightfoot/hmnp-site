import { getDay, setHours, setMinutes, setSeconds, setMilliseconds } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'

type DailyHours = { open: string; close: string; isOpen?: boolean }
type WeeklyHours = {
  monday: DailyHours
  tuesday: DailyHours
  wednesday: DailyHours
  thursday: DailyHours
  friday: DailyHours
  saturday: DailyHours
  sunday: DailyHours
}

const DEFAULT_HOURS: WeeklyHours = {
  monday: { open: '08:00', close: '20:00', isOpen: true },
  tuesday: { open: '08:00', close: '20:00', isOpen: true },
  wednesday: { open: '08:00', close: '20:00', isOpen: true },
  thursday: { open: '08:00', close: '20:00', isOpen: true },
  friday: { open: '08:00', close: '20:00', isOpen: true },
  saturday: { open: '09:00', close: '18:00', isOpen: true },
  sunday: { open: '10:00', close: '17:00', isOpen: true },
}

function parseHours(): WeeklyHours {
  try {
    const env = process.env.NEXT_PUBLIC_BUSINESS_HOURS
    if (!env) return DEFAULT_HOURS
    const parsed = JSON.parse(env)
    return { ...DEFAULT_HOURS, ...parsed }
  } catch {
    return DEFAULT_HOURS
  }
}

export function isOpenNow(zone: string = 'America/Chicago'): boolean {
  const hours = parseHours()
  const now = toZonedTime(new Date(), zone)
  const weekdayIndex = getDay(now) // 0 (Sunday) - 6 (Saturday)

  // Map date-fns day (0=Sunday, 6=Saturday) to our day names
  const map = [
    'sunday',   // 0
    'monday',   // 1
    'tuesday',  // 2
    'wednesday',// 3
    'thursday', // 4
    'friday',   // 5
    'saturday', // 6
  ] as const
  type DayKey = typeof map[number]
  const key = map[weekdayIndex] as DayKey
  const day = hours[key as keyof WeeklyHours]
  if (!day || day.isOpen === false) return false

  const [openH, openM] = day.open.split(':').map((n) => parseInt(n, 10)) as [number, number]
  const [closeH, closeM] = day.close.split(':').map((n) => parseInt(n, 10)) as [number, number]

  // Create open and close times for today
  let openTime = setHours(now, openH)
  openTime = setMinutes(openTime, openM)
  openTime = setSeconds(openTime, 0)
  openTime = setMilliseconds(openTime, 0)

  let closeTime = setHours(now, closeH)
  closeTime = setMinutes(closeTime, closeM)
  closeTime = setSeconds(closeTime, 0)
  closeTime = setMilliseconds(closeTime, 0)

  return now >= openTime && now <= closeTime
}

export function getOpenLabel(zone: string = 'America/Chicago'): 'Open now' | 'Closed' {
  return isOpenNow(zone) ? 'Open now' : 'Closed'
}




