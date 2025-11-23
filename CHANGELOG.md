# Changelog

## [2025-11-23] SEO & Performance Enhancements

### Added
- `public/llms.txt` to document AI/LLM crawler rules (currently permissive) plus supporting note in `SECURITY.md`.

### Changed
- Shortened and canonicalized metadata on booking, contact, pricing, FAQ, what-to-expect, key service pages, and all service-area routes to eliminate duplicate/overlong titles.
- Expanded `app/service-areas/page.tsx`, `app/services/page.tsx`, `app/pricing/page.tsx`, and `app/faq/page.tsx` with new internal-link sections that surface specialized services and high-priority cities.
- Updated sitemap entries to cover the primary service details and city pages while avoiding parameterized URLs.
- Lazy-loaded heavy components (`BookingForm`, `TrustBadges`) to reduce initial JS/CSS payload on high-traffic routes.
- Added richer supporting content (additional city links, specialized service callouts, FAQ quick links) to improve text-to-HTML ratios on money pages.

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
