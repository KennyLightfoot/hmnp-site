### Live Checks Runbook

Purpose: Quick manual verification after production deploys.

Redis connectivity
- Open: `GET /api/debug/redis-test`
- Expect: `{ success: true, ping: 'PONG', setTest: true }` and `connectionStatus: 'connected'`.

Stripe $1 live test
- Preconditions: STRIPE_SECRET_KEY set to live key; Checkout endpoint deployed.
- Action: Create a $1 session via `POST /api/create-checkout-session` (use a small amount and test card if in live mode with real card).
- Expect: 200 and `sessionUrl`. Complete checkout; confirm in Stripe dashboard; app shows status updated if applicable.

Proof.com RON flow (smoke)
- Create a booking eligible for RON or use an existing RON booking.
- Call `POST /api/proof/transactions` with required fields to create a session; expect a `sessionUrl`.
- Verify the session opens; optionally upload a small test doc via `POST /api/proof/documents`.

S3 presign
- Call `POST /api/s3/presign` or `/api/s3/presign-booking` with a small test filename and content type.
- Expect: presigned URL; PUT a tiny payload; confirm 200 from S3.

Synthetic monitor
- Trigger cron health run: `GET /api/cron/synthetic-monitor?type=health` with `Authorization: Bearer $CRON_SECRET`.
- Expect: `success: true` and summary with checks.

Health and pricing
- `GET /api/health` → healthy JSON
- `POST /api/booking/calculate-price` with minimal payload → success with price.

Error monitoring
- Cause a test error (e.g., use `/api/ai/test` POST with invalid payload) and confirm it appears in Sentry.

Rollback
- Identify previous stable deployment in Vercel; confirm one-click rollback plan is ready.

