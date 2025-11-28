### Vercel Environment Sync Checklist

This checklist ensures production (and preview) env vars in Vercel match what the app needs. Use alongside `.env.example`.

Required core
- NEXTAUTH_URL: e.g., https://your-domain.com
- NEXTAUTH_SECRET: 32+ char random string
- JWT_SECRET: 32+ char random string
- DATABASE_URL: Runtime URL (Transaction Pooler, port 6543)
- DIRECT_DATABASE_URL: Migration URL (direct, port 5432)
- NEXT_PUBLIC_BASE_URL: https://your-domain.com

Caching/Rate limiting
- REDIS_URL: rediss://… (prefer) OR
- UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN

Payments
- STRIPE_SECRET_KEY: Live secret key
- STRIPE_WEBHOOK_SECRET: If using webhooks

Email
- RESEND_API_KEY
- FROM_EMAIL: notifications@your-domain.com

GHL (GoHighLevel)
- GHL_API_KEY
- GHL_LOCATION_ID
- (Optional) GHL_API_BASE_URL, GHL_* IDs used by tracking/workflows (see code comments)

Proof.com (RON) - REMOVED
// All PROOF_* variables have been removed. RON is now handled via Notary Hub UI
// with its own environment variables.

S3/Uploads
- S3_BUCKET
- AWS_REGION: us-east-1
  (Credentials should be via Vercel IAM integration or automatic role; otherwise set AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY securely.)

Maps/Client
- GOOGLE_MAPS_API_KEY
- NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

Monitoring/Automation
- SENTRY_DSN
- SLACK_WEBHOOK_URL
- CRON_SECRET: for cron/queue endpoints (Bearer token)
- METRICS_ENDPOINT (optional)
- ADMIN_API_KEY (optional programmatic admin)
- INTERNAL_API_KEY (used by some admin endpoints)
- NOTIFICATIONS_API_KEY (for notifications API)

Contact form
- CONTACT_FORM_RECEIVER_EMAIL
- CONTACT_FORM_SENDER_EMAIL

Commands (suggested)
```bash
# List existing envs
vercel env ls

# Add/update a var (prod)
vercel env add NEXTAUTH_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add JWT_SECRET production
# …repeat for others

# Pull envs locally (optional)
vercel env pull .env.vercel
```

Scope and notes
- Server-only: keep secrets out of NEXT_PUBLIC_.
- Public client vars must be prefixed with NEXT_PUBLIC_.
- Rotate any test keys before launch.
- Database migration uses DIRECT_DATABASE_URL; runtime uses DATABASE_URL.
- Redis-backed rate limiting is auto-enabled in production when REDIS_URL/Upstash is available.

Post-sync validation
- Trigger a prod deployment.
- Verify `/api/health` returns healthy.
- Verify `/api/debug/redis-test` returns `{ success: true, ping: 'PONG' }`.

