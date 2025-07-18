# API Deprecation Notice

## Availability Endpoints - Consolidation Required

All legacy availability endpoints now delegate to the **single unified** endpoint:

**`/api/v2/availability`** – canonical availability API (former logic from `/api/availability`).

Deprecated shims:
* `/api/availability` → re-exports canonical handler
* `/api/availability-compatible` → re-exports canonical handler
* `/api/booking/availability` → re-exports canonical handler

`/api/ghl/availability` was already removed.

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