### API Rate Limits Overview

This document summarizes current API endpoints and their assigned rate-limit buckets. All limits are enforced via `lib/security/rate-limiting.ts` using `withRateLimit(limitType, endpoint)`.

Buckets
- public: 30 req/min (general public endpoints)
- api_general: 60 req/min (authenticated general API)
- booking_create: 5 req/15 min (critical booking write ops)
- payment_create: 3 req/5 min (payment write ops)
- admin: 100 req/min (admin/cron/queue)
- auth_login: 10 req/15 min (auth sensitive flows: register, password reset, 2FA)

Key Endpoints

Public
- GET /api/health → public
- GET /api/health/database → public
- GET /api/ai/test → public
- POST /api/ai/test → public
- GET /api/analytics/web-vitals → public
- POST /api/analytics/web-vitals → public
- GET /api/availability → public
- GET /api/v2/availability → public
- GET /api/places-autocomplete → public
- GET /api/maps/geocode → public
- GET /api/maps/reverse-geocode → public
- GET /api/maps/distance → public
- GET /api/services-compatible → public
- GET /api/booking/[id] → public
- POST /api/booking/ghl-direct → public
- GET /api/ghl/availability → public
- POST /api/contact → public
- POST /api/submit-ad-lead → public
- POST /api/referrals/submit → public
- GET /api/webhooks/reviews (health) → public
- POST /api/webhooks/reviews → public
- GET /api/_ai/get-availability → public
- POST /api/_ai/escalate → public
- POST /api/_ai/log-note → public
- GET /api/ai/diagnostics → public
- GET /api/debug/env-vars → public
- GET /api/debug/request-patterns → public
- POST /api/debug/request-patterns → public
- GET /api/debug/redis-test → public
- GET /api/debug/proof-connection → public
- GET /api/debug/database-health → public
- GET /api/notifications/status/[id] → public
- GET /api/pricing/transparent → public
- POST /api/pricing/transparent → public
- POST /api/pricing/dynamic → public
- GET /api/pricing/dynamic → public
- GET /api/v2/bookings → public

api_general
- POST /api/documents/upload → api_general
- GET /api/documents/upload → api_general
- POST /api/s3/presign → api_general
- POST /api/s3/presign-booking → api_general
- POST /api/proof/documents → api_general
- GET /api/proof/documents → api_general
- GET /api/gmb/stats → api_general (public-friendly but analytics-heavy)

booking_create
- POST /api/booking/create → booking_create
- POST /api/booking/reserve-slot → booking_create
- GET /api/booking/reserve-slot → booking_create
- POST /api/ron/sessions → booking_create (RON session creation)

payment_create
- POST /api/create-checkout-session → payment_create
- GET /api/create-checkout-session → payment_create
- POST /api/payments/process → payment_create

admin
- GET /api/metrics → admin
- GET /api/admin/monitoring → admin
- POST /api/gmb/schedule-post → admin
- GET /api/gmb/schedule-post → admin
- DELETE /api/gmb/schedule-post → admin
- POST /api/gmb/initialize → admin
- GET /api/gmb/initialize → admin
- POST /api/queue → admin
- GET /api/queue → admin
- GET /api/cron/synthetic-monitor → admin
- POST /api/cron/lead-nurturing → admin
- GET /api/cron/lead-nurturing → admin
- GET /api/check-schema → admin
- POST /api/notifications/send → admin
- PUT /api/notifications/status/[id] → admin

auth_login
- POST /api/auth/register → auth_login
- POST /api/auth/password-reset → auth_login
- PATCH /api/auth/password-reset → auth_login
- GET /api/auth/two-factor/setup → auth_login
- POST /api/auth/two-factor/verify → auth_login

Notes
- For any future routes, default to `public` for GETs, `api_general` for authenticated utility endpoints, `booking_create` for booking writes, `payment_create` for payments, `admin` for admin/cron/queue, and `auth_login` for auth-sensitive flows.
- This doc complements deprecations listed in `docs/API_DEPRECATION.md`.


