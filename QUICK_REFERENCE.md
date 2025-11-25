# Quick Reference: Where to Change What

**Purpose:** Quick lookup guide for common changes you might need to make.

---

## 🎯 Common Changes

### Change Booking Form Steps
**File:** `components/booking/BookingForm.tsx`  
**Look for:** `BOOKING_STEPS` array (around line 181)  
**Edit:** Add/remove/modify steps in the array

### Change Service Pricing
**Files:**
- `prisma/schema.prisma` - Edit `Service` model `basePrice`, `depositAmount`
- `lib/pricing/` - Pricing calculation logic
- `lib/business-rules/pricing-engine.ts` - Business rules

**To update:** Edit schema → `pnpm prisma migrate dev` → Update pricing logic

### Change Business Hours
**File:** `lib/hours.ts` - Default hours  
**Or:** Set `NEXT_PUBLIC_BUSINESS_HOURS` env var (JSON format)

### Change Email Templates
**Files:** `lib/email/templates/`  
**Templates:**
- `booking-confirmation.html` - Booking confirmation email
- `booking-reminder.html` - Reminder emails
- `payment-confirmation.html` - Payment confirmation

### Change GHL Calendar Mapping
**File:** `lib/ghl/calendar-mapping.ts`  
**Function:** `getCalendarIdForService()` - Maps service types to GHL calendar IDs

### Change Stripe Payment Amount
**Files:**
- `lib/stripe.ts` - Stripe service
- `app/api/create-checkout-session/route.ts` - Checkout session creation
- `lib/booking/create.ts` - Booking creation (sets deposit amount)

### Change Homepage Content
**File:** `app/page.tsx`  
**Components:**
- `HeroSection` - Hero section
- `ServicesGrid` - Services grid
- `Reviews` - Reviews section
- `FaqStrip` - FAQ section

### Change Admin Dashboard Data
**Files:**
- `app/admin/page.tsx` - Dashboard page
- `app/api/admin/dashboard/route.ts` - Dashboard API endpoint

### Change API Security Rules
**Files:**
- `lib/security/comprehensive-security.ts` - Security middleware
- `middleware.ts` - Next.js middleware (route protection)
- `next.config.js` - Security headers

### Change Database Schema
**File:** `prisma/schema.prisma`  
**Commands:**
- Dev: `pnpm prisma migrate dev`
- Prod: `pnpm prisma migrate deploy`
- Generate types: `pnpm prisma generate`

### Change Environment Variables
**Files:**
- `.env.local` - Local development
- Vercel Dashboard - Production
- `lib/env-validation.ts` - Validates required vars

### Change Analytics Tracking
**Files:**
- `components/analytics/` - Analytics components
- `lib/analytics/` - Analytics utilities
- `app/layout.tsx` - GTM/GA initialization

### Change Service Types
**File:** `prisma/schema.prisma` - `ServiceType` enum  
**Then:** Run `pnpm prisma generate` and create migration

### Change Booking Status Flow
**File:** `prisma/schema.prisma` - `BookingStatus` enum  
**Logic:** `lib/booking/booking-service.ts` - Status transitions

### Change Notary Assignment Logic
**Files:**
- `lib/dispatch/auto-dispatch.ts` - Auto-dispatch logic
- `app/api/assignments/route.ts` - Assignment API

### Change Availability Calculation
**Files:**
- `lib/availability/generateSlots.ts` - Slot generation
- `app/api/availability/route.ts` - Availability API
- `lib/ghl/appointments.ts` - GHL calendar integration

### Change Contact Form Submission
**File:** `app/api/contact/route.ts` - Contact form handler  
**Component:** `components/contact-form.tsx` - Contact form UI

### Change Review Display
**Files:**
- `components/Reviews.tsx` - Reviews component
- `app/api/reviews/route.ts` - Reviews API
- `prisma/schema.prisma` - `Review` model

---

## 🔧 Configuration Files

### Next.js Config
**File:** `next.config.js`  
**Changes:** Redirects, headers, webpack config, image optimization

### TypeScript Config
**File:** `tsconfig.json`  
**Changes:** Path aliases, compiler options, includes/excludes

### Tailwind Config
**File:** `tailwind.config.ts`  
**Changes:** Theme, plugins, content paths

### Prisma Schema
**File:** `prisma/schema.prisma`  
**Changes:** Database models, relationships, enums

---

## 📁 Key Directories

### `/app` - Pages & API Routes
- `app/page.tsx` - Homepage
- `app/booking/` - Booking pages
- `app/api/` - API routes
- `app/admin/` - Admin pages
- `app/portal/` - Customer portal

### `/components` - React Components
- `components/booking/` - Booking components
- `components/ui/` - UI primitives
- `components/admin/` - Admin components

### `/lib` - Business Logic
- `lib/booking/` - Booking logic
- `lib/pricing/` - Pricing logic
- `lib/ghl/` - GHL integration
- `lib/stripe.ts` - Stripe integration

### `/prisma` - Database
- `prisma/schema.prisma` - Schema definition
- `prisma/migrations/` - Migration history

---

## 🚀 Common Commands

### Development
```bash
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm type-check       # Type check
pnpm lint             # Lint code
```

### Database
```bash
pnpm prisma generate  # Generate Prisma client
pnpm prisma migrate dev  # Create migration (dev)
pnpm prisma migrate deploy  # Apply migrations (prod)
pnpm prisma studio    # Open Prisma Studio
```

### Testing
```bash
pnpm test             # Run tests
pnpm test:e2e         # Run E2E tests
pnpm test:unit         # Run unit tests
```

---

## 🔍 Finding Things

### Find Where a Component is Used
```bash
grep -r "ComponentName" .
```

### Find Where an API Route is Called
```bash
grep -r "/api/route-name" .
```

### Find Where a Function is Imported
```bash
grep -r "functionName" .
```

### Find Environment Variable Usage
```bash
grep -r "PROCESS_ENV_VAR_NAME" .
```

---

## 📝 Adding New Features

### Add New Service Type
1. Edit `prisma/schema.prisma` - Add to `ServiceType` enum
2. Run `pnpm prisma migrate dev`
3. Update `lib/ghl/calendar-mapping.ts` - Add calendar mapping
4. Update `lib/pricing/` - Add pricing rules if needed
5. Create service page: `app/services/[slug]/page.tsx`

### Add New API Route
1. Create file: `app/api/your-route/route.ts`
2. Export `GET`, `POST`, etc. handlers
3. Add security middleware if needed: `withPublicSecurity`, `withAdminSecurity`
4. Test endpoint

### Add New Component
1. Create file: `components/your-component.tsx`
2. Use shadcn/ui components from `components/ui/`
3. Import and use in pages

### Add New Database Model
1. Edit `prisma/schema.prisma` - Add model
2. Run `pnpm prisma migrate dev`
3. Use in code: `prisma.yourModel.findMany()`

---

## 🐛 Debugging

### Check Database Connection
```bash
pnpm prisma studio
# Or
curl http://localhost:3000/api/health/database
```

### Check GHL Integration
```bash
curl http://localhost:3000/api/test-ghl-calendar
```

### Check Environment Variables
```bash
# Local
cat .env.local

# Production (Vercel)
vercel env ls
```

### View Logs
- **Local:** Console output
- **Vercel:** Vercel dashboard → Logs
- **Database:** Check `SystemLog` table (if exists)

---

## 🔐 Security Checklist

### Before Deploying Changes
- [ ] Environment variables set correctly
- [ ] API routes have proper security middleware
- [ ] Admin routes are protected
- [ ] Sensitive data not logged
- [ ] CSRF protection enabled
- [ ] Rate limiting configured

---

## 📚 Additional Resources

- **Architecture Overview:** `ARCHITECTURE_OVERVIEW.md`
- **Bloat Analysis:** `BLOAT_ANALYSIS.md`
- **API Documentation:** `API_ENDPOINTS_DOCUMENTATION.md`
- **Environment Setup:** `docs/ENV.CONSOLIDATED.EXAMPLE`

---

**Need help?** Check the architecture docs or search the codebase for similar patterns.

