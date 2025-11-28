### HMNP Launch Checklist (Minimal)

Environment & Secrets
- Verify env on Vercel: `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `JWT_SECRET`, `DATABASE_URL`, `DIRECT_DATABASE_URL`, `REDIS_URL` or Upstash creds, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` (if used), `RESEND_API_KEY`, `FROM_EMAIL`, `GHL_API_KEY`, `GHL_LOCATION_ID`.
- Rotate any test credentials; remove debug keys.

Security & Middleware
- Rate limiting standardized via `withRateLimit`; Redis-backed in production.
- High-risk routes wrapped with `withComprehensiveSecurity` (payments, booking create, auth).
- CORS origins configured to prod domains; CSRF enabled for state-changing routes.

Data & Migrations
- `pnpm db:migrate` runs clean in prod; seed services if empty.
- Backups enabled on database; retention verified.

Payments
- Stripe live keys set; run a $1 live test; confirm Checkout success and status updates.

RON / Proof.com
- (Legacy) Proof.com RON checks are no longer required; RON is handled via Notary Hub UI.

Monitoring & Alerts
- Sentry DSN set; verify error captured on test exception.
- Synthetic monitor cron enabled; Slack webhook for alerts configured.
- `/api/metrics` accessible to monitoring only.

Performance
- CDN enabled; static assets cached; no-cache headers on dynamic API.
- Redis reachable from prod; basic ping passes.

Compliance & Content
- Privacy policy/terms pages published; cookie consent if needed.
- Sitemap/robots verified; meta and OG tags present.

Ads & Analytics
- Pixels installed (GA/Meta); UTM capture on booking/checkout flows.

Rollback Plan
- Previous Vercel deployment pinned; one-click rollback documented.

Smoke Test (Prod)
- Pricing → Reserve Slot → Booking Create → Checkout → Confirmation → (RON) Session → Upload Doc → Completion.


