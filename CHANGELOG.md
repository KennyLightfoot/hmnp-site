- 2025-11-28
  - Phase 1 cockpit routes now backed by dedicated admin APIs (overview, operations, network, billing, system checks, content stats) and all pages read from those endpoints.
  - Added system health aggregator (`/api/admin/system-health`) plus refreshed `/admin/system-checks` UI.
  - Implemented AI autopilot foundation (OutboundMessage + MessageReview models, scheduler engine, `/api/cron/ai-autopilot`, operations metrics, kill-switch env flags).
  - Delivered review queue UI/actions in `/admin/operations` tied to MessageReview moderation endpoints.
  - Introduced `ContentJob` pipeline with admin APIs, UI table, and basic performance tracking (views/leads) surfaced on `/admin/content`.
# Changelog

## [Unreleased] - Security Hardening, Build & Tooling Fixes

### Added
- **Build & Tooling**
  - Cleaned up npm/pnpm configuration by removing legacy `.npmrc` override syntax in favor of the standard `"overrides"` block in `package.json`.
  - Documented pnpm behavior, dependency overrides, and hoisting settings in `docs/npm-pnpm-config.md` so local dev and CI use a consistent, supported configuration.
  - Hardened Redis initialization so `next build` and SSG/ISR do not require a live Redis instance; Redis/cache features degrade gracefully at runtime. See `docs/redis-behavior.md` for the failure policy.
- **Automation Services**
  - Added `automation/pm2.ecosystem.config.cjs` plus helper scripts (`pnpm automation:start|restart|status|logs|stop`) so the agents pipeline and n8n workflows can run as always-on background services under PM2.
  - Created `automation/env.example` and documented the full setup in `docs/AUTOMATION_SERVICES.md`, covering WSL hostname mapping, boot-time auto start, and troubleshooting.
  - Added WSL helper scripts (`start-automation.sh`, `stop-automation.sh`) plus Windows wrappers (`windows-controls/*.bat`, `setup-automation-shortcuts.ps1`) so automations can be started or stopped from Windows shortcuts without opening a terminal; see `docs/windows-automation-controls.md`.
- **Agents Webhook Bridge**
  - Added Prisma models (`AgentBlog`, `AgentLead`, `AgentJob`, `AgentPricingQuote`) and migration `20251128000100_agents_webhooks` so data pushed from the agents service can be stored in Postgres and surfaced in admin dashboards.
  - Implemented signed webhook endpoints at `/api/webhooks/blog-approved`, `/api/webhooks/lead-created`, `/api/webhooks/job-created`, and `/api/webhooks/pricing-quoted` plus a shared auth helper `lib/security/agents-webhook-auth.ts`.
  - Added `lib/services/agent-webhook-service.ts` to write blog markdown files under `content/blogs/` and upsert leads/jobs/pricing rows, and created admin proxy endpoints (`/api/admin/agents/*`) that rely on `lib/agents-client` instead of exposing the agents base URL.
  - Added `pnpm agents:verify` and documented the flow so the entire agents repo (env validation, model checks, build, tests) can be exercised with one command.
- **Agents Monitoring**
  - Added `scripts/check-agents-health.ts` (`pnpm agents:health`) so ops can ping the configured `AGENTS_BASE_URL`/`AGENTS_HEALTH_ENDPOINT` without leaving the main repo, mirroring the existing `pnpm n8n:health` workflow check.
  - Added `scripts/seed-agents-demo.ts` (`pnpm agents:seed-demo`) to quickly populate `AgentLead/AgentJob/AgentPricingQuote` rows and a sample blog so `/admin/operations`, `/admin/network`, and `/admin/content` can be exercised without firing real webhooks.
- **n8n Monitoring**
  - Added `scripts/check-n8n-health.ts` (`pnpm n8n:health`) and integrated an `n8n Health` system test so `/api/system-test?type=automations` now reports workflow-engine status alongside queue/webhook checks.
- **Admin Dashboards**
  - `/admin/system-checks` now shows quick health, a full-suite summary, and dedicated sections for queues, agents, and automations without making multiple expensive API calls.
  - `/admin/content` displays synced blog/review stats pulled from the new Prisma tables, while `/admin/operations` and `/admin/network` surface live automation metrics (agent leads/jobs/pricing) alongside existing booking/network KPIs.
- **Run Book & Security**
  - Added `docs/OPS_RUNBOOK.md` plus references in `docs/AUTOMATION_SERVICES.md` so on-call staff know exactly how to verify, restart, and audit the automation stack (`pnpm automation:*`, `pnpm agents:verify`, `pnpm n8n:health`).
  - `lib/env-validation.ts` now validates `AGENTS_WEBHOOK_SECRET`, `N8N_BASIC_AUTH_*`, and the new health-check configuration, with warnings when secrets/basic auth are missing.
- **Booking API Hardening**
  - Locked down `GET /api/v2/bookings` to require authentication, enforce role-based behavior (ADMIN/STAFF/NOTARY vs SIGNER/CLIENT), and avoid exposing internal notes to non-admin views.
  - Tightened `GET /api/v2/bookings/[id]` to return a minimal, payment-focused projection suitable for secret-link access (no user object, internal notes, or full address fields).
- **Secrets Management**
  - Removed locally committed credential artifacts (`client_secret*.json`, `local-vars.txt`, `cookies.txt`, `vercel-production.env`, and related env snapshot files) and expanded `.gitignore` to block future commits of raw secrets and env dumps.
  - Documented the clean-up and required key rotation steps under “Secrets Management & Rotation Log” in `SECURITY.md`.
- **Chatbot / Agents Integration Strategy**
  - Updated `/api/ai/chat` to support a feature-flagged backend: defaulting to direct Vertex AI (`AI_CHAT_BACKEND=vertex` or unset) and delegating to the agents service `/chat` endpoint when `AI_CHAT_BACKEND=agents`.
  - Added a thin agents chat client in `lib/agents-client.ts` (`sendAgentsChat`) so the web app can call the agents service without exposing its base URL to the browser.
  - Documented the architecture, responsibilities, and `/chat` contract in `docs/chat-architecture.md`, plus a hybrid routing plan + evaluation set in `docs/AI_HYBRID_ROUTING.md` and `automation/evals/hybrid-routing-evals.json`.
- **Proof.com Decommissioning & RON via Notary Hub**
  - Replaced the old `lib/proof/api.ts` client with a decommissioned stub and removed inline Proof.com RON session creation from booking flows and workers.
  - Updated Proof.com routes (`/api/proof/*`, `/api/webhooks/proof`, `/api/debug/proof-connection`) to return 410 responses with clear messaging that RON is now handled via Notary Hub UI.
  - Cleaned up Proof-related scripts and docs to mark them as legacy and removed `PROOF_*` env references from active launch/env checklists.
- **Queues, System Tests, and Admin System Checks**
  - Added a BullMQ queue system test helper (`lib/testing/queue-system-test.ts`) and wired it into `lib/testing/system-tests.ts` plus a `scripts/test-queues.ts` runner for CI/local verification.
  - Extended `/api/system-test` to support `type=health`, `type=full`, `type=queues`, `type=ai`, and `type=automations` for focused reports, and created an admin dashboard at `/admin/system-checks` to visualize key health signals.
  - Documented the testing flow (chat, queues, webhooks/cron, and system checks) in `docs/testing.md`.
- **Database Initialization & Health**
  - Documented the end-to-end process for wiring `DATABASE_URL` to the new Postgres instance, applying all Prisma migrations, and running seed scripts so a brand-new empty database matches `prisma/schema.prisma` and baseline business data requirements.
  - Standardized on using the Supabase Postgres instance as the primary database for the web app, with `.env.local` (and `.env` for server/CI) providing the `DATABASE_URL` in `postgresql://user:pass@host:port/db?sslmode=require` format.
  - Captured recommended smoke-test commands (`pnpm db:migrate`, `pnpm db:seed`, `node test-db-connection.cjs`, `node database-health-check.mjs`, `pnpm db:verify-notary-schema`) to validate schema, seed data, and notary network tables after initializing a new database.
  - Added provider-level backup and monitoring guidance (how to enable automated backups / PITR and basic alerts in the database provider dashboard) so production databases can be restored and monitored reliably.

### Fixed
- **Prisma groupBy TypeScript Errors**
  - Fixed TypeScript TS2345 errors in `app/admin/page.tsx` and `app/api/admin/network/dashboard/route.ts` by removing inline `as Promise<Array<...>>` casts from `prisma.notaryApplication.groupBy()` calls
  - Prisma's type inference now correctly handles the `groupBy` return type without conflicting generic constraints
  - The existing `ApplicationStatusGroup` type alias and downstream casts remain for explicit typing in reduce operations

### Technical Notes
- **Build Warnings**: Next.js build shows `Critical dependency` warnings from `bullmq` (child-processor.js) and `require-in-the-middle` (via OpenTelemetry/Sentry instrumentation). These are expected for server-only dependencies that use dynamic `require()` and do not affect build success or client bundles. No action required.

## [2025-11-23] SEO & Performance Enhancements

### Added
- `public/llms.txt` to document AI/LLM crawler rules (currently permissive) plus supporting note in `SECURITY.md`.

### Changed
- Shortened and canonicalized metadata on booking, contact, pricing, FAQ, what-to-expect, key service pages, and all service-area routes to eliminate duplicate/overlong titles.
- Expanded `app/service-areas/page.tsx`, `app/services/page.tsx`, `app/pricing/page.tsx`, and `app/faq/page.tsx` with new internal-link sections that surface specialized services and high-priority cities.
- Updated sitemap entries to cover the primary service details and city pages while avoiding parameterized URLs.
- Lazy-loaded heavy components (`BookingForm`, `TrustBadges`) to reduce initial JS/CSS payload on high-traffic routes.
- Added richer supporting content (additional city links, specialized service callouts, FAQ quick links) to improve text-to-HTML ratios on money pages.
- Rebuilt the legal experience so `/privacy-policy` and `/terms-of-service` serve dedicated Next.js pages, added in-app redirects from legacy `/privacy` + `/terms`, and updated every form/footer/link plus sitemap/next-sitemap config to reference the new canonical routes.
- Refreshed `app/contact/page.tsx` with dynamic form loading, deeper explanatory copy, and an internal resource grid to improve text-to-HTML ratios and distribute crawl equity.
- Cleaned up `public/llms.txt` to follow the emerging LLM directives format (crawl-delay, usage-policy, per-bot allowance) and regenerated static sitemap assets to reflect the new URLs.

## [Unreleased] - Notary Network & Hiring System

### Changed
- **Pricing Engine Cleanup**
  - Removed unused `PricingEngine` import from `lib/business-rules/engine.ts`
  - Refactored `components/service-calculator.tsx` to use `UnifiedPricingEngine` via API instead of legacy `PricingEngine`
  - Relaxed coverage thresholds for legacy `lib/pricing-engine.ts` (now only used in tests)
  - Created `docs/pricing-engine-classification.md` documenting pricing engine usage across the codebase
  - Primary pricing engine is now `UnifiedPricingEngine` which powers the main booking flow

### Fixed
- **TypeScript Type Errors**
  - Fixed 142 TypeScript errors across 46 files
  - Standardized Prisma imports to use `@/lib/prisma-types` instead of direct `@prisma/client` imports
  - Added proper type annotations to admin UI components (bookings, notary applications, notifications, users, workers)
  - Fixed implicit `any` types in API routes by adding explicit type annotations for map/filter/reduce callbacks
  - Fixed Prisma transaction type annotations in API routes
  - Fixed error handler type guards for Prisma errors
  - Fixed booking worker Prisma namespace import
  - All files now properly import enums and types from centralized `@/lib/prisma-types` module
  - Added a dedicated shim + tsconfig path mapping so `@prisma/client` resolves to the generated `.prisma/client` types under isolated compilation
  - Typed notary job-offer flows, onboarding screens/APIs, and customer support integration logic to remove the remaining implicit `any` usage and stringly-typed enum checks
  - Note: Run `pnpm prisma:generate` to regenerate Prisma client if type errors persist

## [Unreleased] - Notary Network & Hiring System

### Added
- **Notary Application System**
  - Public hiring page at `/work-with-us` for notaries to apply
  - Comprehensive application form with commission details, E&O insurance, service areas, etc.
  - Admin review interface at `/admin/notary-applications` to review and manage applications
  - Application status workflow: PENDING → UNDER_REVIEW → APPROVED/REJECTED → CONVERTED
  - Ability to convert approved applications directly to user accounts
- **Network Operations Dashboard**
  - Dedicated admin pages at `/admin/network`, `/admin/network/jobs`, and `/admin/network/coverage` with live KPIs, job queues, and coverage snapshots
  - Extended `/admin` overview with network-focused summary cards plus navigation links inside the shared admin layout
  - Introduced cached API endpoint at `/api/admin/network/dashboard` for reusable network metrics (applications, notaries, offers, coverage)
- **Database Support for Notary Network**
  - Added migration `20251123_add_notary_network_tables` to create the `NotaryApplication` and `JobOffer` tables (plus enums) so hiring submissions persist and job offers can be queued.

- **Enhanced Notary Profiles**
  - Extended `notary_profiles` model with onboarding status, E&O insurance details, background check status
  - Availability status tracking (AVAILABLE, BUSY, UNAVAILABLE, ON_LEAVE)
  - Service area and coverage tracking (states licensed, counties served, service radius)
  - Languages spoken and special certifications support

- **Job Offer System (First-Come-First-Serve)**
  - `JobOffer` model for managing job offers to network notaries
  - Automatic eligibility matching based on:
    - Active commission and E&O insurance
    - Geographic coverage (states, counties, service radius)
    - Availability status
  - First-come-first-serve acceptance with atomic transactions to prevent double-assignment
  - Automatic cancellation of other offers when one is accepted
  - Notary dashboard at `/notary/job-offers` to view and accept/decline offers
  - API endpoints for:
    - Sending bookings to network (`POST /api/bookings/[id]/send-to-network`)
    - Fetching offers (`GET /api/notary/job-offers`)
    - Accepting offers (`POST /api/notary/job-offers/[id]/accept`)
    - Declining offers (`POST /api/notary/job-offers/[id]/decline`)

- **Database Schema Updates**
  - New `NotaryApplication` model for storing applications
  - New `JobOffer` model for managing job offers
  - Enhanced `notary_profiles` with onboarding and compliance fields
  - Added `sendToNetwork` and `networkOfferExpiresAt` fields to `Booking` model
  - New enums: `NotaryApplicationStatus`, `NotaryOnboardingStatus`, `BackgroundCheckStatus`, `NotaryAvailabilityStatus`, `JobOfferStatus`

- **Admin Enhancements**
  - Added "Notary Applications" link to admin navigation
  - Application review page with detailed view and action buttons
  - Ability to approve, reject, or mark applications under review
  - Convert approved applications to user accounts with automatic profile creation

### Changed
- Updated admin navigation to include notary applications management
- Updated notary portal navigation to include job offers section
- Added `/hiring`, `/jobs`, and `/notary-jobs` redirects to `/work-with-us`, surfaced the hiring page in the footer, and listed it in `app/sitemap.ts` so public recruiting routes stay discoverable.

### Fixed
- Rate limiter now awaits async key generation so session-aware throttling works in builds
- Admin notary application detail + convert route now follow Next.js 15 async params contract to restore builds
- Fixed TypeScript build error in `lib/services/job-offer-service.ts` by ensuring Prisma `Booking` interface augmentation properly merges with base type using triple-slash reference directive
- Fixed TypeScript build errors in admin server components (e.g. `app/admin/alerts/page.tsx`, `app/admin/bookings/[id]/page.tsx`, `app/admin/bookings/page.tsx`) by avoiding direct enum/model imports from `@prisma/client`—string literals like `'ADMIN'`/`'STAFF'` gate access, status comparisons use raw strings, and data shapes are derived from Prisma client helpers—to keep Next.js isolated compilation happy

### Technical Details
- Created `lib/services/job-offer-service.ts` for job offer business logic
- Created `lib/utils/date-utils.ts` for consistent date formatting
- All new endpoints include proper authentication and authorization checks
- Transaction-based acceptance to ensure data consistency
- Comprehensive error handling and logging

### Next Steps (Pending)
- Email notifications for new applications and job offers
- Notary onboarding flow and checklist UI
- Rate limiting on job offer endpoints
- Enhanced geographic matching with actual distance calculations
- Guest-facing updates to show assigned notary information
- SOP documentation updates for network operations
