# HMNP Site
## Redesign Flag

- Env var: `NEXT_PUBLIC_REDESIGN_V1` = `"true"` enables new header/layout/hero.
- Recommended defaults:
  - Preview: `true`
  - Production: `false` (flip to `true` post-QA)
- Files gated: `app/layout.tsx`, `app/page.tsx`
- Rollback: set `NEXT_PUBLIC_REDESIGN_V1="false"` and redeploy; legacy layout remains.


