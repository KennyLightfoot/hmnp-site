import { DateTime } from 'luxon'

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
  const now = DateTime.now().setZone(zone)
  const weekdayIndex = now.weekday // 1 (Monday) - 7 (Sunday)
  const map = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ] as const
  type DayKey = typeof map[number]
  const key = map[(weekdayIndex - 1 + 7) % 7] as DayKey
  const day = hours[key as keyof WeeklyHours]
  if (!day || day.isOpen === false) return false

  const [openH, openM] = day.open.split(':').map((n) => parseInt(n, 10))
  const [closeH, closeM] = day.close.split(':').map((n) => parseInt(n, 10))
  const openTime = now.set({ hour: openH, minute: openM, second: 0, millisecond: 0 })
  const closeTime = now.set({ hour: closeH, minute: closeM, second: 0, millisecond: 0 })

  return now >= openTime && now <= closeTime
}

export function getOpenLabel(zone: string = 'America/Chicago'): 'Open now' | 'Closed' {
  return isOpenNow(zone) ? 'Open now' : 'Closed'
}




