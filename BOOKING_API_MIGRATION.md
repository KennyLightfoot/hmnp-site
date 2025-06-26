# Booking API Consolidation Migration Guide

## Overview

The booking API endpoints have been consolidated to eliminate redundancy and improve maintainability. This guide outlines the migration path for all frontend components.

## Endpoints Consolidated

| Old Endpoint | New Endpoint | Status |
|--------------|--------------|---------|
| `POST /api/booking` | `POST /api/bookings` | ✅ Consolidated |
| `POST /api/bookings/create` | `POST /api/bookings` | ✅ Consolidated |
| `GET /api/bookings` | `GET /api/bookings` | ✅ Maintained |
| `GET /api/bookings/[id]` | `GET /api/bookings/[id]` | ✅ Maintained |

## Frontend Components Requiring Updates

### 🔥 Critical Priority Updates

**Files that must be updated immediately:**

1. **Main Booking Page**
   - **File:** `app/booking/page.tsx:325`
   - **Current:** `fetch('/api/bookings', {...})`
   - **Status:** ✅ Already using correct endpoint
   - **Action:** No change needed

2. **Service Booking Form Component**
   - **File:** `components/service-booking-form.tsx:209`
   - **Current:** `fetch('/api/bookings', {...})`
   - **Status:** ✅ Already using correct endpoint
   - **Action:** No change needed

### 📋 Test Files Requiring Updates

**Test scripts need to be updated for new unified validation:**

3. **Manual Test Script**
   - **File:** `tests/manual-tests/test-booking-system.js`
   - **Lines:** 136, 163, 180, 218
   - **Current:** Multiple endpoint calls
   - **Action:** ✅ Update test cases for unified validation schema

4. **Booking Endpoint Test**
   - **File:** `scripts/testBookingEndpoint.ts:71`
   - **Current:** `fetch('/api/bookings', {...})`
   - **Status:** ✅ Already using correct endpoint
   - **Action:** Update test data format if needed

### 📊 Dashboard & Admin Components

**These components use read-only endpoints (no changes needed):**

5. **Customer Dashboard**
   - **File:** `app/dashboard/page.tsx`
   - **Current:** Uses `/api/bookings/[id]/download` and receipt links
   - **Status:** ✅ No changes needed (specialized endpoints maintained)

6. **Admin Bookings Page**
   - **File:** `app/admin/bookings/page.tsx`
   - **Current:** Uses admin-specific endpoints
   - **Status:** ✅ No changes needed

7. **Booking Confirmation Page**
   - **File:** `app/booking/confirmation/[id]/page.tsx`
   - **Current:** `fetch('/api/bookings/${bookingId}')`
   - **Status:** ✅ Already using correct endpoint

## Migration Steps

### Phase 1: Immediate (No Breaking Changes)
✅ **COMPLETE** - Unified endpoint created with backward compatibility

- [x] Create unified route handler at `/api/bookings/unified-route.ts`
- [x] Update main route handler to use unified database connection
- [x] Maintain backward compatibility for all existing request formats
- [x] Add deprecation notices for old endpoints

### Phase 2: Validation Updates (Optional)

🔄 **OPTIONAL** - Enhance frontend validation to match new unified schema

```typescript
// Enhanced validation schema available
const unifiedBookingSchema = {
  // Flexible customer name fields
  customerName?: string,     // New preferred field
  firstName?: string,        // Legacy support
  lastName?: string,         // Legacy support
  
  // Flexible address fields  
  addressStreet?: string,    // New preferred field
  address?: string,          // Legacy support
  addressCity?: string,      // New preferred field
  city?: string,             // Legacy support
  
  // Enhanced features
  urgencyLevel?: string,
  leadSource?: string,
  utmTracking?: object,
  // ... additional fields
};
```

### Phase 3: Testing & Validation

🧪 **RECOMMENDED** - Update test cases for enhanced functionality

- [ ] Update `tests/manual-tests/test-booking-system.js` for new validation rules
- [ ] Test backward compatibility with old request formats
- [ ] Verify GHL integration works with unified endpoint
- [ ] Test promo code consolidation (FIRST25, referral, database codes)

### Phase 4: Cleanup (Future)

🗑️ **FUTURE** - Remove deprecated endpoints when no longer needed

- [ ] Monitor usage of old endpoints 
- [ ] Set sunset date for `/api/booking` 
- [ ] Remove `/api/bookings/create` redirect
- [ ] Clean up unused code

## Key Improvements

### ✨ New Features Available

1. **Enhanced Validation**
   - Unified schema supports both legacy and new field formats
   - Better error messages with field-specific validation
   - Comprehensive input sanitization

2. **Improved Database Integration**
   - Uses new unified database connection (`/lib/database-connection`)
   - Better connection pooling and error handling
   - Enhanced transaction support

3. **Consolidated Business Logic**
   - Single source of truth for booking creation
   - Unified promo code handling (database + hardcoded codes)
   - Integrated payment flow with Stripe
   - Comprehensive GHL integration

4. **Better Error Handling**
   - Structured error responses
   - Field-level validation errors
   - Improved debugging information

### 🔄 Backward Compatibility

The unified endpoint maintains 100% backward compatibility:

```typescript
// Old format requests still work
const oldFormatRequest = {
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  address: "123 Main St",
  city: "Anytown",
  state: "CA",
  postalCode: "12345",
  // ... all legacy fields supported
};

// New format also supported
const newFormatRequest = {
  customerName: "John Doe", 
  email: "john@example.com",
  addressStreet: "123 Main St",
  addressCity: "Anytown", 
  addressState: "CA",
  addressZip: "12345",
  // ... enhanced fields available
};
```

## Testing Checklist

- [ ] **Booking Creation:** Test both old and new request formats
- [ ] **Validation:** Verify enhanced error messages work
- [ ] **GHL Integration:** Confirm contact creation still works
- [ ] **Promo Codes:** Test FIRST25, referral, and database promo codes
- [ ] **Payment Flow:** Verify Stripe integration functions correctly
- [ ] **Calendar Integration:** Test Google Calendar event creation
- [ ] **Auth Flow:** Test both authenticated and guest bookings

## Support & Questions

For questions about this migration:

1. **Validation Issues:** Check unified schema in `/api/bookings/unified-route.ts`
2. **Database Errors:** Verify `/lib/database-connection.ts` configuration  
3. **GHL Integration:** Check GHL environment variables and permissions
4. **Test Failures:** Update test data to match new validation requirements

## Success Metrics

Migration is successful when:
- ✅ All existing booking forms continue to work
- ✅ Enhanced validation provides better user experience  
- ✅ Database connection pooling improves performance
- ✅ GHL integration maintains contact creation
- ✅ Payment flow processes correctly
- ✅ Test suite passes with new endpoint