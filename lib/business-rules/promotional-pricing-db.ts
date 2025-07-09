/**
 * Database-Driven Promotional Pricing Engine
 * Phase 3: Dynamic promotional campaigns from database
 */

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { BUSINESS_RULES_CONFIG } from './config';

// ============================================================================
// 🎯 PROMOTIONAL PRICING SCHEMAS
// ============================================================================

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
    campaignId?: string;
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
// 🚀 DATABASE-DRIVEN PROMOTIONAL PRICING ENGINE
// ============================================================================

export class DatabasePromotionalPricingEngine {
  
  /**
   * Calculate all applicable discounts using database campaigns
   */
  static async calculatePromotionalPricing(request: DiscountApplication): Promise<PromotionalResult> {
    const validatedRequest = DiscountApplicationSchema.parse(request);
    const requestId = validatedRequest.requestId;
    
    console.log(`🎫 [${requestId}] Starting database-driven promotional pricing calculation`, {
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
      // Get current active campaigns
      const now = new Date();
      const activeCampaigns = await prisma.promotionalCampaign.findMany({
        where: {
          isActive: true,
          validFrom: { lte: now },
          validUntil: { gte: now }
        },
        orderBy: { createdAt: 'desc' }
      });

      console.log(`📊 [${requestId}] Found ${activeCampaigns.length} active campaigns`);

      // 1. Check automatic eligibility discounts (first-time, loyalty)
      await this.checkAutomaticDiscounts(validatedRequest, result, activeCampaigns);
      
      // 2. Process promo code if provided
      if (validatedRequest.promoCode) {
        await this.processPromoCode(validatedRequest, result, activeCampaigns);
      }
      
      // 3. Check referral discounts
      if (validatedRequest.customer.referralCode) {
        await this.processReferralDiscount(validatedRequest, result, activeCampaigns);
      }
      
      // 4. Check seasonal campaigns
      await this.checkSeasonalCampaigns(validatedRequest, result, activeCampaigns);
      
      // 5. Calculate best discount (no stacking policy)
      result.totalDiscount = this.calculateBestDiscount(result.discounts, validatedRequest.subtotal);
      
      // 6. Record usage for applied discounts
      await this.recordUsage(result, validatedRequest);
      
      // 7. Generate GHL actions
      this.generateGHLActions(result, validatedRequest);
      
      console.log(`✅ [${requestId}] Database promotional pricing completed`, {
        discountsFound: result.discounts.length,
        totalDiscount: result.totalDiscount,
        eligibleCodes: result.eligiblePromoCodes.length
      });

      return result;

    } catch (error) {
      console.error(`❌ [${requestId}] Database promotional pricing failed:`, error);
      result.ineligibleReasons.push('System error processing promotions');
      return result;
    }
  }

  /**
   * Check for automatic eligibility discounts
   */
  private static async checkAutomaticDiscounts(
    request: DiscountApplication, 
    result: PromotionalResult,
    campaigns: any[]
  ): Promise<void> {
    
    // First-time customer discount
    if (request.customer.customerType === 'new') {
      const firstTimeCampaign = campaigns.find(c => 
        c.type === 'first_time' && 
        (c.customerTypes.length === 0 || c.customerTypes.includes('new'))
      );
      
      if (firstTimeCampaign) {
        const amount = this.calculateDiscountAmount(firstTimeCampaign, request.subtotal);
        
        result.discounts.push({
          type: 'first_time',
          code: firstTimeCampaign.code,
          campaignId: firstTimeCampaign.id,
          amount,
          percentage: firstTimeCampaign.type === 'percentage' ? firstTimeCampaign.value : undefined,
          label: firstTimeCampaign.name,
          description: firstTimeCampaign.description || 'First-time customer discount'
        });
        
        result.eligiblePromoCodes.push(firstTimeCampaign.code);
        console.log(`🆕 First-time customer discount applied: $${amount.toFixed(2)} (${firstTimeCampaign.code})`);
      }
    }
    
    // Loyalty customer discount
    if (request.customer.customerType === 'loyalty') {
      const loyaltyCampaign = campaigns.find(c => 
        c.type === 'loyalty' && 
        (c.customerTypes.length === 0 || c.customerTypes.includes('loyalty'))
      );
      
      if (loyaltyCampaign && request.customer.previousBookingCount >= 5) {
        const amount = this.calculateDiscountAmount(loyaltyCampaign, request.subtotal);
        
        result.discounts.push({
          type: 'loyalty',
          code: loyaltyCampaign.code,
          campaignId: loyaltyCampaign.id,
          amount,
          percentage: loyaltyCampaign.type === 'percentage' ? loyaltyCampaign.value : undefined,
          label: loyaltyCampaign.name,
          description: loyaltyCampaign.description || 'Loyalty customer discount'
        });
        
        result.eligiblePromoCodes.push(loyaltyCampaign.code);
        console.log(`🌟 Loyalty customer discount applied: $${amount.toFixed(2)} (${loyaltyCampaign.code})`);
      }
    }
  }

  /**
   * Process a specific promo code
   */
  private static async processPromoCode(
    request: DiscountApplication,
    result: PromotionalResult,
    campaigns: any[]
  ): Promise<void> {
    
    const promoCode = request.promoCode?.toUpperCase();
    if (!promoCode) return;

    // Find matching campaign
    const campaign = campaigns.find(c => c.code === promoCode);
    
    if (!campaign) {
      result.ineligibleReasons.push(`Promo code "${promoCode}" not found`);
      return;
    }

    // Check if campaign has reached usage limits
    if (campaign.maxUses && campaign.currentUses >= campaign.maxUses) {
      result.ineligibleReasons.push(`Promo code "${promoCode}" has reached its usage limit`);
      return;
    }

    // Check service type eligibility
    if (campaign.serviceTypes.length > 0 && !campaign.serviceTypes.includes(request.serviceType)) {
      result.ineligibleReasons.push(`Promo code "${promoCode}" not valid for ${request.serviceType}`);
      return;
    }

    // Check customer type eligibility
    if (campaign.customerTypes.length > 0 && !campaign.customerTypes.includes(request.customer.customerType)) {
      result.ineligibleReasons.push(`Promo code "${promoCode}" not valid for ${request.customer.customerType} customers`);
      return;
    }

    // Check minimum order value
    if (request.subtotal < campaign.minOrderValue) {
      result.ineligibleReasons.push(`Promo code "${promoCode}" requires minimum order of $${campaign.minOrderValue}`);
      return;
    }

    // Calculate discount amount
    const amount = this.calculateDiscountAmount(campaign, request.subtotal);

    result.discounts.push({
      type: 'promo_code',
      code: promoCode,
      campaignId: campaign.id,
      amount,
      percentage: campaign.type === 'percentage' ? campaign.value : undefined,
      label: campaign.name,
      description: campaign.description || `Promo code: ${promoCode}`
    });

    result.eligiblePromoCodes.push(promoCode);
    console.log(`🎫 Promo code "${promoCode}" applied: $${amount.toFixed(2)}`);
  }

  /**
   * Process referral discount
   */
  private static async processReferralDiscount(
    request: DiscountApplication,
    result: PromotionalResult,
    campaigns: any[]
  ): Promise<void> {
    
    if (!request.customer.referralCode) return;

    const referralCampaign = campaigns.find(c => c.type === 'referral');
    
    if (!referralCampaign) return;

    const amount = this.calculateDiscountAmount(referralCampaign, request.subtotal);

    result.discounts.push({
      type: 'referral',
      code: referralCampaign.code,
      campaignId: referralCampaign.id,
      amount,
      percentage: referralCampaign.type === 'percentage' ? referralCampaign.value : undefined,
      label: referralCampaign.name,
      description: `${referralCampaign.description || 'Referral discount'} (Referred by: ${request.customer.referralCode})`
    });

    result.eligiblePromoCodes.push(referralCampaign.code);
    console.log(`👥 Referral discount applied: $${amount.toFixed(2)}`);
  }

  /**
   * Check seasonal campaigns
   */
  private static async checkSeasonalCampaigns(
    request: DiscountApplication,
    result: PromotionalResult,
    campaigns: any[]
  ): Promise<void> {
    
    const seasonalCampaigns = campaigns.filter(c => c.type === 'seasonal');
    
    for (const campaign of seasonalCampaigns) {
      const amount = this.calculateDiscountAmount(campaign, request.subtotal);
      
      result.discounts.push({
        type: 'seasonal',
        code: campaign.code,
        campaignId: campaign.id,
        amount,
        percentage: campaign.type === 'percentage' ? campaign.value : undefined,
        label: campaign.name,
        description: campaign.description || 'Seasonal promotion'
      });
      
      result.eligiblePromoCodes.push(campaign.code);
      console.log(`🎄 Seasonal campaign applied: $${amount.toFixed(2)} (${campaign.code})`);
    }
  }

  /**
   * Calculate discount amount based on campaign type
   */
  private static calculateDiscountAmount(campaign: any, subtotal: number): number {
    if (campaign.type === 'percentage') {
      const amount = subtotal * (campaign.value / 100);
      return Math.min(amount, campaign.maxDiscount || amount);
    } else {
      return Math.min(campaign.value, subtotal);
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
   * Record usage for applied discounts
   */
  private static async recordUsage(result: PromotionalResult, request: DiscountApplication): Promise<void> {
    const appliedDiscount = result.discounts.find(d => d.amount === result.totalDiscount);
    
    if (appliedDiscount && appliedDiscount.campaignId) {
      try {
        // Record usage tracking
        await prisma.promoCodeUsageTracking.create({
          data: {
            campaignId: appliedDiscount.campaignId,
            customerEmail: request.customer.customerEmail,
            discountAmount: appliedDiscount.amount,
            usedAt: new Date()
          }
        });

        // Update campaign usage count
        await prisma.promotionalCampaign.update({
          where: { id: appliedDiscount.campaignId },
          data: { currentUses: { increment: 1 } }
        });

        console.log(`📊 Usage recorded for campaign: ${appliedDiscount.code}`);
      } catch (error) {
        console.error('Error recording promotional usage:', error);
      }
    }
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
    const appliedDiscount = result.discounts.find(d => d.amount === result.totalDiscount);
    result.ghlActions.customFields = {
      cf_discount_amount: result.totalDiscount,
      cf_promo_codes_applied: result.eligiblePromoCodes.join(', '),
      cf_discount_breakdown: JSON.stringify(result.discounts),
      cf_promotional_customer: result.discounts.length > 0 ? 'Yes' : 'No',
      cf_applied_campaign: appliedDiscount ? appliedDiscount.code : null
    };

    // Add workflow triggers
    if (result.totalDiscount > 0) {
      result.ghlActions.workflows.push('GHL_DISCOUNT_TRACKING_WORKFLOW_ID');
      
      // Special workflows for high-value discounts
      if (result.totalDiscount >= 25) {
        result.ghlActions.workflows.push('GHL_HIGH_VALUE_DISCOUNT_WORKFLOW_ID');
      }
    }

    // Type-specific workflows
    if (result.discounts.some(d => d.type === 'first_time')) {
      result.ghlActions.workflows.push('GHL_FIRST_TIME_CUSTOMER_WORKFLOW_ID');
    }

    if (result.discounts.some(d => d.type === 'loyalty')) {
      result.ghlActions.workflows.push('GHL_LOYALTY_CUSTOMER_WORKFLOW_ID');
    }

    if (result.discounts.some(d => d.type === 'referral')) {
      result.ghlActions.workflows.push('GHL_REFERRAL_REWARD_WORKFLOW_ID');
    }
  }

  /**
   * Seed default promotional campaigns
   */
  static async seedDefaultCampaigns(): Promise<void> {
    const defaultCampaigns = [
      {
        code: 'WELCOME10',
        name: '10% First-Time Customer Discount',
        description: 'Welcome to Houston Mobile Notary Pros!',
        type: 'first_time',
        value: 10,
        maxDiscount: 25,
        minOrderValue: 0,
        customerTypes: ['new'],
        validFrom: new Date('2025-01-01'),
        validUntil: new Date('2025-12-31'),
        isActive: true
      },
      {
        code: 'LOYAL20',
        name: '20% Loyalty Customer Discount',
        description: 'Thank you for being a loyal customer!',
        type: 'loyalty',
        value: 20,
        maxDiscount: 50,
        minOrderValue: 0,
        customerTypes: ['loyalty'],
        validFrom: new Date('2025-01-01'),
        validUntil: new Date('2025-12-31'),
        isActive: true
      },
      {
        code: 'FRIEND15',
        name: '15% Referral Discount',
        description: 'Thank you for the referral!',
        type: 'referral',
        value: 15,
        maxDiscount: 40,
        minOrderValue: 0,
        validFrom: new Date('2025-01-01'),
        validUntil: new Date('2025-12-31'),
        isActive: true
      },
      {
        code: 'RON5OFF',
        name: '$5 RON Service Discount',
        description: 'Special discount for remote online notarization!',
        type: 'fixed_amount',
        value: 5,
        serviceTypes: ['RON_SERVICES'],
        validFrom: new Date('2025-01-01'),
        validUntil: new Date('2025-12-31'),
        maxUses: 100,
        isActive: true
      }
    ];

    for (const campaign of defaultCampaigns) {
      await prisma.promotionalCampaign.upsert({
        where: { code: campaign.code },
        update: campaign,
        create: campaign
      });
    }

    console.log('✅ Default promotional campaigns seeded successfully');
  }
}

export default DatabasePromotionalPricingEngine; 