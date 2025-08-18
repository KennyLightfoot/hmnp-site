## 2025-08-18

- Added `tests/.env.test` for integration test environment variables.
- Updated `vitest.config.ts` to:
  - Include API tests only when `TEST_TYPE=integration`.
  - Exclude `tests/api/auth.test.ts` from integration until HTTP server wiring is added.
- Added `test:integration` script in `package.json` to run API tests with coverage.
- Created GitHub Actions workflow at `.github/workflows/ci.yml` with jobs for unit, e2e, and integration tests.
- Declared `supertest` as a dev dependency for API tests.
 - docs(ads): Added ad-generation brief and templates
   - `docs/ads/ad-brief-prompt.md` (master AI brief)
   - `docs/ads/templates-search.md` (Google-style search)
   - `docs/ads/templates-social.md` (Meta/LinkedIn)
   - `docs/ads/templates-display.md` (display banners)
## 2025-08-12

- fix(availability): improve GHL free-slots accuracy and freshness
  - Add optional `teamMemberId` to `lib/ghl-calendar.getAvailableSlots` and pass `GHL_DEFAULT_TEAM_MEMBER_ID` from `app/api/v2/availability/route.ts`.
  - Filter out Redis-held slots in `app/api/v2/availability/route.ts` using `isSlotAvailable` to prevent showing temporarily reserved slots.
  - Invalidate GHL calendar free-slots cache after booking in `lib/booking/create.ts` so UI updates immediately post-appointment.
  - Repair `lib/ghl/client.ts` export so management helpers work reliably.
  - No schema changes.

- fix(ghl): accept both startDate/endDate and startTime/endTime; auto-retry with seconds/ms for free-slots endpoint
- fix(csrf/cors): relax origin validation when Origin/Referer are null (server-to-server) and auto-include www/apex variants; add OPTIONS handler to POST /api/booking/reserve-slot for smoother preflights

## 2025-08-11

- Refactor: Replaced barrel `@/lib/ghl` usages in key paths with specific adapters where appropriate.
  - `lib/notifications.ts`: use `findContactByEmail` from `lib/ghl/contacts`.
  - `app/api/webhooks/reviews/route.ts`: use `findContactByEmail` and `addTagsToContact` from `lib/ghl/contacts`.
  - `lib/reviews/collection-automation.ts`: use `addTagsToContact` from `lib/ghl/contacts`.

- Security: Added runtime/dynamic flags, Zod validation, and standardized rate limiting via `withRateLimit` to public routes:
  - `app/api/booking/ghl-direct/route.ts` (already done previously)
  - `app/api/availability/route.ts` (removed custom in-handler rate limiter)
  - `app/api/ghl/availability/route.ts`
  - `app/api/_ai/get-availability/route.ts`
  - `app/api/contact/route.ts`
  - `app/api/submit-ad-lead/route.ts`
  - `app/api/test-ghl/route.ts`
  - `app/api/booking/[id]/route.ts` (GET wrapped)

- Rate limiting: Standardized on `lib/security/rate-limiting.withRateLimit` for public endpoints; removed ad-hoc limiter in `app/api/availability/route.ts`.

- Notes: Further de-duplication between `lib/security/rate-limiting.ts`, `lib/rate-limiting.ts`, and `lib/auth/rate-limit.ts` is planned; current change focuses on applying a single middleware to public endpoints.

## 2025-08-10

- feat(ai): add Vertex AI function tools (booking, payment link, notes, escalation) and optional RAG; introduce diagnostics endpoint `/api/ai/diagnostics`
- docs: update `.env.example`, `docs/GEMINI_AI_INTEGRATION.md`, `docs/AI_ASSISTANT_QUICK_REFERENCE.md`, `README.md` to reflect Vertex service-account setup
- fix(build): remove duplicate GET export in `app/api/v2/availability/route.ts` causing Vercel build failure
- feat(services): introduce `lib/services/config.ts` as single source of truth for services (IDs, base prices, limits, durations, hours) and `lib/services/map.ts` for mapping and calendar integration
- refactor(pricing): unify pricing engines to consume centralized config (`lib/pricing-engine.ts`, `lib/pricing/unified-pricing-engine.ts`, `lib/business-rules/pricing-engine.ts`)
- refactor(ui): `InteractivePricingCalculator` now imports centralized base prices; removed excluded services from `ServiceSelector` (ESTATE_PLANNING, SPECIALTY_NOTARY, BUSINESS_SOLUTIONS)
- feat(RON): codify RON pricing as $25 base + $10 notarial (itemized in config), keep $5 per seal
- refactor(calendar): `unified-booking-calendar` now derives durations from centralized config and maps service types via `toServiceId`
- chore(availability): set `app/api/booking/availability` as canonical; updated client deduped fetcher to target it; availability business hours now pulled from centralized config
- fix(payments): booking create defaults to PAYMENT_PENDING until Stripe webhook confirms
- test(e2e): unskip Critical Booking Flow E2E spec

## 2025-08-08

- fix: include `types/**/*.d.ts` and `types/**/*.ts` in `tsconfig.json` so NextAuth session augmentation (`types/next-auth.d.ts`) is recognized during build
- fix: replace nonexistent `BookingStatus.CANCELLED` with `CANCELLED_BY_CLIENT` and `CANCELLED_BY_STAFF` in `app/api/booking/create/route.ts`

### Booking → GHL reliability

- fix(booking): fallback to env-based calendar mapping via `getCalendarIdForService` when `service.externalCalendarId` is missing in `app/api/booking/create/route.ts`
- feat(booking): if appointment creation fails, auto-create a GHL Opportunity to trigger workflows; keeps owners notified even on calendar misconfig
- chore(booking): ensure contact is created/ensured once and reused for both appointment/opportunity

Impact: resolves Vercel build failure due to missing `session.user.id` type and Prisma enum mismatch; local type check passes.

### Booking + GHL integration tweaks

- fix: GHL contact search now uses page/pageLimit (was sending invalid `limit`)
- fix: Removed "Popular Areas" quick-select from `components/booking/steps/LocationStep.tsx`
- fix: Removed "Popular" label in `SchedulingStep` and disabled in `EnhancedSchedulingStep`
- feat: Create GHL appointment immediately during booking creation (also still queued). Adds proper `endTime` per API

## 2025-08-08

- fix(booking): prevent crash when selecting time by hoisting helper functions in `components/booking/InteractivePricingCalculator.tsx` to avoid TDZ/hoisting error (ReferenceError: Cannot access 'L' before initialization)
- chore(booking): standardize datetime construction to ISO format (`YYYY-MM-DDTHH:mm`) in `components/booking/BookingForm.tsx` for reliable parsing across environments

Notes:
- No behavioral changes to pricing logic; only function declaration order adjusted.
- ISO formatting ensures consistent `Date` parsing and avoids locale-dependent issues.


## 2025-08-08T14:04:18Z
- fix: success page only uses real local booking.id; prevents 404 on /api/booking/[id]
- fix: add LocationId header for GHL API requests to stabilize appointment/opportunity creation
