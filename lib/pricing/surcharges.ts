import { PRICING_CONFIG } from './base'

export function calculateSurcharges(
  serviceType: string,
  scheduledDateTime: string,
  options: { priority?: boolean; weatherAlert?: boolean; sameDay?: boolean }
): number {
  let total = 0
  const date = new Date(scheduledDateTime)
  const hour = date.getHours()
  const dayOfWeek = date.getDay()

  if (serviceType === 'STANDARD_NOTARY' && (hour < 9 || hour >= 17)) total += PRICING_CONFIG.surcharges.afterHours
  if (dayOfWeek === 0 || dayOfWeek === 6) total += PRICING_CONFIG.surcharges.weekend
  if (options.priority) total += PRICING_CONFIG.surcharges.priority
  if (options.sameDay) total += PRICING_CONFIG.surcharges.sameDay
  return total
}


