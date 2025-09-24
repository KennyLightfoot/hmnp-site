/**
 * Service ID Validation and Error Handling
 * 
 * Provides comprehensive validation for service IDs across the booking flow
 * with proper error handling and fallback logic.
 */

import { z } from 'zod';

// Service ID validation schema
const serviceIdSchema = z.string()
  .min(1, 'Service ID is required')
  .refine(
    (id) => id.length >= 10 && id.length <= 50,
    'Service ID must be between 10 and 50 characters'
  );

// Service validation response type
export interface ServiceValidationResult {
  isValid: boolean;
  serviceId?: string;
  error?: string;
  fallbackAction?: 'redirect' | 'show_selector' | 'use_default';
  fallbackServiceId?: string;
}

// Default service IDs for fallback
const DEFAULT_SERVICE_IDS = {
  essential: 'essential-notary-service',
  priority: 'priority-notary-service', 
  loan: 'loan-signing-service',
  default: 'essential-notary-service'
};

/**
 * Validate service ID with comprehensive error handling
 */
export function validateServiceId(serviceId: string | null | undefined): ServiceValidationResult {
  // Handle null/undefined cases
  if (!serviceId) {
    return {
      isValid: false,
      error: 'Service ID is required',
      fallbackAction: 'show_selector'
    };
  }

  // Handle empty string
  if (serviceId.trim() === '') {
    return {
      isValid: false,
      error: 'Service ID cannot be empty',
      fallbackAction: 'show_selector'
    };
  }

  // Validate with Zod schema
  try {
    const validatedId = serviceIdSchema.parse(serviceId.trim());
    
    return {
      isValid: true,
      serviceId: validatedId
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        error: error.errors[0]?.message || 'Invalid service ID format',
        fallbackAction: 'use_default',
        fallbackServiceId: DEFAULT_SERVICE_IDS.default
      };
    }

    return {
      isValid: false,
      error: 'Unknown validation error',
      fallbackAction: 'show_selector'
    };
  }
}

/**
 * Get fallback service ID based on context
 */
export function getFallbackServiceId(context?: 'loan' | 'essential' | 'priority'): string {
  switch (context) {
    case 'loan':
      return DEFAULT_SERVICE_IDS.loan;
    case 'priority':
      return DEFAULT_SERVICE_IDS.priority;
    case 'essential':
      return DEFAULT_SERVICE_IDS.essential;
    default:
      return DEFAULT_SERVICE_IDS.default;
  }
}

/**
 * Validate service ID from URL parameters
 */
export function validateServiceIdFromParams(
  searchParams: URLSearchParams,
  paramName = 'serviceId'
): ServiceValidationResult {
  const serviceId = searchParams.get(paramName);
  const result = validateServiceId(serviceId);
  
  // Add URL-specific fallback logic
  if (!result.isValid && !result.fallbackServiceId) {
    // Try to infer service from other URL params
    const service = searchParams.get('service');
    const type = searchParams.get('type');
    
    if (service || type) {
      const inferredContext = service || type;
      return {
        ...result,
        fallbackAction: 'use_default',
        fallbackServiceId: getFallbackServiceId(inferredContext as any)
      };
    }
  }
  
  return result;
}

/**
 * Service ID validation hook for React components
 */
export function useServiceIdValidation(serviceId: string | null | undefined) {
  const validation = validateServiceId(serviceId);
  
  return {
    ...validation,
    // Helper methods
    hasValidServiceId: validation.isValid,
    needsServiceSelection: validation.fallbackAction === 'show_selector',
    canUseFallback: Boolean(validation.fallbackServiceId),
    getValidServiceId: () => validation.serviceId || validation.fallbackServiceId,
  };
}

/**
 * Validate booking form data including service ID
 */
export interface BookingFormValidation {
  serviceId: ServiceValidationResult;
  date?: string;
  isValid: boolean;
  errors: string[];
}

export function validateBookingFormData(data: {
  serviceId?: string;
  date?: string;
  [key: string]: any;
}): BookingFormValidation {
  const serviceValidation = validateServiceId(data.serviceId);
  const errors: string[] = [];
  
  if (!serviceValidation.isValid) {
    errors.push(serviceValidation.error || 'Invalid service');
  }
  
  if (!data.date) {
    errors.push('Date is required');
  } else {
    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(data.date)) {
      errors.push('Date must be in YYYY-MM-DD format');
    }
  }
  
  return {
    serviceId: serviceValidation,
    date: data.date,
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Handle service ID errors in API routes
 */
export function handleServiceIdError(
  serviceId: string | null | undefined,
  context?: string
): { success: false; error: string; code: string } | { success: true; serviceId: string } {
  const validation = validateServiceId(serviceId);
  
  if (!validation.isValid) {
    return {
      success: false,
      error: validation.error || 'Invalid service ID',
      code: 'INVALID_SERVICE_ID'
    };
  }
  
  return {
    success: true,
    serviceId: validation.serviceId!
  };
}

/**
 * Get user-friendly error message for service ID validation
 */
export function getServiceIdErrorMessage(validation: ServiceValidationResult): string {
  if (validation.isValid) {
    return '';
  }
  
  switch (validation.fallbackAction) {
    case 'show_selector':
      return 'Please select a service to continue with your booking.';
    case 'use_default':
      return 'We\'ve selected our Essential Notary Service for you. You can change this if needed.';
    case 'redirect':
      return 'Please start your booking by selecting a service.';
    default:
      return validation.error || 'Invalid service selected.';
  }
}

export {
  DEFAULT_SERVICE_IDS,
  serviceIdSchema
};