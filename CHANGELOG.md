## 2025-11-06

- feat(consent): add Consent Mode v2 default (denied) + updater hook in `app/layout.tsx` prior to GTM load
- docs(env): add GA4/GTM/Ads vars + business hours/DNI to `docs/ENV.CONSOLIDATED.EXAMPLE`
- seo(schema): set `legalName` to "Houston Mobile Notary Pros LLC", adjust service-area and hours in `components/structured-data.tsx`
- seo(nap): update footer copyright to "Houston Mobile Notary Pros LLC"
- seo/citations: align `lib/citations/citation-manager.ts` with official NAP (LLC, email, hours, Texas City center)
- feat(automation): add Ads conversion creation and bootstrap scripts:
  - `scripts/ads/create_conversions.py` (Booking, Calls from ads, Click-to-call website)
  - `scripts/ads/bootstrap_account.py` (orchestrates conversions and assets)
  - `scripts/ads/generate_google_ads_yaml.py` (writes google-ads.yaml from env)
  - `scripts/ads/link_ga4_property.py` (GA4↔Ads link via Analytics Admin)
  - `scripts/ads/requirements.txt` updated (adds PyYAML)
  - `scripts/README.AUTOMATION.md` quick start
- perf: tune Next image config (inline disposition + mobile device sizes) to reduce LCP on phones
- feat(rum): add `app/instrumentation.ts` + `/api/rum` endpoint with optional Upstash storage for Core Web Vitals
- perf(pricing): lazy-load calculator, comparison table, and trust badges with server JSON-LD + daily revalidation
- feat(booking): defer AI assistant/pricing sidebar, add Redis-backed Idempotency-Key support, standardize funnel events
- feat(ui): ship reusable `StickyMobileCTA` and mount it across pricing/services/LP layouts
- seo: embed SSR JSON-LD for pricing + key service pages (mobile notary, loan signing, RON, priority)
- ci: ran `pnpm lint` and `ANALYZE=true pnpm build` (bundle reports in `.next/**/*bundle-analysis.html`)
- docs(plan): expand SOP/RevOps emphasis and to-dos in `hm.plan.md`
- feat(consent): add `/api/consent/sms`, GHL consent tags/fields, and SMS gating
- docs: add `docs/SMS_10DLC_COMPLIANCE.md`, `docs/VENDOR_DPA_STATUS.md`, `docs/ON_CALL_SLA.md`, `docs/STATUS_PAGE.md`, `docs/BACKUP_RESTORE_DR.md`
- ci: add Lighthouse CI workflow and a11y/perf gates, E2E workflow run
- feat(security): admin IP allowlist via `ADMIN_IP_ALLOWLIST`; immutable `AuditLog` with chained hashes
- fix(seo): make service-area pages self-referential, add legacy `/services` redirects, and stop layout defaulting every page to the root canonical
- fix(seo/faq): serve the optimized FAQ component on `/faq` so the FAQ content and schema render instead of the RON landing copy
- seo(schema): embed homepage LocalBusiness JSON-LD, testimonials review schema, and reuse the structured data helper across pages
- perf(ux): drop artificial FAQ loading delays and swap global Suspense fallbacks to lightweight skeletons instead of blocking spinners
- feat(analytics): wire up Google Tag Manager with Consent Mode defaults and noscript fallback in `app/layout.tsx`

## 2025-08-27

- fix(lp): fill testimonial star icons on Standard Services LP (`app/lp/standard-services/testimonials.client.tsx`)
- fix(thank-you): update ad thank-you page phone/link to (832) 617-4285 (`app/thank-you-ads/page.tsx`)
- feat(lead): send email notifications on ad quote form submissions via Resend (`app/api/submit-ad-lead/route.ts`)
- chore(phone): centralize phone via `lib/phone.ts` and use on LP + thank-you
- chore(phone): roll out phone util to hero, booking, FAQ, services, and LPs; add tel click tracking
- fix(pricing): remove same-day surcharge for `STANDARD_NOTARY` in unified pricing engine
- fix(payments): align Stripe apiVersion to `2025-08-27.basil` to satisfy SDK types and fix Vercel build (`lib/stripe.ts`)

### P0 Ads Prep (in progress)
- feat(lp): add message-matched LPs for Paid Search
  - `/lp/mobile-notary` (STANDARD_NOTARY preselected)
  - `/lp/ron` (RON_SERVICES preselected)
  - `/lp/loan-signing` (LOAN_SIGNING preselected)
- feat(analytics): persist UTM/GCLID on first hit via `AttributionInit`
- feat(dni): basic DNI scaffolding via env in `lib/phone.ts`
- perf: prefetch `/booking` on LPs for faster CTA click
- analytics: GA4 `estimate_requested` event in `components/EstimatorStrip.tsx`

## 2025-08-23

- feat: Inline `enhanced_conversion_data` with `booking_complete` dataLayer push on `app/booking/success/page.tsx` to align with GTM variables DLV – value, currency, transaction_id, and enhanced_conversion_data.
- feat: Add query param fallback when booking API fetch fails so Tag Assistant preview URL works and triggers `booking_complete` immediately.
- fix(ads): Use `NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID` to derive Ads account ID for gtag loader when GTM is not present; fallback `send_to` to `NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID` when `NEXT_PUBLIC_GOOGLE_ADS_SEND_TO` is unset.
- feat(analytics): Add dataLayer fallbacks for pageviews and key clicks when `window.gtag` is unavailable (GTM-only setups).

GTM setup reference:
- Variables: DLV – value, currency, transaction_id, enhanced_conversion_data (Version 2)
- Trigger: EVT – booking_complete (Custom Event)
- Tag: Google Ads Conversion Tracking (ID 17079349538, Label ItryCJmg0IkbEKLiiNA_) with Value/Currency/Transaction ID bound to the DLVs and Enhanced Conversions using data layer variable.

## 2025-08-21

- feat(booking): enhance service comparison for mobile vs in-person
  - Replace minimal comparison with persuasive, detailed bullets
  - Remove online (RON) from the comparison widget to focus on in-person choices
  - Add clear “Choose this if” guidance for each option

- feat(analytics): add Google Ads/GA4 gtag loader and conversion for bookings
  - Load gtag.js when `NEXT_PUBLIC_GA_ID` or `NEXT_PUBLIC_GOOGLE_ADS_ID` is set (no GTM path)
  - Configure both GA4 and Ads when both IDs are present
  - Fire Ads conversion on booking success with dynamic value/currency
  - Required env vars:
    - `NEXT_PUBLIC_GA_ID` (optional, GA4)
    - `NEXT_PUBLIC_GOOGLE_ADS_ID` (e.g., AW-17079349538)
    - `NEXT_PUBLIC_GOOGLE_ADS_SEND_TO` (e.g., AW-17079349538/ItryCJmg0IkbEKLiiNA_)
    - `NEXT_PUBLIC_ADS_CONVERSION_CURRENCY` (default: USD)

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
- feat(RON): codify pricing as $25 base + $10 notarial (itemized in config), keep $5 per seal
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
