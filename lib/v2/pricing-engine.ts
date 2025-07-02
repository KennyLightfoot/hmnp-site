/**
 * 🧮 HMNP V2 Pricing Engine
 * Single source of truth for ALL pricing calculations
 * Bulletproof, auditable, and business-rule driven
 */

import { ServiceType } from '@prisma/client';
import { getServiceById } from '@/app/api/v2/services/route';

// ============================================================================
// 🎯 PRICING INTERFACES
// ============================================================================

export interface PricingRequest {
  serviceId: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  scheduledDateTime: Date;
  promoCode?: string;
  additionalSigners?: number;
  additionalDocuments?: number;
}

export interface PricingCalculation {
  serviceId: string;
  serviceName: string;
  serviceType: ServiceType;
  
  // Base pricing
  basePrice: number;
  
  // Add-on fees
  travelFee: number;
  timeSurcharge: number;
  emergencyFee: number;
  additionalSignerFee: number;
  additionalDocumentFee: number;
  
  // Discounts
  promoDiscount: number;
  
  // Tax & totals
  subtotal: number;
  taxAmount: number;
  finalPrice: number;
  
  // Deposit
  depositRequired: boolean;
  depositAmount: number;
  
  // Metadata
  breakdown: PriceBreakdown[];
  calculatedAt: Date;
  pricingVersion: string;
  distanceInfo?: DistanceInfo;
}

export interface PriceBreakdown {
  item: string;
  description: string;
  amount: number;
  type: 'base' | 'fee' | 'discount' | 'tax';
}

export interface DistanceInfo {
  distanceMiles: number;
  durationMinutes: number;
  withinStandardArea: boolean;
  withinExtendedArea: boolean;
  calculationMethod: string;
}

// ============================================================================
// 🌍 SERVICE AREA CONFIGURATION
// ============================================================================

const SERVICE_CONFIG = {
  centerPoint: {
    lat: 29.3838,  // Texas City, TX (ZIP 77591)
    lng: -94.9027
  },
  
  serviceAreas: {
    STANDARD: {
      radius: 15,        // miles
      travelFeeRate: 0,  // included
      description: 'Standard service area'
    },
    EXTENDED: {
      radius: 20,        // miles  
      travelFeeRate: 0,  // included for extended hours
      description: 'Extended service area'
    },
    PREMIUM: {
      radius: 35,        // miles
      travelFeeRate: 0.50, // $0.50 per mile beyond standard
      description: 'Premium service area with travel fee'
    }
  },
  
  // Time-based surcharges
  surcharges: {
    WEEKEND: {
      amount: 40,
      days: [0, 6], // Sunday, Saturday
      description: 'Weekend service surcharge'
    },
    AFTER_HOURS: {
      amount: 30,
      hours: { before: 8, after: 18 }, // Before 8am or after 6pm
      description: 'After hours service surcharge'
    },
    EMERGENCY: {
      amount: 50,
      withinHours: 4, // Within 4 hours of current time
      description: 'Emergency/rush service surcharge'
    }
  },
  
  // Texas tax rate
  taxRate: 0.0825, // 8.25% standard Texas sales tax
  
  pricingVersion: '2.0.1'
};

// ============================================================================
// 🧮 CORE PRICING ENGINE
// ============================================================================

export async function calculatePricing(request: PricingRequest): Promise<PricingCalculation> {
  const service = getServiceById(request.serviceId);
  
  if (!service) {
    throw new Error(`Invalid service ID: ${request.serviceId}`);
  }

  const breakdown: PriceBreakdown[] = [];
  let runningTotal = 0;

  // 1. BASE PRICE
  const basePrice = service.basePrice;
  breakdown.push({
    item: 'base_service',
    description: service.name,
    amount: basePrice,
    type: 'base'
  });
  runningTotal += basePrice;

  // 2. TRAVEL FEE (Mobile services only)
  let travelFee = 0;
  let distanceInfo: DistanceInfo | undefined;
  
  if (service.type === 'MOBILE' && request.address) {
    const distance = await calculateDistance(request.address);
    distanceInfo = distance;
    
    // Calculate travel fee based on service area
    if (distance.distanceMiles > SERVICE_CONFIG.serviceAreas.STANDARD.radius) {
      const excessMiles = distance.distanceMiles - SERVICE_CONFIG.serviceAreas.STANDARD.radius;
      travelFee = excessMiles * SERVICE_CONFIG.serviceAreas.PREMIUM.travelFeeRate;
      
      breakdown.push({
        item: 'travel_fee',
        description: `Travel fee (${excessMiles.toFixed(1)} miles @ $${SERVICE_CONFIG.serviceAreas.PREMIUM.travelFeeRate}/mile)`,
        amount: travelFee,
        type: 'fee'
      });
      runningTotal += travelFee;
    }
  }

  // 3. TIME SURCHARGES
  let timeSurcharge = 0;
  const scheduledTime = new Date(request.scheduledDateTime);
  
  // Weekend surcharge
  if (SERVICE_CONFIG.surcharges.WEEKEND.days.includes(scheduledTime.getDay())) {
    timeSurcharge += SERVICE_CONFIG.surcharges.WEEKEND.amount;
    breakdown.push({
      item: 'weekend_surcharge',
      description: SERVICE_CONFIG.surcharges.WEEKEND.description,
      amount: SERVICE_CONFIG.surcharges.WEEKEND.amount,
      type: 'fee'
    });
  }
  
  // After hours surcharge
  const hour = scheduledTime.getHours();
  if (hour < SERVICE_CONFIG.surcharges.AFTER_HOURS.hours.before || 
      hour >= SERVICE_CONFIG.surcharges.AFTER_HOURS.hours.after) {
    timeSurcharge += SERVICE_CONFIG.surcharges.AFTER_HOURS.amount;
    breakdown.push({
      item: 'after_hours_surcharge',
      description: SERVICE_CONFIG.surcharges.AFTER_HOURS.description,
      amount: SERVICE_CONFIG.surcharges.AFTER_HOURS.amount,
      type: 'fee'
    });
  }
  
  runningTotal += timeSurcharge;

  // 4. EMERGENCY FEE
  let emergencyFee = 0;
  const now = new Date();
  const hoursUntilService = (scheduledTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  if (hoursUntilService > 0 && hoursUntilService <= SERVICE_CONFIG.surcharges.EMERGENCY.withinHours) {
    emergencyFee = SERVICE_CONFIG.surcharges.EMERGENCY.amount;
    breakdown.push({
      item: 'emergency_fee',
      description: `${SERVICE_CONFIG.surcharges.EMERGENCY.description} (${hoursUntilService.toFixed(1)} hours notice)`,
      amount: emergencyFee,
      type: 'fee'
    });
    runningTotal += emergencyFee;
  }

  // 5. ADDITIONAL SIGNERS/DOCUMENTS (Future enhancement)
  const additionalSignerFee = 0;
  const additionalDocumentFee = 0;

  // 6. PROMO CODE DISCOUNT
  let promoDiscount = 0;
  if (request.promoCode) {
    const discount = await calculatePromoDiscount(request.promoCode, runningTotal);
    promoDiscount = discount;
    
    if (discount > 0) {
      breakdown.push({
        item: 'promo_discount',
        description: `Promo code: ${request.promoCode}`,
        amount: -discount, // Negative for discount
        type: 'discount'
      });
      runningTotal -= discount;
    }
  }

  // 7. TAX CALCULATION
  const subtotal = runningTotal;
  const taxAmount = subtotal * SERVICE_CONFIG.taxRate;
  
  breakdown.push({
    item: 'sales_tax',
    description: `Texas sales tax (${(SERVICE_CONFIG.taxRate * 100).toFixed(2)}%)`,
    amount: taxAmount,
    type: 'tax'
  });

  const finalPrice = subtotal + taxAmount;

  // 8. DEPOSIT CALCULATION
  const depositRequired = service.depositRequired;
  const depositAmount = depositRequired ? (service.depositAmount || finalPrice * 0.25) : 0;

  return {
    serviceId: request.serviceId,
    serviceName: service.name,
    serviceType: service.type as ServiceType,
    
    basePrice,
    travelFee,
    timeSurcharge,
    emergencyFee,
    additionalSignerFee,
    additionalDocumentFee,
    promoDiscount,
    
    subtotal,
    taxAmount,
    finalPrice,
    
    depositRequired,
    depositAmount,
    
    breakdown,
    calculatedAt: new Date(),
    pricingVersion: SERVICE_CONFIG.pricingVersion,
    distanceInfo
  };
}

// ============================================================================
// 📍 DISTANCE CALCULATION
// ============================================================================

async function calculateDistance(address: PricingRequest['address']): Promise<DistanceInfo> {
  // For now, use a simple mock calculation
  // In production, this would integrate with Google Maps Distance Matrix API
  
  const mockDistance = 12.5; // miles
  const mockDuration = 25;    // minutes
  
  return {
    distanceMiles: mockDistance,
    durationMinutes: mockDuration,
    withinStandardArea: mockDistance <= SERVICE_CONFIG.serviceAreas.STANDARD.radius,
    withinExtendedArea: mockDistance <= SERVICE_CONFIG.serviceAreas.EXTENDED.radius,
    calculationMethod: 'mock_calculation' // TODO: Replace with 'google_maps_api'
  };
}

// ============================================================================
// 🎟️ PROMO CODE VALIDATION
// ============================================================================

async function calculatePromoDiscount(promoCode: string, orderTotal: number): Promise<number> {
  // Mock promo code validation
  // In production, this would query the PromoCode table
  
  const mockPromoCodes: Record<string, { type: 'fixed' | 'percentage', amount: number }> = {
    'WELCOME10': { type: 'percentage', amount: 10 },
    'SAVE25': { type: 'fixed', amount: 25 },
    'FIRST50': { type: 'fixed', amount: 50 }
  };
  
  const promo = mockPromoCodes[promoCode.toUpperCase()];
  
  if (!promo) {
    return 0;
  }
  
  if (promo.type === 'fixed') {
    return Math.min(promo.amount, orderTotal);
  } else {
    return (orderTotal * promo.amount) / 100;
  }
}

// ============================================================================
// 🛡️ PRICING VALIDATION
// ============================================================================

export function validatePricingCalculation(calculation: PricingCalculation): boolean {
  // Validate pricing calculation integrity
  const expectedSubtotal = calculation.basePrice + 
                          calculation.travelFee + 
                          calculation.timeSurcharge + 
                          calculation.emergencyFee + 
                          calculation.additionalSignerFee + 
                          calculation.additionalDocumentFee - 
                          calculation.promoDiscount;
  
  const expectedFinalPrice = expectedSubtotal + calculation.taxAmount;
  
  return Math.abs(calculation.subtotal - expectedSubtotal) < 0.01 &&
         Math.abs(calculation.finalPrice - expectedFinalPrice) < 0.01;
}

// ============================================================================
// 📊 PRICING UTILITIES
// ============================================================================

export function formatPricing(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

export function getPricingBreakdownText(calculation: PricingCalculation): string {
  return calculation.breakdown
    .map(item => `${item.description}: ${formatPricing(item.amount)}`)
    .join('\n');
}