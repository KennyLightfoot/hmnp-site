# DEPRECATED ENDPOINT

⚠️ **This endpoint (`/api/bookings/create`) has been deprecated and consolidated into `/api/bookings`.**

## Migration Required

**Old endpoint:** `POST /api/bookings/create`
**New endpoint:** `POST /api/bookings`

## What Changed

1. **Unified into main bookings endpoint** - no need for separate create endpoint
2. **Enhanced validation** - comprehensive input validation combining all endpoint logic
3. **Better conflict resolution** - improved time slot availability checking
4. **Integrated payment flow** - Stripe payment handling built-in

## Backward Compatibility

The main `/api/bookings` endpoint handles creation automatically via POST method.

## Timeline

- **Phase 1:** Redirect `/api/bookings/create` to `/api/bookings` 
- **Phase 2:** Update any direct calls to use main endpoint
- **Phase 3:** Remove create-specific endpoint

## Action Required

Update your code to use `POST /api/bookings` for booking creation.