/**
 * 🧮 HMNP V2 Pricing API
 * Real-time pricing calculations with full transparency
 * Lightning fast, bulletproof pricing engine
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { calculatePricing, formatPricing, validatePricingCalculation } from '@/lib/v2/pricing-engine';
import { validateServiceId } from '@/app/api/v2/services/route';

// ============================================================================
// 🛡️ REQUEST VALIDATION
// ============================================================================

const AddressSchema = z.object({
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().length(2, 'State must be 2 characters'),
  zip: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code format')
});

const PricingRequestSchema = z.object({
  serviceId: z.string().min(1, 'Service ID is required'),
  address: AddressSchema.optional(),
  scheduledDateTime: z.string()
    .refine((date) => {
      try {
        // Handle datetime-local format (YYYY-MM-DDTHH:mm)
        if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(date)) {
          return !isNaN(new Date(date + ':00').getTime());
        }
        // Handle full ISO format
        return !isNaN(new Date(date).getTime());
      } catch {
        return false;
      }
    }, 'Invalid date format'),
  promoCode: z.string().optional(),
  additionalSigners: z.number().int().min(0).max(10).optional().default(0),
  additionalDocuments: z.number().int().min(0).max(50).optional().default(0)
});

// ============================================================================
// 🎯 API HANDLERS
// ============================================================================

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  
  try {
    const body = await request.json();
    console.log('Pricing API Request:', { requestId, body });
    
    // Validate request
    const validatedRequest = PricingRequestSchema.parse(body);
    console.log('Validated pricing request:', { requestId, validatedRequest });
    
    // Validate service exists
    if (!validateServiceId(validatedRequest.serviceId)) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_SERVICE',
          message: 'Service not found or inactive',
          field: 'serviceId'
        }
      }, { status: 400 });
    }
    
    // Parse scheduled date - handle both datetime-local and ISO formats
    const scheduledDateTime = new Date(
      validatedRequest.scheduledDateTime.includes('T') && !validatedRequest.scheduledDateTime.includes('Z')
        ? validatedRequest.scheduledDateTime + ':00'
        : validatedRequest.scheduledDateTime
    );
    
    // Validate future date
    if (scheduledDateTime <= new Date()) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_DATE',
          message: 'Scheduled date must be in the future',
          field: 'scheduledDateTime'
        }
      }, { status: 400 });
    }
    
    // Calculate pricing
    console.log('Calculating pricing with:', {
      requestId,
      serviceId: validatedRequest.serviceId,
      address: validatedRequest.address,
      scheduledDateTime: scheduledDateTime.toISOString(),
      promoCode: validatedRequest.promoCode
    });
    
    const pricingCalculation = await calculatePricing({
      serviceId: validatedRequest.serviceId,
      address: validatedRequest.address,
      scheduledDateTime,
      promoCode: validatedRequest.promoCode,
      additionalSigners: validatedRequest.additionalSigners,
      additionalDocuments: validatedRequest.additionalDocuments
    });
    
    console.log('Pricing calculation result:', { requestId, pricingCalculation });
    
    // Validate calculation integrity
    if (!validatePricingCalculation(pricingCalculation)) {
      throw new Error('Pricing calculation validation failed');
    }
    
    // Format response
    const response = {
      success: true,
      data: {
        pricing: {
          ...pricingCalculation,
          // Format amounts for display
          displayAmounts: {
            basePrice: formatPricing(pricingCalculation.basePrice),
            travelFee: formatPricing(pricingCalculation.travelFee),
            timeSurcharge: formatPricing(pricingCalculation.timeSurcharge),
            emergencyFee: formatPricing(pricingCalculation.emergencyFee),
            promoDiscount: formatPricing(pricingCalculation.promoDiscount),
            subtotal: formatPricing(pricingCalculation.subtotal),
            taxAmount: formatPricing(pricingCalculation.taxAmount),
            finalPrice: formatPricing(pricingCalculation.finalPrice),
            depositAmount: formatPricing(pricingCalculation.depositAmount)
          }
        },
        // Quick summary for UI
        summary: {
          total: formatPricing(pricingCalculation.finalPrice),
          deposit: pricingCalculation.depositRequired ? formatPricing(pricingCalculation.depositAmount) : null,
          hasFees: pricingCalculation.travelFee > 0 || pricingCalculation.timeSurcharge > 0 || pricingCalculation.emergencyFee > 0,
          hasDiscount: pricingCalculation.promoDiscount > 0
        }
      },
      meta: {
        timestamp: new Date().toISOString(),
        pricingVersion: pricingCalculation.pricingVersion,
        requestId: generateRequestId()
      }
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Pricing API Error:', { requestId, error });
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          })),
          requestId
        }
      }, { status: 400 });
    }
    
    // Handle business logic errors
    if (error instanceof Error && error.message.includes('Invalid service')) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_SERVICE',
          message: error.message,
          requestId
        }
      }, { status: 400 });
    }
    
    // Generic error
    return NextResponse.json({
      success: false,
      error: {
        code: 'PRICING_CALCULATION_ERROR',
        message: 'Failed to calculate pricing',
        details: error instanceof Error ? error.message : 'Unknown error',
        requestId
      }
    }, { status: 500 });
  }
}

// ============================================================================
// 🎯 PRICING ESTIMATION (GET)
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const serviceId = searchParams.get('serviceId');
    const zip = searchParams.get('zip');
    
    if (!serviceId) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'MISSING_SERVICE_ID',
          message: 'Service ID is required'
        }
      }, { status: 400 });
    }
    
    if (!validateServiceId(serviceId)) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_SERVICE',
          message: 'Service not found or inactive'
        }
      }, { status: 400 });
    }
    
    // Provide basic pricing estimate without full calculation
    const quickEstimate = await getQuickPricingEstimate(serviceId, zip);
    
    return NextResponse.json({
      success: true,
      data: {
        estimate: quickEstimate,
        note: 'This is an estimate. Final pricing may vary based on location, time, and other factors.'
      },
      meta: {
        timestamp: new Date().toISOString(),
        type: 'estimate'
      }
    });
    
  } catch (error) {
    console.error('Pricing Estimate Error:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        code: 'ESTIMATE_ERROR',
        message: 'Failed to generate pricing estimate'
      }
    }, { status: 500 });
  }
}

// ============================================================================
// 🛠️ UTILITY FUNCTIONS
// ============================================================================

async function getQuickPricingEstimate(serviceId: string, zip?: string | null) {
  // Quick estimate without full calculation
  const service = require('@/app/api/v2/services/route').getServiceById(serviceId);
  
  if (!service) {
    throw new Error('Service not found');
  }
  
  let estimatedTravelFee = 0;
  
  // Simple ZIP-based travel fee estimation
  if (service.type === 'MOBILE' && zip) {
    // Mock travel fee estimation based on ZIP
    // In production, use cached distance calculations
    if (!isWithinStandardServiceArea(zip)) {
      estimatedTravelFee = 25; // Estimated average travel fee
    }
  }
  
  const basePrice = service.basePrice;
  const estimatedTotal = basePrice + estimatedTravelFee;
  
  return {
    serviceId,
    serviceName: service.name,
    basePrice: formatPricing(basePrice),
    estimatedTravelFee: formatPricing(estimatedTravelFee),
    estimatedTotal: formatPricing(estimatedTotal),
    depositRequired: service.depositRequired,
    depositAmount: service.depositRequired ? formatPricing(service.depositAmount || estimatedTotal * 0.25) : null,
    priceRange: {
      min: formatPricing(basePrice),
      max: formatPricing(basePrice + 100) // Account for surcharges
    }
  };
}

function isWithinStandardServiceArea(zip: string): boolean {
  // Mock ZIP validation for standard service area
  // In production, use geolocation calculation
  const standardAreaZips = ['77591', '77590', '77539', '77568', '77565'];
  return standardAreaZips.includes(zip);
}

function generateRequestId(): string {
  return `pricing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}