/**
 * Enhanced Pricing API - Houston Mobile Notary Pros
 * Phase 2: Dynamic pricing with business rules integration
 */

import { NextRequest, NextResponse } from 'next/server';
import { getErrorMessage } from '@/lib/utils/error-utils';
import { withRateLimit } from '@/lib/security/rate-limiting';
import { z } from 'zod';

// Phase 2: Enhanced Pricing Engine
import { EnhancedPricingEngine } from '../../../../lib/business-rules/pricing-engine';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({
  serviceType: z.string().min(1),
  address: z.any().optional(),
  documentCount: z.number().int().min(1).max(50).optional(),
  appointmentDateTime: z.any().optional(),
  customerType: z.string().optional(),
  referralCode: z.string().optional(),
  promoCode: z.string().optional(),
  customerId: z.string().optional(),
});

export const POST = withRateLimit('public', 'booking_calculate_price')(async (request: NextRequest) => {
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
    const { 
      serviceType, 
      address, 
      documentCount = 1, 
      appointmentDateTime,
      customerType = 'new',
      referralCode,
      promoCode,
      customerId 
    } = parsed.data as any;
    
    // Validate service type
    const validServiceTypes = ['STANDARD_NOTARY', 'EXTENDED_HOURS', 'LOAN_SIGNING', 'RON_SERVICES', 'BUSINESS_ESSENTIALS', 'BUSINESS_GROWTH'];
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
        details: error instanceof Error ? getErrorMessage(error) : 'Unknown error',
        status: 'error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
})
