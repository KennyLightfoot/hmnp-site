/**
 * Unified Pricing Engine - Houston Mobile Notary Pros
 * Phase 4: Complete Pricing Transparency System
 * 
 * This engine consolidates all pricing logic from:
 * - lib/pricing-engine.ts (base pricing)
 * - lib/business-rules/pricing-engine.ts (enhanced pricing)
 * - lib/pricing/dynamic-pricing-engine.ts (dynamic pricing)
 * 
 * Into one transparent, comprehensive pricing system.
 */

import { z } from 'zod';
import { getErrorMessage } from '@/lib/utils/error-utils';
import { UnifiedDistanceService } from '../maps/unified-distance-service';
import { validateBusinessRules } from '../business-rules/engine';
import { BUSINESS_RULES_CONFIG } from '../business-rules/config';
import { PricingCacheService, withPricingCache } from './pricing-cache';
import { isAddressMissing } from '@/lib/validation/address';

// ============================================================================
// 🎯 UNIFIED PRICING CONFIGURATION
// ============================================================================

export const UNIFIED_SERVICE_CONFIG = {
  QUICK_STAMP_LOCAL: {
    basePrice: 50,
    maxDocuments: 1,
    maxStamps: 2,
    includedRadius: 10,
    feePerMile: 0.50,
    description: "Fast & simple local signings",
    features: ["Quick service", "1 document", "2 stamps", "10-mile radius"]
  },
  STANDARD_NOTARY: {
    basePrice: 75,
    maxDocuments: 4,
    includedRadius: 20,
    feePerMile: 0.50,
    description: "Professional notary service for routine documents",
    features: ["Up to 4 documents", "1-2 signers", "20-mile radius"]
  },
  EXTENDED_HOURS: {
    basePrice: 100,
    maxDocuments: 4,
    includedRadius: 30,
    feePerMile: 0.50,
    description: "Extended availability for urgent and after-hours needs",
    features: ["Up to 4 documents", "1-2 signers", "7am-9pm daily", "30-mile radius"]
  },
  LOAN_SIGNING: {
    basePrice: 150,
    maxDocuments: 999,
    includedRadius: 30,
    feePerMile: 0.50,
    description: "Specialized loan document signing with expertise",
    features: ["Single package", "Up to 4 signers", "Loan expertise", "30-mile radius", "2 hours table time"]
  },
  RON_SERVICES: {
    basePrice: 25,
    sealPrice: 5,
    maxDocuments: 10,
    includedRadius: 0, // No travel for RON
    feePerMile: 0,
    description: "24/7 Remote Online Notarization services",
    features: ["24/7 availability", "Up to 10 documents", "No travel required", "Texas-compliant", "$25 session + $5 per seal"]
  },
  BUSINESS_ESSENTIALS: {
    basePrice: 125,
    maxDocuments: 10,
    includedRadius: 30,
    feePerMile: 0.50,
    description: "Monthly business subscription - essentials",
    features: ["Monthly plan", "Priority scheduling", "Business support"]
  },
  BUSINESS_GROWTH: {
    basePrice: 349,
    maxDocuments: 50,
    includedRadius: 50,
    feePerMile: 0.25,
    description: "Monthly business subscription - growth",
    features: ["Monthly plan", "Extended radius", "Premium support", "Reduced travel fees"]
  }
} as const;

export const PRICING_MULTIPLIERS = {
  timeBasedSurcharges: {
    sameDay: { multiplier: 1.5, label: "Same-day service", description: "Service requested within 24 hours" },
    nextDay: { multiplier: 1.2, label: "Next-day service", description: "Service requested 24-48 hours ahead" },
    extendedHours: { multiplier: 1.3, label: "Extended hours", description: "Service outside 9am-5pm Mon-Fri" },
    weekend: { multiplier: 1.1, label: "Weekend service", description: "Saturday or Sunday service" },
    holiday: { multiplier: 1.4, label: "Holiday service", description: "Service on recognized holidays" }
  },
  serviceAreaZones: {
    houston_metro: { multiplier: 1.0, label: "Houston Metro", description: "Standard service area" },
    extended_range: { multiplier: 1.2, label: "Extended Range", description: "30-50 miles from Houston" },
    maximum_range: { multiplier: 1.5, label: "Maximum Range", description: "50-60 miles from Houston" }
  },
  discounts: {
    firstTime: { amount: 15, percentage: 0.1, label: "First-time customer", description: "Welcome discount for new customers" },
    referral: { amount: 20, percentage: 0.15, label: "Referral discount", description: "Discount for referred customers" },
    loyalty: { amount: 0, percentage: 0.2, label: "Loyalty customer", description: "Discount for repeat customers (5+ bookings)" }
  },
  extraDocumentFees: {
    QUICK_STAMP_LOCAL: 5, // Extra stamp fee
    STANDARD_NOTARY: 10,
    EXTENDED_HOURS: 10,
    LOAN_SIGNING: 0, // Unlimited
    RON_SERVICES: 5,
    BUSINESS_ESSENTIALS: 3,
    BUSINESS_GROWTH: 2
  }
} as const;

// ============================================================================
// 📊 PRICING SCHEMAS
// ============================================================================

export const TransparentPricingRequestSchema = z.object({
  serviceType: z.enum(['QUICK_STAMP_LOCAL', 'STANDARD_NOTARY', 'EXTENDED_HOURS', 'LOAN_SIGNING', 'RON_SERVICES', 'BUSINESS_ESSENTIALS', 'BUSINESS_GROWTH']),
  documentCount: z.number().min(1).default(1),
  signerCount: z.number().min(1).default(1),
  address: z.string().trim().nullable().optional(),
  scheduledDateTime: z.string().datetime().optional(),
  customerType: z.enum(['new', 'returning', 'loyalty']).default('new'),
  customerEmail: z.string().email().optional().or(z.literal('')),
  referralCode: z.string().optional(),
  promoCode: z.string().optional(),
  requestId: z.string().optional()
}).superRefine((data, ctx) => {
  // Only validate address if it's provided and not for RON services
  if (data.serviceType !== 'RON_SERVICES' && data.address && isAddressMissing(data.address)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Address is required for in-person services.',
      path: ['address']
    });
  }
});

export const PricingBreakdownComponentSchema = z.object({
  amount: z.number(),
  label: z.string(),
  description: z.string(),
  isDiscount: z.boolean().default(false),
  multiplier: z.number().optional(),
  calculation: z.string().optional()
});

export const TransparentPricingResultSchema = z.object({
  serviceType: z.string(),
  basePrice: z.number(),
  totalPrice: z.number(),
  
  breakdown: z.object({
    serviceBase: PricingBreakdownComponentSchema,
    travelFee: PricingBreakdownComponentSchema.optional(),
    extraDocuments: PricingBreakdownComponentSchema.optional(),
    timeBasedSurcharges: z.array(PricingBreakdownComponentSchema),
    serviceAreaMultiplier: PricingBreakdownComponentSchema.optional(),
    discounts: z.array(PricingBreakdownComponentSchema)
  }),
  
  transparency: z.object({
    whyThisPrice: z.string(),
    feeExplanations: z.array(z.string()),
    alternatives: z.array(z.object({
      serviceType: z.string(),
      price: z.number(),
      savings: z.number(),
      tradeoffs: z.array(z.string())
    })),
    priceFactors: z.array(z.string())
  }),
  
  businessRules: z.object({
    serviceAreaZone: z.string(),
    isWithinServiceArea: z.boolean(),
    documentLimitsExceeded: z.boolean(),
    dynamicPricingActive: z.boolean(),
    discountsApplied: z.array(z.string()),
    violations: z.array(z.string()),
    recommendations: z.array(z.string())
  }),
  
  ghlActions: z.object({
    tags: z.array(z.string()),
    customFields: z.record(z.string(), z.union([z.string(), z.number()])),
    workflows: z.array(z.string())
  }),
  
  metadata: z.object({
    calculatedAt: z.string(),
    requestId: z.string(),
    version: z.string(),
    calculationTime: z.number()
  })
});

export type TransparentPricingRequest = z.infer<typeof TransparentPricingRequestSchema>;
export type PricingBreakdownComponent = z.infer<typeof PricingBreakdownComponentSchema>;
export type TransparentPricingResult = z.infer<typeof TransparentPricingResultSchema>;

// ============================================================================
// 🚀 UNIFIED PRICING ENGINE
// ============================================================================

export class UnifiedPricingEngine {
  
  /**
   * Calculate complete transparent pricing
   */
  static async calculateTransparentPricing(request: TransparentPricingRequest): Promise<TransparentPricingResult> {
    const startTime = Date.now();
    const requestId = request.requestId || `pricing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`🔍 [${requestId}] Starting transparent pricing calculation`, {
      serviceType: request.serviceType,
      documentCount: request.documentCount,
      hasAddress: !!request.address,
      customerType: request.customerType
    });

    try {
      // Validate request
      const validatedRequest = TransparentPricingRequestSchema.parse(request);
      
      // Initialize pricing components
      const serviceConfig = UNIFIED_SERVICE_CONFIG[validatedRequest.serviceType];
      const basePrice = serviceConfig.basePrice;
      
      // Initialize breakdown components
      const breakdown = {
        serviceBase: {
          amount: basePrice,
          label: `${validatedRequest.serviceType.replace(/_/g, ' ')} Service`,
          description: serviceConfig.description,
          isDiscount: false,
          calculation: `Base price for ${serviceConfig.description}`
        } as PricingBreakdownComponent,
        
        timeBasedSurcharges: [] as PricingBreakdownComponent[],
        discounts: [] as PricingBreakdownComponent[]
      };
      
      // Initialize business rules tracking
      const businessRules = {
        serviceAreaZone: 'houston_metro',
        isWithinServiceArea: true,
        documentLimitsExceeded: false,
        dynamicPricingActive: false,
        discountsApplied: [] as string[],
        violations: [] as string[],
        recommendations: [] as string[]
      };
      
      // Initialize GHL actions
      const ghlActions = {
        tags: [`service:${validatedRequest.serviceType.toLowerCase()}`],
        customFields: {
          cf_service_type: validatedRequest.serviceType,
          cf_base_price: basePrice,
          cf_document_count: validatedRequest.documentCount,
          cf_signer_count: validatedRequest.signerCount
        } as Record<string, string | number>,
        workflows: [] as string[]
      };
      
      let runningTotal = basePrice;
      
      // 1. Calculate Travel Fee (if address provided and not RON)
      if (validatedRequest.address && validatedRequest.serviceType !== 'RON_SERVICES') {
        console.log(`🗺️ [${requestId}] Calculating travel fee`);
        
        const travelResult = await this.calculateTravelFee(
          validatedRequest.serviceType,
          validatedRequest.address,
          requestId
        );
        
        if (travelResult.fee > 0) {
          (breakdown as any).travelFee = {
            amount: travelResult.fee,
            label: `Travel Fee`,
            description: `${travelResult.distance.toFixed(1)} miles @ $${serviceConfig.feePerMile}/mile`,
            isDiscount: false,
            calculation: `(${travelResult.distance.toFixed(1)} - ${serviceConfig.includedRadius}) × $${serviceConfig.feePerMile}`
          };
          runningTotal += travelResult.fee;
        }
        
        // Update business rules
        businessRules.serviceAreaZone = travelResult.zone;
        businessRules.isWithinServiceArea = travelResult.withinArea;
        
        // Update GHL actions
        ghlActions.customFields.cf_travel_fee = travelResult.fee;
        ghlActions.customFields.cf_travel_distance = travelResult.distance;
        ghlActions.customFields.cf_service_area_zone = travelResult.zone;
        ghlActions.tags.push(`area:${travelResult.zone}`);
      }
      
      // 2. Calculate Extra Document Fees
      if (validatedRequest.documentCount > serviceConfig.maxDocuments) {
        console.log(`📄 [${requestId}] Calculating extra document fees`);
        
        const extraDocs = validatedRequest.documentCount - serviceConfig.maxDocuments;
        const feePerDoc = PRICING_MULTIPLIERS.extraDocumentFees[validatedRequest.serviceType];
        const extraDocFee = extraDocs * feePerDoc;
        
        (breakdown as any).extraDocuments = {
          amount: extraDocFee,
          label: `Additional Documents`,
          description: `${extraDocs} extra document${extraDocs > 1 ? 's' : ''} @ $${feePerDoc} each`,
          isDiscount: false,
          calculation: `${extraDocs} × $${feePerDoc}`
        };
        
        runningTotal += extraDocFee;
        businessRules.documentLimitsExceeded = true;
        
        // Update GHL actions
        ghlActions.customFields.cf_extra_doc_fees = extraDocFee;
        ghlActions.customFields.cf_extra_doc_count = extraDocs;
        ghlActions.tags.push('docs:over_limit');
      }
      
      // 3. Calculate Time-Based Surcharges
      if (validatedRequest.scheduledDateTime) {
        console.log(`⏰ [${requestId}] Calculating time-based surcharges`);
        
        const timeBasedSurcharges = this.calculateTimeBasedSurcharges(
          new Date(validatedRequest.scheduledDateTime),
          runningTotal,
          requestId
        );
        
        breakdown.timeBasedSurcharges = timeBasedSurcharges;
        const totalSurcharges = timeBasedSurcharges.reduce((sum, surcharge) => sum + surcharge.amount, 0);
        
        if (totalSurcharges > 0) {
          runningTotal += totalSurcharges;
          businessRules.dynamicPricingActive = true;
          ghlActions.customFields.cf_time_surcharges = totalSurcharges;
          ghlActions.tags.push('pricing:dynamic_active');
        }
      }
      
      // 4. Calculate Discounts
      console.log(`💰 [${requestId}] Calculating discounts`);
      
      const discountResult = await this.calculateDiscounts(
        validatedRequest.customerType,
        validatedRequest.customerEmail,
        validatedRequest.referralCode,
        validatedRequest.promoCode,
        runningTotal,
        requestId
      );
      
      breakdown.discounts = discountResult.discounts;
      const totalDiscounts = discountResult.totalDiscount;
      businessRules.discountsApplied = discountResult.discountsApplied;
      
      if (totalDiscounts > 0) {
        runningTotal -= totalDiscounts;
        ghlActions.customFields.cf_discount_amount = totalDiscounts;
        ghlActions.tags.push('pricing:discount_applied');
        ghlActions.workflows.push('GHL_DISCOUNT_TRACKING_WORKFLOW_ID');
      }
      
      // 5. Generate Transparency Information
      const transparency = this.generateTransparencyInfo(
        validatedRequest,
        breakdown,
        businessRules,
        requestId
      );
      
      // 6. Update final GHL actions
      ghlActions.customFields.cf_final_total = runningTotal;
      ghlActions.customFields.cf_pricing_breakdown = JSON.stringify(breakdown);
      ghlActions.workflows.push('GHL_PRICING_CONFIRMATION_WORKFLOW_ID');
      
      const calculationTime = Date.now() - startTime;
      
      console.log(`✅ [${requestId}] Transparent pricing calculation completed in ${calculationTime}ms`, {
        basePrice,
        totalPrice: runningTotal,
        discountsApplied: businessRules.discountsApplied,
        dynamicPricingActive: businessRules.dynamicPricingActive
      });

      return {
        serviceType: validatedRequest.serviceType,
        basePrice,
        totalPrice: Math.max(0, runningTotal),
        breakdown,
        transparency,
        businessRules,
        ghlActions,
        metadata: {
          calculatedAt: new Date().toISOString(),
          requestId,
          version: '1.0.0',
          calculationTime
        }
      };
      
    } catch (error) {
      console.error(`❌ [${requestId}] Transparent pricing calculation failed:`, error);
      throw new Error(`Pricing calculation failed: ${error instanceof Error ? getErrorMessage(error) : 'Unknown error'}`);
    }
  }
  
  /**
   * Calculate travel fee with zone detection
   */
  private static async calculateTravelFee(
    serviceType: string,
    address: string,
    requestId: string
  ): Promise<{
    fee: number;
    distance: number;
    zone: string;
    withinArea: boolean;
  }> {
    try {
      const serviceConfig = UNIFIED_SERVICE_CONFIG[serviceType as keyof typeof UNIFIED_SERVICE_CONFIG];
      
      if (serviceType === 'RON_SERVICES') {
        return { fee: 0, distance: 0, zone: 'remote', withinArea: true };
      }

      // Calculate distance using UnifiedDistanceService
      const distanceResult = await UnifiedDistanceService.calculateDistance(address, serviceType);
      const distance = distanceResult.distance.miles || 0;
      
      // Determine service area zone
      let zone = 'houston_metro';
      if (distance > 50) {
        zone = 'maximum_range';
      } else if (distance > 30) {
        zone = 'extended_range';
      }
      
      // Check if within service area (60 miles max based on business rules)
      const withinArea = distance <= 60;
      
      if (!withinArea) {
        throw new Error(`Service area exceeded: ${distance.toFixed(1)} miles (maximum: 60 miles)`);
      }
      
      // Calculate fee
      const excessDistance = Math.max(0, distance - serviceConfig.includedRadius);
      const fee = Math.round(excessDistance * serviceConfig.feePerMile * 100) / 100;

      console.log(`🗺️ [${requestId}] Travel calculation: ${distance.toFixed(1)} miles, zone: ${zone}, fee: $${fee}`);
      
      return { fee, distance, zone, withinArea };
      
    } catch (error: any) {
      console.warn(`⚠️ [${requestId}] Travel fee calculation failed:`, getErrorMessage(error));
      
      // Fallback to estimated fee
      return { fee: 15, distance: 30, zone: 'houston_metro', withinArea: true };
    }
  }
  
  /**
   * Calculate time-based surcharges
   */
  private static calculateTimeBasedSurcharges(
    scheduledDate: Date,
    currentTotal: number,
    requestId: string
  ): PricingBreakdownComponent[] {
    const surcharges: PricingBreakdownComponent[] = [];
    const now = new Date();
    const hoursUntilService = (scheduledDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    // Same-day service (within 24 hours)
    if (hoursUntilService <= 24 && hoursUntilService > 0) {
      const sameDayConfig = PRICING_MULTIPLIERS.timeBasedSurcharges.sameDay;
      const surchargeAmount = Math.round(currentTotal * (sameDayConfig.multiplier - 1) * 100) / 100;
      
      surcharges.push({
        amount: surchargeAmount,
        label: sameDayConfig.label,
        description: sameDayConfig.description,
        isDiscount: false,
        multiplier: sameDayConfig.multiplier,
        calculation: `${currentTotal} × ${(sameDayConfig.multiplier - 1) * 100}%`
      });
    }
    
    // Extended hours (outside 9am-5pm Mon-Fri)
    const hour = scheduledDate.getHours();
    const day = scheduledDate.getDay();
    const isWeekend = day === 0 || day === 6;
    const isAfterHours = hour < 9 || hour >= 17;
    
    if (!isWeekend && isAfterHours) {
      const extendedConfig = PRICING_MULTIPLIERS.timeBasedSurcharges.extendedHours;
      const surchargeAmount = Math.round(currentTotal * (extendedConfig.multiplier - 1) * 100) / 100;
      
      surcharges.push({
        amount: surchargeAmount,
        label: extendedConfig.label,
        description: extendedConfig.description,
        isDiscount: false,
        multiplier: extendedConfig.multiplier,
        calculation: `${currentTotal} × ${(extendedConfig.multiplier - 1) * 100}%`
      });
    }
    
    // Weekend service
    if (isWeekend) {
      const weekendConfig = PRICING_MULTIPLIERS.timeBasedSurcharges.weekend;
      const surchargeAmount = Math.round(currentTotal * (weekendConfig.multiplier - 1) * 100) / 100;
      
      surcharges.push({
        amount: surchargeAmount,
        label: weekendConfig.label,
        description: weekendConfig.description,
        isDiscount: false,
        multiplier: weekendConfig.multiplier,
        calculation: `${currentTotal} × ${(weekendConfig.multiplier - 1) * 100}%`
      });
    }
    
    console.log(`⏰ [${requestId}] Time-based surcharges: ${surcharges.length} applied, total: $${surcharges.reduce((sum, s) => sum + s.amount, 0)}`);
    
    return surcharges;
  }
  
  /**
   * Calculate all applicable discounts
   */
  private static async calculateDiscounts(
    customerType: 'new' | 'returning' | 'loyalty',
    customerEmail?: string,
    referralCode?: string,
    promoCode?: string,
    currentTotal?: number,
    requestId?: string
  ): Promise<{
    discounts: PricingBreakdownComponent[];
    totalDiscount: number;
    discountsApplied: string[];
  }> {
    const discounts: PricingBreakdownComponent[] = [];
    const discountsApplied: string[] = [];
    
    // First-time customer discount
    if (customerType === 'new') {
      const firstTimeConfig = PRICING_MULTIPLIERS.discounts.firstTime;
      discounts.push({
        amount: firstTimeConfig.amount,
        label: firstTimeConfig.label,
        description: firstTimeConfig.description,
        isDiscount: true,
        calculation: `$${firstTimeConfig.amount} welcome discount`
      });
      discountsApplied.push('first_time');
    }
    
    // Referral discount
    if (referralCode) {
      const referralConfig = PRICING_MULTIPLIERS.discounts.referral;
      discounts.push({
        amount: referralConfig.amount,
        label: referralConfig.label,
        description: referralConfig.description,
        isDiscount: true,
        calculation: `$${referralConfig.amount} referral discount`
      });
      discountsApplied.push('referral');
    }
    
    // Loyalty discount
    if (customerType === 'loyalty') {
      const loyaltyConfig = PRICING_MULTIPLIERS.discounts.loyalty;
      const discountAmount = currentTotal ? Math.round(currentTotal * loyaltyConfig.percentage * 100) / 100 : 0;
      
      discounts.push({
        amount: discountAmount,
        label: loyaltyConfig.label,
        description: loyaltyConfig.description,
        isDiscount: true,
        calculation: `${currentTotal} × ${loyaltyConfig.percentage * 100}%`
      });
      discountsApplied.push('loyalty');
    }
    
    const totalDiscount = discounts.reduce((sum, discount) => sum + discount.amount, 0);
    
    console.log(`💰 [${requestId}] Discounts calculated: ${discounts.length} applied, total: $${totalDiscount}`);
    
    return { discounts, totalDiscount, discountsApplied };
  }
  
  /**
   * Generate transparency information
   */
  private static generateTransparencyInfo(
    request: TransparentPricingRequest,
    breakdown: any,
    businessRules: any,
    requestId: string
  ): TransparentPricingResult['transparency'] {
    
    // Generate "Why this price?" explanation
    const priceFactors = [];
    let whyThisPrice = `Your ${request.serviceType.replace(/_/g, ' ').toLowerCase()} service is priced at `;
    
    priceFactors.push(`Base service: ${UNIFIED_SERVICE_CONFIG[request.serviceType].description}`);
    
    if (breakdown.travelFee) {
      priceFactors.push(`Travel: ${breakdown.travelFee.description}`);
      whyThisPrice += `with travel fee for ${breakdown.travelFee.description}, `;
    }
    
    if (breakdown.extraDocuments) {
      priceFactors.push(`Extra documents: ${breakdown.extraDocuments.description}`);
      whyThisPrice += `additional document fees, `;
    }
    
    if (breakdown.timeBasedSurcharges.length > 0) {
      const surchargeLabels = breakdown.timeBasedSurcharges.map((s: any) => s.label).join(', ');
      priceFactors.push(`Time-based pricing: ${surchargeLabels}`);
      whyThisPrice += `time-based surcharges for ${surchargeLabels}, `;
    }
    
    if (breakdown.discounts.length > 0) {
      const discountLabels = breakdown.discounts.map((d: any) => d.label).join(', ');
      priceFactors.push(`Discounts applied: ${discountLabels}`);
      whyThisPrice += `with discounts applied (${discountLabels}), `;
    }
    
    whyThisPrice = whyThisPrice.replace(/,\s*$/, '') + '.';
    
    // Generate fee explanations
    const feeExplanations = [
      `Base price includes ${UNIFIED_SERVICE_CONFIG[request.serviceType].features.join(', ')}`,
      'Travel fees apply for distances beyond our free radius',
      'Time-based surcharges reflect service urgency and availability',
      'All prices are transparent with no hidden fees'
    ];
    
    // Generate alternative options
    const alternatives = this.generateAlternativeOptions(request);
    
    console.log(`📋 [${requestId}] Transparency info generated: ${priceFactors.length} factors, ${alternatives.length} alternatives`);
    
    return {
      whyThisPrice,
      feeExplanations,
      alternatives,
      priceFactors
    };
  }
  
  /**
   * Generate alternative service options
   */
  private static generateAlternativeOptions(request: TransparentPricingRequest): Array<{
    serviceType: string;
    price: number;
    savings: number;
    tradeoffs: string[];
  }> {
    const alternatives = [];
    const currentService = UNIFIED_SERVICE_CONFIG[request.serviceType];
    
    // Suggest cheaper alternatives
    for (const [serviceType, config] of Object.entries(UNIFIED_SERVICE_CONFIG)) {
      if (serviceType !== request.serviceType && config.basePrice < currentService.basePrice) {
        const savings = currentService.basePrice - config.basePrice;
        const tradeoffs = [];
        
        if (config.maxDocuments < request.documentCount) {
          tradeoffs.push(`Supports fewer documents (${config.maxDocuments} vs ${request.documentCount})`);
        }
        
        if (config.includedRadius < currentService.includedRadius) {
          tradeoffs.push(`Smaller service area (${config.includedRadius} vs ${currentService.includedRadius} miles)`);
        }
        
        alternatives.push({
          serviceType,
          price: config.basePrice,
          savings,
          tradeoffs
        });
      }
    }
    
    return alternatives.slice(0, 2); // Limit to top 2 alternatives
  }
} 
