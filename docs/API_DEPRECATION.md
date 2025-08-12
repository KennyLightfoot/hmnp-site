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

## 2025-08 Rate Limiting Utilities

- Deprecated: `lib/rate-limiting.ts` has been removed in favor of standardized middleware in `lib/security/rate-limiting.ts`.
- For Next.js route handlers, use `withRateLimit(limitType, endpoint)` or the higher-level `withComprehensiveSecurity` from `lib/security/comprehensive-security`.
- `lib/auth/rate-limit.ts` remains for auth flows that rely on its Redis-based sliding window logic; consider migrating those routes to the standardized wrapper if feasible.

For a live mapping of endpoints to rate limit buckets, see `docs/SECURITY_RATELIMITS.md`.

### Migration Guide
- Before: `import { rateLimiters, rateLimitConfigs } from '@/lib/rate-limiting'`
- After: `import { withRateLimit } from '@/lib/security/rate-limiting'`

Wrap your handlers:

```ts
export const POST = withRateLimit('public', 'example_endpoint')(async (request) => {
  // handler body
});
```

If you need multiple layers (CORS, CSRF, validation), compose via:

```ts
import { withComprehensiveSecurity, SecurityLevels } from '@/lib/security/comprehensive-security';

export const POST = withComprehensiveSecurity(SecurityLevels.API, async (request) => {
  // handler body
});
```