/**
 * Dynamic Pricing API Endpoint
 * Houston Mobile Notary Pros - Phase 2
 * 
 * Provides real-time dynamic pricing with market-based adjustments
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { dynamicPricingEngine } from '@/lib/pricing/dynamic-pricing-engine';
import { logger } from '@/lib/logger';
import { redis } from '@/lib/redis';
import { z } from 'zod';

// Rate limiting for pricing API
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 30; // 30 requests per minute

// Request validation schema
const DynamicPricingRequestSchema = z.object({
  serviceType: z.enum(['QUICK_STAMP_LOCAL', 'STANDARD_NOTARY', 'EXTENDED_HOURS', 'LOAN_SIGNING', 'RON_SERVICES', 'BUSINESS_ESSENTIALS', 'BUSINESS_GROWTH']),
  scheduledDateTime: z.string().datetime(),
  location: z.object({
    zipCode: z.string().regex(/^\d{5}$/, 'Must be a valid 5-digit ZIP code'),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    address: z.string().optional()
  }),
  urgency: z.enum(['standard', 'same_day', 'next_hour', 'rush_30min']).default('standard'),
  documentCount: z.number().min(1).max(50).default(1),
  signerCount: z.number().min(1).max(10).default(1),
  estimatedDuration: z.number().min(15).max(300).default(60),
  customerId: z.string().optional(),
  bookingId: z.string().optional(),
  includeBreakdown: z.boolean().default(true),
  includeAlternatives: z.boolean().default(false)
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    const headersList = await headers();
    const clientIP = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown';
    const userAgent = headersList.get('user-agent');

    // Rate limiting check
    const rateLimitResult = await checkRateLimit(clientIP);
    if (!rateLimitResult.allowed) {
      return NextResponse.json({
        success: false,
        error: 'Rate limit exceeded',
        retryAfter: rateLimitResult.retryAfter
      }, { status: 429 });
    }

    // Validate request
    const validatedRequest = DynamicPricingRequestSchema.parse(body);
    
    // Validate scheduling time (must be in future, within service hours)
    const scheduledDateTime = new Date(validatedRequest.scheduledDateTime);
    const now = new Date();
    
    if (scheduledDateTime <= now) {
      return NextResponse.json({
        success: false,
        error: 'Scheduled time must be in the future'
      }, { status: 400 });
    }
    
    // Check if too far in advance (max 6 months)
    const maxAdvanceTime = new Date(now.getTime() + (6 * 30 * 24 * 60 * 60 * 1000));
    if (scheduledDateTime > maxAdvanceTime) {
      return NextResponse.json({
        success: false,
        error: 'Cannot schedule more than 6 months in advance'
      }, { status: 400 });
    }

    logger.info('Dynamic pricing calculation requested', {
      serviceType: validatedRequest.serviceType,
      scheduledDateTime: validatedRequest.scheduledDateTime,
      zipCode: validatedRequest.location.zipCode,
      urgency: validatedRequest.urgency,
      clientIP: clientIP.substring(0, 10) + '***' // Partial IP for privacy
    });

    // Calculate dynamic price
    const pricingResult = await dynamicPricingEngine.calculateDynamicPrice(validatedRequest);

    // Calculate alternatives if requested
    let alternatives;
    if (validatedRequest.includeAlternatives) {
      alternatives = await calculatePricingAlternatives(validatedRequest, pricingResult);
    }

    // Prepare response
    const response = {
      success: true,
      pricing: {
        serviceType: validatedRequest.serviceType,
        basePrice: pricingResult.basePrice,
        finalPrice: pricingResult.finalPrice,
        totalAdjustment: pricingResult.adjustments.totalAdjustment,
        savings: pricingResult.finalPrice < pricingResult.basePrice ? 
          pricingResult.basePrice - pricingResult.finalPrice : null,
        surcharge: pricingResult.finalPrice > pricingResult.basePrice ? 
          pricingResult.finalPrice - pricingResult.basePrice : null,
        expires: pricingResult.expires,
        quoteId: generateQuoteId(validatedRequest)
      },
      marketConditions: {
        demandLevel: pricingResult.marketConditions.demandLevel,
        demandScore: Math.round(pricingResult.marketConditions.demandScore * 100),
        weatherImpact: pricingResult.adjustments.weatherSurcharge > 0,
        peakHours: pricingResult.marketConditions.timeMultipliers.peakHourMultiplier > 1,
        afterHours: pricingResult.marketConditions.timeMultipliers.afterHoursMultiplier > 1
      },
      breakdown: validatedRequest.includeBreakdown ? pricingResult.priceBreakdown : undefined,
      reasoning: pricingResult.reasoning,
      alternatives,
      metadata: {
        calculatedAt: new Date().toISOString(),
        calculationTime: Date.now() - startTime,
        version: '2.0.0',
        features: ['dynamic_demand', 'weather_integration', 'urgency_pricing', 'geographic_zones']
      }
    };

    // Track pricing API usage
    await trackPricingAPIUsage({
      clientIP,
      serviceType: validatedRequest.serviceType,
      finalPrice: pricingResult.finalPrice,
      demandLevel: pricingResult.marketConditions.demandLevel,
      calculationTime: Date.now() - startTime
    });

    return NextResponse.json(response);

  } catch (error: any) {
    logger.error('Dynamic pricing calculation failed', {
      error: error.message,
      stack: error.stack,
      requestBody: body ? JSON.stringify(body).substring(0, 500) : 'No body'
    });

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request data',
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: 'Pricing calculation failed',
      message: 'An unexpected error occurred while calculating pricing'
    }, { status: 500 });
  }
}

/**
 * Get pricing quote by ID
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const quoteId = searchParams.get('quoteId');
    const serviceType = searchParams.get('serviceType');
    const zipCode = searchParams.get('zipCode');

    if (!quoteId && !serviceType) {
      return NextResponse.json({
        success: false,
        error: 'Quote ID or service type is required'
      }, { status: 400 });
    }

    if (quoteId) {
      // Retrieve specific quote (this would be cached/stored)
      // For MVP, return quote not found
      return NextResponse.json({
        success: false,
        error: 'Quote not found or expired'
      }, { status: 404 });
    }

    // Return general pricing info for service type
    const generalPricing = await getGeneralPricingInfo(serviceType!, zipCode);
    
    return NextResponse.json({
      success: true,
      pricing: generalPricing
    });

  } catch (error: any) {
    logger.error('Failed to retrieve pricing quote', {
      error: error.message
    });

    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve pricing information'
    }, { status: 500 });
  }
}

/**
 * Rate limiting implementation
 */
async function checkRateLimit(clientIP: string): Promise<{ allowed: boolean; retryAfter?: number }> {
  try {
    const key = `rate_limit:pricing:${clientIP}`;
    const current = await redis.incr(key);
    
    if (current === 1) {
      await redis.expire(key, Math.ceil(RATE_LIMIT_WINDOW / 1000));
    }
    
    if (current > RATE_LIMIT_MAX_REQUESTS) {
      const ttl = await redis.ttl(key);
      return { allowed: false, retryAfter: ttl };
    }
    
    return { allowed: true };
  } catch (error) {
    // Allow request if rate limiting fails
    logger.error('Rate limiting check failed', { error, clientIP });
    return { allowed: true };
  }
}

/**
 * Calculate pricing alternatives (different times, urgency levels)
 */
async function calculatePricingAlternatives(originalRequest: any, originalResult: any) {
  try {
    const alternatives = [];
    const originalDateTime = new Date(originalRequest.scheduledDateTime);

    // Alternative times (same day, different hours)
    const timeAlternatives = [
      { hours: 2, label: '2 hours later' },
      { hours: -2, label: '2 hours earlier' },
      { hours: 24, label: 'Next day same time' }
    ];

    for (const timeAlt of timeAlternatives) {
      const altDateTime = new Date(originalDateTime.getTime() + (timeAlt.hours * 60 * 60 * 1000));
      
      if (altDateTime > new Date()) { // Only future times
        try {
          const altRequest = {
            ...originalRequest,
            scheduledDateTime: altDateTime.toISOString(),
            urgency: 'standard' // Reset urgency for alternatives
          };
          
          const altResult = await dynamicPricingEngine.calculateDynamicPrice(altRequest);
          
          alternatives.push({
            type: 'time',
            label: timeAlt.label,
            scheduledDateTime: altDateTime.toISOString(),
            price: altResult.finalPrice,
            savings: originalResult.finalPrice - altResult.finalPrice,
            demandLevel: altResult.marketConditions.demandLevel
          });
        } catch (error) {
          // Skip this alternative if calculation fails
          continue;
        }
      }
    }

    // Alternative urgency levels
    if (originalRequest.urgency !== 'standard') {
      try {
        const standardRequest = {
          ...originalRequest,
          urgency: 'standard'
        };
        
        const standardResult = await dynamicPricingEngine.calculateDynamicPrice(standardRequest);
        
        alternatives.push({
          type: 'urgency',
          label: 'Standard scheduling',
          urgency: 'standard',
          price: standardResult.finalPrice,
          savings: originalResult.finalPrice - standardResult.finalPrice,
          demandLevel: standardResult.marketConditions.demandLevel
        });
      } catch (error) {
        // Skip if calculation fails
      }
    }

    return alternatives.filter(alt => alt.savings > 0).slice(0, 3); // Top 3 savings opportunities
  } catch (error) {
    logger.error('Failed to calculate pricing alternatives', { error });
    return [];
  }
}

/**
 * Generate unique quote ID
 */
function generateQuoteId(request: any): string {
  const timestamp = Date.now();
  const hash = Buffer.from(JSON.stringify(request)).toString('base64').slice(0, 8);
  return `DQ-${timestamp}-${hash}`;
}

/**
 * Track pricing API usage for analytics
 */
async function trackPricingAPIUsage(data: any): Promise<void> {
  try {
    // This would integrate with analytics service
    logger.info('Pricing API usage tracked', {
      clientIP: data.clientIP.substring(0, 10) + '***',
      serviceType: data.serviceType,
      finalPrice: data.finalPrice,
      demandLevel: data.demandLevel,
      calculationTime: data.calculationTime
    });
  } catch (error) {
    logger.error('Failed to track pricing API usage', { error });
  }
}

/**
 * Get general pricing information
 */
async function getGeneralPricingInfo(serviceType: string, zipCode?: string) {
  const basePrices = {
    'STANDARD_NOTARY': { base: 75, description: 'Standard notary services during business hours' },
    'EXTENDED_HOURS': { base: 100, description: 'Notary services outside standard business hours' },
    'LOAN_SIGNING': { base: 150, description: 'Loan document signing and notarization' },
    'RON_SERVICES': { base: 125, description: 'Remote Online Notarization services' }
  };

  const serviceInfo = basePrices[serviceType as keyof typeof basePrices];
  
  if (!serviceInfo) {
    throw new Error('Invalid service type');
  }

  return {
    serviceType,
    basePrice: serviceInfo.base,
    description: serviceInfo.description,
    priceRange: {
      min: Math.round(serviceInfo.base * 0.8), // Possible discount
      max: Math.round(serviceInfo.base * 2.5)   // Max surge pricing
    },
    factors: [
      'Current demand level',
      'Weather conditions',
      'Urgency of request',
      'Time of day',
      'Geographic location',
      'Document complexity'
    ],
    lastUpdated: new Date().toISOString()
  };
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';