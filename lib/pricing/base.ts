import { SERVICES_CONFIG } from '@/lib/services/config'
import { PricingCalculationError } from './types'

export const SERVICES = Object.fromEntries(
  Object.entries(SERVICES_CONFIG).map(([k, v]) => [k, { price: v.basePrice, includedRadius: v.includedRadius, feePerMile: v.feePerMile, maxDocuments: v.maxDocuments }])
) as Record<string, { price: number; includedRadius: number; feePerMile: number; maxDocuments: number }>

export function getServiceBasePrice(serviceType: string): number {
  const service = SERVICES[serviceType as keyof typeof SERVICES]
  if (!service) throw new PricingCalculationError(`Invalid service type: ${serviceType}`)
  return service.price
}

export const PRICING_CONFIG = {
  baseLocation: '77591',
  surcharges: { afterHours: 30, weekend: 40, weather: 0.65, priority: 25, sameDay: 0 },
  deposits: { threshold: 100, percentage: 0.5 },
  discounts: { firstTime: 15, referral: 20, volume: 0.10 },
} as const


