/**
 * Transparent Pricing API - Houston Mobile Notary Pros
 * Phase 4: Complete Pricing Transparency System
 * 
 * This endpoint provides complete, transparent pricing breakdowns
 * with detailed explanations and alternative options.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getErrorMessage } from '@/lib/utils/error-utils';
import { UnifiedPricingEngine } from '../../../../lib/pricing/unified-pricing-engine';
import { withRateLimit } from '@/lib/security/rate-limiting';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TransparentPricingSchema = z.object({
  serviceType: z.string().min(1),
  documentCount: z.number().int().min(1).max(50).optional(),
  signerCount: z.number().int().min(1).max(20).optional(),
  address: z.any().optional(),
  scheduledDateTime: z.string().optional(),
  customerType: z.string().optional(),
  customerEmail: z.string().email().optional(),
  referralCode: z.string().optional(),
  promoCode: z.string().optional(),
});

export const POST = withRateLimit('public', 'pricing_transparent')(async (request: NextRequest) => {
  const startTime = Date.now();
  
  try {
    const json = await request.json();
    const parsed = TransparentPricingSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid request' }, { status: 400 });
    }
    const {
      serviceType,
      documentCount = 1,
      signerCount = 1,
      address,
      scheduledDateTime,
      customerType = 'new',
      customerEmail = '',
      referralCode,
      promoCode
    } = parsed.data as any;
    
    // Generate request ID for tracking
    const requestId = `api_transparent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`🔍 [${requestId}] Transparent pricing request received`, {
      serviceType,
      documentCount,
      hasAddress: !!address,
      customerType,
      hasSchedule: !!scheduledDateTime
    });
    
    // Validate required fields
    if (!serviceType) {
      return NextResponse.json(
        { 
          error: 'Service type is required',
          code: 'MISSING_SERVICE_TYPE',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }
    
    const validServiceTypes = [
      'QUICK_STAMP_LOCAL', 
      'STANDARD_NOTARY', 
      'EXTENDED_HOURS', 
      'LOAN_SIGNING', 
      'RON_SERVICES', 
      'BUSINESS_ESSENTIALS', 
      'BUSINESS_GROWTH'
    ];
    
    if (!validServiceTypes.includes(serviceType)) {
      return NextResponse.json(
        { 
          error: 'Invalid service type',
          code: 'INVALID_SERVICE_TYPE',
          validTypes: validServiceTypes,
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }
    
    // Calculate transparent pricing using unified engine
    let pricingResult;
    try {
      pricingResult = await UnifiedPricingEngine.calculateTransparentPricing({
        serviceType,
        documentCount,
        signerCount,
        address,
        scheduledDateTime,
        customerType,
        customerEmail,
        referralCode,
        promoCode,
        requestId
      });
    } catch (pricingError) {
      console.error(`[${requestId}] Pricing calculation error:`, pricingError);
      
      // Return a fallback pricing response instead of failing completely
      pricingResult = {
        serviceType,
        basePrice: 75, // Default base price
        totalPrice: 75,
        breakdown: {
          serviceBase: { amount: 75, label: 'Standard Notary Service' },
          travelFee: { amount: 0, label: 'Travel Fee' },
          extraDocuments: { amount: 0, label: 'Additional Documents' },
          timeBasedFees: [],
          serviceAreaFee: { amount: 0, label: 'Service Area' },
          discounts: []
        },
        transparency: {
          whyThisPrice: 'Standard pricing applied due to calculation error',
          feeExplanations: {},
          priceFactors: ['Base service fee'],
          alternatives: []
        },
        businessRules: {
          isValid: true,
          serviceAreaZone: 'houston_metro',
          isWithinServiceArea: true,
          documentLimitsExceeded: false,
          dynamicPricingActive: false,
          discountsApplied: [],
          violations: [],
          recommendations: ['Please contact us for accurate pricing']
        },
        ghlActions: { tags: ['pricing:fallback'] },
        metadata: {
          calculatedAt: new Date().toISOString(),
          version: '1.0.0',
          calculationTime: 0,
          requestId
        }
      };
    }
    
    const processingTime = Date.now() - startTime;
    
    console.log(`✅ [${requestId}] Transparent pricing completed in ${processingTime}ms`, {
      totalPrice: pricingResult.totalPrice,
      discountsApplied: pricingResult.businessRules.discountsApplied,
      dynamicPricingActive: pricingResult.businessRules.dynamicPricingActive
    });
    
    // Return comprehensive transparent pricing response
    return NextResponse.json({
      success: true,
      
      // Core pricing information
      serviceType: pricingResult.serviceType,
      basePrice: pricingResult.basePrice,
      totalPrice: pricingResult.totalPrice,
      
      // Detailed breakdown with explanations
      breakdown: pricingResult.breakdown,
      
      // Transparency features
      transparency: {
        whyThisPrice: pricingResult.transparency.whyThisPrice,
        feeExplanations: pricingResult.transparency.feeExplanations,
        priceFactors: pricingResult.transparency.priceFactors,
        alternatives: pricingResult.transparency.alternatives
      },
      
      // Business rules compliance
      businessRules: {
        isValid: pricingResult.businessRules.violations.length === 0,
        serviceAreaZone: pricingResult.businessRules.serviceAreaZone,
        isWithinServiceArea: pricingResult.businessRules.isWithinServiceArea,
        documentLimitsExceeded: pricingResult.businessRules.documentLimitsExceeded,
        dynamicPricingActive: pricingResult.businessRules.dynamicPricingActive,
        discountsApplied: pricingResult.businessRules.discountsApplied,
        violations: pricingResult.businessRules.violations,
        recommendations: pricingResult.businessRules.recommendations
      },
      
      // GHL integration data
      ghlActions: pricingResult.ghlActions,
      
      // Request metadata
      metadata: {
        requestId,
        calculatedAt: pricingResult.metadata.calculatedAt,
        version: pricingResult.metadata.version,
        processingTime,
        calculationTime: pricingResult.metadata.calculationTime
      }
    });
    
  } catch (error) {
    const processingTime = Date.now() - startTime;
    
    console.error('Transparent pricing calculation error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Pricing calculation failed',
        code: 'CALCULATION_FAILED',
        details: error instanceof Error ? getErrorMessage(error) : 'Unknown error',
        metadata: {
          timestamp: new Date().toISOString(),
          processingTime
        }
      },
      { status: 500 }
    );
  }
});

/**
 * GET endpoint for pricing information and service details
 */
export const GET = withRateLimit('public', 'pricing_transparent_info')(async (request: NextRequest) => {
  try {
    const { searchParams } = request.nextUrl;
    const serviceType = searchParams.get('serviceType');
    
    if (!serviceType) {
      // Return all available services with basic pricing
      const { UNIFIED_SERVICE_CONFIG } = await import('../../../../lib/pricing/unified-pricing-engine');
      
      type ServiceConfig = {
        basePrice: number;
        description: string;
        features: string[];
        maxDocuments: number;
        includedRadius: number;
      };
      
      const configMap = UNIFIED_SERVICE_CONFIG as Record<string, ServiceConfig>;
      const services = Object.entries(configMap).map(([type, config]) => ({
        serviceType: type,
        name: type.replace(/_/g, ' '),
        basePrice: config.basePrice,
        description: config.description,
        features: config.features,
        maxDocuments: config.maxDocuments,
        includedRadius: config.includedRadius
      }));
      
      return NextResponse.json({
        success: true,
        services,
        metadata: {
          timestamp: new Date().toISOString(),
          version: '1.0.0'
        }
      });
    }
    
    // Return specific service information
    const { UNIFIED_SERVICE_CONFIG, PRICING_MULTIPLIERS } = await import('../../../../lib/pricing/unified-pricing-engine');
    
    const validServiceTypes = Object.keys(UNIFIED_SERVICE_CONFIG);
    if (!validServiceTypes.includes(serviceType)) {
      return NextResponse.json(
        { 
          error: 'Invalid service type',
          validTypes: validServiceTypes 
        },
        { status: 400 }
      );
    }
    
    const serviceConfig = UNIFIED_SERVICE_CONFIG[serviceType as keyof typeof UNIFIED_SERVICE_CONFIG];
    
    return NextResponse.json({
      success: true,
      service: {
        serviceType,
        name: serviceType.replace(/_/g, ' '),
        basePrice: serviceConfig.basePrice,
        description: serviceConfig.description,
        features: serviceConfig.features,
        maxDocuments: serviceConfig.maxDocuments,
        includedRadius: serviceConfig.includedRadius,
        feePerMile: serviceConfig.feePerMile
      },
      pricingInfo: {
        timeBasedSurcharges: PRICING_MULTIPLIERS.timeBasedSurcharges,
        extraDocumentFee: PRICING_MULTIPLIERS.extraDocumentFees[serviceType as keyof typeof PRICING_MULTIPLIERS.extraDocumentFees],
        discounts: PRICING_MULTIPLIERS.discounts
      },
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }
    });
    
  } catch (error) {
    console.error('Pricing information error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to retrieve pricing information',
        details: error instanceof Error ? getErrorMessage(error) : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
});
