import type { PricingCalculationParams, PricingConfidence } from './types'

export function calculatePricingConfidence(params: PricingCalculationParams, travelData: { withinArea: boolean }): PricingConfidence {
  const factors: string[] = []
  let level: 'high' | 'medium' | 'low' = 'high'
  if (travelData.withinArea) { factors.push('Within service area') } else { factors.push('Extended service area'); level = 'medium' }
  if (params.serviceType === 'LOAN_SIGNING') factors.push('Flat-rate pricing')
  if (params.serviceType === 'RON_SERVICES') { factors.push('No travel required'); factors.push('24/7 availability') }
  return { level, factors, competitiveAdvantage: level === 'high' ? 'Best value in Houston metro area' : 'Competitive pricing with premium service' }
}


