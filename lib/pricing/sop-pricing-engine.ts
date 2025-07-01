/**
 * SOP Pricing Engine
 * Standardized pricing calculation based on business rules
 */

import { validateServiceArea, type ServiceAreaResult } from '@/lib/maps/sop-service-area';

export interface SOPPricingInput {
  serviceType: string;
  location: {
    zipCode: string;
    address?: string;
    city?: string;
    state?: string;
  };
  documentCount?: number;
  urgencyLevel?: 'STANDARD' | 'RUSH' | 'EMERGENCY';
  isFirstTimeCustomer?: boolean;
  promoCode?: string;
}

export interface SOPPricingResult {
  basePrice: number;
  travelFee: number;
  urgencyFee: number;
  documentFee: number;
  subtotal: number;
  discountAmount: number;
  totalPrice: number;
  depositAmount: number;
  depositRequired: boolean;
  breakdown: PricingBreakdown[];
  serviceAreaInfo: ServiceAreaResult;
  appliedPromoCode?: string;
  isFirstTimeDiscount?: boolean;
}

export interface PricingBreakdown {
  description: string;
  amount: number;
  type: 'base' | 'travel' | 'urgency' | 'document' | 'discount' | 'deposit';
}

// SOP Base Pricing Structure
const SOP_BASE_RATES = {
  NOTARY_STANDARD: 75,          // $75 - Standard notarization
  NOTARY_PREMIUM: 100,          // $100 - Premium notarization with extras
  LOAN_SIGNING: 150,            // $150 - Loan signing services
  REMOTE_ONLINE_NOTARIZATION: 25, // $25 - RON services
  MOBILE_NOTARY: 100,           // $100 - Mobile notary services
  WITNESS_SERVICE: 50,          // $50 - Witness services
  DOCUMENT_PREP: 75,            // $75 - Document preparation
} as const;

// Additional fees
const FEES = {
  TRAVEL_PER_MILE: 0.50,        // $0.50 per mile travel fee
  RUSH_MULTIPLIER: 1.5,         // 50% surcharge for rush service
  EMERGENCY_MULTIPLIER: 2.0,    // 100% surcharge for emergency service
  EXTRA_DOCUMENT_FEE: 5,        // $5 per additional document (after first 3)
  AFTER_HOURS_FEE: 25,          // $25 after hours fee (weekends/evenings)
} as const;

// Deposit requirements
const DEPOSIT_RULES = {
  REQUIRED_THRESHOLD: 100,      // Deposit required for services > $100
  DEPOSIT_PERCENTAGE: 0.5,      // 50% deposit
  MINIMUM_DEPOSIT: 25,          // Minimum $25 deposit
} as const;

/**
 * Calculate SOP compliant pricing for a service
 */
export async function calculateSOPPricing(input: SOPPricingInput): Promise<SOPPricingResult> {
  try {
    // Validate service area and get travel information
    const serviceAreaInfo = await validateServiceArea(input.location);
    
    // Get base price for service type
    const basePrice = getBasePrice(input.serviceType);
    if (basePrice === 0) {
      throw new Error(`Invalid service type: ${input.serviceType}`);
    }

    // Calculate travel fee
    const travelFee = serviceAreaInfo.isWithinArea ? serviceAreaInfo.travelFee : 0;

    // Calculate urgency fee
    const urgencyFee = calculateUrgencyFee(basePrice, input.urgencyLevel);

    // Calculate document fee
    const documentFee = calculateDocumentFee(input.documentCount);

    // Calculate subtotal
    const subtotal = basePrice + travelFee + urgencyFee + documentFee;

    // Apply discounts
    const { discountAmount, appliedPromoCode, isFirstTimeDiscount } = await calculateDiscounts(
      subtotal,
      input.promoCode,
      input.isFirstTimeCustomer
    );

    // Calculate final price
    const totalPrice = Math.max(0, subtotal - discountAmount);

    // Calculate deposit
    const { depositAmount, depositRequired } = calculateDeposit(totalPrice);

    // Create pricing breakdown
    const breakdown = createPricingBreakdown({
      basePrice,
      travelFee,
      urgencyFee,
      documentFee,
      discountAmount,
      depositAmount
    });

    return {
      basePrice,
      travelFee,
      urgencyFee,
      documentFee,
      subtotal,
      discountAmount,
      totalPrice,
      depositAmount,
      depositRequired,
      breakdown,
      serviceAreaInfo,
      appliedPromoCode,
      isFirstTimeDiscount
    };

  } catch (error) {
    console.error('SOP pricing calculation failed:', error);
    throw new Error('Unable to calculate pricing. Please contact us for a quote.');
  }
}

/**
 * Get base price for service type
 */
function getBasePrice(serviceType: string): number {
  const normalizedType = serviceType.toUpperCase() as keyof typeof SOP_BASE_RATES;
  return SOP_BASE_RATES[normalizedType] || 0;
}

/**
 * Calculate urgency fee based on service level
 */
function calculateUrgencyFee(basePrice: number, urgencyLevel?: string): number {
  switch (urgencyLevel) {
    case 'RUSH':
      return Math.round(basePrice * (FEES.RUSH_MULTIPLIER - 1));
    case 'EMERGENCY':
      return Math.round(basePrice * (FEES.EMERGENCY_MULTIPLIER - 1));
    default:
      return 0;
  }
}

/**
 * Calculate additional document fees
 */
function calculateDocumentFee(documentCount?: number): number {
  if (!documentCount || documentCount <= 3) {
    return 0; // First 3 documents included
  }
  return (documentCount - 3) * FEES.EXTRA_DOCUMENT_FEE;
}

/**
 * Calculate applicable discounts
 */
async function calculateDiscounts(
  subtotal: number,
  promoCode?: string,
  isFirstTimeCustomer?: boolean
): Promise<{
  discountAmount: number;
  appliedPromoCode?: string;
  isFirstTimeDiscount?: boolean;
}> {
  let discountAmount = 0;
  let appliedPromoCode: string | undefined;
  let isFirstTimeDiscount = false;

  // First-time customer discount (10%)
  if (isFirstTimeCustomer) {
    discountAmount += Math.round(subtotal * 0.1);
    isFirstTimeDiscount = true;
  }

  // Promo code discount (if provided)
  if (promoCode) {
    try {
      const promoDiscount = await validateAndCalculatePromoDiscount(promoCode, subtotal);
      if (promoDiscount > 0) {
        discountAmount += promoDiscount;
        appliedPromoCode = promoCode;
      }
    } catch (error) {
      console.warn('Promo code validation failed:', error);
      // Continue without promo code discount
    }
  }

  return {
    discountAmount: Math.round(discountAmount * 100) / 100, // Round to cents
    appliedPromoCode,
    isFirstTimeDiscount
  };
}

/**
 * Calculate deposit requirement
 */
function calculateDeposit(totalPrice: number): { depositAmount: number; depositRequired: boolean } {
  if (totalPrice <= DEPOSIT_RULES.REQUIRED_THRESHOLD) {
    return {
      depositAmount: 0,
      depositRequired: false
    };
  }

  const calculatedDeposit = totalPrice * DEPOSIT_RULES.DEPOSIT_PERCENTAGE;
  const depositAmount = Math.max(calculatedDeposit, DEPOSIT_RULES.MINIMUM_DEPOSIT);

  return {
    depositAmount: Math.round(depositAmount * 100) / 100, // Round to cents
    depositRequired: true
  };
}

/**
 * Create detailed pricing breakdown
 */
function createPricingBreakdown(components: {
  basePrice: number;
  travelFee: number;
  urgencyFee: number;
  documentFee: number;
  discountAmount: number;
  depositAmount: number;
}): PricingBreakdown[] {
  const breakdown: PricingBreakdown[] = [];

  // Base service price
  breakdown.push({
    description: 'Base Service Fee',
    amount: components.basePrice,
    type: 'base'
  });

  // Travel fee
  if (components.travelFee > 0) {
    breakdown.push({
      description: 'Travel Fee',
      amount: components.travelFee,
      type: 'travel'
    });
  }

  // Urgency fee
  if (components.urgencyFee > 0) {
    breakdown.push({
      description: 'Rush Service Fee',
      amount: components.urgencyFee,
      type: 'urgency'
    });
  }

  // Document fee
  if (components.documentFee > 0) {
    breakdown.push({
      description: 'Additional Document Fee',
      amount: components.documentFee,
      type: 'document'
    });
  }

  // Discount
  if (components.discountAmount > 0) {
    breakdown.push({
      description: 'Discount Applied',
      amount: -components.discountAmount,
      type: 'discount'
    });
  }

  // Deposit
  if (components.depositAmount > 0) {
    breakdown.push({
      description: 'Required Deposit (50%)',
      amount: components.depositAmount,
      type: 'deposit'
    });
  }

  return breakdown;
}

/**
 * Validate promo code and calculate discount (placeholder)
 */
async function validateAndCalculatePromoDiscount(promoCode: string, subtotal: number): Promise<number> {
  // This would integrate with the existing promo code validation API
  try {
    const response = await fetch('/api/promo-codes/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: promoCode,
        price: subtotal,
        serviceId: 'sop-pricing' // Generic service ID for SOP pricing
      })
    });

    if (!response.ok) {
      return 0;
    }

    const result = await response.json();
    return result.pricing?.discountAmount || 0;
  } catch (error) {
    console.error('Promo code validation failed:', error);
    return 0;
  }
}

/**
 * Get available service types and their base prices
 */
export function getServiceTypes(): Array<{ type: string; name: string; basePrice: number; description: string }> {
  return [
    {
      type: 'NOTARY_STANDARD',
      name: 'Standard Notarization',
      basePrice: SOP_BASE_RATES.NOTARY_STANDARD,
      description: 'Basic notarization services for standard documents'
    },
    {
      type: 'NOTARY_PREMIUM',
      name: 'Premium Notarization',
      basePrice: SOP_BASE_RATES.NOTARY_PREMIUM,
      description: 'Enhanced notarization with additional verification and support'
    },
    {
      type: 'LOAN_SIGNING',
      name: 'Loan Signing Services',
      basePrice: SOP_BASE_RATES.LOAN_SIGNING,
      description: 'Complete loan document signing and notarization'
    },
    {
      type: 'REMOTE_ONLINE_NOTARIZATION',
      name: 'Remote Online Notarization (RON)',
      basePrice: SOP_BASE_RATES.REMOTE_ONLINE_NOTARIZATION,
      description: 'Secure online notarization from anywhere'
    },
    {
      type: 'MOBILE_NOTARY',
      name: 'Mobile Notary Service',
      basePrice: SOP_BASE_RATES.MOBILE_NOTARY,
      description: 'We come to your location for notarization'
    },
    {
      type: 'WITNESS_SERVICE',
      name: 'Witness Services',
      basePrice: SOP_BASE_RATES.WITNESS_SERVICE,
      description: 'Professional witness services for legal documents'
    },
    {
      type: 'DOCUMENT_PREP',
      name: 'Document Preparation',
      basePrice: SOP_BASE_RATES.DOCUMENT_PREP,
      description: 'Professional document preparation and review'
    }
  ];
}

/**
 * Estimate pricing for quick quotes (without full validation)
 */
export function getQuickPriceEstimate(serviceType: string, distance: number = 0): {
  estimatedPrice: number;
  depositRequired: boolean;
  estimatedDeposit: number;
} {
  const basePrice = getBasePrice(serviceType);
  const travelFee = distance * FEES.TRAVEL_PER_MILE;
  const estimatedPrice = basePrice + travelFee;
  
  const { depositAmount, depositRequired } = calculateDeposit(estimatedPrice);
  
  return {
    estimatedPrice: Math.round(estimatedPrice * 100) / 100,
    depositRequired,
    estimatedDeposit: depositAmount
  };
}