# Booking Calculator Troubleshooting Guide
## Common Issues & Solutions

### 🚨 Critical Issues

#### 1. Pricing Calculation Fails Completely
**Symptoms:**
- "Unable to calculate pricing" error
- Pricing shows $0 or undefined
- API returns 500 errors

**Root Causes:**
- Missing environment variables (Google Maps API key)
- Database connection issues
- Invalid service type in request

**Solutions:**
```bash
# Check environment variables
echo $GOOGLE_MAPS_API_KEY
echo $DATABASE_URL

# Test API endpoint directly
curl -X POST http://localhost:3000/api/booking/calculate-price \
  -H "Content-Type: application/json" \
  -d '{
    "serviceType": "STANDARD_NOTARY",
    "scheduledDateTime": "2024-01-15T14:00:00Z",
    "documentCount": 1,
    "signerCount": 1
  }'
```

#### 2. Travel Fees Not Calculating
**Symptoms:**
- Travel fee always shows $0
- Distance calculation fails
- "Distance calculation failed" warnings in logs

**Root Causes:**
- Google Maps API quota exceeded
- Invalid address format
- Network connectivity issues

**Solutions:**
```typescript
// Check distance calculation in pricing engine
const distanceResult = await calculateDistance(
  PRICING_CONFIG.baseLocation, // "77591"
  location.address
);

// Add fallback logic
if (!distanceResult.distance) {
  logger.warn('Distance calculation failed, using fallback');
  return { fee: 10, distance: 20, withinArea: false };
}
```

#### 3. Promo Codes Not Working
**Symptoms:**
- Promo code shows "Invalid" but code exists
- Discount not applied to final price
- Promo code validation fails

**Root Causes:**
- Promo code expired
- Usage limits exceeded
- Database connection issues

**Solutions:**
```sql
-- Check promo code status
SELECT * FROM "PromoCode" 
WHERE code = 'YOUR_CODE' 
AND "isActive" = true 
AND "expiresAt" > NOW();
```

### ⚠️ Performance Issues

#### 1. Slow Pricing Calculations
**Symptoms:**
- 5+ second response times
- User sees loading spinner for extended periods
- API timeouts

**Root Causes:**
- No caching implemented
- Excessive API calls to Google Maps
- Database query optimization needed

**Solutions:**
```typescript
// Implement Redis caching
const cacheKey = `pricing:${hashParams(params)}`;
const cached = await redis.get(cacheKey);
if (cached) {
  return JSON.parse(cached);
}

// Cache result for 30 seconds
await redis.setex(cacheKey, 30, JSON.stringify(result));
```

#### 2. Excessive API Calls
**Symptoms:**
- Google Maps API quota exceeded quickly
- High costs from external APIs
- Rate limiting errors

**Root Causes:**
- No debouncing on frontend
- Missing request deduplication
- Inefficient caching strategy

**Solutions:**
```typescript
// Implement smart debouncing
const debouncedCalculatePricing = useMemo(
  () => debounce(calculatePricing, 2000), // 2 second delay
  [watchedValues.serviceType, watchedValues.location?.zipCode]
);

// Add request fingerprinting
const requestFingerprint = createHash('md5')
  .update(JSON.stringify(params))
  .digest('hex');
```

### 🔧 Validation Issues

#### 1. Form Validation Errors
**Symptoms:**
- "Please fill in all required fields" but form looks complete
- Validation errors for future steps
- Step-based validation not working

**Root Causes:**
- `form.trigger()` validating all fields instead of current step
- Missing step field mapping
- Form state not properly managed

**Solutions:**
```typescript
// Implement step-based validation
const stepFieldMap = {
  'service-selection': ['serviceType'],
  'customer-info': ['customer.name', 'customer.email'],
  'location': ['location.address', 'location.zipCode'],
  'scheduling': ['scheduling.preferredDate', 'scheduling.preferredTime']
};

// Only validate current step fields
const currentStepFields = stepFieldMap[BOOKING_STEPS[state.currentStep].id];
await form.trigger(currentStepFields);
```

#### 2. Address Validation Issues
**Symptoms:**
- Invalid address format errors
- ZIP code validation fails
- Location not found errors

**Root Causes:**
- Address normalization issues
- ZIP code format mismatch
- Google Maps geocoding failures

**Solutions:**
```typescript
// Normalize address format
const normalizeAddress = (address: string) => {
  return address
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/,\s*,/g, ',');
};

// Validate ZIP code format
const isValidZipCode = (zipCode: string) => {
  return /^\d{5}(-\d{4})?$/.test(zipCode);
};
```

### 💰 Pricing Accuracy Issues

#### 1. Incorrect Base Prices
**Symptoms:**
- Service prices don't match expected values
- RON pricing shows wrong amount
- Different prices for same service

**Root Causes:**
- Hardcoded prices in multiple places
- Service configuration mismatch
- Database vs. code price inconsistency

**Solutions:**
```typescript
// Centralize pricing in SERVICES config
export const SERVICES = {
  STANDARD_NOTARY: {
    price: 75, // Single source of truth
    includedRadius: 15,
    feePerMile: 0.50
  }
  // ... other services
};

// Use consistent pricing throughout
const basePrice = SERVICES[serviceType].price;
```

#### 2. Travel Fee Calculation Errors
**Symptoms:**
- Travel fees too high or too low
- Incorrect distance calculations
- Fees applied when they shouldn't be

**Root Causes:**
- Wrong base location coordinates
- Incorrect fee per mile calculation
- Included radius not respected

**Solutions:**
```typescript
// Verify travel fee calculation
const calculateTravelFee = (distance: number, includedRadius: number, feePerMile: number) => {
  const excessDistance = Math.max(0, distance - includedRadius);
  const fee = Math.round(excessDistance * feePerMile * 100) / 100;
  
  console.log(`Distance: ${distance}, Included: ${includedRadius}, Excess: ${excessDistance}, Fee: ${fee}`);
  return fee;
};
```

### 🔄 State Management Issues

#### 1. Pricing State Not Updating
**Symptoms:**
- Price doesn't update when service changes
- Old pricing persists after form changes
- Pricing loading state stuck

**Root Causes:**
- Missing dependencies in useEffect
- State update race conditions
- Incorrect dependency arrays

**Solutions:**
```typescript
// Ensure proper dependencies
useEffect(() => {
  if (shouldRecalculatePrice && watchedValues.serviceType) {
    debouncedCalculatePricing();
  }
}, [shouldRecalculatePrice, debouncedCalculatePricing, watchedValues.serviceType]);

// Add proper state cleanup
useEffect(() => {
  return () => {
    setState(prev => ({ ...prev, pricing: null, pricingLoading: false }));
  };
}, []);
```

#### 2. Form State Corruption
**Symptoms:**
- Form values disappear
- Step navigation issues
- Validation state inconsistent

**Root Causes:**
- Form reset not handled properly
- Step state not preserved
- React Hook Form state conflicts

**Solutions:**
```typescript
// Preserve form state across steps
const [formState, setFormState] = useState({});

// Save state before step change
const handleStepChange = (newStep: number) => {
  const currentValues = form.getValues();
  setFormState(prev => ({ ...prev, [state.currentStep]: currentValues }));
  setState(prev => ({ ...prev, currentStep: newStep }));
};

// Restore state when returning to step
useEffect(() => {
  if (formState[state.currentStep]) {
    form.reset(formState[state.currentStep]);
  }
}, [state.currentStep]);
```

### 🐛 Debugging Tools

#### 1. Enable Debug Logging
```typescript
// Add to pricing engine
logger.debug('Pricing calculation details', {
  serviceType: validatedParams.serviceType,
  location: validatedParams.location,
  basePrice,
  travelFee,
  surcharges,
  discounts,
  finalPrice: total
});
```

#### 2. Add Request Tracking
```typescript
// Track all pricing requests
const requestId = `pricing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

logger.info('Pricing request started', {
  requestId,
  serviceType: params.serviceType,
  timestamp: new Date().toISOString()
});
```

#### 3. Performance Monitoring
```typescript
// Add timing to pricing calculation
const startTime = Date.now();
const result = await calculateBookingPrice(params);
const duration = Date.now() - startTime;

logger.info('Pricing calculation completed', {
  requestId,
  duration,
  success: !!result
});
```

### 📊 Testing Checklist

#### Manual Testing
- [ ] Test each service type pricing
- [ ] Verify travel fees for different distances
- [ ] Test promo code application
- [ ] Check form validation on each step
- [ ] Verify pricing updates in real-time
- [ ] Test error handling scenarios

#### Automated Testing
```typescript
// Add comprehensive unit tests
describe('Pricing Engine', () => {
  it('should calculate correct base pricing', () => {
    const result = calculateBookingPrice({
      serviceType: 'STANDARD_NOTARY',
      scheduledDateTime: '2024-01-15T14:00:00Z',
      documentCount: 1,
      signerCount: 1
    });
    
    expect(result.basePrice).toBe(75);
    expect(result.total).toBe(75);
  });
});
```

### 🚀 Performance Optimization

#### 1. Implement Caching
```typescript
// Redis caching for pricing results
const cacheKey = `pricing:${hashParams(params)}`;
const cached = await redis.get(cacheKey);

if (cached) {
  return JSON.parse(cached);
}

// Cache for 30 seconds
await redis.setex(cacheKey, 30, JSON.stringify(result));
```

#### 2. Optimize API Calls
```typescript
// Batch distance calculations
const batchDistanceCalculation = async (addresses: string[]) => {
  // Use Google Maps Distance Matrix API for batch requests
  const results = await Promise.all(
    addresses.map(addr => calculateDistance(baseLocation, addr))
  );
  return results;
};
```

#### 3. Frontend Optimization
```typescript
// Implement virtual scrolling for large forms
// Use React.memo for expensive components
// Implement proper loading states
```

---

*This troubleshooting guide should help resolve most common booking calculator issues. For persistent problems, check the application logs and consider implementing additional monitoring.* 