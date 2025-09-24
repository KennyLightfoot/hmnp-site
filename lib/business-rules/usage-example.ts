/**
 * Business Rules Engine - Usage Examples
 * Houston Mobile Notary Pros - Integration Guide
 * 
 * This file shows how to integrate the BusinessRulesEngine
 * into your existing booking system and API endpoints.
 */

import { createBusinessRulesEngine, validateBusinessRules } from './engine';
import { getErrorMessage } from '@/lib/utils/error-utils';

// ============================================================================
// 🚀 QUICK START - Simple Validation
// ============================================================================

/**
 * Quick validation function for simple use cases
 * Perfect for API endpoints that need fast business rule checking
 */
export async function quickValidateBooking(bookingData: {
  serviceType: string;
  customerAddress: string;
  documentCount: number;
  documentTypes?: string[];
  ghlContactId?: string;
}) {
  try {
    const result = await validateBusinessRules({
      serviceType: bookingData?.serviceType,
      location: { address: bookingData?.customerAddress },
      documentCount: bookingData?.documentCount,
      documentTypes: bookingData?.documentTypes,
      ghlContactId: bookingData?.ghlContactId
    });

    return {
      canProceed: result?.isValid,
      violations: result?.violations,
      ghlActions: result?.ghlActions
    };
  } catch (error) {
    console?.error('Business rules validation failed:', error);
    return {
      canProceed: false,
      violations: ['System error during validation'],
      ghlActions: { tags: [], customFields: {}, workflows: [] }
    };
  }
}

// ============================================================================
// 🎯 COMPREHENSIVE VALIDATION - Full Engine Usage
// ============================================================================

/**
 * Comprehensive booking validation with full business rules engine
 * Use this for complete booking flow validation
 */
export async function comprehensiveBookingValidation(params: {
  // Booking data
  serviceType: string;
  customerAddress: string;
  documentCount: number;
  documentTypes?: string[];
  scheduledDateTime?: Date;
  
  // Pricing data (if calculated)
  basePrice?: number;
  travelFee?: number;
  extraDocumentFees?: number;
  discounts?: number;
  totalPrice?: number;
  
  // Customer data
  ghlContactId?: string;
  customerType?: string;
  
  // Context
  requestId?: string;
}) {
  // Create engine instance with context
  const engine = createBusinessRulesEngine({
    requestId: params?.requestId,
    ghlContactId: params?.ghlContactId,
    timestamp: new Date()
  });

  try {
    // Run comprehensive validation
    const validation = await engine?.validateAll({
      serviceType: params?.serviceType,
      location: { address: params?.customerAddress },
      documentCount: params?.documentCount,
      documentTypes: params?.documentTypes,
      customerType: params?.customerType,
      scheduledDateTime: params?.scheduledDateTime,
      pricing: params?.basePrice ? {
        serviceType: params?.serviceType,
        basePrice: params?.basePrice,
        travelFee: params?.travelFee || 0,
        extraDocumentFees: params?.extraDocumentFees || 0,
        discounts: params?.discounts || 0,
        totalPrice: params?.totalPrice || params?.basePrice
      } : undefined
    });

    // Apply to GHL if contact ID provided
    if (params?.ghlContactId && validation?.ghlActions?.tags?.length > 0) {
      await engine?.applyToGHL([
        validation?.serviceArea,
        validation?.documentLimits,
        validation?.pricing
      ], params?.ghlContactId);
    }

    return {
      isValid: validation?.isValid,
      violations: validation?.violations,
      serviceArea: validation?.serviceArea,
      documentLimits: validation?.documentLimits,
      pricing: validation?.pricing,
      ghlActions: validation?.ghlActions,
      recommendations: [
        ...validation?.serviceArea?.recommendations,
        ...validation?.documentLimits?.recommendations,
        ...validation?.pricing?.recommendations
      ]
    };

  } catch (error) {
    console?.error('Comprehensive validation failed:', error);
    throw new Error(`Business rules validation failed: ${error instanceof Error ? getErrorMessage(error) : String(error)}`);
  }
}

// ============================================================================
// 📋 API ENDPOINT INTEGRATION EXAMPLES
// ============================================================================

/**
 * Example: Booking API endpoint integration
 * Add this to your booking API route
 */
export async function bookingApiValidation(req: any, res: any, next: any) {
  try {
    const { serviceType, address, documentCount, documentTypes, ghlContactId } = req?.body;

    // Validate business rules
    const validation = await quickValidateBooking({
      serviceType,
      customerAddress: address,
      documentCount,
      documentTypes,
      ghlContactId
    });

    if (!validation?.canProceed) {
      return res?.status(400).json({
        error: 'Booking violates business rules',
        violations: validation?.violations,
        code: 'BUSINESS_RULE_VIOLATION'
      });
    }

    // Add GHL actions to request for later processing
    if (req) {
      req.businessRules = validation;
    }
    
    next();
  } catch (error) {
    console?.error('Business rules validation error:', error);
    res?.status(500).json({
      error: 'Business rules validation failed',
      code: 'VALIDATION_ERROR'
    });
  }
}

/**
 * Example: Cancellation API endpoint integration
 */
export async function cancellationApiValidation(bookingId: string, reason: string, isWeatherRelated = false) {
  const engine = createBusinessRulesEngine({
    requestId: `cancel_${bookingId}_${Date?.now()}`
  });

  try {
    // Get booking data (you'll need to fetch from your database)
    const booking = await getBookingById(bookingId); // Your existing function
    
    const cancellationValidation = await engine?.validateCancellation({
      bookingId,
      scheduledDateTime: booking?.scheduledDateTime,
      requestedAt: new Date(),
      reason,
      isWeatherRelated,
      isReschedule: false
    });

    return {
      canCancel: cancellationValidation?.isValid,
      refundEligibility: cancellationValidation?.refundEligibility,
      violations: cancellationValidation?.violations,
      recommendations: cancellationValidation?.recommendations,
      ghlActions: cancellationValidation?.ghlActions
    };

  } catch (error) {
    console?.error('Cancellation validation failed:', error);
    throw error;
  }
}

// ============================================================================
// 🔄 REAL-TIME PRICING INTEGRATION
// ============================================================================

/**
 * Example: Real-time pricing with business rules validation
 */
export async function calculatePricingWithRules(params: {
  serviceType: string;
  address: string;
  documentCount: number;
  documentTypes?: string[];
  customerType?: string;
}) {
  try {
    // Calculate base pricing (using your existing PricingEngine)
    const pricing = await calculateBasePricing(params); // Your existing function
    
    // Validate business rules including pricing
    const validation = await comprehensiveBookingValidation({
      ...params,
      customerAddress: params?.address,
      basePrice: pricing?.basePrice,
      travelFee: pricing?.travelFee,
      extraDocumentFees: pricing?.extraDocumentFees,
      discounts: pricing?.discounts,
      totalPrice: pricing?.total
    });

    return {
      pricing: {
        base: pricing?.basePrice,
        travel: pricing?.travelFee,
        extraDocs: pricing?.extraDocumentFees,
        discounts: pricing?.discounts,
        total: pricing?.total,
        breakdown: pricing?.breakdown
      },
      businessRules: {
        isValid: validation?.isValid,
        violations: validation?.violations,
        recommendations: validation?.recommendations
      },
      ghlActions: validation?.ghlActions
    };

  } catch (error) {
    console?.error('Pricing with rules calculation failed:', error);
    throw error;
  }
}

// ============================================================================
// 🛠️ UTILITY FUNCTIONS (Mock implementations for examples)
// ============================================================================

// Mock functions - replace with your actual implementations
async function getBookingById(bookingId: string) {
  // Your database query to get booking
  return {
    id: bookingId,
    scheduledDateTime: new Date(),
    serviceType: 'STANDARD_NOTARY',
    // ... other booking fields
  };
}

async function calculateBasePricing(params: any) {
  // Your existing pricing calculation
  return {
    basePrice: 125,
    travelFee: 25,
    extraDocumentFees: 7,
    discounts: 0,
    total: 157,
    breakdown: {}
  };
}

// ============================================================================
// 📤 EXPORTS FOR EASY INTEGRATION
// ============================================================================

// Functions are already exported inline above

// ============================================================================
// 📚 USAGE DOCUMENTATION
// ============================================================================

/**
 * INTEGRATION CHECKLIST:
 * 
 * 1. 🔌 **API Endpoints**: Add bookingApiValidation middleware to booking routes
 * 2. 💰 **Pricing**: Replace pricing calculations with calculatePricingWithRules
 * 3. ❌ **Cancellations**: Use cancellationApiValidation for refund logic
 * 4. 🔗 **GHL Integration**: Ensure GHL contact IDs are passed to validation functions
 * 5. 📊 **Error Handling**: Handle violations gracefully with user-friendly messages
 * 6. ⚡ **Performance**: Use quickValidateBooking for simple checks, comprehensive for full validation
 * 
 * NEXT STEPS:
 * 1. Choose appropriate validation function for each use case
 * 2. Update existing API endpoints to use business rules validation
 * 3. Test with real booking scenarios
 * 4. Monitor GHL automation effectiveness
 */ 