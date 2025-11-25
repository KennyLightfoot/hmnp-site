# HMNP Architecture Overview & Codebase Guide

**Last Updated:** 2025-01-XX  
**Purpose:** Complete guide to how the Houston Mobile Notary Pros web app works, where things live, and what can be cleaned up.

---

## Table of Contents

1. [High-Level Architecture](#high-level-architecture)
2. [Project Structure](#project-structure)
3. [Core User Flows](#core-user-flows)
4. [Data Layer](#data-layer)
5. [External Integrations](#external-integrations)
6. [API Routes](#api-routes)
7. [Components & UI](#components--ui)
8. [Configuration & Environment](#configuration--environment)
9. [Bloat & Unused Code](#bloat--unused-code)
10. [Quick Reference: Where to Change What](#quick-reference-where-to-change-what)

---

## High-Level Architecture

### Tech Stack
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL via Prisma ORM
- **Cache/Queue:** Redis (Upstash), BullMQ
- **Auth:** NextAuth.js v4
- **Payments:** Stripe
- **CRM:** GoHighLevel (GHL) Private Integration API
- **Storage:** AWS S3
- **Analytics:** Google Analytics 4, Google Tag Manager, Google Ads
- **Hosting:** Vercel (production)

### Architecture Pattern
- **Server-Side Rendering (SSR)** for SEO-critical pages
- **Client Components** for interactive forms and booking flows
- **API Routes** for backend logic, webhooks, and integrations
- **Middleware** for auth, security headers, and route protection
- **Server Actions** for form submissions (where applicable)

---

## Project Structure

### `/app` - Next.js App Router Pages & API Routes

#### Public Pages (`/app/*.tsx`)
- **`page.tsx`** - Homepage with hero, services grid, reviews, FAQ
- **`booking/page.tsx`** - Main booking form (enhanced version)
- **`booking/simple/page.tsx`** - Simplified booking form (alternative)
- **`services/[slug]/page.tsx`** - Individual service pages
- **`service-areas/[slug]/page.tsx`** - Service area landing pages
- **`contact/page.tsx`** - Contact form page
- **`pricing/page.tsx`** - Pricing information page
- **`faq/page.tsx`** - FAQ page
- **`blog/[slug]/page.tsx`** - Blog posts (Sanity CMS)
- **`lp/*`** - Landing pages for marketing campaigns

#### Protected Pages
- **`/portal/*`** - Customer portal (bookings, documents)
- **`/admin/*`** - Admin dashboard (bookings, users, analytics, pricing)
- **`/notary/*`** - Notary worker portal (job offers, journal, settings)

#### API Routes (`/app/api/*`)
See [API Routes section](#api-routes) for detailed breakdown.

### `/components` - React Components

#### Core Components
- **`booking/`** - Booking form, wizard steps, pricing calculator
- **`ui/`** - shadcn/ui components (buttons, dialogs, forms, etc.)
- **`admin/`** - Admin-specific components
- **`analytics/`** - Analytics tracking components
- **`portal/`** - Customer portal components
- **`notary/`** - Notary worker components

#### Marketing Components
- **`hero-section.tsx`** - Homepage hero
- **`ServicesGrid.tsx`** - Service cards grid
- **`Reviews.tsx`** - Reviews display
- **`FaqStrip.tsx`** - FAQ accordion
- **`StickyBookBar.tsx`** - Sticky booking CTA

### `/lib` - Shared Utilities & Business Logic

#### Core Services
- **`db.ts`** - Prisma client export (re-exports from `database-connection.ts`)
- **`database-connection.ts`** - Unified DB connection with retry logic
- **`auth/`** - Authentication, JWT, 2FA, permissions
- **`booking/`** - Booking creation, validation, service logic
- **`pricing/`** - Pricing calculation engine
- **`ghl/`** - GoHighLevel CRM integration (calendars, contacts, appointments)
- **`stripe.ts`** - Stripe payment processing
- **`email/`** - Email templates and sending (Resend)
- **`sms/`** - SMS notifications (Twilio/other)

#### Utilities
- **`utils/`** - General utilities (formatting, validation, error handling)
- **`validation/`** - Zod schemas for forms and API
- **`security/`** - Security headers, CSRF, rate limiting
- **`analytics/`** - Analytics tracking, KPI monitoring
- **`maps/`** - Google Maps integration
- **`queue/`** - BullMQ queue configuration and processors

### `/prisma` - Database Schema & Migrations

- **`schema.prisma`** - Database schema definition
- **`migrations/`** - Migration history
- **`seed.ts`** - Database seeding script

### `/hooks` - React Hooks

- **`use-mobile.tsx`** - Mobile detection
- **`use-offline-booking.ts`** - Offline booking support
- **`use-transparent-pricing.ts`** - Pricing display hook
- **`use-toast.ts`** - Toast notifications

### `/scripts` - Utility Scripts

**⚠️ Many scripts here are one-time setup/debug scripts. See [Bloat section](#bloat--unused-code) for cleanup recommendations.**

- **`setup-*.ts/js`** - Setup scripts for GHL, business settings, etc.
- **`test-*.ts/js`** - Test scripts
- **`fix-*.sh/js`** - One-time fix scripts
- **`postinstall.js`** - Runs Prisma generate on install

### `/lambda-functions` - Serverless Functions

- **`s3-clamav-scanner/`** - Virus scanning for uploaded documents

### `/public` - Static Assets

- Images, fonts, icons, manifest.json, robots.txt

### `/types` - TypeScript Type Definitions

- Shared types, Prisma-generated types

---

## Core User Flows

### 1. Booking Flow (Customer)

**Path:** Homepage → `/booking` → Form submission → `/booking/success`

1. **User lands on homepage** (`app/page.tsx`)
   - Sees hero, services, reviews
   - Clicks "Book Now" → goes to `/booking`

2. **Booking form** (`components/booking/BookingForm.tsx`)
   - Multi-step wizard:
     - Step 1: Service selection
     - Step 2: Date/time selection (fetches availability from `/api/availability`)
     - Step 3: Location/address
     - Step 4: Customer info
     - Step 5: Document upload (optional)
     - Step 6: Review & submit
   - Real-time pricing calculation
   - AI assistant integration (optional)

3. **Form submission** → `POST /api/booking/create`
   - Validates data (Zod schemas)
   - Checks slot availability (overlap prevention)
   - Creates booking in database (Prisma)
   - Creates GHL contact & appointment (if configured)
   - Sends confirmation email
   - Returns booking ID

4. **Success page** (`app/booking/success/page.tsx`)
   - Shows confirmation
   - Payment link (if deposit required)
   - Next steps

**Key Files:**
- `components/booking/BookingForm.tsx` - Main form component
- `app/api/booking/create/route.ts` - Booking creation endpoint
- `lib/booking/create.ts` - Booking creation logic
- `lib/booking/booking-service.ts` - Booking service class
- `lib/pricing/` - Pricing calculation

### 2. Payment Flow

**Path:** Booking success → Stripe checkout → Webhook confirmation

1. **Customer clicks payment link** (if deposit required)
   - Redirects to Stripe Checkout (`/api/create-checkout-session`)

2. **Stripe processes payment**
   - Webhook: `POST /api/webhooks/stripe/route.ts`
   - Updates booking `depositStatus` to `PAID`
   - Sends confirmation email

**Key Files:**
- `lib/stripe.ts` - Stripe client & utilities
- `app/api/create-checkout-session/route.ts` - Creates Stripe session
- `app/api/webhooks/stripe/route.ts` - Handles Stripe webhooks

### 3. Admin Flow (Internal)

**Path:** `/admin` → Dashboard → Manage bookings/users

1. **Admin logs in** (`app/login/page.tsx`)
   - NextAuth.js handles auth
   - Redirects to `/admin` if authorized

2. **Admin dashboard** (`app/admin/page.tsx`)
   - View bookings, users, analytics
   - Manage pricing, services
   - Review notary applications

**Key Files:**
- `app/admin/*` - Admin pages
- `app/api/admin/*` - Admin API endpoints
- `lib/auth/permissions.ts` - RBAC logic

### 4. Notary Worker Flow

**Path:** `/notary` → Job offers → Accept → Complete booking

1. **Notary logs in** → `/notary` portal
2. **Views job offers** (`app/notary/job-offers/page.tsx`)
3. **Accepts assignment** → Creates `DispatchAssignment`
4. **Completes booking** → Updates booking status, journal entry

**Key Files:**
- `app/notary/*` - Notary portal pages
- `app/api/notary/*` - Notary API endpoints

---

## Data Layer

### Database Schema (Prisma)

**Core Models:**

- **`Service`** - Notary services (STANDARD_NOTARY, LOAN_SIGNING, RON, etc.)
- **`Booking`** - Customer bookings
- **`User`** - Customers, notaries, admins
- **`Payment`** - Payment records (Stripe)
- **`DispatchAssignment`** - Notary-to-booking assignments
- **`NotarizationDocument`** - Documents associated with bookings
- **`BusinessSettings`** - Business configuration (hours, pricing rules)
- **`PromoCode`** - Promotional codes
- **`Review`** - Customer reviews
- **`AuditLog`** - System audit trail

**Key Relationships:**
- `Booking` → `Service` (many-to-one)
- `Booking` → `User` (signer, notary - many-to-one)
- `Booking` → `Payment[]` (one-to-many)
- `Booking` → `DispatchAssignment[]` (one-to-many)

**Database Connection:**
- `lib/database-connection.ts` - Unified connection with retry logic
- `lib/db.ts` - Re-exports Prisma client (use this for imports)

### Prisma Usage

```typescript
import { prisma } from '@/lib/db';

// Example: Create booking
const booking = await prisma.booking.create({
  data: { ... }
});
```

---

## External Integrations

### 1. GoHighLevel (GHL) - CRM & Calendar

**Purpose:** Manage contacts, appointments, workflows

**Configuration:**
- `GHL_PRIVATE_INTEGRATION_TOKEN` - API token
- `GHL_LOCATION_ID` - Location ID
- `GHL_API_BASE_URL` - API base URL

**Key Files:**
- `lib/ghl/client.ts` - GHL API client
- `lib/ghl/contacts.ts` - Contact management
- `lib/ghl/appointments.ts` - Appointment creation
- `lib/ghl/calendar-mapping.ts` - Service-to-calendar mapping
- `app/api/ghl/*` - GHL API endpoints
- `app/api/webhooks/ghl/route.ts` - GHL webhooks

**How It Works:**
1. Booking created → Create/update GHL contact
2. Create GHL appointment in appropriate calendar
3. Trigger GHL workflow (if configured)
4. GHL webhooks update booking status

### 2. Stripe - Payments

**Purpose:** Process deposits and payments

**Configuration:**
- `STRIPE_SECRET_KEY` - Server-side key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Client-side key
- `STRIPE_WEBHOOK_SECRET` - Webhook verification

**Key Files:**
- `lib/stripe.ts` - Stripe client & service
- `app/api/create-checkout-session/route.ts` - Creates checkout session
- `app/api/webhooks/stripe/route.ts` - Handles webhooks

### 3. Google Maps - Location Services

**Purpose:** Geocoding, distance calculation, service area validation

**Configuration:**
- `GOOGLE_MAPS_API_KEY` - Server-side key
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` - Client-side key

**Key Files:**
- `lib/maps/` - Maps utilities
- `app/api/geocode/route.ts` - Geocoding endpoint
- `app/api/maps/*` - Maps API endpoints

### 4. Google Analytics / Ads - Tracking

**Purpose:** Analytics, conversion tracking, remarketing

**Configuration:**
- `NEXT_PUBLIC_GA_ID` - Google Analytics ID
- `NEXT_PUBLIC_GTM_ID` - Google Tag Manager ID
- `NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID` - Ads conversion ID

**Key Files:**
- `components/analytics/` - Analytics components
- `lib/analytics/` - Analytics utilities

### 5. Resend - Email

**Purpose:** Send transactional emails

**Configuration:**
- `RESEND_API_KEY` - Resend API key
- `FROM_EMAIL` - Sender email

**Key Files:**
- `lib/email/` - Email templates and sending

### 6. AWS S3 - File Storage

**Purpose:** Store uploaded documents

**Configuration:**
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_S3_BUCKET_NAME`

**Key Files:**
- `lib/s3.ts` - S3 client
- `app/api/s3/*` - S3 upload endpoints

### 7. Redis / Upstash - Caching & Queues

**Purpose:** Rate limiting, caching, job queues

**Configuration:**
- `REDIS_URL` - Redis connection string

**Key Files:**
- `lib/redis.ts` - Redis client
- `lib/queue/` - BullMQ queue configuration
- `lib/bullmq/` - Queue processors

---

## API Routes

### Public API Routes

#### Booking
- **`POST /api/booking/create`** - Create booking (main endpoint)
- **`POST /api/booking/reserve-slot`** - Reserve time slot (temporary hold)
- **`GET /api/availability`** - Get available time slots
- **`GET /api/availability-compatible`** - Legacy availability endpoint

#### Contact & Forms
- **`POST /api/contact`** - Submit contact form
- **`POST /api/request-call`** - Request callback

#### Pricing & Estimates
- **`POST /api/estimate`** - Get price estimate
- **`GET /api/pricing/*`** - Pricing information

#### Public Data
- **`GET /api/services-compatible`** - Legacy services endpoint
- **`GET /api/reviews`** - Public reviews

### Protected API Routes

#### Admin (`/api/admin/*`)
- **`GET /api/admin/dashboard`** - Dashboard data
- **`GET /api/admin/bookings`** - List bookings
- **`GET /api/admin/users`** - List users
- **`GET /api/admin/analytics`** - Analytics data
- **`POST /api/admin/pricing`** - Update pricing
- **`POST /api/admin/alerts/test`** - Test alert system

#### Portal (`/api/portal/*`)
- **`GET /api/portal/bookings`** - User's bookings
- **`GET /api/portal/[assignmentId]`** - Assignment details

#### Notary (`/api/notary/*`)
- **`GET /api/notary/job-offers`** - Available job offers
- **`POST /api/notary/job-offers/[id]/accept`** - Accept assignment
- **`POST /api/notary/complete-booking`** - Complete booking

### Webhooks (`/api/webhooks/*`)
- **`POST /api/webhooks/stripe`** - Stripe payment webhooks
- **`POST /api/webhooks/ghl`** - GHL webhooks
- **`POST /api/webhooks/proof`** - Proof.com webhooks (RON)
- **`POST /api/webhooks/reviews`** - Review webhooks

### Debug/Test Routes (⚠️ Consider removing in production)

- **`/api/debug/*`** - Debug endpoints
- **`/api/test-ghl*`** - GHL test endpoints
- **`/api/cron-test`** - Cron test endpoint
- **`/api/system-test`** - System test endpoint
- **`/api/diagnostics`** - Diagnostics endpoint

### Health & Monitoring
- **`GET /api/health`** - Basic health check
- **`GET /api/health/database`** - Database health
- **`GET /api/monitoring`** - Monitoring data

---

## Components & UI

### Component Organization

#### `/components/ui` - shadcn/ui Components
Reusable UI primitives (Button, Dialog, Input, etc.)

#### `/components/booking` - Booking Components
- **`BookingForm.tsx`** - Main booking form (multi-step wizard)
- **`ServiceSelector.tsx`** - Service selection step
- **`EnhancedTimeSlotDisplay.tsx`** - Time slot picker
- **`InteractivePricingCalculator.tsx`** - Pricing calculator
- **`steps/`** - Individual wizard steps

#### `/components/admin` - Admin Components
- **`AdminLayout.tsx`** - Admin layout wrapper
- **`LocalSEODashboard.tsx`** - SEO dashboard
- **`QAChecklistCard.tsx`** - QA checklist

#### `/components/analytics` - Analytics Components
- **`GAConversionEvents.tsx`** - GA conversion tracking
- **`GAPathTracker.tsx`** - Page path tracking
- **`PerformanceDashboard.tsx`** - Performance metrics

### Styling

- **Tailwind CSS** - Utility-first CSS
- **`app/globals.css`** - Global styles
- **`tailwind.config.ts`** - Tailwind configuration

---

## Configuration & Environment

### Environment Variables

**Critical Variables (Required):**
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - NextAuth secret
- `NEXTAUTH_URL` - App URL
- `STRIPE_SECRET_KEY` - Stripe secret key
- `GHL_PRIVATE_INTEGRATION_TOKEN` - GHL API token
- `GOOGLE_MAPS_API_KEY` - Google Maps key

**See `docs/ENV.CONSOLIDATED.EXAMPLE` for full list.**

### Environment Loading

- **`.env.local`** - Local development (gitignored)
- **Vercel Environment Variables** - Production (set in Vercel dashboard)
- **`lib/env-validation.ts`** - Validates required env vars on startup

### Configuration Files

- **`next.config.js`** - Next.js configuration
- **`tsconfig.json`** - TypeScript configuration
- **`tailwind.config.ts`** - Tailwind configuration
- **`prisma/schema.prisma`** - Database schema

---

## Bloat & Unused Code

### ⚠️ Backup Files (Safe to Delete)

- `components/booking/BookingForm.tsx.backup`
- `lib/bullmq/config.ts.backup`
- `lib/auth/unified-middleware-REMOVED.ts.bak`
- `components/booking/BookingWizard-REMOVED.tsx.bak`

### ⚠️ Debug/Test API Routes (Consider Removing or Gating)

- `/api/debug/*` - Debug endpoints (5 files)
- `/api/test-ghl*` - GHL test endpoints (3 files)
- `/api/cron-test` - Cron test
- `/api/system-test` - System test
- `/api/diagnostics` - Diagnostics

**Recommendation:** Gate these behind `NODE_ENV !== 'production'` or remove entirely.

### ⚠️ One-Time Setup Scripts (Archive or Document)

**In `/scripts` directory:**

**Setup Scripts (Keep):**
- `setup-booking-system.ts` - Core setup
- `setup-ghl-oauth.js` - GHL OAuth setup
- `setup-ghl-calendars.js` - Calendar setup
- `postinstall.js` - Runs on install

**One-Time Fix Scripts (Archive/Remove):**
- `fix-*.sh` - Multiple fix scripts (batch-3, batch-4, etc.)
- `fix-common-errors.sh`
- `fix-common-patterns.sh`
- `fix-core-patterns.sh`
- `fix-final-patterns.sh`
- `fix-remaining-errors.sh`
- `fix-remaining-patterns.sh`
- `fix-specific-patterns.sh`
- `fix-targeted-errors.sh`
- `fix-typescript-errors.sh`

**Test Scripts (Keep for Development):**
- `test-booking-system.ts` - Booking system tests
- `test-ghl-*.js` - GHL integration tests
- `check-booking-health.ts` - Health checks

**Recommendation:** Move one-time fix scripts to `/scripts/archive/` or delete if no longer needed.

### ⚠️ Backup Directories (Safe to Archive)

- `batch-*-backup-*` - Multiple backup directories (batch-3, batch-4, batch-5, batch-6)
- `common-patterns-backup-*`
- `core-patterns-backup-*`
- `remaining-errors-backup-*`
- `specific-patterns-backup-*`
- `targeted-errors-backup-*`

**Recommendation:** Archive these to external storage or delete if no longer needed.

### ⚠️ Root-Level Scripts (Many Are One-Time)

**Environment Sync Scripts (Keep if Used):**
- `sync-env-to-vercel.sh` - Syncs env vars to Vercel
- `sync-critical-stripe-vars.sh` - Stripe vars sync

**One-Time Fix Scripts (Archive/Remove):**
- `fix-*.sh` - Multiple fix scripts
- `add-critical-missing-env.sh`
- `clean-env-for-vercel.sh`
- `fix-database-config.sh`
- `fix-production-env-vars.sh`
- `fix-vercel-env-newlines.sh`
- `force-fix-vercel-env.sh`
- `rollback-production-env.sh`

**Recommendation:** Document which scripts are still needed, archive the rest.

### ⚠️ Unused Dependencies (Needs Verification)

**Potentially Unused (Verify Before Removing):**
- `express` - May not be used (Next.js handles routing)
- `body-parser` - Next.js has built-in body parsing
- `cors` - Next.js API routes handle CORS
- `helmet` - Security headers handled in `next.config.js`
- `moment` - Using `date-fns` and `luxon` instead
- `moment-timezone` - Using `date-fns-tz` instead

**Recommendation:** Run `pnpm why <package>` to check usage, then remove if unused.

### ⚠️ Duplicate/Unused Components

**Needs Investigation:**
- `components/booking/BookingForm.tsx.backup` - Backup file
- `components/booking/BookingWizard-REMOVED.tsx.bak` - Removed component
- Check for duplicate components in `components/booking/` vs `components/enhanced-ui/`

---

## Quick Reference: Where to Change What

### Change Booking Form
**File:** `components/booking/BookingForm.tsx`  
**Steps:** Edit wizard steps, validation, or UI

### Change Pricing Logic
**Files:**
- `lib/pricing/` - Pricing calculation engine
- `lib/business-rules/pricing-engine.ts` - Business rules
- `prisma/schema.prisma` - Service pricing fields

### Change Service Types
**File:** `prisma/schema.prisma` - `ServiceType` enum  
**Then:** Run `pnpm prisma generate` and create migration

### Change Email Templates
**Files:** `lib/email/templates/`  
**Templates:** Booking confirmation, reminders, etc.

### Change Business Hours
**File:** `lib/hours.ts` - Default hours  
**Or:** Set `NEXT_PUBLIC_BUSINESS_HOURS` env var (JSON)

### Change GHL Integration
**Files:**
- `lib/ghl/` - GHL client and utilities
- `lib/ghl/calendar-mapping.ts` - Service-to-calendar mapping
- `app/api/webhooks/ghl/route.ts` - Webhook handler

### Change Stripe Payment Flow
**Files:**
- `lib/stripe.ts` - Stripe client
- `app/api/create-checkout-session/route.ts` - Checkout creation
- `app/api/webhooks/stripe/route.ts` - Webhook handler

### Change Homepage Content
**File:** `app/page.tsx`  
**Components:** Edit hero, services grid, reviews, etc.

### Change Admin Dashboard
**Files:**
- `app/admin/page.tsx` - Dashboard page
- `app/api/admin/dashboard/route.ts` - Dashboard data API
- `components/admin/` - Admin components

### Change API Security
**Files:**
- `lib/security/comprehensive-security.ts` - Security middleware
- `middleware.ts` - Next.js middleware
- `next.config.js` - Security headers

### Change Database Schema
**File:** `prisma/schema.prisma`  
**Then:** `pnpm prisma migrate dev` (dev) or `pnpm prisma migrate deploy` (prod)

---

## Next Steps

1. **Review bloat items** - Decide what to archive/delete
2. **Test critical flows** - Booking, payment, admin
3. **Document specific integrations** - GHL, Stripe, etc.
4. **Create cleanup plan** - Remove unused code, scripts, dependencies

---

**Questions?** Check the codebase or ask for clarification on specific areas.

