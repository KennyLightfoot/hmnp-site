/**
 * Promotional Pricing System - Houston Mobile Notary Pros
 * Phase 2: Advanced discount management with business rules integration
 * 
 * Features:
 * - Promo code management and validation
 * - Customer eligibility checking  
 * - Referral discount system
 * - Seasonal campaigns
 * - Business rules compliance
 * - GHL automation integration
 */

import { z } from 'zod';
import { BUSINESS_RULES_CONFIG } from './config';

// ============================================================================
// 🎯 PROMOTIONAL PRICING SCHEMAS
// ============================================================================

const PromoCodeSchema = z.object({
  code: z.string().min(3).max(20).toUpperCase(),
  type: z.enum(['percentage', 'fixed_amount', 'first_time', 'referral', 'loyalty', 'seasonal']),
  value: z.number().min(0),
  maxValue: z.number().optional(), // Max discount amount for percentage
  minOrderValue: z.number().min(0).default(0),
  maxUses: z.number().min(1).optional(),
  currentUses: z.number().min(0).default(0),
  validFrom: z.date(),
  validUntil: z.date(),
  serviceTypes: z.array(z.string()).optional(), // Specific services only
  customerTypes: z.array(z.enum(['new', 'returning', 'loyalty'])).optional(),
  isActive: z.boolean().default(true),
  createdBy: z.string(),
  description: z.string().max(200)
});

const CustomerEligibilitySchema = z.object({
  customerId: z.string().optional(),
  customerEmail: z.string().email(),
  customerType: z.enum(['new', 'returning', 'loyalty']),
  previousBookingCount: z.number().min(0).default(0),
  lastBookingDate: z.date().optional(),
  referralCode: z.string().optional(),
  totalSpent: z.number().min(0).default(0)
});

const DiscountApplicationSchema = z.object({
  serviceType: z.string(),
  subtotal: z.number().min(0),
  customer: CustomerEligibilitySchema,
  promoCode: z.string().optional(),
  requestId: z.string()
});

export type PromoCode = z.infer<typeof PromoCodeSchema>;
export type CustomerEligibility = z.infer<typeof CustomerEligibilitySchema>;
export type DiscountApplication = z.infer<typeof DiscountApplicationSchema>;

export interface PromotionalResult {
  discounts: Array<{
    type: string;
    code?: string;
    amount: number;
    percentage?: number;
    label: string;
    description: string;
  }>;
  totalDiscount: number;
  eligiblePromoCodes: string[];
  ineligibleReasons: string[];
  ghlActions: {
    tags: string[];
    customFields: Record<string, any>;
    workflows: string[];
  };
}

// ============================================================================
// 🎮 PROMOTIONAL CAMPAIGNS CONFIGURATION
// ============================================================================

const PROMOTIONAL_CAMPAIGNS = {
  // Permanent discounts
  FIRST_TIME: {
    code: 'WELCOME10',
    type: 'percentage' as const,
    value: 0.1,
    label: '10% First-Time Customer Discount',
    description: 'Welcome to Houston Mobile Notary Pros!',
    maxValue: 25,
    customerTypes: ['new']
  },
  
  LOYALTY: {
    code: 'LOYAL20',
    type: 'percentage' as const,
    value: 0.2,
    label: '20% Loyalty Customer Discount',
    description: 'Thank you for being a loyal customer!',
    maxValue: 50,
    customerTypes: ['loyalty'],
    minBookings: 5
  },
  
  REFERRAL: {
    code: 'FRIEND15',
    type: 'percentage' as const,
    value: 0.15,
    label: '15% Referral Discount',
    description: 'Thank you for the referral!',
    maxValue: 40,
    requiresReferralCode: true
  },
  
  // Seasonal campaigns
  WINTER_SPECIAL: {
    code: 'WINTER25',
    type: 'fixed_amount' as const,
    value: 25,
    label: '$25 Winter Special',
    description: 'Stay warm while we handle your notarization!',
    seasonalStart: '2025-01-01',
    seasonalEnd: '2025-03-31',
    maxUses: 100
  },
  
  SPRING_PROMO: {
    code: 'SPRING15',
    type: 'percentage' as const,
    value: 0.15,
    label: '15% Spring Promotion',
    description: 'Spring into action with savings!',
    seasonalStart: '2025-04-01',
    seasonalEnd: '2025-06-30',
    maxValue: 35
  },
  
  // Service-specific promotions
  RON_DISCOUNT: {
    code: 'RON5OFF',
    type: 'fixed_amount' as const,
    value: 5,
    label: '$5 RON Service Discount',
    description: 'Special discount for remote online notarization!',
    serviceTypes: ['RON_SERVICES'],
    maxUses: 50
  },
  
  LOAN_SIGNING: {
    code: 'LOANS10',
    type: 'percentage' as const,
    value: 0.1,
    label: '10% Loan Signing Discount',
    description: 'Professional loan signing services!',
    serviceTypes: ['LOAN_SIGNING'],
    maxValue: 20,
    minOrderValue: 100
  }
} as const;

// ============================================================================
// 🚀 PROMOTIONAL PRICING ENGINE
// ============================================================================

export class PromotionalPricingEngine {
  
  /**
   * Calculate all applicable discounts for a customer and service
   */
  static async calculatePromotionalPricing(request: DiscountApplication): Promise<PromotionalResult> {
    const validatedRequest = DiscountApplicationSchema.parse(request);
    const requestId = validatedRequest.requestId;
    
    console.log(`🎫 [${requestId}] Starting promotional pricing calculation`, {
      serviceType: validatedRequest.serviceType,
      subtotal: validatedRequest.subtotal,
      customerType: validatedRequest.customer.customerType,
      hasPromoCode: !!validatedRequest.promoCode
    });

    const result: PromotionalResult = {
      discounts: [],
      totalDiscount: 0,
      eligiblePromoCodes: [],
      ineligibleReasons: [],
      ghlActions: {
        tags: [],
        customFields: {},
        workflows: []
      }
    };

    try {
      // 1. Check automatic eligibility discounts (first-time, loyalty)
      await this.checkAutomaticDiscounts(validatedRequest, result);
      
      // 2. Process promo code if provided
      if (validatedRequest.promoCode) {
        await this.processPromoCode(validatedRequest, result);
      }
      
      // 3. Check referral discounts
      if (validatedRequest.customer.referralCode) {
        await this.processReferralDiscount(validatedRequest, result);
      }
      
      // 4. Check seasonal campaigns
      await this.checkSeasonalCampaigns(validatedRequest, result);
      
      // 5. Calculate total discount (apply best discount only to prevent stacking)
      result.totalDiscount = this.calculateBestDiscount(result.discounts, validatedRequest.subtotal);
      
      // 6. Generate GHL actions
      this.generateGHLActions(result, validatedRequest);
      
      console.log(`✅ [${requestId}] Promotional pricing completed`, {
        discountsFound: result.discounts.length,
        totalDiscount: result.totalDiscount,
        eligibleCodes: result.eligiblePromoCodes.length
      });

      return result;

    } catch (error) {
      console.error(`❌ [${requestId}] Promotional pricing failed:`, error);
      result.ineligibleReasons.push('System error processing promotions');
      return result;
    }
  }

  /**
   * Check for automatic eligibility discounts (first-time, loyalty)
   */
  private static async checkAutomaticDiscounts(
    request: DiscountApplication, 
    result: PromotionalResult
  ): Promise<void> {
    
    // First-time customer discount
    if (request.customer.customerType === 'new') {
      const campaign = PROMOTIONAL_CAMPAIGNS.FIRST_TIME;
      const amount = Math.min(
        request.subtotal * campaign.value,
        campaign.maxValue || Infinity
      );
      
      result.discounts.push({
        type: 'first_time',
        code: campaign.code,
        amount,
        percentage: campaign.value,
        label: campaign.label,
        description: campaign.description
      });
      
      result.eligiblePromoCodes.push(campaign.code);
      console.log(`🆕 First-time customer discount applied: $${amount.toFixed(2)}`);
    }
    
    // Loyalty customer discount
    if (request.customer.customerType === 'loyalty' && 
        request.customer.previousBookingCount >= (PROMOTIONAL_CAMPAIGNS.LOYALTY.minBookings || 5)) {
      
      const campaign = PROMOTIONAL_CAMPAIGNS.LOYALTY;
      const amount = Math.min(
        request.subtotal * campaign.value,
        campaign.maxValue || Infinity
      );
      
      result.discounts.push({
        type: 'loyalty',
        code: campaign.code,
        amount,
        percentage: campaign.value,
        label: campaign.label,
        description: campaign.description
      });
      
      result.eligiblePromoCodes.push(campaign.code);
      console.log(`🌟 Loyalty customer discount applied: $${amount.toFixed(2)}`);
    }
  }

  /**
   * Process a specific promo code
   */
  private static async processPromoCode(
    request: DiscountApplication,
    result: PromotionalResult
  ): Promise<void> {
    
    const promoCode = request.promoCode?.toUpperCase();
    if (!promoCode) return;

    // Find matching campaign
    const campaign = Object.values(PROMOTIONAL_CAMPAIGNS).find(c => c.code === promoCode);
    
    if (!campaign) {
      result.ineligibleReasons.push(`Promo code "${promoCode}" not found`);
      return;
    }

    // Check service type eligibility
    if (campaign.serviceTypes && !campaign.serviceTypes.includes(request.serviceType)) {
      result.ineligibleReasons.push(`Promo code "${promoCode}" not valid for ${request.serviceType}`);
      return;
    }

    // Check customer type eligibility
    if (campaign.customerTypes && !campaign.customerTypes.includes(request.customer.customerType)) {
      result.ineligibleReasons.push(`Promo code "${promoCode}" not valid for ${request.customer.customerType} customers`);
      return;
    }

    // Check minimum order value
    if (campaign.minOrderValue && request.subtotal < campaign.minOrderValue) {
      result.ineligibleReasons.push(`Promo code "${promoCode}" requires minimum order of $${campaign.minOrderValue}`);
      return;
    }

    // Check seasonal validity
    if (campaign.seasonalStart && campaign.seasonalEnd) {
      const now = new Date();
      const start = new Date(campaign.seasonalStart);
      const end = new Date(campaign.seasonalEnd);
      
      if (now < start || now > end) {
        result.ineligibleReasons.push(`Promo code "${promoCode}" is not currently active`);
        return;
      }
    }

    // Calculate discount amount
    let amount = 0;
    if (campaign.type === 'percentage') {
      amount = Math.min(
        request.subtotal * campaign.value,
        campaign.maxValue || Infinity
      );
    } else {
      amount = campaign.value;
    }

    result.discounts.push({
      type: 'promo_code',
      code: promoCode,
      amount,
      percentage: campaign.type === 'percentage' ? campaign.value : undefined,
      label: campaign.label,
      description: campaign.description
    });

    result.eligiblePromoCodes.push(promoCode);
    console.log(`🎫 Promo code "${promoCode}" applied: $${amount.toFixed(2)}`);
  }

  /**
   * Process referral discount
   */
  private static async processReferralDiscount(
    request: DiscountApplication,
    result: PromotionalResult
  ): Promise<void> {
    
    if (!request.customer.referralCode) return;

    const campaign = PROMOTIONAL_CAMPAIGNS.REFERRAL;
    const amount = Math.min(
      request.subtotal * campaign.value,
      campaign.maxValue || Infinity
    );

    result.discounts.push({
      type: 'referral',
      code: campaign.code,
      amount,
      percentage: campaign.value,
      label: campaign.label,
      description: `${campaign.description} (Referred by: ${request.customer.referralCode})`
    });

    result.eligiblePromoCodes.push(campaign.code);
    console.log(`👥 Referral discount applied: $${amount.toFixed(2)}`);
  }

  /**
   * Check seasonal campaigns
   */
  private static async checkSeasonalCampaigns(
    request: DiscountApplication,
    result: PromotionalResult
  ): Promise<void> {
    
    const now = new Date();
    
    // Check winter special
    const winter = PROMOTIONAL_CAMPAIGNS.WINTER_SPECIAL;
    if (winter.seasonalStart && winter.seasonalEnd) {
      const start = new Date(winter.seasonalStart);
      const end = new Date(winter.seasonalEnd);
      
      if (now >= start && now <= end) {
        result.discounts.push({
          type: 'seasonal',
          code: winter.code,
          amount: winter.value,
          label: winter.label,
          description: winter.description
        });
        
        result.eligiblePromoCodes.push(winter.code);
      }
    }

    // Check spring promo
    const spring = PROMOTIONAL_CAMPAIGNS.SPRING_PROMO;
    if (spring.seasonalStart && spring.seasonalEnd) {
      const start = new Date(spring.seasonalStart);
      const end = new Date(spring.seasonalEnd);
      
      if (now >= start && now <= end) {
        const amount = Math.min(
          request.subtotal * spring.value,
          spring.maxValue || Infinity
        );
        
        result.discounts.push({
          type: 'seasonal',
          code: spring.code,
          amount,
          percentage: spring.value,
          label: spring.label,
          description: spring.description
        });
        
        result.eligiblePromoCodes.push(spring.code);
      }
    }
  }

  /**
   * Calculate the best discount (no stacking)
   */
  private static calculateBestDiscount(discounts: PromotionalResult['discounts'], subtotal: number): number {
    if (discounts.length === 0) return 0;
    
    // Return the highest discount amount
    const bestDiscount = Math.max(...discounts.map(d => d.amount));
    
    // Ensure discount doesn't exceed subtotal
    return Math.min(bestDiscount, subtotal);
  }

  /**
   * Generate GHL automation actions
   */
  private static generateGHLActions(result: PromotionalResult, request: DiscountApplication): void {
    
    // Add promotional tags
    if (result.discounts.length > 0) {
      result.ghlActions.tags.push('promotion:discount_applied');
      
      result.discounts.forEach(discount => {
        result.ghlActions.tags.push(`promotion:${discount.type}`);
        if (discount.code) {
          result.ghlActions.tags.push(`promo_code:${discount.code}`);
        }
      });
    }

    // Add custom fields
    result.ghlActions.customFields = {
      cf_discount_amount: result.totalDiscount,
      cf_promo_codes_applied: result.eligiblePromoCodes.join(', '),
      cf_discount_breakdown: JSON.stringify(result.discounts),
      cf_promotional_customer: result.discounts.length > 0 ? 'Yes' : 'No'
    };

    // Add workflow triggers
    if (result.totalDiscount > 0) {
      result.ghlActions.workflows.push('GHL_DISCOUNT_TRACKING_WORKFLOW_ID');
      
      // Special workflows for high-value discounts
      if (result.totalDiscount >= 25) {
        result.ghlActions.workflows.push('GHL_HIGH_VALUE_DISCOUNT_WORKFLOW_ID');
      }
    }

    // First-time customer workflow
    if (result.discounts.some(d => d.type === 'first_time')) {
      result.ghlActions.workflows.push('GHL_FIRST_TIME_CUSTOMER_WORKFLOW_ID');
    }

    // Loyalty customer workflow
    if (result.discounts.some(d => d.type === 'loyalty')) {
      result.ghlActions.workflows.push('GHL_LOYALTY_CUSTOMER_WORKFLOW_ID');
    }

    // Referral workflow
    if (result.discounts.some(d => d.type === 'referral')) {
      result.ghlActions.workflows.push('GHL_REFERRAL_REWARD_WORKFLOW_ID');
    }
  }

  /**
   * Validate a specific promo code (for real-time checking)
   */
  static async validatePromoCode(
    code: string,
    serviceType: string,
    customerType: 'new' | 'returning' | 'loyalty',
    orderValue: number
  ): Promise<{
    isValid: boolean;
    discount?: { amount: number; label: string; description: string };
    reason?: string;
  }> {
    
    const promoCode = code.toUpperCase();
    const campaign = Object.values(PROMOTIONAL_CAMPAIGNS).find(c => c.code === promoCode);
    
    if (!campaign) {
      return { isValid: false, reason: 'Promo code not found' };
    }

    // Check service type
    if (campaign.serviceTypes && !campaign.serviceTypes.includes(serviceType)) {
      return { isValid: false, reason: `Not valid for ${serviceType}` };
    }

    // Check customer type
    if (campaign.customerTypes && !campaign.customerTypes.includes(customerType)) {
      return { isValid: false, reason: `Not valid for ${customerType} customers` };
    }

    // Check minimum order
    if (campaign.minOrderValue && orderValue < campaign.minOrderValue) {
      return { isValid: false, reason: `Requires minimum order of $${campaign.minOrderValue}` };
    }

    // Check seasonal validity
    if (campaign.seasonalStart && campaign.seasonalEnd) {
      const now = new Date();
      const start = new Date(campaign.seasonalStart);
      const end = new Date(campaign.seasonalEnd);
      
      if (now < start || now > end) {
        return { isValid: false, reason: 'Promotion is not currently active' };
      }
    }

    // Calculate discount
    let amount = 0;
    if (campaign.type === 'percentage') {
      amount = Math.min(orderValue * campaign.value, campaign.maxValue || Infinity);
    } else {
      amount = campaign.value;
    }

    return {
      isValid: true,
      discount: {
        amount,
        label: campaign.label,
        description: campaign.description
      }
    };
  }
}

export default PromotionalPricingEngine; 