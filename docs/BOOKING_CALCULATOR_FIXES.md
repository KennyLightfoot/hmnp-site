# Booking Calculator Implementation Fixes
## Specific Solutions for Current Issues

### 🎯 Priority Fixes

#### 1. Fix Step-Based Validation in BookingWizard

**Problem**: The Continue button fails because `nextStep()` calls `form.trigger()` which validates ALL form fields across all steps, causing validation errors for unfilled future steps.

**Solution**: Implement step-based validation using `form.trigger(fieldsArray)` to only validate current step's fields.

```typescript
// In BookingWizard.tsx - Add this step field mapping
const stepFieldMap = {
  'service-selection': ['serviceType'],
  'customer-info': ['customer.name', 'customer.email', 'customer.phone'],
  'location': ['location.address', 'location.city', 'location.state', 'location.zipCode'],
  'scheduling': ['scheduling.preferredDate', 'scheduling.preferredTime'],
  'service-details': ['serviceDetails.documentCount', 'serviceDetails.signerCount'],
  'review': [] // No validation needed for review step
};

// Replace the current nextStep function
const nextStep = async () => {
  const currentStepId = BOOKING_STEPS[state.currentStep].id;
  const currentStepFields = stepFieldMap[currentStepId] || [];
  
  if (currentStepFields.length > 0) {
    const isValid = await form.trigger(currentStepFields);
    if (!isValid) {
      return; // Don't proceed if validation fails
    }
  }
  
  setState(prev => ({ 
    ...prev, 
    currentStep: Math.min(prev.currentStep + 1, BOOKING_STEPS.length - 1) 
  }));
};
```

#### 2. Fix Pricing Calculation Debouncing

**Problem**: Pricing calculations are triggered too frequently, causing performance issues and API rate limiting.

**Solution**: Implement smarter debouncing with proper dependency management.

```typescript
// In BookingWizard.tsx - Replace current debouncing logic
const calculatePricing = useCallback(async () => {
  if (!watchedValues.serviceType) return;

  setState(prev => ({ ...prev, pricingLoading: true }));
  
  try {
    const pricingParams = {
      serviceType: watchedValues.serviceType,
      location: watchedValues.location ? {
        address: `${watchedValues.location.address}, ${watchedValues.location.city}, ${watchedValues.location.state} ${watchedValues.location.zipCode}`,
        latitude: watchedValues.location.latitude,
        longitude: watchedValues.location.longitude
      } : undefined,
      scheduledDateTime: watchedValues.scheduling?.preferredDate && watchedValues.scheduling?.preferredTime ? 
        new Date(`${watchedValues.scheduling.preferredDate.split('T')[0]}T${watchedValues.scheduling.preferredTime}`).toISOString() :
        new Date().toISOString(),
      documentCount: watchedValues.serviceDetails?.documentCount || 1,
      signerCount: watchedValues.serviceDetails?.signerCount || 1,
      options: {
        priority: watchedValues.scheduling?.priority || false,
        sameDay: watchedValues.scheduling?.sameDay || false,
        weatherAlert: false
      },
      customerEmail: watchedValues.customer?.email,
      promoCode: watchedValues.promoCode,
      referralCode: watchedValues.referralCode
    };

    const response = await fetch('/api/booking/calculate-price', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pricingParams)
    });

    if (!response.ok) {
      throw new Error(`Pricing calculation failed (${response.status})`);
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Invalid pricing response');
    }

    setState(prev => ({ 
      ...prev, 
      pricing: result.data,
      showUpsell: result.data.upsellSuggestions?.length > 0 && state.currentStep >= 2
    }));
  } catch (error) {
    console.error('Failed to calculate price:', error);
    toast({
      variant: 'destructive',
      title: 'Pricing Error',
      description: 'Unable to calculate pricing. Please try again or contact support.'
    });
  } finally {
    setState(prev => ({ ...prev, pricingLoading: false }));
  }
}, [watchedValues, state.currentStep, toast]);

// Improved debouncing with proper dependencies
const debouncedCalculatePricing = useMemo(
  () => debounce(calculatePricing, 2000),
  [calculatePricing]
);

// Only trigger on meaningful changes
useEffect(() => {
  const relevantData = {
    serviceType: watchedValues.serviceType,
    zipCode: watchedValues.location?.zipCode,
    date: watchedValues.scheduling?.preferredDate,
    time: watchedValues.scheduling?.preferredTime,
    documentCount: watchedValues.serviceDetails?.documentCount,
    signerCount: watchedValues.serviceDetails?.signerCount
  };
  
  const currentHash = JSON.stringify(relevantData);
  
  if (currentHash !== lastPricingHash && watchedValues.serviceType) {
    setLastPricingHash(currentHash);
    debouncedCalculatePricing();
  }
}, [watchedValues.serviceType, watchedValues.location?.zipCode, watchedValues.scheduling?.preferredDate, watchedValues.scheduling?.preferredTime, watchedValues.serviceDetails?.documentCount, watchedValues.serviceDetails?.signerCount, debouncedCalculatePricing]);
```

#### 3. Fix Environment Variable Access Issues

**Problem**: Some components are trying to access environment variables that may not be available or properly configured.

**Solution**: Add proper environment variable validation and fallbacks.

```typescript
// Create a new file: lib/config/environment.ts
export const ENV_CONFIG = {
  GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY || '',
  DATABASE_URL: process.env.DATABASE_URL || '',
  REDIS_URL: process.env.REDIS_URL || '',
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || '',
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000'
};

// Validate required environment variables
export const validateEnvironment = () => {
  const required = ['GOOGLE_MAPS_API_KEY', 'DATABASE_URL'];
  const missing = required.filter(key => !ENV_CONFIG[key as keyof typeof ENV_CONFIG]);
  
  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing);
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

// Use in your components
import { ENV_CONFIG } from '@/lib/config/environment';

// Instead of process.env.GOOGLE_MAPS_API_KEY
const apiKey = ENV_CONFIG.GOOGLE_MAPS_API_KEY;
```

#### 4. Fix Pricing Engine Error Handling

**Problem**: Pricing engine doesn't handle errors gracefully, causing the entire booking flow to fail.

**Solution**: Add comprehensive error handling with fallbacks.

```typescript
// In lib/pricing-engine.ts - Update the main calculation method
async calculateBookingPrice(params: PricingCalculationParams): Promise<PricingResult> {
  try {
    // Validate inputs with Zod
    const validatedParams = PricingCalculationParamsSchema.parse(params);
    
    logger.info('Pricing calculation started', { 
      requestId: this.requestId, 
      serviceType: validatedParams.serviceType 
    });

    // Get base service price
    const basePrice = this.getServiceBasePrice(validatedParams.serviceType);
    
    // Calculate travel fees if location provided
    let travelData = { fee: 0, distance: 0, withinArea: true };
    if (validatedParams.location) {
      try {
        travelData = await this.calculateTravelFee(validatedParams.serviceType, validatedParams.location);
      } catch (error) {
        logger.warn('Travel fee calculation failed, using fallback', { 
          error: error.message,
          requestId: this.requestId 
        });
        // Fallback to estimated travel fee
        travelData = { fee: 10, distance: 20, withinArea: false };
      }
    }
    
    // Calculate surcharges
    const surcharges = this.calculateSurcharges(
      validatedParams.serviceType,
      validatedParams.scheduledDateTime,
      validatedParams.options
    );
    
    // Calculate discounts
    let discounts = 0;
    try {
      discounts = await this.calculateDiscounts(
        validatedParams.promoCode,
        validatedParams.customerEmail,
        validatedParams.referralCode,
        validatedParams.documentCount,
        validatedParams.serviceType
      );
    } catch (error) {
      logger.warn('Discount calculation failed', { 
        error: error.message,
        requestId: this.requestId 
      });
      // Continue without discounts
    }
    
    // Calculate final price
    const subtotal = basePrice + travelData.fee + surcharges;
    const total = Math.max(0, subtotal - discounts);
    
    // Generate breakdown
    const breakdown = this.generatePricingBreakdown(
      basePrice, 
      travelData.fee, 
      surcharges, 
      discounts,
      travelData
    );
    
    // Detect upsell opportunities
    const upsellSuggestions = this.detectUpsellOpportunities(validatedParams, travelData);
    
    // Calculate confidence level
    const confidence = this.calculatePricingConfidence(validatedParams, travelData);
    
    // Get pricing factors
    const factors = this.getPricingFactors(validatedParams, travelData);
    
    const result: PricingResult = {
      basePrice,
      travelFee: travelData.fee,
      surcharges,
      discounts,
      total: Math.round(total * 100) / 100, // Round to 2 decimal places
      breakdown,
      upsellSuggestions,
      confidence,
      metadata: {
        calculatedAt: new Date().toISOString(),
        version: '2.0.0',
        factors,
        requestId: this.requestId
      }
    };
    
    // Cache result
    await this.cacheResult(validatedParams, result);
    
    logger.info('Pricing calculation completed', { 
      requestId: this.requestId,
      total: result.total,
      serviceType: validatedParams.serviceType
    });
    
    return result;
    
  } catch (error) {
    logger.error('Pricing calculation failed', { 
      requestId: this.requestId,
      error: error.message,
      stack: error.stack
    });
    
    // Return fallback pricing to prevent complete failure
    return {
      basePrice: 75,
      travelFee: 0,
      surcharges: 0,
      discounts: 0,
      total: 75,
      breakdown: {
        lineItems: [{
          description: 'Standard Notary Service (Fallback)',
          amount: 75,
          type: 'base'
        }],
        transparency: {
          travelCalculation: 'Fallback pricing due to calculation error'
        }
      },
      upsellSuggestions: [],
      confidence: {
        level: 'low',
        factors: ['Calculation error occurred']
      },
      metadata: {
        calculatedAt: new Date().toISOString(),
        version: '2.0.0',
        factors: { error: error.message },
        requestId: this.requestId
      }
    };
  }
}
```

#### 5. Fix Distance Calculation Issues

**Problem**: Distance calculation fails or returns incorrect values, affecting travel fee calculations.

**Solution**: Add robust distance calculation with multiple fallbacks.

```typescript
// In lib/maps/distance-calculator.ts - Add fallback logic
export async function calculateDistance(
  origin: string, 
  destination: string
): Promise<{ distance: number; duration: number; route: string }> {
  try {
    // Try Google Maps API first
    const googleResult = await calculateDistanceGoogleMaps(origin, destination);
    if (googleResult.distance > 0) {
      return googleResult;
    }
  } catch (error) {
    logger.warn('Google Maps distance calculation failed', { error: error.message });
  }
  
  try {
    // Fallback to OpenStreetMap API
    const osmResult = await calculateDistanceOpenStreetMap(origin, destination);
    if (osmResult.distance > 0) {
      return osmResult;
    }
  } catch (error) {
    logger.warn('OpenStreetMap distance calculation failed', { error: error.message });
  }
  
  // Final fallback: estimate based on ZIP codes
  const estimatedDistance = estimateDistanceByZipCodes(origin, destination);
  
  logger.info('Using estimated distance calculation', { 
    origin, 
    destination, 
    estimatedDistance 
  });
  
  return {
    distance: estimatedDistance,
    duration: estimatedDistance * 2, // Rough estimate: 2 minutes per mile
    route: 'estimated'
  };
}

// Add ZIP code-based estimation
function estimateDistanceByZipCodes(origin: string, destination: string): number {
  // Extract ZIP codes
  const originZip = origin.match(/\d{5}/)?.[0];
  const destZip = destination.match(/\d{5}/)?.[0];
  
  if (!originZip || !destZip) {
    return 20; // Default fallback distance
  }
  
  // Simple distance estimation based on ZIP code patterns
  // This is a rough approximation - in production, you'd want a more sophisticated approach
  const zipDistanceMap: Record<string, number> = {
    '77591': 0, // Base location
    '77001': 25, // Downtown Houston
    '77002': 24,
    '77003': 23,
    '77004': 22,
    '77005': 21,
    '77006': 20,
    '77007': 19,
    '77008': 18,
    '77009': 17,
    '77010': 16,
    '77011': 15,
    '77012': 14,
    '77013': 13,
    '77014': 12,
    '77015': 11,
    '77016': 10,
    '77017': 9,
    '77018': 8,
    '77019': 7,
    '77020': 6,
    '77021': 5,
    '77022': 4,
    '77023': 3,
    '77024': 2,
    '77025': 1,
    '77026': 2,
    '77027': 3,
    '77028': 4,
    '77029': 5,
    '77030': 6,
    '77031': 7,
    '77032': 8,
    '77033': 9,
    '77034': 10,
    '77035': 11,
    '77036': 12,
    '77037': 13,
    '77038': 14,
    '77039': 15,
    '77040': 16,
    '77041': 17,
    '77042': 18,
    '77043': 19,
    '77044': 20,
    '77045': 21,
    '77046': 22,
    '77047': 23,
    '77048': 24,
    '77049': 25,
    '77050': 26,
    '77051': 27,
    '77052': 28,
    '77053': 29,
    '77054': 30,
    '77055': 31,
    '77056': 32,
    '77057': 33,
    '77058': 34,
    '77059': 35,
    '77060': 36,
    '77061': 37,
    '77062': 38,
    '77063': 39,
    '77064': 40,
    '77065': 41,
    '77066': 42,
    '77067': 43,
    '77068': 44,
    '77069': 45,
    '77070': 46,
    '77071': 47,
    '77072': 48,
    '77073': 49,
    '77074': 50,
    '77075': 51,
    '77076': 52,
    '77077': 53,
    '77078': 54,
    '77079': 55,
    '77080': 56,
    '77081': 57,
    '77082': 58,
    '77083': 59,
    '77084': 60,
    '77085': 61,
    '77086': 62,
    '77087': 63,
    '77088': 64,
    '77089': 65,
    '77090': 66,
    '77091': 67,
    '77092': 68,
    '77093': 69,
    '77094': 70,
    '77095': 71,
    '77096': 72,
    '77097': 73,
    '77098': 74,
    '77099': 75
  };
  
  const originDistance = zipDistanceMap[originZip] || 20;
  const destDistance = zipDistanceMap[destZip] || 20;
  
  return Math.abs(destDistance - originDistance);
}
```

### 🔧 Additional Improvements

#### 1. Add Request Caching

```typescript
// In lib/cache/request-cache.ts
import { redis } from '../redis';

export class RequestCache {
  private static instance: RequestCache;
  private cache = new Map<string, { result: any; timestamp: number }>();
  
  static getInstance(): RequestCache {
    if (!RequestCache.instance) {
      RequestCache.instance = new RequestCache();
    }
    return RequestCache.instance;
  }
  
  async get(key: string): Promise<any | null> {
    // Check memory cache first
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < 30000) { // 30 seconds
      return cached.result;
    }
    
    // Check Redis cache
    try {
      const redisCached = await redis.get(`request:${key}`);
      if (redisCached) {
        const result = JSON.parse(redisCached);
        this.cache.set(key, { result, timestamp: Date.now() });
        return result;
      }
    } catch (error) {
      console.warn('Redis cache check failed:', error);
    }
    
    return null;
  }
  
  async set(key: string, result: any, ttl: number = 30): Promise<void> {
    // Set memory cache
    this.cache.set(key, { result, timestamp: Date.now() });
    
    // Set Redis cache
    try {
      await redis.setex(`request:${key}`, ttl, JSON.stringify(result));
    } catch (error) {
      console.warn('Redis cache set failed:', error);
    }
  }
  
  clear(): void {
    this.cache.clear();
  }
}

export const requestCache = RequestCache.getInstance();
```

#### 2. Add Comprehensive Logging

```typescript
// In lib/logger.ts - Add structured logging
export const logger = {
  info: (message: string, meta?: any) => {
    console.log(`[INFO] ${message}`, meta ? JSON.stringify(meta, null, 2) : '');
  },
  warn: (message: string, meta?: any) => {
    console.warn(`[WARN] ${message}`, meta ? JSON.stringify(meta, null, 2) : '');
  },
  error: (message: string, meta?: any) => {
    console.error(`[ERROR] ${message}`, meta ? JSON.stringify(meta, null, 2) : '');
  },
  debug: (message: string, meta?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, meta ? JSON.stringify(meta, null, 2) : '');
    }
  }
};
```

#### 3. Add Error Tracking

```typescript
// In lib/monitoring/error-tracker.ts
export const trackError = (error: Error, context?: any) => {
  console.error('Error tracked:', {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString()
  });
  
  // In production, send to error tracking service
  if (process.env.NODE_ENV === 'production') {
    // Send to Sentry, LogRocket, etc.
  }
};
```

### 📋 Implementation Checklist

- [ ] Fix step-based validation in BookingWizard
- [ ] Implement proper debouncing for pricing calculations
- [ ] Add environment variable validation
- [ ] Improve error handling in pricing engine
- [ ] Add fallback distance calculation
- [ ] Implement request caching
- [ ] Add comprehensive logging
- [ ] Test all fixes thoroughly
- [ ] Monitor performance improvements

### 🧪 Testing Commands

```bash
# Test pricing calculation API
curl -X POST http://localhost:3000/api/booking/calculate-price \
  -H "Content-Type: application/json" \
  -d '{
    "serviceType": "STANDARD_NOTARY",
    "scheduledDateTime": "2024-01-15T14:00:00Z",
    "documentCount": 1,
    "signerCount": 1
  }'

# Test with location
curl -X POST http://localhost:3000/api/booking/calculate-price \
  -H "Content-Type: application/json" \
  -d '{
    "serviceType": "STANDARD_NOTARY",
    "location": {
      "address": "123 Main St, Houston, TX 77001"
    },
    "scheduledDateTime": "2024-01-15T14:00:00Z",
    "documentCount": 1,
    "signerCount": 1
  }'

# Test promo code
curl -X POST http://localhost:3000/api/booking/calculate-price \
  -H "Content-Type: application/json" \
  -d '{
    "serviceType": "STANDARD_NOTARY",
    "scheduledDateTime": "2024-01-15T14:00:00Z",
    "documentCount": 1,
    "signerCount": 1,
    "promoCode": "FIRST20"
  }'
```

---

*These fixes address the most common booking calculator issues. Implement them in order of priority and test thoroughly after each change.* 