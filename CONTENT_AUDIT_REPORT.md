# Content Audit Report

**Date:** 2025-01-27  
**Purpose:** Inventory of pages, guides, runbooks, and scripts to identify gold, dead weight, and maybes

---

## Section A: "Gold" Content (Keep/Polish/Surface)

### Core Funnel Pages (Critical - Must Keep)
These are essential for the business and customer journey:

1. **`/` (Homepage)** - Core landing page
   - Status: ✅ Active
   - Linked: Yes (sitemap, nav)
   - Priority: HIGH

2. **`/booking`** - Primary booking flow
   - Status: ✅ Active
   - Linked: Yes (sitemap, nav, homepage)
   - Priority: CRITICAL

3. **`/contact`** - Contact form
   - Status: ✅ Active
   - Linked: Yes (sitemap, nav, footer)
   - Priority: HIGH

4. **`/services`** - Services overview
   - Status: ✅ Active
   - Linked: Yes (sitemap, nav)
   - Priority: HIGH

5. **`/faq`** - Frequently asked questions
   - Status: ✅ Active
   - Linked: Yes (sitemap, nav)
   - Priority: MEDIUM

6. **`/reviews`** - Customer reviews
   - Status: ✅ Active
   - Linked: Yes (sitemap)
   - Priority: HIGH (social proof)

7. **`/testimonials`** - Testimonials
   - Status: ✅ Active
   - Linked: Yes (sitemap)
   - Priority: MEDIUM

8. **`/what-to-expect`** - Customer education
   - Status: ✅ Active
   - Linked: Yes (sitemap)
   - Priority: MEDIUM

### Service Pages (Keep - SEO Value)
All service pages provide SEO value and should be kept:

- `/services/mobile-notary`
- `/services/loan-signing-specialist`
- `/services/remote-online-notarization`
- `/services/standard-notary`
- `/services/extended-hours-notary`
- `/services/business`
- `/services/reverse-mortgage`
- `/services/estate-planning`
- `/services/real-estate-notary`
- `/services/emergency-notary`
- `/services/specialty`
- `/services/extras`
- `/services/mobile-notary/houston`
- `/services/mobile-notary/league-city`
- `/services/mobile-notary/webster`
- `/services/mobile-notary/pearland`
- `/services/mobile-notary/sugar-land`

**Status:** ✅ All active, linked in sitemap  
**Priority:** MEDIUM-HIGH (SEO value)

### Service Area Pages (Keep - Local SEO)
- `/service-areas` (index)
- `/service-areas/[slug]` (dynamic routes for Houston, League City, Friendswood, etc.)

**Status:** ✅ Active, linked in sitemap  
**Priority:** HIGH (local SEO)

### Landing Pages (Keep - Marketing Campaigns)
These are campaign-specific landing pages:

- `/lp/facebook-campaign`
- `/lp/gmb-contact`
- `/lp/newsletter-signup`
- `/lp/google-loan-signing`
- `/lp/loan-signing`
- `/lp/mobile-notary`
- `/lp/ron`
- `/lp/ron-instant`
- `/lp/standard-services`
- `/lp/yelp-general-notary`
- `/lp/linkedin-b2b-solutions`
- `/lp/lsa-mobile-notary`
- `/lp/mobile-priority`
- `/lp/estate-planning`
- `/lp/facebook-spring-promo`
- `/lp/example-campaign`

**Status:** ✅ Active (campaign-specific)  
**Priority:** MEDIUM (marketing value, may need periodic review)

### User Portal Pages (Keep - Core Functionality)
- `/dashboard` - Customer dashboard
- `/portal` - Assignment portal
- `/portal/[assignmentId]` - Assignment details
- `/portal/assignments/new` - New assignment
- `/portal/assignments/[assignmentId]/edit` - Edit assignment
- `/portal/security` - Security settings

**Status:** ✅ Active  
**Priority:** HIGH (core functionality)

### Notary Portal Pages (Keep - Core Functionality)
- `/notary/onboarding` - Notary onboarding
- `/notary/job-offers` - Job offers
- `/notary/analytics` - Analytics dashboard
- `/notary/journal` - Journal entries
- `/notary/settings` - Settings
- `/notary/mobile` - Mobile view
- `/notary/ron` - RON dashboard

**Status:** ✅ Active  
**Priority:** HIGH (core functionality)

### RON Pages (Keep - Core Feature)
- `/ron/dashboard` - RON dashboard
- `/ron/how-it-works` - RON education
- `/ron/session/[sessionId]` - RON session
- `/ron/thank-you` - RON completion

**Status:** ✅ Active  
**Priority:** HIGH (core feature)

### Legal/Compliance Pages (Keep - Required)
- `/privacy-policy`
- `/privacy`
- `/terms-of-service`
- `/terms`

**Status:** ✅ Active  
**Priority:** HIGH (legal requirement)  
**Note:** Consider consolidating duplicate routes (`/privacy` vs `/privacy-policy`, `/terms` vs `/terms-of-service`)

### Blog (Keep - Content Marketing)
- `/blog` - Blog index
- `/blog/[slug]` - Individual blog posts

**Status:** ✅ Active  
**Priority:** MEDIUM (content marketing)

### Guides (Keep - Customer Education)
- `/guides/[docType]` - Dynamic guide pages

**Status:** ✅ Active  
**Priority:** MEDIUM (customer education)

---

## Section B: Dead/Legacy Content (Candidate for Archive/Removal)

### Debug/Test Pages (Remove or Protect)
These should be removed or protected behind authentication:

1. **`/api/debug-ghl-availability`** - Debug endpoint
   - Status: ⚠️ Should be admin-only or removed
   - Action: Protect with admin auth or remove

2. **`/api/test-ghl-calendar`** - Test endpoint
   - Status: ⚠️ Should be admin-only or removed
   - Action: Protect with admin auth or remove

3. **`/api/test-ghl-setup`** - Test endpoint
   - Status: ⚠️ Should be admin-only or removed
   - Action: Protect with admin auth or remove

4. **`/api/diagnostics`** - Diagnostic endpoint
   - Status: ⚠️ Should be admin-only
   - Action: Protect with admin auth

5. **`/api/fix-database`** - Database fix endpoint
   - Status: ⚠️ Should be admin-only or removed
   - Action: Protect with admin auth or remove

6. **`/api/debug/env-vars`** - Debug endpoint
   - Status: ⚠️ Should be admin-only or removed
   - Action: Protect with admin auth or remove

7. **`/api/debug/request-patterns`** - Debug endpoint
   - Status: ⚠️ Should be admin-only or removed
   - Action: Protect with admin auth or remove

8. **`/api/debug/proof-connection`** - Legacy Proof.com debug
   - Status: ❌ REMOVE (Proof.com is legacy)
   - Action: Delete

### Legacy Proof.com Routes (Remove)
- `/api/proof/transactions` - Legacy
- `/api/proof/documents` - Legacy
- `/api/webhooks/proof` - Legacy

**Status:** ❌ REMOVE (Proof.com integration removed)  
**Action:** Delete all Proof.com related routes

### Duplicate Routes (Consolidate)
- `/privacy` vs `/privacy-policy` - Consolidate to one
- `/terms` vs `/terms-of-service` - Consolidate to one

**Action:** Choose canonical route, redirect other to canonical

### Thank You Pages (Review for Consolidation)
Multiple thank you pages may be redundant:

- `/thank-you-ads`
- `/thank-you-fb`
- `/contact/thank-you`
- `/contact/thank-you-gmb`
- `/newsletter-thank-you`
- `/reviews/thank-you`
- `/ron/thank-you`
- `/booking/success`

**Status:** ⚠️ Review for consolidation  
**Action:** Consider consolidating to a single dynamic thank-you page with query params

### Internal/Experimental Pages (Review)
- `/internal/quote` - Internal tool
  - Status: ⚠️ Should be admin-only
  - Action: Protect with admin auth

- `/pricing-demo` - Demo page
  - Status: ⚠️ Review if still needed
  - Action: Remove if not actively used

- `/compare/[slug]` - Comparison pages
  - Status: ⚠️ Review usage
  - Action: Keep if generating traffic, remove if not

### Studio (Sanity CMS)
- `/studio` - Sanity Studio
  - Status: ✅ Keep (CMS interface)
  - Priority: MEDIUM (admin tool)

---

## Section C: Maybes (Need Human Decision)

### Admin Pages (Keep - But Review Access)
All admin pages should be protected. Review access controls:

- `/admin` - Main admin dashboard
- `/admin/analytics` - Analytics
- `/admin/bookings` - Bookings management
- `/admin/bookings/[id]` - Booking details
- `/admin/users` - User management
- `/admin/notary-applications` - Notary applications
- `/admin/notary-applications/[id]` - Application details
- `/admin/network` - Network management
- `/admin/network/coverage` - Coverage map
- `/admin/network/jobs` - Job management
- `/admin/operations` - Operations dashboard
- `/admin/operations/assignments` - Assignment management
- `/admin/alerts` - Alerts
- `/admin/billing` - Billing
- `/admin/content` - Content management
- `/admin/content/tone-templates` - Tone templates
- `/admin/notifications` - Notifications
- `/admin/pricing` - Pricing management
- `/admin/system-checks` - System health checks
- `/admin/workers` - Worker management

**Status:** ✅ Keep (but ensure all are admin-protected)  
**Action:** Audit access controls

### Landing Pages (Review Campaign Status)
Review which campaigns are still active:

- `/lp/example-campaign` - Example/test campaign?
  - Action: Remove if test/example

- `/lp/facebook-spring-promo` - Seasonal campaign
  - Action: Archive if campaign ended

### Mobile Notary Dynamic Routes
- `/mobile-notary-[zipCode]` - Dynamic zip code routes
  - Status: ⚠️ Review if generating traffic
  - Action: Keep if SEO value, remove if not

### Work With Us
- `/work-with-us` - Career/recruitment page
  - Status: ⚠️ Review if actively recruiting
  - Action: Keep if recruiting, remove if not

### Request a Call
- `/request-a-call` - Call request form
  - Status: ⚠️ Review usage
  - Action: Keep if generating leads, remove if not

---

## Section D: Guides, Runbooks, and Scripts

### Gold Guides (Keep/Polish)
These are high-value operational guides:

1. **`docs/OPS_RUNBOOK.md`** - Operations runbook
   - Status: ✅ Gold
   - Action: Keep, ensure it's up to date

2. **`docs/LIVE_CHECKS_RUNBOOK.md`** - Live checks runbook
   - Status: ✅ Gold
   - Action: Keep

3. **`docs/DATABASE_MAINTENANCE_GUIDE.md`** - Database maintenance
   - Status: ✅ Gold
   - Action: Keep

4. **`docs/SECURITY_RATELIMITS.md`** - Security guide
   - Status: ✅ Gold
   - Action: Keep

5. **`docs/GHL_CALENDAR_SETUP.md`** - GHL calendar setup
   - Status: ✅ Gold
   - Action: Keep

6. **`docs/GHL_WORKING_INTEGRATION.md`** - GHL integration guide
   - Status: ✅ Gold
   - Action: Keep

7. **`docs/STRIPE_RADAR_AND_DISPUTES.md`** - Stripe guide
   - Status: ✅ Gold
   - Action: Keep

8. **`docs/DEPLOYMENT-SUMMARY.md`** - Deployment guide
   - Status: ✅ Gold
   - Action: Keep

9. **`docs/LAUNCH_CHECKLIST.md`** - Launch checklist
   - Status: ✅ Gold
   - Action: Keep

10. **`docs/QA_Checklist_v2.md`** - QA checklist
    - Status: ✅ Gold
    - Action: Keep

### Important Guides (Keep)
- `docs/PROJECT_OVERVIEW.md` - Project overview
- `docs/BUSINESS_LOGIC_PLANNING.md` - Business logic
- `docs/SIMPLE_BOOKING_ARCHITECTURE.md` - Booking architecture
- `docs/API_DEPRECATION.md` - API deprecation guide
- `docs/CUSTOMER_COMMUNICATION_ENHANCEMENTS.md` - Communication guide
- `docs/PAYMENT_FLOW_IMPROVEMENTS.md` - Payment guide
- `docs/SMS_10DLC_COMPLIANCE.md` - SMS compliance
- `docs/RON_TESTING_GUIDE.md` - RON testing
- `docs/CRON_SETUP.md` - Cron setup
- `docs/V0_INTEGRATION.md` - V0 integration
- `docs/AI_RECEPTIONIST.md` - AI receptionist guide
- `docs/GEMINI_AI_INTEGRATION.md` - Gemini integration

### Scripts (Review Categories)

#### Gold Scripts (Keep - High Value)
- `scripts/setup-booking-system.ts` - Booking system setup
- `scripts/check-booking-health.ts` - Health checks
- `scripts/verify-environment-config.js` - Env validation
- `scripts/setup-ghl-calendars.js` - GHL calendar setup
- `scripts/setup-ghl-webhooks.js` - GHL webhook setup
- `scripts/postinstall.js` - Post-install setup
- `scripts/pre-deployment-checklist.js` - Pre-deployment checks

#### Utility Scripts (Keep - Useful)
- `scripts/analyze-db-usage.cjs` - DB analysis
- `scripts/cleanup-database.cjs` - DB cleanup
- `scripts/archive-old-data.cjs` - Data archival
- `scripts/check-n8n-health.ts` - n8n health
- `scripts/verify-notary-application-schema.ts` - Schema validation

#### Test Scripts (Keep - Testing)
- `scripts/test-booking-system.ts` - Booking tests
- `scripts/test-notary-application-api.ts` - Notary API tests
- `scripts/proof-smoke.ts` - Proof.com smoke test (LEGACY - remove)

#### GHL Setup Scripts (Keep - Setup)
- `scripts/setup-ghl-oauth.js` - GHL OAuth
- `scripts/setup-ghl-calendars-api.js` - GHL calendars API
- `scripts/setup-ghl-service-menu.js` - GHL service menu
- `scripts/setup-ghl-complete.js` - Complete GHL setup
- `scripts/create-ghl-webhooks.js` - Create webhooks
- `scripts/create-ghl-pipelines.js` - Create pipelines
- `scripts/create-ghl-custom-fields.js` - Create custom fields
- `scripts/create-ghl-tags.js` - Create tags

#### GHL Diagnostic Scripts (Keep - Debugging)
- `scripts/check-ghl-calendars.cjs` - Calendar check
- `scripts/check-ghl-custom-fields.js` - Custom fields check
- `scripts/debug-ghl-403.js` - 403 debug
- `scripts/ghl-debug-booking.cjs` - Booking debug
- `scripts/diagnose-calendar-issue.js` - Calendar diagnosis
- `scripts/deep-calendar-analysis.cjs` - Calendar analysis

#### GHL Fix Scripts (Review - May be One-Time)
- `scripts/fix-ghl-calendars-minimal.js` - Calendar fix
- `scripts/fix-ghl-team-availability.cjs` - Availability fix
- `scripts/fix-calendar-availabilities.js` - Calendar availability fix
- `scripts/restore-calendars-complete.cjs` - Calendar restore

**Action:** Review if these were one-time fixes. If so, archive or remove.

#### GMB Scripts (Keep - Google My Business)
- `scripts/update-gbp-complete.js` - GBP update
- `scripts/verify-gmb-credentials.js` - GMB credentials
- `scripts/get-gmb-refresh-token.js` - GMB token
- `scripts/get-gmb-account-location.js` - GMB location
- `scripts/check-gmb-api-status.js` - GMB API status

#### Database Scripts (Keep - Maintenance)
- `scripts/backup-database.sh` - DB backup
- `scripts/sync-schema-production.ts` - Schema sync
- `scripts/verify-postgres-version.ts` - Postgres version check

#### Legacy/Remove Scripts
- `scripts/detect-proof-environment.sh` - Proof.com (LEGACY)
- `scripts/test-proof-connection.js` - Proof.com (LEGACY)
- `scripts/quick-ron-test.sh` - Legacy RON test
- `scripts/setup-proof-webhook.js` - Proof.com (LEGACY)

**Action:** Remove all Proof.com related scripts

#### Fix Scripts (Review - May be One-Time)
Multiple `fix-*.sh` scripts that may have been one-time fixes:
- `scripts/fix-batch-3.sh`
- `scripts/fix-batch-4.sh`
- `scripts/fix-batch-5.sh`
- `scripts/fix-batch-6.sh`
- `scripts/fix-common-errors.sh`
- `scripts/fix-common-patterns.sh`
- `scripts/fix-core-patterns.sh`
- `scripts/fix-final-patterns.sh`
- `scripts/fix-next-batch.sh`
- `scripts/fix-remaining-errors.sh`
- `scripts/fix-remaining-patterns.sh`
- `scripts/fix-specific-patterns.sh`
- `scripts/fix-targeted-errors.sh`
- `scripts/fix-typescript-errors.sh`
- `scripts/fix-model-name-mismatches.sh`
- `scripts/fix-prisma-schema-mismatches.sh`

**Action:** Review if these were one-time migration fixes. If so, archive or remove.

#### Build/Deploy Scripts (Keep)
- `scripts/commit-build-fixes.sh` - Build fixes
- `scripts/fix-build-errors.mjs` - Build error fixes

#### Security Scripts (Keep)
- `scripts/install-gitleaks.sh` - Gitleaks install
- `scripts/scan-git-secrets.sh` - Secret scanning

#### Env Management Scripts (Keep)
- `scripts/sync-env-to-vercel.sh` - Env sync
- `scripts/import-env-to-vercel.sh` - Env import
- `scripts/nuke-vercel-envs.sh` - Env cleanup (use with caution)

#### Cleanup Scripts (Review)
- `scripts/cleanup-unused-ghl-fields.js` - GHL cleanup
- `scripts/cleanup-unused-ghl-tags.js` - GHL tags cleanup
- `scripts/cleanup-all-ghl-unused.js` - GHL cleanup all
- `scripts/cleanup-prebooking-uploads.ts` - Prebooking cleanup
- `scripts/cleanup-duplicates.sh` - Duplicate cleanup

**Action:** Keep if regularly used, remove if one-time cleanup

---

## Summary & Recommendations

### Immediate Actions

1. **Remove Legacy Proof.com Code**
   - Delete all `/api/proof/*` routes
   - Delete all Proof.com related scripts
   - Remove Proof.com references from docs

2. **Protect Debug/Test Endpoints**
   - Add admin authentication to all `/api/debug/*` and `/api/test-*` routes
   - Or remove if no longer needed

3. **Consolidate Duplicate Routes**
   - Choose canonical route for privacy (`/privacy-policy` recommended)
   - Choose canonical route for terms (`/terms-of-service` recommended)
   - Add redirects from old routes to canonical

4. **Review Thank You Pages**
   - Consider consolidating to single dynamic page
   - Or keep separate if each serves distinct purpose

5. **Archive One-Time Fix Scripts**
   - Move one-time fix scripts to `scripts/archive/` or remove
   - Keep only scripts that are regularly used

### Keep & Polish

- All core funnel pages
- All service pages (SEO value)
- All service area pages (local SEO)
- All user/notary portal pages
- All operational guides and runbooks
- All setup and diagnostic scripts

### Review & Decide

- Landing pages (review campaign status)
- Admin pages (audit access controls)
- Comparison pages (review traffic)
- Work with us page (review if actively recruiting)

---

**Last Updated:** 2025-01-27

