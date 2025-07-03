/**
 * Championship Booking System - Real-time Pricing API
 * Houston Mobile Notary Pros
 * 
 * Real-time pricing calculation endpoint for the championship booking system.
 * Powers live pricing updates and conversion optimization.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createHash } from 'crypto';
import { calculateBookingPrice, PricingCalculationParamsSchema } from '@/lib/pricing-engine';
import { logger } from '@/lib/logger';
import { headers } from 'next/headers';

// Rate limiting helper
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60       // Increased from 30 to 60 for optimized frontend
};

// Request deduplication cache
const requestCache = new Map<string, { result: any; timestamp: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(ip);
  
  if (!userLimit || now - userLimit.timestamp > RATE_LIMIT.windowMs) {
    rateLimitMap.set(ip, { count: 1, timestamp: now });
    return true;
  }
  
  if (userLimit.count >= RATE_LIMIT.maxRequests) {
    return false;
  }
  
  userLimit.count++;
  return true;
}

// Request validation schema
const PricingRequestSchema = PricingCalculationParamsSchema.extend({
  requestId: z.string().optional(),
  source: z.enum(['booking-form', 'calculator', 'api']).default('api')
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let requestId: string | undefined;
  
  try {
    // Get client IP for rate limiting
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for') || 
                headersList.get('x-real-ip') || 
                'unknown';
    
    // Rate limiting check
    if (!checkRateLimit(ip)) {
      logger.warn('Rate limit exceeded', { ip });
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded. Please try again later.',
          code: 'RATE_LIMIT_EXCEEDED'
        },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedRequest = PricingRequestSchema.parse(body);
    
    requestId = validatedRequest.requestId || `api_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Request fingerprinting to prevent duplicate processing
    const requestFingerprint = createHash('md5')
      .update(JSON.stringify(validatedRequest))
      .digest('hex');

    const cached = requestCache.get(requestFingerprint);
    if (cached && Date.now() - cached.timestamp < 30000) { // 30 seconds
      logger.info('Returning cached pricing result', { requestId, fingerprint: requestFingerprint.substring(0, 8) });
      return NextResponse.json(cached.result);
    }
    
    logger.info('Pricing calculation request received', {
      requestId,
      serviceType: validatedRequest.serviceType,
      source: validatedRequest.source,
      fingerprint: requestFingerprint.substring(0, 8),
      ip: ip.substring(0, 10) + '...' // Partial IP for privacy
    });

    // Calculate pricing using our championship engine
    const pricingResult = await calculateBookingPrice(validatedRequest);
    
    const processingTime = Date.now() - startTime;
    
    logger.info('Pricing calculation completed', {
      requestId,
      processingTime,
      total: pricingResult.total,
      upsellCount: pricingResult.upsellSuggestions.length
    });

    // Prepare response
    const response = {
      success: true,
      data: pricingResult,
      metadata: {
        requestId,
        processingTime,
        timestamp: new Date().toISOString(),
        api_version: '2.0.0'
      }
    };

    // Cache the result for deduplication
    requestCache.set(requestFingerprint, { result: response, timestamp: Date.now() });
    
    // Clean up old cache entries (prevent memory leaks)
    const now = Date.now();
    for (const [key, value] of requestCache.entries()) {
      if (now - value.timestamp > 60000) { // Remove entries older than 1 minute
        requestCache.delete(key);
      }
    }

    return NextResponse.json(response);

  } catch (error) {
    const processingTime = Date.now() - startTime;
    
    if (error instanceof z.ZodError) {
      logger.warn('Pricing calculation validation error', {
        requestId,
        errors: error.errors,
        processingTime
      });
      
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          code: 'VALIDATION_ERROR',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      );
    }

    logger.error('Pricing calculation failed', {
      requestId,
      error: error.message,
      stack: error.stack,
      processingTime
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Unable to calculate pricing. Please try again.',
        code: 'CALCULATION_ERROR',
        requestId
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

// GET method for health check
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'pricing-calculator',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    capabilities: [
      'real-time-pricing',
      'upsell-detection', 
      'distance-calculation',
      'discount-application',
      'rate-limiting'
    ]
  });
}