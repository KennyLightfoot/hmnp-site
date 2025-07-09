/**
 * Enhanced Pricing Engine - Houston Mobile Notary Pros
 * Phase 2: Dynamic Pricing with Business Rules Integration
 * 
 * Features:
 * - Dynamic pricing based on demand and urgency
 * - Time-based pricing (same-day, extended hours, weekends)
 * - Promotional pricing system (discounts, referrals)
 * - Service area pricing zones
 * - Business rules integration
 * - GHL automation triggers
 */

import { z } from 'zod';
import { BUSINESS_RULES_CONFIG } from './config';
import { validateBusinessRules } from './engine';

// ============================================================================
// 🎯 PRICING CONFIGURATION
// ============================================================================

const SERVICE_BASE_PRICES = {
  'QUICK_STAMP_LOCAL': 50,
  'STANDARD_NOTARY': 75,
  'EXTENDED_HOURS': 100,
  'LOAN_SIGNING': 150,
  'RON_SERVICES': 35,
  'BUSINESS_ESSENTIALS': 125,
  'BUSINESS_GROWTH': 349
} as const;

const SERVICE_AREA_MULTIPLIERS = {
  houston_metro: { range: '0-30 miles', multiplier: 1.0, label: 'Houston Metro' },
  extended_range: { range: '30-50 miles', multiplier: 1.2, label: 'Extended Range' },
  maximum_range: { range: '50-60 miles', multiplier: 1.5, label: 'Maximum Range' }
} as const;

const TIME_BASED_MULTIPLIERS = {
  sameDay: { multiplier: 1.5, label: 'Same-day service', minHours: 0, maxHours: 24 },
  nextDay: { multiplier: 1.2, label: 'Next-day service', minHours: 24, maxHours: 48 },
  extendedHours: { multiplier: 1.3, label: 'Extended hours (7PM-9AM)', condition: 'outside_business_hours' },
  weekend: { multiplier: 1.1, label: 'Weekend service', condition: 'weekend' },
  holiday: { multiplier: 1.4, label: 'Holiday service', condition: 'holiday' }
} as const;

const PROMOTIONAL_DISCOUNTS = {
  first_time_customer: { discount: 0.1, label: '10% First-Time Customer Discount' },
  referral_discount: { discount: 0.15, label: '15% Referral Discount' },
  bulk_booking: { discount: 0.05, label: '5% Bulk Booking Discount' },
  loyalty_discount: { discount: 0.2, label: '20% Loyalty Customer Discount' },
  promo_code: { discount: 0.0, label: 'Promo Code Discount' } // Variable based on code
} as const;

// ============================================================================
// 📊 PRICING SCHEMAS
// ============================================================================

const PricingRequestSchema = z.object({
  serviceType: z.enum(['QUICK_STAMP_LOCAL', 'STANDARD_NOTARY', 'EXTENDED_HOURS', 'LOAN_SIGNING', 'RON_SERVICES', 'BUSINESS_ESSENTIALS', 'BUSINESS_GROWTH']),
  address: z.string().optional(),
  documentCount: z.number().min(1).default(1),
  appointmentDateTime: z.string().datetime().optional(),
  customerType: z.enum(['new', 'returning', 'loyalty']).default('new'),
  referralCode: z.string().optional(),
  promoCode: z.string().optional(),
  customerId: z.string().optional(),
  requestId: z.string().optional()
});

const PricingComponentSchema = z.object({
  basePrice: z.number(),
  travelFee: z.number().default(0),
  extraDocumentFees: z.number().default(0),
  urgencyFee: z.number().default(0),
  demandSurcharge: z.number().default(0),
  serviceAreaMultiplier: z.number().default(1),
  discountAmount: z.number().default(0),
  totalPrice: z.number()
});

export type PricingRequest = z.infer<typeof PricingRequestSchema>;
export type PricingComponent = z.infer<typeof PricingComponentSchema>;

export interface PricingResult {
  pricing: PricingComponent;
  breakdown: {
    baseService: { amount: number; label: string };
    travelFee: { amount: number; label: string; distance?: number };
    extraDocuments: { amount: number; label: string; count?: number };
    timeBasedFees: { amount: number; label: string; multiplier?: number }[];
    serviceAreaFee: { amount: number; label: string; zone?: string };
    discounts: { amount: number; label: string; type?: string }[];
  };
  businessRules: {
    serviceAreaZone: string;
    documentLimitsExceeded: boolean;
    dynamicPricingActive: boolean;
    discountsApplied: string[];
    violations: string[];
    recommendations: string[];
  };
  ghlActions: {
    tags: string[];
    customFields: Record<string, any>;
    workflows: string[];
  };
}

// ============================================================================
// 🚀 ENHANCED PRICING ENGINE
// ============================================================================

export class EnhancedPricingEngine {
  
  /**
   * Calculate comprehensive pricing with business rules integration
   */
  static async calculateDynamicPricing(request: PricingRequest): Promise<PricingResult> {
    // Validate request
    const validatedRequest = PricingRequestSchema.parse(request);
    const requestId = validatedRequest.requestId || `pricing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`🔍 [${requestId}] Starting dynamic pricing calculation`, {
      serviceType: validatedRequest.serviceType,
      hasAddress: !!validatedRequest.address,
      documentCount: validatedRequest.documentCount,
      hasAppointmentDate: !!validatedRequest.appointmentDateTime
    });

    // Initialize pricing components
    const basePrice = SERVICE_BASE_PRICES[validatedRequest.serviceType];
    let travelFee = 0;
    let extraDocumentFees = 0;
    let urgencyFee = 0;
    let serviceAreaMultiplier = 1;
    let discountAmount = 0;
    
    // Initialize breakdown and business rules
    const breakdown = {
      baseService: { amount: basePrice, label: `${validatedRequest.serviceType.replace('_', ' ')} Service` },
      travelFee: { amount: 0, label: 'Travel Fee' },
      extraDocuments: { amount: 0, label: 'Additional Documents' },
      timeBasedFees: [] as Array<{ amount: number; label: string; multiplier?: number }>,
      serviceAreaFee: { amount: 0, label: 'Service Area' },
      discounts: [] as Array<{ amount: number; label: string; type?: string }>
    };
    
    const businessRules = {
      serviceAreaZone: 'houston_metro',
      documentLimitsExceeded: false,
      dynamicPricingActive: false,
      discountsApplied: [] as string[],
      violations: [] as string[],
      recommendations: [] as string[]
    };
    
    const ghlActions = {
      tags: ['pricing:calculated'],
      customFields: {} as Record<string, any>,
      workflows: [] as string[]
    };

    try {
      // 1. Business Rules Validation (if address provided)
      if (validatedRequest.address) {
        console.log(`📍 [${requestId}] Running business rules validation`);
        
        const businessRulesResult = await validateBusinessRules({
          serviceType: validatedRequest.serviceType,
          location: { address: validatedRequest.address },
          documentCount: validatedRequest.documentCount,
          ghlContactId: validatedRequest.customerId
        });
        
        businessRules.violations = businessRulesResult.violations;
        businessRules.recommendations = businessRulesResult.ghlActions.tags || [];
        
        // Apply GHL actions from business rules
        ghlActions.tags.push(...businessRulesResult.ghlActions.tags);
        Object.assign(ghlActions.customFields, businessRulesResult.ghlActions.customFields);
        ghlActions.workflows.push(...businessRulesResult.ghlActions.workflows);
      }

      // 2. Calculate Travel Fee and Service Area
      if (validatedRequest.address && validatedRequest.serviceType !== 'RON_SERVICES') {
        console.log(`🚗 [${requestId}] Calculating travel fee and service area`);
        
        const { travelFeeAmount, distance, zone } = await this.calculateTravelFeeAndZone(
          validatedRequest.address, 
          validatedRequest.serviceType
        );
        
        travelFee = travelFeeAmount;
        serviceAreaMultiplier = SERVICE_AREA_MULTIPLIERS[zone as keyof typeof SERVICE_AREA_MULTIPLIERS]?.multiplier || 1;
        businessRules.serviceAreaZone = zone;
        
        breakdown.travelFee = { 
          amount: travelFee, 
          label: `Travel Fee (${distance} miles)`, 
          distance 
        } as any;
        
        breakdown.serviceAreaFee = {
          amount: basePrice * (serviceAreaMultiplier - 1),
          label: SERVICE_AREA_MULTIPLIERS[zone as keyof typeof SERVICE_AREA_MULTIPLIERS]?.label || 'Service Area',
          zone
        } as any;
        
        ghlActions.customFields.cf_service_distance = distance;
        ghlActions.customFields.cf_travel_fee = travelFee;
        ghlActions.customFields.cf_service_zone = zone;
        ghlActions.tags.push(`service_area:${zone}`);
      }

      // 3. Calculate Extra Document Fees
      const documentLimits = BUSINESS_RULES_CONFIG.documentLimits.serviceLimits;
      const serviceLimit = documentLimits[validatedRequest.serviceType as keyof typeof documentLimits];
      
      if (serviceLimit && validatedRequest.documentCount > serviceLimit.base) {
        const extraDocs = validatedRequest.documentCount - serviceLimit.base;
        extraDocumentFees = extraDocs * serviceLimit.extraFee;
        businessRules.documentLimitsExceeded = true;
        
        breakdown.extraDocuments = {
          amount: extraDocumentFees,
          label: `${extraDocs} additional document${extraDocs > 1 ? 's' : ''}`,
          count: extraDocs
        } as any;
        
        ghlActions.customFields.cf_extra_doc_fees = extraDocumentFees;
        ghlActions.customFields.cf_document_count = validatedRequest.documentCount;
        ghlActions.tags.push('docs:over_limit');
        
        console.log(`📄 [${requestId}] Extra document fees applied: $${extraDocumentFees} for ${extraDocs} extra docs`);
      }

      // 4. Calculate Time-based Pricing
      if (validatedRequest.appointmentDateTime) {
        console.log(`⏰ [${requestId}] Calculating time-based pricing`);
        
        const timeBasedFees = this.calculateTimeBasedPricing(
          new Date(validatedRequest.appointmentDateTime),
          basePrice
        );
        
        urgencyFee = timeBasedFees.reduce((sum, fee) => sum + fee.amount, 0);
        breakdown.timeBasedFees = timeBasedFees;
        businessRules.dynamicPricingActive = urgencyFee > 0;
        
        if (urgencyFee > 0) {
          ghlActions.customFields.cf_urgency_fee = urgencyFee;
          ghlActions.tags.push('pricing:dynamic_pricing_active');
          ghlActions.workflows.push('GHL_SURGE_PRICING_WORKFLOW_ID');
        }
      }

      // 5. Calculate Promotional Discounts
      const promotionalResult = await this.calculatePromotionalPricing(
        validatedRequest.customerType,
        validatedRequest.referralCode,
        validatedRequest.promoCode,
        basePrice + travelFee + extraDocumentFees + urgencyFee,
        validatedRequest.serviceType,
        requestId
      );
      
      discountAmount = promotionalResult.discountAmount;
      breakdown.discounts = promotionalResult.discounts;
      businessRules.discountsApplied = promotionalResult.discountsApplied;
      
      if (discountAmount > 0) {
        ghlActions.customFields.cf_discount_amount = discountAmount;
        ghlActions.tags.push('pricing:discount_applied');
        ghlActions.workflows.push('GHL_DISCOUNT_TRACKING_WORKFLOW_ID');
      }

      // 6. Calculate Final Total
      const subtotal = basePrice * serviceAreaMultiplier + travelFee + extraDocumentFees + urgencyFee;
      const totalPrice = Math.max(0, subtotal - discountAmount);
      
      // 7. Build Final GHL Actions
      ghlActions.customFields.cf_base_service_fee = basePrice;
      ghlActions.customFields.cf_final_total = totalPrice;
      ghlActions.customFields.cf_fee_breakdown = JSON.stringify(breakdown);
      
      console.log(`✅ [${requestId}] Pricing calculation completed`, {
        basePrice,
        travelFee,
        extraDocumentFees,
        urgencyFee,
        discountAmount,
        totalPrice
      });

      return {
        pricing: {
          basePrice,
          travelFee,
          extraDocumentFees,
          urgencyFee,
          demandSurcharge: 0, // Future feature
          serviceAreaMultiplier,
          discountAmount,
          totalPrice
        },
        breakdown,
        businessRules,
        ghlActions
      };

    } catch (error) {
      console.error(`❌ [${requestId}] Pricing calculation failed:`, error);
      throw new Error(`Pricing calculation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculate travel fee and determine service area zone
   */
  private static async calculateTravelFeeAndZone(address: string, serviceType: string): Promise<{
    travelFeeAmount: number;
    distance: number;
    zone: string;
  }> {
    // Import UnifiedDistanceService
    const { UnifiedDistanceService } = await import('../maps/unified-distance-service');
    
    try {
      const distanceResult = await UnifiedDistanceService.calculateDistance(address);
      const distance = distanceResult.distance.miles;
      
      // Determine zone
      let zone = 'houston_metro';
      if (distance > 50) zone = 'maximum_range';
      else if (distance > 30) zone = 'extended_range';
      
      // Calculate travel fee
      const freeRadius = serviceType === 'QUICK_STAMP_LOCAL' ? 10 : 30;
      const travelFeeAmount = distance <= freeRadius ? 0 : (distance - freeRadius) * 0.50;
      
      return { travelFeeAmount, distance, zone };
      
    } catch (error) {
      console.warn('Distance calculation failed, using fallback:', error);
      return { travelFeeAmount: 0, distance: 15, zone: 'houston_metro' };
    }
  }

  /**
   * Calculate time-based pricing multipliers
   */
  private static calculateTimeBasedPricing(appointmentDate: Date, basePrice: number): Array<{
    amount: number;
    label: string;
    multiplier?: number;
  }> {
    const now = new Date();
    const hoursUntilAppointment = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    const fees: Array<{ amount: number; label: string; multiplier?: number }> = [];
    
    // Same-day service fee
    if (hoursUntilAppointment <= 24) {
      const multiplier = TIME_BASED_MULTIPLIERS.sameDay.multiplier;
      const amount = basePrice * (multiplier - 1);
      fees.push({
        amount,
        label: TIME_BASED_MULTIPLIERS.sameDay.label,
        multiplier
      });
    }
    // Next-day service fee
    else if (hoursUntilAppointment <= 48) {
      const multiplier = TIME_BASED_MULTIPLIERS.nextDay.multiplier;
      const amount = basePrice * (multiplier - 1);
      fees.push({
        amount,
        label: TIME_BASED_MULTIPLIERS.nextDay.label,
        multiplier
      });
    }
    
    // Extended hours check (7PM - 9AM)
    const appointmentHour = appointmentDate.getHours();
    if (appointmentHour >= 19 || appointmentHour <= 9) {
      const multiplier = TIME_BASED_MULTIPLIERS.extendedHours.multiplier;
      const amount = basePrice * (multiplier - 1);
      fees.push({
        amount,
        label: TIME_BASED_MULTIPLIERS.extendedHours.label,
        multiplier
      });
    }
    
    // Weekend check
    const dayOfWeek = appointmentDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      const multiplier = TIME_BASED_MULTIPLIERS.weekend.multiplier;
      const amount = basePrice * (multiplier - 1);
      fees.push({
        amount,
        label: TIME_BASED_MULTIPLIERS.weekend.label,
        multiplier
      });
    }
    
    return fees;
  }

  /**
   * Calculate promotional pricing and discounts using the database-driven promotional pricing engine
   */
  private static async calculatePromotionalPricing(
    customerType: 'new' | 'returning' | 'loyalty',
    referralCode?: string,
    promoCode?: string,
    subtotal?: number,
    serviceType?: string,
    requestId?: string
  ): Promise<{
    discountAmount: number;
    discounts: Array<{ amount: number; label: string; type?: string }>;
    discountsApplied: string[];
  }> {
    // Use the database-driven promotional pricing engine
    const { DatabasePromotionalPricingEngine } = await import('./promotional-pricing-db');
    
         const promotionalResult = await DatabasePromotionalPricingEngine.calculatePromotionalPricing({
       serviceType: serviceType || 'STANDARD_NOTARY',
       subtotal: subtotal || 0,
       customer: {
         customerType,
         customerEmail: 'customer@example.com', // Placeholder email for pricing calculation
         referralCode: referralCode || undefined,
         previousBookingCount: customerType === 'loyalty' ? 5 : 0,
         totalSpent: customerType === 'loyalty' ? 500 : 0,
         lastBookingDate: customerType === 'returning' || customerType === 'loyalty' ? new Date() : undefined
       },
       promoCode,
       requestId: requestId || `promo_${Date.now()}`
     });
    
    return {
      discountAmount: promotionalResult.totalDiscount,
      discounts: promotionalResult.discounts.map(d => ({
        amount: d.amount,
        label: d.label,
        type: d.type
      })),
      discountsApplied: promotionalResult.discounts.map(d => d.type)
    };
  }
}

export default EnhancedPricingEngine; 