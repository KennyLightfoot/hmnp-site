# DEPRECATED ENDPOINT

⚠️ **This endpoint (`/api/booking`) has been deprecated and consolidated into `/api/bookings`.**

## Migration Required

**Old endpoint:** `POST /api/booking`
**New endpoint:** `POST /api/bookings`

## What Changed

1. **Unified validation schema** - supports both legacy and new field names
2. **Enhanced error handling** - better validation error messages  
3. **Improved database integration** - uses new unified database connection
4. **Consolidated business logic** - combines GHL integration with full booking management

## Backward Compatibility

The new `/api/bookings` endpoint is designed to handle requests in the old format:

```typescript
// Old format (still supported)
{
  firstName: "John",
  lastName: "Doe", 
  email: "john@example.com",
  // ... other legacy fields
}

// New format (also supported)
{
  customerName: "John Doe",
  email: "john@example.com", 
  // ... unified fields
}
```

## Timeline

- **Phase 1:** Old endpoint redirects to new endpoint with deprecation warning
- **Phase 2:** Update frontend components to use new endpoint
- **Phase 3:** Remove old endpoint completely

## Action Required

Update your frontend code to use `/api/bookings` instead of `/api/booking`.