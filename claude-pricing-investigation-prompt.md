# Claude Investigation Prompt: Multiple Pricing Calculations Issue

## 🎯 INVESTIGATION OBJECTIVE
The booking system's pricing calculator is running multiple times during a single booking process, when it should only run once at the end when the user completes the booking. This is causing performance issues, unnecessary API calls, and potential rate limiting.

## 📋 CONTEXT & EXISTING DOCUMENTATION

### Current System Architecture
- **Pricing Engine**: `lib/pricing-engine.ts` - Centralized pricing calculations
- **Booking Components**: `BookingWizard.tsx` and `BookingForm.tsx` - Main booking interfaces
- **API Endpoint**: `/api/booking/calculate-price` - Pricing calculation service
- **Distance Service**: `lib/maps/unified-distance-service.ts` - Travel fee calculations

### Known Issues from Documentation
1. **Step-based validation failure** causing form re-renders
2. **Excessive API calls** due to improper debouncing
3. **State management issues** with pricing state updates
4. **Form state corruption** causing recalculations

## 🔍 INVESTIGATION REQUIREMENTS

### Phase 1: Identify All Pricing Calculation Triggers
**Investigate these potential sources:**

1. **useEffect Dependencies in BookingWizard.tsx**
   - Check all useEffect hooks that call `calculatePricing()`
   - Identify which dependencies are changing unnecessarily
   - Look for dependency arrays that might be causing re-renders

2. **Form State Changes**
   - Analyze how form state updates trigger pricing recalculations
   - Check if form validation triggers are causing calculations
   - Look for unnecessary form re-renders

3. **Step Navigation**
   - Investigate if step changes trigger pricing calculations
   - Check if validation during step changes calls pricing
   - Look for duplicate calls during step transitions

4. **Debouncing Issues**
   - Verify the debouncing implementation in `debouncedCalculatePricing`
   - Check if debounce is being reset unnecessarily
   - Look for race conditions in debounced calls

### Phase 2: Analyze Current Implementation
**Focus on these files:**

1. **`components/booking/BookingWizard.tsx`**
   - Line 214: `calculatePricing` function
   - Line 289: `debouncedCalculatePricing` implementation
   - Line 326: `useEffect` for pricing triggers
   - Check all useEffect hooks for pricing-related dependencies

2. **`components/booking/BookingForm.tsx`**
   - Line 177: `calculateLivePrice` function
   - Line 268: Dependencies for pricing calculation
   - Look for duplicate implementation of pricing logic

3. **`app/api/booking/calculate-price/route.ts`**
   - Check for request deduplication logic
   - Verify caching implementation
   - Look for multiple requests from same session

### Phase 3: Trace Execution Flow
**Use this systematic approach:**

1. **Add Debug Logging**
   ```typescript
   console.log('🔍 PRICING CALCULATION TRIGGERED:', {
     trigger: 'useEffect/user-action/form-change',
     timestamp: new Date().toISOString(),
     watchedValues: JSON.stringify(watchedValues, null, 2),
     currentStep: state.currentStep,
     stackTrace: new Error().stack
   });
   ```

2. **Track State Changes**
   ```typescript
   // Before each pricing calculation
   console.log('📊 STATE BEFORE PRICING:', {
     serviceType: watchedValues.serviceType,
     location: watchedValues.location,
     scheduling: watchedValues.scheduling,
     serviceDetails: watchedValues.serviceDetails,
     currentStep: state.currentStep,
     pricingLoading: state.pricingLoading
   });
   ```

3. **Monitor API Calls**
   ```typescript
   // In calculate-price API endpoint
   logger.info('🌐 API CALL RECEIVED:', {
     requestId: Date.now(),
     params: validatedRequest,
     userAgent: request.headers.get('user-agent'),
     referer: request.headers.get('referer'),
     timestamp: new Date().toISOString()
   });
   ```

## 🎯 SPECIFIC INVESTIGATION QUESTIONS

### Question 1: Debouncing Effectiveness
- Is the debouncing actually preventing multiple calls?
- Are there multiple debounced functions being created?
- Is the debounce timer being reset by dependency changes?

### Question 2: Form State Triggers
- Which form fields are triggering pricing recalculations?
- Are validation errors causing pricing to recalculate?
- Is the form state being updated multiple times per user action?

### Question 3: Step Navigation Impact
- Does changing steps trigger pricing calculations?
- Are there pricing calculations happening for incomplete forms?
- Is the step validation process calling pricing?

### Question 4: Component Re-renders
- Are pricing calculations happening due to component re-renders?
- Are there multiple instances of the pricing components?
- Is the pricing state being managed correctly?

## 📋 EXPECTED FINDINGS & SOLUTIONS

### Likely Root Causes
Based on the documentation, expect to find:

1. **Improper useEffect Dependencies**
   ```typescript
   // PROBLEM: Too many dependencies
   useEffect(() => {
     calculatePricing();
   }, [watchedValues, state, form, toast]); // This triggers on every change

   // SOLUTION: Only meaningful dependencies
   useEffect(() => {
     calculatePricing();
   }, [watchedValues.serviceType, watchedValues.location?.zipCode]); // Only key changes
   ```

2. **Multiple Debounced Functions**
   ```typescript
   // PROBLEM: Creating new debounced function on every render
   const debouncedFn = debounce(calculatePricing, 2000);

   // SOLUTION: Memoize the debounced function
   const debouncedFn = useMemo(() => debounce(calculatePricing, 2000), [calculatePricing]);
   ```

3. **Form Validation Triggers**
   ```typescript
   // PROBLEM: Form validation triggering pricing
   const nextStep = async () => {
     await form.trigger(); // This might trigger pricing
     calculatePricing(); // Duplicate call
   };

   // SOLUTION: Separate validation from pricing
   const nextStep = async () => {
     const isValid = await form.trigger(currentStepFields);
     if (isValid) {
       // Only calculate pricing when actually needed
     }
   };
   ```

## 🔧 REQUIRED DELIVERABLES

### 1. Root Cause Analysis Report
Document exactly what is causing multiple pricing calculations:
- Which triggers are firing
- How many times pricing runs per booking
- Which dependencies are causing re-renders
- Any race conditions or timing issues

### 2. Execution Flow Map
Create a detailed map showing:
- User action → State change → Pricing calculation
- All paths that lead to pricing calculations
- Redundant or unnecessary calculation triggers

### 3. Performance Impact Assessment
Quantify the current issue:
- Number of API calls per booking
- Time spent in pricing calculations
- Impact on user experience
- Cost implications from excessive API usage

### 4. Solution Implementation Plan
Provide specific fixes:
- Exact code changes needed
- Dependencies to modify
- Debouncing improvements
- State management optimizations

## 🎯 SUCCESS CRITERIA

After investigation and fixes:
- **Pricing should only calculate once** when user completes the booking
- **No unnecessary API calls** during form filling
- **Sub-2-second response times** for pricing calculations
- **No duplicate calculations** from the same user session
- **Proper debouncing** preventing excessive calls

## 📊 MONITORING & VALIDATION

### Add Performance Tracking
```typescript
// Track pricing calculation frequency
const pricingCallTracker = {
  sessionId: crypto.randomUUID(),
  calls: [],
  addCall: (trigger: string) => {
    pricingCallTracker.calls.push({
      trigger,
      timestamp: Date.now(),
      stackTrace: new Error().stack
    });
  },
  getReport: () => {
    return {
      totalCalls: pricingCallTracker.calls.length,
      avgTimeBetweenCalls: /* calculate average */,
      triggers: pricingCallTracker.calls.map(c => c.trigger)
    };
  }
};
```

### Add User Journey Tracking
```typescript
// Track complete booking journey
const journeyTracker = {
  steps: [],
  pricingCalculations: [],
  addStep: (stepName: string) => {
    journeyTracker.steps.push({
      step: stepName,
      timestamp: Date.now(),
      pricingCalculationsAtStep: journeyTracker.pricingCalculations.length
    });
  }
};
```

---

## 🚀 INVESTIGATION ACTION PLAN

1. **Start with debug logging** in BookingWizard.tsx calculatePricing function
2. **Trace all useEffect dependencies** that might trigger pricing
3. **Monitor API calls** to see exact frequency and timing
4. **Test step navigation** to see if it triggers unnecessary calculations
5. **Verify debouncing** is working correctly
6. **Check for component re-renders** causing duplicate calculations
7. **Implement fixes** based on findings
8. **Test thoroughly** to ensure single pricing calculation per booking

---

*This investigation should identify exactly why pricing calculations are running multiple times and provide specific solutions to ensure they only run once when the booking is completed.* 