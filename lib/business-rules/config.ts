/**
 * Business Rules Configuration Center
 * Houston Mobile Notary Pros - Single Source of Truth
 * 
 * This file centralizes all business rules and decisions from the planning phase,
 * integrating with the existing BusinessSettings system and GHL infrastructure.
 */

import { z } from 'zod';

// ============================================================================
// 🎯 BUSINESS RULES CONFIGURATION (From Planning Decisions)
// ============================================================================

export const BUSINESS_RULES_CONFIG = {
  
  // Service Area Rules (Based on business decisions)
  serviceArea: {
    maxDistance: 60, // "absolute maximum you'll travel? like 60 miles"
    zonePricing: false, // "Do you want different rates? no"
    extendedServiceAvailable: true, // "Do you offer service beyond normal areas for extra fees? yes"
    weatherCancellations: 'manual', // "i will manually cancel and reach out on extreme weather"
    notaryLocationImpact: false, // "How does notary location affect service area? it doesnt"
    
    // Zone definitions for GHL tagging
    zones: {
      houston_metro: { min: 0, max: 30, tag: 'service_area:houston_metro' },
      extended_range: { min: 30, max: 50, tag: 'service_area:extended_range' },
      maximum_range: { min: 50, max: 60, tag: 'service_area:maximum_range' }
    }
  },

  // Document Limits Rules (Based on business decisions)
  documentLimits: {
    extraDocumentFee: 7, // "we should have additional pricing for docs over the alloted amount in the tier, like $5-10"
    restrictedDocuments: ['HELOC'] as string[], // "HELOC, I dont have an office space for it"
    exceptionHandling: 'manual_contact', // "will be to have them reach out to me"
    communicationStyle: 'clear_upfront', // "we should use clear language and be upfront"
    pricingTiers: true, // "Should pricing change based on document count? yes"
    
    // Service-specific limits (from existing system)
    serviceLimits: {
      QUICK_STAMP_LOCAL: { base: 1, extraFee: 5 },
      STANDARD_NOTARY: { base: 2, extraFee: 7 },
      EXTENDED_HOURS: { base: 5, extraFee: 7 },
      LOAN_SIGNING: { base: 999, extraFee: 0 }, // unlimited
      RON_SERVICES: { base: 10, extraFee: 5 }
    }
  },

  // Pricing Transparency Rules (Based on business decisions)
  pricingTransparency: {
    paymentPlans: false, // "not currently, but we can think about what this would look like"
    dynamicPricing: true, // "yes we have discussed this" (already implemented)
    taxHandling: 'included', // "we dont charge it, its included in our pricing"
    discountStrategy: ['first_time', 'referrals'], // "yeah first time, referrals for now"
    feeCalculationTiming: 'end_of_booking', // "fees should be clear up front and calculated for the client at the end"
    
    // Fee disclosure settings
    feeDisclosure: {
      showUpfront: true,
      calculateAtEnd: true,
      includeBreakdown: true,
      showMileageCalculation: false // "we dont need to calculate milage until the last steps"
    },

    // Phase 2: Enhanced Pricing Features
    enhancedPricing: {
      timeBasedPricing: {
        sameDay: { multiplier: 1.5, enabled: true },
        nextDay: { multiplier: 1.2, enabled: true },
        extendedHours: { multiplier: 1.3, enabled: true },
        weekend: { multiplier: 1.1, enabled: true },
        holiday: { multiplier: 1.4, enabled: true }
      },
      serviceAreaPricing: {
        houston_metro: { multiplier: 1.0, freeRadius: 30 },
        extended_range: { multiplier: 1.2, freeRadius: 30 },
        maximum_range: { multiplier: 1.5, freeRadius: 30 }
      },
      promotionalPricing: {
        stackingAllowed: false, // Only best discount applies
        maxDiscountPercentage: 0.25, // 25% maximum discount
        autoApplyBestDiscount: true,
        customerTypeDiscounts: {
          new: { percentage: 0.1, maxValue: 25 },
          loyalty: { percentage: 0.2, maxValue: 50 }
        }
      }
    }
  },

  // Cancellation Policy Rules (Based on business decisions)
  cancellationPolicy: {
    refundDecisionProcess: 'case_by_case', // "clients can request a refund but we will need to determine the reason"
    reschedulingFee: false, // "Do you charge for rescheduling? no"
    reschedulingCutoff: 2, // "cut off is like 2-4 hours before the appointment"
    noShowPolicy: 'lose_deposit', // "they lose the deposit"
    weatherPolicy: 'no_charge', // "How do you handle weather-related cancellations? no charge"
    communicationStyle: 'clear_upfront', // "be clear and upfront"
    
    // Specific policy rules
    policy: {
      fullRefundWindow: 2, // hours before appointment
      noShowPenalty: 'full_deposit',
      weatherException: true,
      reschedulingAllowed: true,
      reschedulingCutoffHours: 2
    }
  }
} as const;

// ============================================================================
// 🔗 GHL INTEGRATION MAPPING
// ============================================================================

export const GHL_INTEGRATION_MAPPING = {
  
  // Service Area → GHL Integration
  serviceArea: {
    customFields: {
      distance: 'cf_service_distance',
      travelFee: 'cf_travel_fee',
      serviceZone: 'cf_service_zone'
    },
    tags: {
      houstonMetro: 'service_area:houston_metro',
      extendedRange: 'service_area:extended_range', 
      maximumRange: 'service_area:maximum_range'
    },
    workflows: {
      extendedService: 'GHL_EXTENDED_SERVICE_WORKFLOW_ID',
      weatherCancellation: 'GHL_WEATHER_CANCELLATION_WORKFLOW_ID',
      outOfArea: 'GHL_OUT_OF_AREA_WORKFLOW_ID'
    }
  },

  // Document Limits → GHL Integration  
  documentLimits: {
    customFields: {
      documentCount: 'cf_document_count',
      documentType: 'cf_document_type', 
      extraDocFees: 'cf_extra_doc_fees',
      restrictions: 'cf_document_restrictions'
    },
    tags: {
      underLimit: 'docs:under_limit',
      overLimit: 'docs:over_limit',
      restrictedType: 'docs:restricted_type',
      extraFeesApplied: 'docs:extra_fees_applied'
    },
    workflows: {
      overLimit: 'GHL_EXTRA_DOCS_WORKFLOW_ID',
      helocRestriction: 'GHL_DOCUMENT_RESTRICTION_WORKFLOW_ID',
      education: 'GHL_DOCUMENT_LIMITS_EDUCATION_ID'
    }
  },

  // Pricing → GHL Integration
  pricing: {
    customFields: {
      baseServiceFee: 'cf_base_service_fee',
      travelFeeAmount: 'cf_travel_fee_amount',
      extraDocFees: 'cf_extra_doc_fees',
      discountAmount: 'cf_discount_amount',
      finalTotal: 'cf_final_total',
      feeBreakdown: 'cf_fee_breakdown'
    },
    tags: {
      baseService: 'pricing:base_service',
      travelFeesApplied: 'pricing:travel_fees_applied',
      extraDocFees: 'pricing:extra_doc_fees',
      discountApplied: 'pricing:discount_applied',
      dynamicPricingActive: 'pricing:dynamic_pricing_active'
    },
    workflows: {
      pricingCalculated: 'GHL_PRICING_CONFIRMATION_WORKFLOW_ID',
      discountApplied: 'GHL_DISCOUNT_TRACKING_WORKFLOW_ID',
      dynamicPricing: 'GHL_SURGE_PRICING_WORKFLOW_ID'
    }
  },

  // Cancellation → GHL Integration
  cancellation: {
    customFields: {
      cancellationReason: 'cf_cancellation_reason',
      cancellationTime: 'cf_cancellation_time',
      refundAmount: 'cf_refund_amount',
      cancellationFee: 'cf_cancellation_fee',
      rescheduleCount: 'cf_reschedule_count'
    },
    tags: {
      fullRefund: 'cancellation:full_refund',
      noRefund: 'cancellation:no_refund',
      weatherException: 'cancellation:weather_exception',
      rescheduled: 'cancellation:rescheduled',
      noShow: 'cancellation:no_show'
    },
    workflows: {
      cancellationRequest: 'GHL_CANCELLATION_HANDLER_WORKFLOW_ID',
      weatherCancellation: 'GHL_WEATHER_EXCEPTION_WORKFLOW_ID',
      noShowRecovery: 'GHL_NO_SHOW_RECOVERY_WORKFLOW_ID',
      rescheduleRequest: 'GHL_RESCHEDULE_HANDLER_WORKFLOW_ID'
    }
  }
} as const;

// ============================================================================
// 📊 BUSINESS RULES VALIDATION SCHEMAS
// ============================================================================

export const ServiceAreaValidationSchema = z.object({
  distance: z.number().min(0).max(BUSINESS_RULES_CONFIG.serviceArea.maxDistance),
  address: z.string().min(1),
  serviceType: z.string(),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number()
  }).optional()
});

export const DocumentLimitsValidationSchema = z.object({
  serviceType: z.string(),
  documentCount: z.number().min(1),
  documentTypes: z.array(z.string()).optional(),
  hasRestrictedDocuments: z.boolean().default(false)
});

export const PricingValidationSchema = z.object({
  serviceType: z.string(),
  basePrice: z.number().min(0),
  travelFee: z.number().min(0),
  extraDocumentFees: z.number().min(0),
  discounts: z.number().min(0),
  totalPrice: z.number().min(0)
});

export const CancellationValidationSchema = z.object({
  bookingId: z.string(),
  reason: z.string(),
  requestedAt: z.date(),
  scheduledDateTime: z.date(),
  isWeatherRelated: z.boolean().default(false),
  isReschedule: z.boolean().default(false)
});

// ============================================================================
// 🛠️ BUSINESS RULES TYPES
// ============================================================================

export type ServiceAreaValidation = z.infer<typeof ServiceAreaValidationSchema>;
export type DocumentLimitsValidation = z.infer<typeof DocumentLimitsValidationSchema>;
export type PricingValidation = z.infer<typeof PricingValidationSchema>;
export type CancellationValidation = z.infer<typeof CancellationValidationSchema>;

export type BusinessRuleType = 'serviceArea' | 'documentLimits' | 'pricing' | 'cancellation';

export interface BusinessRuleResult {
  isValid: boolean;
  ruleType: BusinessRuleType;
  violations: string[];
  recommendations: string[];
  ghlActions: {
    tags: string[];
    customFields: Record<string, any>;
    workflows: string[];
  };
}

// ============================================================================
// 🎯 RULE EXECUTION CONTEXT
// ============================================================================

export interface BusinessRuleContext {
  booking?: any;
  service?: any;
  customer?: any;
  pricing?: any;
  location?: any;
  ghlContactId?: string;
  requestId: string;
  timestamp: Date;
}

export default BUSINESS_RULES_CONFIG; 