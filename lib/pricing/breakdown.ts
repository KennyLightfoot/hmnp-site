import { PRICING_CONFIG } from './base'
import type { PricingBreakdown } from './types'

export function generatePricingBreakdown(
  basePrice: number,
  travelFee: number,
  surcharges: number,
  discounts: number,
  travelData: { distance: number; withinArea: boolean }
): PricingBreakdown {
  const lineItems: PricingBreakdown['lineItems'] = [{ description: 'Base Service Fee', amount: basePrice, type: 'base' }]
  if (travelFee > 0) lineItems.push({ description: `Travel Fee (${travelData.distance.toFixed(1)} miles)`, amount: travelFee, type: 'base' })
  if (surcharges > 0) lineItems.push({ description: 'Service Surcharges', amount: surcharges, type: 'base' })
  if (discounts > 0) lineItems.push({ description: 'Discounts Applied', amount: -discounts, type: 'base' })
  return { lineItems, transparency: { travelCalculation: travelFee > 0 ? `Based on ${travelData.distance.toFixed(1)} miles from ZIP ${PRICING_CONFIG.baseLocation}` : undefined, surchargeExplanation: surcharges > 0 ? 'After-hours, weekend, or priority service fees' : undefined, discountSource: discounts > 0 ? 'Customer loyalty discounts applied' : undefined } }
}


