/**
 * GHL Transparent Pricing Custom Fields Configuration
 * Phase 4 Week 3: Enhanced GHL Integration
 * 
 * This module defines all custom fields needed for transparent pricing
 * integration with GoHighLevel CRM.
 */

// ============================================================================
// 📊 CUSTOM FIELDS CONFIGURATION
// ============================================================================

export const TRANSPARENT_PRICING_CUSTOM_FIELDS = {
  // Core Pricing Fields
  cf_transparent_pricing_total: {
    fieldKey: 'cf_transparent_pricing_total',
    fieldType: 'CURRENCY',
    fieldName: 'Transparent Pricing Total',
    fieldDescription: 'Final total price from transparent pricing engine',
    isRequired: false,
    placeholder: '$0.00',
    category: 'pricing'
  },
  
  cf_transparent_pricing_base: {
    fieldKey: 'cf_transparent_pricing_base',
    fieldType: 'CURRENCY',
    fieldName: 'Base Service Price',
    fieldDescription: 'Base price for the selected service',
    isRequired: false,
    placeholder: '$0.00',
    category: 'pricing'
  },
  
  cf_transparent_pricing_breakdown: {
    fieldKey: 'cf_transparent_pricing_breakdown',
    fieldType: 'TEXT_AREA',
    fieldName: 'Pricing Breakdown',
    fieldDescription: 'Detailed pricing breakdown as JSON',
    isRequired: false,
    placeholder: '{"serviceBase": {...}, "travelFee": {...}}',
    category: 'pricing'
  },
  
  // Travel and Location Fields
  cf_transparent_travel_fee: {
    fieldKey: 'cf_transparent_travel_fee',
    fieldType: 'CURRENCY',
    fieldName: 'Travel Fee',
    fieldDescription: 'Travel fee calculated based on distance',
    isRequired: false,
    placeholder: '$0.00',
    category: 'location'
  },
  
  cf_transparent_travel_distance: {
    fieldKey: 'cf_transparent_travel_distance',
    fieldType: 'NUMBER',
    fieldName: 'Travel Distance (Miles)',
    fieldDescription: 'Distance to customer location in miles',
    isRequired: false,
    placeholder: '0.0',
    category: 'location'
  },
  
  cf_transparent_service_area_zone: {
    fieldKey: 'cf_transparent_service_area_zone',
    fieldType: 'DROPDOWN',
    fieldName: 'Service Area Zone',
    fieldDescription: 'Service area zone classification',
    isRequired: false,
    options: [
      { value: 'houston_metro', label: 'Houston Metro' },
      { value: 'extended_range', label: 'Extended Range (30-50 miles)' },
      { value: 'maximum_range', label: 'Maximum Range (50-60 miles)' },
      { value: 'remote', label: 'Remote (RON Services)' }
    ],
    category: 'location'
  },
  
  // Document and Service Fields
  cf_transparent_document_count: {
    fieldKey: 'cf_transparent_document_count',
    fieldType: 'NUMBER',
    fieldName: 'Document Count',
    fieldDescription: 'Total number of documents to be notarized',
    isRequired: false,
    placeholder: '1',
    category: 'service'
  },
  
  cf_transparent_extra_doc_fee: {
    fieldKey: 'cf_transparent_extra_doc_fee',
    fieldType: 'CURRENCY',
    fieldName: 'Extra Document Fee',
    fieldDescription: 'Fee for documents beyond service limit',
    isRequired: false,
    placeholder: '$0.00',
    category: 'service'
  },
  
  cf_transparent_signer_count: {
    fieldKey: 'cf_transparent_signer_count',
    fieldType: 'NUMBER',
    fieldName: 'Signer Count',
    fieldDescription: 'Number of signers for the notarization',
    isRequired: false,
    placeholder: '1',
    category: 'service'
  },
  
  // Time-based Pricing Fields
  cf_transparent_time_surcharges: {
    fieldKey: 'cf_transparent_time_surcharges',
    fieldType: 'CURRENCY',
    fieldName: 'Time-based Surcharges',
    fieldDescription: 'Total surcharges for timing (same-day, extended hours, etc.)',
    isRequired: false,
    placeholder: '$0.00',
    category: 'timing'
  },
  
  cf_transparent_dynamic_pricing_active: {
    fieldKey: 'cf_transparent_dynamic_pricing_active',
    fieldType: 'CHECKBOX',
    fieldName: 'Dynamic Pricing Active',
    fieldDescription: 'Whether dynamic pricing is currently active',
    isRequired: false,
    category: 'timing'
  },
  
  cf_transparent_urgency_level: {
    fieldKey: 'cf_transparent_urgency_level',
    fieldType: 'DROPDOWN',
    fieldName: 'Urgency Level',
    fieldDescription: 'Service urgency level affecting pricing',
    isRequired: false,
    options: [
      { value: 'flexible', label: 'Flexible (2+ weeks out)' },
      { value: 'this_week', label: 'This Week' },
      { value: 'next_day', label: 'Next Day' },
      { value: 'same_day', label: 'Same Day' },
      { value: 'urgent', label: 'Urgent (within hours)' }
    ],
    category: 'timing'
  },
  
  // Discount Fields
  cf_transparent_discount_total: {
    fieldKey: 'cf_transparent_discount_total',
    fieldType: 'CURRENCY',
    fieldName: 'Total Discounts',
    fieldDescription: 'Total discount amount applied',
    isRequired: false,
    placeholder: '$0.00',
    category: 'discounts'
  },
  
  cf_transparent_discount_types: {
    fieldKey: 'cf_transparent_discount_types',
    fieldType: 'MULTI_SELECT',
    fieldName: 'Discount Types Applied',
    fieldDescription: 'Types of discounts applied to this pricing',
    isRequired: false,
    options: [
      { value: 'first_time', label: 'First-time Customer' },
      { value: 'referral', label: 'Referral Discount' },
      { value: 'loyalty', label: 'Loyalty Customer' },
      { value: 'promo_code', label: 'Promo Code' },
      { value: 'seasonal', label: 'Seasonal Discount' },
      { value: 'bulk', label: 'Bulk Service Discount' }
    ],
    category: 'discounts'
  },
  
  cf_transparent_first_time_discount: {
    fieldKey: 'cf_transparent_first_time_discount',
    fieldType: 'CURRENCY',
    fieldName: 'First-time Customer Discount',
    fieldDescription: 'Discount amount for first-time customers',
    isRequired: false,
    placeholder: '$0.00',
    category: 'discounts'
  },
  
  cf_transparent_referral_discount: {
    fieldKey: 'cf_transparent_referral_discount',
    fieldType: 'CURRENCY',
    fieldName: 'Referral Discount',
    fieldDescription: 'Discount amount for referral customers',
    isRequired: false,
    placeholder: '$0.00',
    category: 'discounts'
  },
  
  // Transparency Fields
  cf_transparent_why_this_price: {
    fieldKey: 'cf_transparent_why_this_price',
    fieldType: 'TEXT_AREA',
    fieldName: 'Why This Price?',
    fieldDescription: 'Explanation of pricing factors for customer',
    isRequired: false,
    placeholder: 'Your service is priced at...',
    category: 'transparency'
  },
  
  cf_transparent_alternatives_offered: {
    fieldKey: 'cf_transparent_alternatives_offered',
    fieldType: 'TEXT_AREA',
    fieldName: 'Alternative Options Offered',
    fieldDescription: 'Alternative service options presented to customer',
    isRequired: false,
    placeholder: 'Cheaper alternatives: ...',
    category: 'transparency'
  },
  
  cf_transparent_money_saving_tips: {
    fieldKey: 'cf_transparent_money_saving_tips',
    fieldType: 'TEXT_AREA',
    fieldName: 'Money-Saving Tips',
    fieldDescription: 'Money-saving suggestions provided to customer',
    isRequired: false,
    placeholder: 'Save money by...',
    category: 'transparency'
  },
  
  // Business Rules Fields
  cf_transparent_business_rules_valid: {
    fieldKey: 'cf_transparent_business_rules_valid',
    fieldType: 'CHECKBOX',
    fieldName: 'Business Rules Valid',
    fieldDescription: 'Whether all business rules are satisfied',
    isRequired: false,
    category: 'validation'
  },
  
  cf_transparent_rule_violations: {
    fieldKey: 'cf_transparent_rule_violations',
    fieldType: 'TEXT_AREA',
    fieldName: 'Rule Violations',
    fieldDescription: 'Any business rule violations detected',
    isRequired: false,
    placeholder: 'No violations',
    category: 'validation'
  },
  
  cf_transparent_recommendations: {
    fieldKey: 'cf_transparent_recommendations',
    fieldType: 'TEXT_AREA',
    fieldName: 'System Recommendations',
    fieldDescription: 'Recommendations from the pricing system',
    isRequired: false,
    placeholder: 'No recommendations',
    category: 'validation'
  },
  
  // Metadata Fields
  cf_transparent_pricing_version: {
    fieldKey: 'cf_transparent_pricing_version',
    fieldType: 'TEXT',
    fieldName: 'Pricing Engine Version',
    fieldDescription: 'Version of the pricing engine used',
    isRequired: false,
    placeholder: '1.0.0',
    category: 'metadata'
  },
  
  cf_transparent_calculation_time: {
    fieldKey: 'cf_transparent_calculation_time',
    fieldType: 'NUMBER',
    fieldName: 'Calculation Time (ms)',
    fieldDescription: 'Time taken to calculate pricing in milliseconds',
    isRequired: false,
    placeholder: '0',
    category: 'metadata'
  },
  
  cf_transparent_request_id: {
    fieldKey: 'cf_transparent_request_id',
    fieldType: 'TEXT',
    fieldName: 'Pricing Request ID',
    fieldDescription: 'Unique identifier for this pricing calculation',
    isRequired: false,
    placeholder: 'pricing_123456789',
    category: 'metadata'
  },
  
  cf_transparent_last_updated: {
    fieldKey: 'cf_transparent_last_updated',
    fieldType: 'DATE_TIME',
    fieldName: 'Pricing Last Updated',
    fieldDescription: 'When the pricing was last calculated',
    isRequired: false,
    category: 'metadata'
  }
} as const;

// ============================================================================
// 🏷️ TRANSPARENT PRICING TAGS
// ============================================================================

export const TRANSPARENT_PRICING_TAGS = {
  // Service Tags
  service_quick_stamp: 'service:quick_stamp_local',
  service_standard: 'service:standard_notary',
  service_extended: 'service:extended_hours',
  service_loan: 'service:loan_signing',
  service_ron: 'service:ron_services',
  service_business_essentials: 'service:business_essentials',
  service_business_growth: 'service:business_growth',
  
  // Pricing Status Tags
  pricing_transparent: 'pricing:transparent',
  pricing_calculated: 'pricing:calculated',
  pricing_dynamic_active: 'pricing:dynamic_active',
  pricing_discount_applied: 'pricing:discount_applied',
  pricing_surcharge_applied: 'pricing:surcharge_applied',
  
  // Service Area Tags
  area_houston_metro: 'area:houston_metro',
  area_extended_range: 'area:extended_range',
  area_maximum_range: 'area:maximum_range',
  area_remote: 'area:remote',
  
  // Timing Tags
  timing_same_day: 'timing:same_day',
  timing_next_day: 'timing:next_day',
  timing_extended_hours: 'timing:extended_hours',
  timing_weekend: 'timing:weekend',
  timing_holiday: 'timing:holiday',
  timing_flexible: 'timing:flexible',
  
  // Discount Tags
  discount_first_time: 'discount:first_time',
  discount_referral: 'discount:referral',
  discount_loyalty: 'discount:loyalty',
  discount_promo: 'discount:promo_code',
  discount_seasonal: 'discount:seasonal',
  
  // Document Tags
  docs_standard: 'docs:standard_count',
  docs_over_limit: 'docs:over_limit',
  docs_bulk: 'docs:bulk_service',
  
  // Validation Tags
  validation_passed: 'validation:passed',
  validation_warnings: 'validation:warnings',
  validation_failed: 'validation:failed',
  
  // Transparency Tags
  transparency_full: 'transparency:full_disclosure',
  transparency_alternatives_shown: 'transparency:alternatives_shown',
  transparency_money_saving_tips: 'transparency:money_saving_tips',
  
  // Customer Journey Tags
  journey_pricing_viewed: 'journey:pricing_viewed',
  journey_alternatives_considered: 'journey:alternatives_considered',
  journey_discount_applied: 'journey:discount_applied',
  journey_pricing_accepted: 'journey:pricing_accepted'
} as const;

// ============================================================================
// 📋 WORKFLOW CONFIGURATION
// ============================================================================

export const TRANSPARENT_PRICING_WORKFLOWS = {
  // Pricing Calculation Workflows
  pricing_calculation_complete: {
    workflowId: 'GHL_PRICING_CALCULATION_COMPLETE',
    name: 'Pricing Calculation Complete',
    description: 'Triggered when transparent pricing calculation is completed',
    triggerConditions: ['pricing_calculated'],
    actions: [
      'send_pricing_confirmation_email',
      'update_opportunity_value',
      'add_pricing_notes',
      'schedule_follow_up'
    ]
  },
  
  dynamic_pricing_active: {
    workflowId: 'GHL_DYNAMIC_PRICING_ACTIVE',
    name: 'Dynamic Pricing Active',
    description: 'Triggered when dynamic pricing is applied',
    triggerConditions: ['pricing_dynamic_active'],
    actions: [
      'notify_admin_dynamic_pricing',
      'send_urgency_confirmation',
      'update_calendar_priority'
    ]
  },
  
  // Discount Workflows
  discount_applied: {
    workflowId: 'GHL_DISCOUNT_APPLIED',
    name: 'Discount Applied',
    description: 'Triggered when any discount is applied',
    triggerConditions: ['pricing_discount_applied'],
    actions: [
      'send_discount_confirmation',
      'update_customer_type',
      'track_discount_usage',
      'send_thank_you_message'
    ]
  },
  
  first_time_discount: {
    workflowId: 'GHL_FIRST_TIME_DISCOUNT',
    name: 'First-time Customer Discount',
    description: 'Triggered for first-time customer discounts',
    triggerConditions: ['discount_first_time'],
    actions: [
      'welcome_new_customer',
      'send_service_education',
      'schedule_onboarding_call',
      'add_to_newsletter'
    ]
  },
  
  // Transparency Workflows
  alternatives_shown: {
    workflowId: 'GHL_ALTERNATIVES_SHOWN',
    name: 'Alternative Options Shown',
    description: 'Triggered when alternative service options are shown',
    triggerConditions: ['transparency_alternatives_shown'],
    actions: [
      'track_alternative_consideration',
      'send_comparison_guide',
      'offer_consultation'
    ]
  },
  
  money_saving_tips: {
    workflowId: 'GHL_MONEY_SAVING_TIPS',
    name: 'Money-Saving Tips Provided',
    description: 'Triggered when money-saving tips are provided',
    triggerConditions: ['transparency_money_saving_tips'],
    actions: [
      'send_savings_confirmation',
      'track_customer_satisfaction',
      'offer_future_discounts'
    ]
  },
  
  // Validation Workflows
  business_rules_failed: {
    workflowId: 'GHL_BUSINESS_RULES_FAILED',
    name: 'Business Rules Validation Failed',
    description: 'Triggered when business rules validation fails',
    triggerConditions: ['validation_failed'],
    actions: [
      'notify_admin_validation_failure',
      'send_alternative_options',
      'schedule_consultation',
      'escalate_to_manager'
    ]
  },
  
  service_area_exceeded: {
    workflowId: 'GHL_SERVICE_AREA_EXCEEDED',
    name: 'Service Area Exceeded',
    description: 'Triggered when customer is outside service area',
    triggerConditions: ['area_exceeded'],
    actions: [
      'send_service_area_explanation',
      'offer_ron_alternative',
      'refer_to_partner_notary',
      'add_to_expansion_waitlist'
    ]
  }
} as const;

// ============================================================================
// 🔧 FIELD MANAGEMENT UTILITIES
// ============================================================================

export class TransparentPricingFieldManager {
  
  /**
   * Get all custom fields for a specific category
   */
  static getFieldsByCategory(category: string) {
    return Object.entries(TRANSPARENT_PRICING_CUSTOM_FIELDS)
      .filter(([_, field]) => field.category === category)
      .reduce((acc, [key, field]) => {
        acc[key] = field;
        return acc;
      }, {} as Record<string, any>);
  }
  
  /**
   * Get all tags for a specific category
   */
  static getTagsByCategory(category: string) {
    const categoryPrefix = `${category}:`;
    return Object.entries(TRANSPARENT_PRICING_TAGS)
      .filter(([_, tag]) => tag.startsWith(categoryPrefix))
      .reduce((acc, [key, tag]) => {
        acc[key] = tag;
        return acc;
      }, {} as Record<string, string>);
  }
  
  /**
   * Transform pricing result to GHL custom fields
   */
  static transformPricingResultToCustomFields(pricingResult: any) {
    const customFields = [];
    
    // Core pricing fields
    customFields.push({
      key: 'cf_transparent_pricing_total',
      value: pricingResult.totalPrice
    });
    
    customFields.push({
      key: 'cf_transparent_pricing_base',
      value: pricingResult.basePrice
    });
    
    customFields.push({
      key: 'cf_transparent_pricing_breakdown',
      value: JSON.stringify(pricingResult.breakdown)
    });
    
    // Travel fields
    if (pricingResult.breakdown.travelFee) {
      customFields.push({
        key: 'cf_transparent_travel_fee',
        value: pricingResult.breakdown.travelFee.amount
      });
    }
    
    // Document fields
    customFields.push({
      key: 'cf_transparent_document_count',
      value: pricingResult.ghlActions.customFields.cf_document_count
    });
    
    // Discount fields
    const totalDiscounts = pricingResult.breakdown.discounts.reduce((sum: number, d: any) => sum + d.amount, 0);
    if (totalDiscounts > 0) {
      customFields.push({
        key: 'cf_transparent_discount_total',
        value: totalDiscounts
      });
      
      customFields.push({
        key: 'cf_transparent_discount_types',
        value: pricingResult.businessRules.discountsApplied.join(',')
      });
    }
    
    // Transparency fields
    customFields.push({
      key: 'cf_transparent_why_this_price',
      value: pricingResult.transparency.whyThisPrice
    });
    
    // Business rules
    customFields.push({
      key: 'cf_transparent_business_rules_valid',
      value: pricingResult.businessRules.violations.length === 0
    });
    
    // Metadata
    customFields.push({
      key: 'cf_transparent_pricing_version',
      value: pricingResult.metadata.version
    });
    
    customFields.push({
      key: 'cf_transparent_calculation_time',
      value: pricingResult.metadata.calculationTime
    });
    
    customFields.push({
      key: 'cf_transparent_request_id',
      value: pricingResult.metadata.requestId
    });
    
    customFields.push({
      key: 'cf_transparent_last_updated',
      value: pricingResult.metadata.calculatedAt
    });
    
    return customFields;
  }
  
  /**
   * Generate appropriate tags for pricing result
   */
  static generateTagsForPricingResult(pricingResult: any) {
    const tags = [];
    
    // Service tag
    const serviceTag = TRANSPARENT_PRICING_TAGS[`service_${pricingResult.serviceType.toLowerCase()}` as keyof typeof TRANSPARENT_PRICING_TAGS];
    if (serviceTag) tags.push(serviceTag);
    
    // Pricing status tags
    tags.push(TRANSPARENT_PRICING_TAGS.pricing_transparent);
    tags.push(TRANSPARENT_PRICING_TAGS.pricing_calculated);
    
    // Dynamic pricing
    if (pricingResult.businessRules.dynamicPricingActive) {
      tags.push(TRANSPARENT_PRICING_TAGS.pricing_dynamic_active);
    }
    
    // Discounts
    if (pricingResult.businessRules.discountsApplied.length > 0) {
      tags.push(TRANSPARENT_PRICING_TAGS.pricing_discount_applied);
      
      pricingResult.businessRules.discountsApplied.forEach((discount: string) => {
        const discountTag = TRANSPARENT_PRICING_TAGS[`discount_${discount}` as keyof typeof TRANSPARENT_PRICING_TAGS];
        if (discountTag) tags.push(discountTag);
      });
    }
    
    // Service area
    const areaTag = TRANSPARENT_PRICING_TAGS[`area_${pricingResult.businessRules.serviceAreaZone}` as keyof typeof TRANSPARENT_PRICING_TAGS];
    if (areaTag) tags.push(areaTag);
    
    // Transparency
    tags.push(TRANSPARENT_PRICING_TAGS.transparency_full);
    
    if (pricingResult.transparency.alternatives.length > 0) {
      tags.push(TRANSPARENT_PRICING_TAGS.transparency_alternatives_shown);
      tags.push(TRANSPARENT_PRICING_TAGS.transparency_money_saving_tips);
    }
    
    // Validation
    if (pricingResult.businessRules.violations.length === 0) {
      tags.push(TRANSPARENT_PRICING_TAGS.validation_passed);
    } else {
      tags.push(TRANSPARENT_PRICING_TAGS.validation_warnings);
    }
    
    // Journey
    tags.push(TRANSPARENT_PRICING_TAGS.journey_pricing_viewed);
    
    return tags;
  }
}

export default TransparentPricingFieldManager; 