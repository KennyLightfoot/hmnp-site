# Pricing Engine Usage Classification

## Summary
- **Primary Engine**: `UnifiedPricingEngine` (`lib/pricing/unified-pricing-engine.ts`) - Powers main booking flow
- **Secondary Engines**: `EnhancedPricingEngine`, `DynamicPricingEngine` - Used for specific API endpoints
- **Legacy Engine**: `PricingEngine` (`lib/pricing-engine.ts`) - Only used in legacy component

## Detailed Usage Map

### UnifiedPricingEngine (PRIMARY)
**File**: `lib/pricing/unified-pricing-engine.ts`
**Status**: ✅ Core Production
**Used In**:
- `app/api/pricing/transparent/route.ts` - Main transparent pricing API
- `app/api/estimate/route.ts` - Quick estimate API
- `hooks/use-transparent-pricing.ts` - React hook (calls `/api/pricing/transparent`)
- `components/booking/BookingForm.tsx` - Main booking form (via hook)

### EnhancedPricingEngine (SECONDARY)
**File**: `lib/business-rules/pricing-engine.ts`
**Status**: ✅ Active (Specific Use Case)
**Used In**:
- `app/api/booking/calculate-price/route.ts` - Enhanced pricing API endpoint

### DynamicPricingEngine (SECONDARY)
**File**: `lib/pricing/dynamic-pricing-engine.ts`
**Status**: ✅ Active (Specific Use Case)
**Used In**:
- `app/api/pricing/dynamic/route.ts` - Dynamic pricing API endpoint

### PricingEngine (LEGACY)
**File**: `lib/pricing-engine.ts`
**Status**: ⚠️ Legacy (Minimal Usage)
**Used In**:
- `components/service-calculator.tsx` - Legacy calculator component
- `lib/business-rules/engine.ts` - Imported but NOT USED (dead import)

## Pricing Module Files Classification

### Core Production Files (lib/pricing/)
- ✅ `unified-pricing-engine.ts` - PRIMARY ENGINE
- ✅ `dynamic-pricing-engine.ts` - SECONDARY ENGINE
- ✅ `base.ts` - Shared base pricing config (used by unified engine)
- ✅ `surcharges.ts` - Used by unified engine
- ✅ `discounts.ts` - Used by unified engine
- ✅ `upsells.ts` - Used by unified engine
- ✅ `breakdown.ts` - Used by unified engine
- ✅ `confidence.ts` - Used by unified engine
- ✅ `cache.ts` - Used by unified engine
- ✅ `pricing-cache.ts` - Used by unified engine
- ✅ `travel.ts` - Used by unified engine
- ✅ `types.ts` - Shared types

### Legacy Files
- ⚠️ `lib/pricing-engine.ts` - LEGACY ENGINE (only used in legacy component)

### Business Rules Files
- ✅ `lib/business-rules/pricing-engine.ts` - SECONDARY ENGINE (EnhancedPricingEngine)
- ✅ `lib/business-rules/engine.ts` - Business rules validation (has unused import of PricingEngine)

## Test Files Classification

### Active Tests (Keep)
- ✅ `tests/unit/pricing-engine-comprehensive.test.ts` - Tests legacy PricingEngine (needed for coverage)
- ✅ `tests/unit/pricing-happy.test.ts` - Tests UnifiedPricingEngine
- ✅ `tests/unit/pricing-travel-fee.test.ts` - Tests UnifiedPricingEngine
- ✅ `tests/unit/pricing-surcharges.test.ts` - Tests UnifiedPricingEngine
- ⚠️ `tests/unit/pricing-edge-cases.test.ts` - Tests legacy PricingEngine via shim (legacy compatibility)

## Cleanup Actions Needed

1. **Remove unused import** in `lib/business-rules/engine.ts` (line 12)
2. **Refactor `components/service-calculator.tsx`** to use UnifiedPricingEngine instead of PricingEngine
3. **Update coverage config** to exclude or relax thresholds for `lib/pricing-engine.ts` since it's legacy
4. **Consider deprecating** `lib/pricing-engine.ts` if `service-calculator.tsx` can be updated

