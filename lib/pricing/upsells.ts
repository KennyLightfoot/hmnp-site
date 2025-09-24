import { SERVICES } from './base'
import type { PricingCalculationParams, UpsellSuggestion } from './types'

export function detectUpsellOpportunities(
  params: PricingCalculationParams,
  travelData: { fee: number; distance: number; withinArea: boolean }
): UpsellSuggestion[] {
  const suggestions: UpsellSuggestion[] = []
  const hour = new Date(params.scheduledDateTime).getHours()

  if (hour >= 17 && params.serviceType === 'STANDARD_NOTARY') {
    suggestions.push({ type: 'service_upgrade', fromService: 'STANDARD_NOTARY', toService: 'EXTENDED_HOURS', priceIncrease: 25, headline: '⚡ Evening Appointment Available', benefit: 'Available until 9pm + handles up to 5 documents', urgency: 'Next available evening slot', conversionBoost: 'Priority booking guaranteed' })
  }

  if (params.documentCount > 2 && params.serviceType === 'STANDARD_NOTARY') {
    const savings = (params.documentCount - 2) * 15
    suggestions.push({ type: 'service_upgrade', fromService: 'STANDARD_NOTARY', toService: 'EXTENDED_HOURS', priceIncrease: 25, headline: '💰 Better Value for Multiple Documents', benefit: `Covers up to 5 documents (you have ${params.documentCount})`, savings: Math.max(0, savings - 25), conversionBoost: 'More documents, better price per document' })
  }

  if (travelData.distance > 15 && params.serviceType === 'STANDARD_NOTARY') {
    const extendedTravelSavings = Math.max(0, (travelData.distance - 20) * 0.5)
    suggestions.push({ type: 'service_upgrade', headline: '🚗 Extended Hours Includes More Travel', benefit: '20-mile radius included (reduces your travel fees)', priceIncrease: 25, savings: Math.round(extendedTravelSavings * 100) / 100, fromService: 'STANDARD_NOTARY', toService: 'EXTENDED_HOURS' })
  }

  if (params.documentCount > 5 || detectLoanDocuments(params)) {
    suggestions.push({ type: 'service_upgrade', fromService: params.serviceType, toService: 'LOAN_SIGNING', priceIncrease: (SERVICES['LOAN_SIGNING']?.price ?? 0) - (SERVICES[params.serviceType as keyof typeof SERVICES]?.price ?? 0), headline: '🏠 Loan Signing Specialist', benefit: 'Unlimited documents + real estate expertise + title company coordination', conversionBoost: 'Flat fee regardless of document count' })
  }

  if (!params.options?.priority && isWithinPriorityTimeframe(params.scheduledDateTime)) {
    suggestions.push({ type: 'add_on', priceIncrease: 25, headline: '⚡ Priority Booking', benefit: 'Next available appointment within 2 hours', condition: 'subject to availability', urgency: 'Limited slots available' })
  }

  return suggestions
}

function detectLoanDocuments(params: PricingCalculationParams): boolean {
  return params.documentCount > 10 || params.signerCount > 2
}

function isWithinPriorityTimeframe(scheduledDateTime: string): boolean {
  const scheduled = new Date(scheduledDateTime)
  const hoursUntil = (scheduled.getTime() - Date.now()) / (1000 * 60 * 60)
  return hoursUntil <= 24
}


