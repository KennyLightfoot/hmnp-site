import { z } from 'zod'

export const PricingCalculationParamsSchema = z.object({
  serviceType: z.enum(['QUICK_STAMP_LOCAL','STANDARD_NOTARY','EXTENDED_HOURS','LOAN_SIGNING','RON_SERVICES','BUSINESS_ESSENTIALS','BUSINESS_GROWTH']),
  location: z.object({ address: z.string(), latitude: z.number().optional(), longitude: z.number().optional() }).optional(),
  scheduledDateTime: z.string().datetime(),
  documentCount: z.number().min(1).default(1),
  signerCount: z.number().min(1).default(1),
  options: z.object({ priority: z.boolean().default(false), weatherAlert: z.boolean().default(false), sameDay: z.boolean().default(false) }).default({}),
  customerEmail: z.string().email().optional(),
  promoCode: z.string().optional(),
  referralCode: z.string().optional(),
})

export type PricingCalculationParams = z.infer<typeof PricingCalculationParamsSchema>

export interface PricingBreakdown {
  lineItems: Array<{ description: string; amount: number; type?: 'base' | 'travel' | 'surcharge' | 'discount' }>
  transparency: { travelCalculation?: string; surchargeExplanation?: string; discountSource?: string }
}

export interface UpsellSuggestion {
  type: 'service_upgrade' | 'add_on'
  fromService?: string
  toService?: string
  priceIncrease: number
  headline: string
  benefit: string
  urgency?: string
  conversionBoost?: string
  savings?: number
  condition?: string
}

export interface PricingConfidence { level: 'high' | 'medium' | 'low'; factors: string[]; competitiveAdvantage?: string }

export interface PricingMetadata { calculatedAt: string; version: string; factors: Record<string, any>; requestId?: string }

export interface PricingResult {
  basePrice: number
  travelFee: number
  surcharges: number
  discounts: number
  total: number
  breakdown: PricingBreakdown
  upsellSuggestions: UpsellSuggestion[]
  confidence: PricingConfidence
  metadata: PricingMetadata
}

export class PricingCalculationError extends Error {
  constructor(message: string, public details?: any) { super(message); this.name = 'PricingCalculationError' }
}


