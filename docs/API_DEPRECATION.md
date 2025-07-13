# API Deprecation Notice

## Availability Endpoints - Consolidation Required

### Current Status
We have **4 different availability endpoints** that serve overlapping purposes:

1. **`/api/availability`** - Main availability endpoint
2. **`/api/availability-compatible`** - Compatibility layer (DEPRECATED)
3. **`/api/ghl/availability`** - GHL-specific availability (DEPRECATED)
4. **`/api/booking/availability`** - Booking context availability (DEPRECATED)

### Recommendation
- **Keep:** `/api/availability` as the canonical endpoint
- **Deprecate:** All other availability endpoints
- **Migration:** Move compatibility logic behind feature flags in main endpoint

### Impact Assessment
- Multiple endpoints cause confusion for developers
- Risk of diverging business rules
- Increased maintenance overhead
- Potential for inconsistent availability data

### Next Steps
1. Audit all callers of deprecated endpoints
2. Update frontend to use canonical endpoint
3. Add deprecation warnings to deprecated endpoints
4. Plan removal timeline (suggest 2-3 months)

### Files to Review
- `app/api/availability/route.ts` (KEEP)
- `app/api/availability-compatible/route.ts` (DEPRECATE)
- `app/api/ghl/availability/route.ts` (DEPRECATE)  
- `app/api/booking/availability/route.ts` (DEPRECATE)

---
*Generated: $(date)* 