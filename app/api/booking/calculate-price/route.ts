/**
 * Enhanced Pricing API - Houston Mobile Notary Pros
 * Phase 2: Dynamic pricing with business rules integration
 */

import { NextRequest, NextResponse } from 'next/server';

// Phase 2: Enhanced Pricing Engine
import { EnhancedPricingEngine } from '../../../../lib/business-rules/pricing-engine';

export async function POST(request: NextRequest) {
  try {
    const { 
      serviceType, 
      address, 
      documentCount = 1, 
      appointmentDateTime,
      customerType = 'new',
      referralCode,
      promoCode,
      customerId 
    } = await request.json();
    
    // Validate service type
    const validServiceTypes = ['QUICK_STAMP_LOCAL', 'STANDARD_NOTARY', 'EXTENDED_HOURS', 'LOAN_SIGNING', 'RON_SERVICES', 'BUSINESS_ESSENTIALS', 'BUSINESS_GROWTH'];
    if (!serviceType || !validServiceTypes.includes(serviceType)) {
      return NextResponse.json(
        { error: 'Invalid service type' },
        { status: 400 }
      );
    }

    console.log('🔍 Applying business rules to pricing calculation...');
    
    // 🔥 NEW: Enhanced Pricing Calculation with Business Rules
    const pricingResult = await EnhancedPricingEngine.calculateDynamicPricing({
      serviceType,
      address,
      documentCount,
      appointmentDateTime,
      customerType,
      referralCode,
      promoCode,
      customerId,
      requestId: `api_${Date.now()}`
    });

    console.log('✅ Business rules applied to pricing');

    // Return enhanced pricing result with detailed breakdown
    return NextResponse.json({
      // Legacy format (for backward compatibility)
      basePrice: pricingResult.pricing.basePrice,
      travelFee: pricingResult.pricing.travelFee,
      extraDocumentFees: pricingResult.pricing.extraDocumentFees,
      totalPrice: pricingResult.pricing.totalPrice,
      
      // Enhanced Phase 2 format
      pricing: pricingResult.pricing,
      breakdown: pricingResult.breakdown,
      businessRules: {
        isValid: pricingResult.businessRules.violations.length === 0,
        violations: pricingResult.businessRules.violations,
        recommendations: pricingResult.businessRules.recommendations,
        serviceAreaZone: pricingResult.businessRules.serviceAreaZone,
        documentLimitsExceeded: pricingResult.businessRules.documentLimitsExceeded,
        dynamicPricingActive: pricingResult.businessRules.dynamicPricingActive,
        discountsApplied: pricingResult.businessRules.discountsApplied
      },
      ghlActions: pricingResult.ghlActions,
      
      // Status information
      status: 'success',
      requestId: `api_${Date.now()}`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Enhanced pricing calculation error:', error);
    return NextResponse.json(
      { 
        error: 'Price calculation failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}