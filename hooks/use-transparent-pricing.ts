'use client';

/**
 * Transparent Pricing Hook - Houston Mobile Notary Pros
 * Phase 4: Transparent Pricing Integration
 * 
 * This hook provides real-time transparent pricing calculations
 * throughout the booking flow using the unified pricing engine.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';

// Types for the hook
interface TransparentPricingRequest {
  serviceType: string;
  documentCount?: number;
  signerCount?: number;
  address?: string;
  scheduledDateTime?: string;
  customerType?: 'new' | 'returning' | 'loyalty';
  customerEmail?: string;
  referralCode?: string;
  promoCode?: string;
}

interface PricingBreakdownComponent {
  amount: number;
  label: string;
  description: string;
  isDiscount: boolean;
  calculation?: string;
}

interface TransparentPricingResult {
  serviceType: string;
  basePrice: number;
  totalPrice: number;
  breakdown: {
    serviceBase: PricingBreakdownComponent;
    travelFee?: PricingBreakdownComponent;
    extraDocuments?: PricingBreakdownComponent;
    timeBasedSurcharges: PricingBreakdownComponent[];
    discounts: PricingBreakdownComponent[];
  };
  transparency: {
    whyThisPrice: string;
    feeExplanations: string[];
    alternatives: Array<{
      serviceType: string;
      price: number;
      savings: number;
      tradeoffs: string[];
    }>;
  };
  businessRules: {
    isValid: boolean;
    serviceAreaZone: string;
    isWithinServiceArea: boolean;
    documentLimitsExceeded: boolean;
    dynamicPricingActive: boolean;
    discountsApplied: string[];
    violations: string[];
    recommendations: string[];
  };
}

interface UseTransparentPricingResult {
  // Pricing data
  pricing: TransparentPricingResult | null;
  
  // State flags
  isLoading: boolean;
  isCalculating: boolean;
  error: string | null;
  
  // Methods
  calculatePricing: (request: TransparentPricingRequest) => Promise<void>;
  recalculate: () => Promise<void>;
  clearError: () => void;
  
  // Helper getters
  totalPrice: number;
  hasDiscounts: boolean;
  hasSurcharges: boolean;
  isValid: boolean;
  
  // Quick access to common data
  serviceAreaZone: string | null;
  dynamicPricingActive: boolean;
  alternatives: TransparentPricingResult['transparency']['alternatives'];
}

export function useTransparentPricing(
  initialRequest?: TransparentPricingRequest,
  options: {
    autoCalculate?: boolean;
    debounceMs?: number;
    onPricingChange?: (pricing: TransparentPricingResult | null) => void;
    onError?: (error: string) => void;
  } = {}
): UseTransparentPricingResult {
  
  const {
    autoCalculate = true,
    debounceMs = 500,
    onPricingChange,
    onError
  } = options;

  // State
  const [pricing, setPricing] = useState<TransparentPricingResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRequest, setLastRequest] = useState<TransparentPricingRequest | null>(initialRequest || null);
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);

  // Calculate pricing function
  const calculatePricing = useCallback(async (request: TransparentPricingRequest) => {
    // Validate required fields
    if (!request.serviceType) {
      setError('Service type is required for pricing calculation');
      return;
    }

    setIsCalculating(true);
    setError(null);
    setLastRequest(request);

    try {
      console.log('🔍 Calculating transparent pricing:', request);

      const response = await fetch('/api/pricing/transparent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceType: request.serviceType,
          documentCount: request.documentCount || 1,
          signerCount: request.signerCount || 1,
          address: request.address,
          scheduledDateTime: request.scheduledDateTime,
          customerType: request.customerType || 'new',
          customerEmail: request.customerEmail,
          referralCode: request.referralCode,
          promoCode: request.promoCode
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Pricing calculation failed');
      }

      // Transform API response to match our interface
      const transformedResult: TransparentPricingResult = {
        serviceType: result.serviceType,
        basePrice: result.basePrice,
        totalPrice: result.totalPrice,
        breakdown: result.breakdown,
        transparency: result.transparency,
        businessRules: result.businessRules
      };

      setPricing(transformedResult);
      onPricingChange?.(transformedResult);

      console.log('✅ Transparent pricing calculated:', {
        totalPrice: transformedResult.totalPrice,
        discountsApplied: transformedResult.businessRules.discountsApplied,
        dynamicPricingActive: transformedResult.businessRules.dynamicPricingActive
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Pricing calculation failed';
      console.error('❌ Transparent pricing calculation failed:', errorMessage);
      
      setError(errorMessage);
      setPricing(null);
      onError?.(errorMessage);
      onPricingChange?.(null);
    } finally {
      setIsCalculating(false);
    }
  }, [onPricingChange, onError]);

  // Debounced calculation
  const debouncedCalculatePricing = useCallback((request: TransparentPricingRequest) => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    const timeout = setTimeout(() => {
      calculatePricing(request);
    }, debounceMs);

    setDebounceTimeout(timeout);
  }, [calculatePricing, debounceMs, debounceTimeout]);

  // Recalculate using last request
  const recalculate = useCallback(async () => {
    if (lastRequest) {
      await calculatePricing(lastRequest);
    }
  }, [calculatePricing, lastRequest]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto-calculate on initial request
  useEffect(() => {
    if (initialRequest && autoCalculate) {
      setIsLoading(true);
      debouncedCalculatePricing(initialRequest);
      setTimeout(() => setIsLoading(false), 100);
    }
  }, [initialRequest, autoCalculate, debouncedCalculatePricing]);

  // Cleanup debounce timeout
  useEffect(() => {
    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
    };
  }, [debounceTimeout]);

  // Memoized helper values
  const totalPrice = useMemo(() => pricing?.totalPrice || 0, [pricing]);
  
  const hasDiscounts = useMemo(() => 
    pricing?.breakdown.discounts.length > 0 || false, 
    [pricing]
  );
  
  const hasSurcharges = useMemo(() => 
    pricing?.breakdown.timeBasedSurcharges.length > 0 || false, 
    [pricing]
  );
  
  const isValid = useMemo(() => 
    pricing?.businessRules.isValid || false, 
    [pricing]
  );
  
  const serviceAreaZone = useMemo(() => 
    pricing?.businessRules.serviceAreaZone || null, 
    [pricing]
  );
  
  const dynamicPricingActive = useMemo(() => 
    pricing?.businessRules.dynamicPricingActive || false, 
    [pricing]
  );
  
  const alternatives = useMemo(() => 
    pricing?.transparency.alternatives || [], 
    [pricing]
  );

  return {
    // Pricing data
    pricing,
    
    // State flags
    isLoading,
    isCalculating,
    error,
    
    // Methods
    calculatePricing: debouncedCalculatePricing,
    recalculate,
    clearError,
    
    // Helper getters
    totalPrice,
    hasDiscounts,
    hasSurcharges,
    isValid,
    
    // Quick access to common data
    serviceAreaZone,
    dynamicPricingActive,
    alternatives
  };
}

// Specialized hook for booking forms
export function useBookingPricing(
  formData: {
    serviceType?: string;
    documentCount?: number;
    address?: string;
    scheduledDateTime?: string;
    customerType?: 'new' | 'returning' | 'loyalty';
    customerEmail?: string;
    referralCode?: string;
    promoCode?: string;
  },
  options?: {
    autoCalculate?: boolean;
    onPricingChange?: (pricing: TransparentPricingResult | null) => void;
  }
) {
  const request = useMemo((): TransparentPricingRequest | undefined => {
    if (!formData.serviceType) return undefined;

    return {
      serviceType: formData.serviceType,
      documentCount: formData.documentCount || 1,
      signerCount: 1, // Default for now
      address: formData.address,
      scheduledDateTime: formData.scheduledDateTime,
      customerType: formData.customerType || 'new',
      customerEmail: formData.customerEmail,
      referralCode: formData.referralCode,
      promoCode: formData.promoCode
    };
  }, [formData]);

  return useTransparentPricing(request, {
    autoCalculate: true,
    debounceMs: 750, // Slightly longer for form fields
    ...options
  });
}

// Specialized hook for service comparison
export function useServiceComparison(
  baseServiceType: string,
  comparisonServices: string[] = ['QUICK_STAMP_LOCAL', 'STANDARD_NOTARY', 'EXTENDED_HOURS', 'LOAN_SIGNING', 'RON_SERVICES']
) {
  const [comparisons, setComparisons] = useState<{ [serviceType: string]: TransparentPricingResult | null }>({});
  const [isLoading, setIsLoading] = useState(false);

  const loadComparisons = useCallback(async (baseRequest: TransparentPricingRequest) => {
    setIsLoading(true);
    const results: { [serviceType: string]: TransparentPricingResult | null } = {};

    for (const serviceType of comparisonServices) {
      try {
        const response = await fetch('/api/pricing/transparent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...baseRequest,
            serviceType
          })
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            results[serviceType] = {
              serviceType: result.serviceType,
              basePrice: result.basePrice,
              totalPrice: result.totalPrice,
              breakdown: result.breakdown,
              transparency: result.transparency,
              businessRules: result.businessRules
            };
          }
        }
      } catch (error) {
        console.warn(`Failed to load pricing for ${serviceType}:`, error);
        results[serviceType] = null;
      }
    }

    setComparisons(results);
    setIsLoading(false);
  }, [comparisonServices]);

  return {
    comparisons,
    isLoading,
    loadComparisons
  };
}

export default useTransparentPricing; 