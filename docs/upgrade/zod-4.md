## Zod v4 Upgrade Plan

Status: Draft (no code changes yet)

Notes
- Zod 4 introduces ESM-only and potential API surface changes.

Action steps
1) Bump `zod` to ^4 in a separate branch.
2) Audit imports (`import { z } from 'zod'`) remain compatible.
3) Check any `.transform`, `.refine` custom messages.
4) Run unit tests for validation-heavy modules: `lib/booking-validation.ts`.

Rollback
- Revert to Zod 3 if regressions found.

