# Environment Variables Reference

**Last Updated:** 2025-01-27  
**Project:** Houston Mobile Notary Pros  
**Purpose:** Canonical source of truth for all environment variables used across the monorepo

---

## Classification System

Each variable is marked with one of:
- `required_prod` - Must be set in production; app will fail without it
- `optional_prod` - Recommended for production but app can run without it
- `dev_only` - Only needed for local development
- `test_only` - Only needed for running tests
- `legacy` - Deprecated/unused; safe to remove

---

## Core Production Variables (required_prod)

### Database & Runtime
- **`DATABASE_URL`** (required_prod)
  - Type: URL (PostgreSQL connection string)
  - Description: Primary database connection for runtime queries
  - Example: `postgresql://user:pass@host:6543/db?sslmode=require`
  - Used in: Prisma client, all database operations

- **`DIRECT_URL`** (optional_prod)
  - Type: URL (PostgreSQL connection string)
  - Description: Direct database connection for migrations (bypasses pooler)
  - Example: `postgresql://user:pass@host:5432/db?sslmode=require`
  - Used in: Prisma migrations

- **`NODE_ENV`** (required_prod)
  - Type: enum (`development` | `production` | `test`)
  - Description: Node.js environment identifier
  - Default: `development`
  - Used in: Build-time checks, conditional logic

### Authentication (NextAuth)
- **`NEXTAUTH_SECRET`** (required_prod)
  - Type: string (min 32 chars)
  - Description: Secret key for JWT signing and session encryption
  - Security: CRITICAL - must be random and secure
  - Used in: NextAuth session management

- **`NEXTAUTH_URL`** (required_prod)
  - Type: URL
  - Description: Canonical base URL for auth callbacks
  - Example: `https://houstonmobilenotarypros.com`
  - Used in: NextAuth callback URLs

### Payments (Stripe)
- **`STRIPE_SECRET_KEY`** (required_prod)
  - Type: string (starts with `sk_`)
  - Description: Stripe secret key for server-side payment processing
  - Security: SENSITIVE
  - Used in: Payment processing, webhook verification

- **`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`** (required_prod)
  - Type: string (starts with `pk_`)
  - Description: Stripe publishable key for client-side payment forms
  - Used in: Booking forms, payment UI

- **`STRIPE_WEBHOOK_SECRET`** (required_prod)
  - Type: string (starts with `whsec_`)
  - Description: Stripe webhook endpoint secret for signature verification
  - Security: SENSITIVE
  - Used in: Webhook route handlers

### Application URLs
- **`NEXT_PUBLIC_BASE_URL`** (required_prod)
  - Type: URL
  - Description: Canonical site URL used in pages, templates, emails
  - Example: `https://houstonmobilenotarypros.com`
  - Used in: Email templates, sitemap, structured data

### Database Infrastructure (Supabase)
- **`NEXT_PUBLIC_SUPABASE_URL`** (required_prod)
  - Type: URL
  - Description: Supabase project URL
  - Used in: Supabase client initialization

- **`NEXT_PUBLIC_SUPABASE_ANON_KEY`** (required_prod)
  - Type: string
  - Description: Supabase anonymous/public key
  - Used in: Client-side Supabase operations

- **`SUPABASE_SERVICE_ROLE_KEY`** (required_prod)
  - Type: string
  - Description: Supabase service role key (bypasses RLS)
  - Security: SENSITIVE
  - Used in: Server-side admin operations

### CRM & Calendar (GoHighLevel)
- **`GHL_LOCATION_ID`** (required_prod)
  - Type: string (min 20 chars)
  - Description: GoHighLevel location/business ID
  - Used in: All GHL API calls

- **`GHL_PRIVATE_INTEGRATION_TOKEN`** (required_prod - preferred)
  - Type: string
  - Description: GHL private integration token (newer auth method)
  - Security: SENSITIVE
  - Used in: GHL API authentication
  - Note: Prefer this over `GHL_API_KEY`

- **`GHL_API_KEY`** (optional_prod - legacy)
  - Type: string
  - Description: Legacy GHL API key (deprecated, use `GHL_PRIVATE_INTEGRATION_TOKEN`)
  - Status: Legacy - will be removed in future

- **`GHL_API_BASE_URL`** (optional_prod)
  - Type: URL
  - Description: GHL API base URL
  - Default: `https://services.leadconnectorhq.com`
  - Used in: GHL client configuration

### Email (Resend)
- **`RESEND_API_KEY`** (required_prod)
  - Type: string (starts with `re_`)
  - Description: Resend API key for transactional emails
  - Security: SENSITIVE
  - Used in: Email sending (bookings, confirmations, notifications)

- **`FROM_EMAIL`** (required_prod)
  - Type: email address
  - Description: Default sender email address
  - Example: `no-reply@houstonmobilenotarypros.com`
  - Used in: Email templates

- **`CONTACT_FORM_RECEIVER_EMAIL`** (optional_prod)
  - Type: email address
  - Description: Email address to receive contact form submissions
  - Used in: Contact form API route

- **`CONTACT_FORM_SENDER_EMAIL`** (optional_prod)
  - Type: email address
  - Description: Email address to send contact form notifications from
  - Used in: Contact form API route

### Caching & Rate Limiting (Redis/Upstash)
- **`REDIS_URL`** (optional_prod - preferred)
  - Type: URL (Redis connection string)
  - Description: Redis connection URL (Upstash or self-hosted)
  - Example: `rediss://default:token@host:port`
  - Used in: Rate limiting, caching, job queues

- **`UPSTASH_REDIS_REST_URL`** (optional_prod - alternative)
  - Type: URL
  - Description: Upstash REST API URL
  - Used in: Upstash Redis client (alternative to `REDIS_URL`)

- **`UPSTASH_REDIS_REST_TOKEN`** (optional_prod - alternative)
  - Type: string
  - Description: Upstash REST API token
  - Security: SENSITIVE
  - Used in: Upstash Redis client (alternative to `REDIS_URL`)

### File Storage (AWS S3)
- **`AWS_ACCESS_KEY_ID`** (required_prod)
  - Type: string
  - Description: AWS access key ID
  - Security: SENSITIVE
  - Used in: S3 client initialization

- **`AWS_SECRET_ACCESS_KEY`** (required_prod)
  - Type: string
  - Description: AWS secret access key
  - Security: SENSITIVE
  - Used in: S3 client initialization

- **`AWS_REGION`** (required_prod)
  - Type: string
  - Description: AWS region for S3 bucket
  - Example: `us-east-1`
  - Default: `us-east-1`
  - Used in: S3 client configuration

- **`S3_BUCKET`** or **`AWS_S3_BUCKET`** (required_prod)
  - Type: string
  - Description: S3 bucket name for file uploads
  - Example: `houston-notary-docs`
  - Used in: S3 upload operations

### Location Services (Google Maps)
- **`GOOGLE_MAPS_API_KEY`** (required_prod)
  - Type: string
  - Description: Google Maps API key for server-side geocoding/distance calculations
  - Security: Can be restricted to server IPs
  - Used in: Geocoding, distance matrix, travel fee calculations

- **`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`** (required_prod)
  - Type: string
  - Description: Google Maps API key for client-side maps/autocomplete
  - Security: Must be restricted to domain in Google Cloud Console
  - Used in: Maps components, Places autocomplete

---

## Optional Production Variables (optional_prod)

### Agents Service Integration
- **`AGENTS_BASE_URL`** (optional_prod)
  - Type: URL
  - Description: Base URL for external agents service (LLM/automation backend)
  - Used in: Agents API client

- **`AGENTS_ADMIN_SECRET`** (optional_prod)
  - Type: string
  - Description: Secret for admin authentication to agents service
  - Security: SENSITIVE
  - Used in: Admin review UI → agents service auth

- **`AGENTS_WEBHOOK_SECRET`** (optional_prod)
  - Type: string
  - Description: Secret for webhook signature verification from agents service
  - Security: SENSITIVE
  - Used in: Agents webhook routes

- **`NEXTJS_API_SECRET`** (optional_prod but strongly recommended)
  - Type: string
  - Description: Back-compat webhook secret used by both the root app and the agents service. Keep this value identical to `AGENTS_WEBHOOK_SECRET` so every webhook call uses the same token.

- **`AGENTS_HEALTH_ENDPOINT`** (optional_prod)
  - Type: string (path)
  - Description: Health check endpoint path for agents service
  - Default: `/health`
  - Used in: Health check monitoring

- **`AGENTS_HEALTH_TIMEOUT_MS`** (optional_prod)
  - Type: number (milliseconds)
  - Description: Timeout for agents service health checks
  - Used in: Health check monitoring

- **`AGENTS_HEALTH_REQUIRED`** (optional_prod)
  - Type: enum (`true` | `false`)
  - Description: Whether agents service health is required for app startup
  - Used in: Health check validation

### n8n Orchestration
- **`N8N_BASE_URL`** (optional_prod)
  - Type: URL
  - Description: Base URL for n8n automation platform
  - Used in: n8n webhook triggers

- **`N8N_HEALTH_ENDPOINT`** (optional_prod)
  - Type: string (path)
  - Description: Health check endpoint path for n8n
  - Default: `/health`
  - Used in: Health check monitoring

- **`N8N_HEALTH_TIMEOUT_MS`** (optional_prod)
  - Type: number (milliseconds)
  - Description: Timeout for n8n health checks
  - Used in: Health check monitoring

- **`N8N_HEALTH_REQUIRED`** (optional_prod)
  - Type: enum (`true` | `false`)
  - Description: Whether n8n health is required for app startup
  - Used in: Health check validation

- **`N8N_BASIC_AUTH_USER`** (optional_prod)
  - Type: string
  - Description: Basic auth username for n8n
  - Security: SENSITIVE
  - Used in: n8n API authentication

- **`N8N_BASIC_AUTH_PASSWORD`** (optional_prod)
  - Type: string
  - Description: Basic auth password for n8n
  - Security: SENSITIVE
  - Used in: n8n API authentication

- **`N8N_BASIC_AUTH_ACTIVE`** (optional_prod)
  - Type: enum (`true` | `false`)
  - Description: Whether n8n basic auth is enabled
  - Used in: n8n client configuration

### AI/ML (Vertex AI / Gemini)
- **`GOOGLE_SERVICE_ACCOUNT_JSON`** (optional_prod)
  - Type: string (JSON)
  - Description: Google Cloud service account JSON credentials
  - Security: SENSITIVE
  - Used in: Vertex AI client, Google Calendar API

- **`GOOGLE_PROJECT_ID`** (optional_prod)
  - Type: string
  - Description: Google Cloud project ID
  - Used in: Vertex AI client initialization

- **`GOOGLE_REGION`** (optional_prod)
  - Type: string
  - Description: Google Cloud region
  - Example: `us-central1`
  - Used in: Vertex AI client configuration

- **`VERTEX_MODEL_ID`** (optional_prod)
  - Type: string
  - Description: Vertex AI model identifier
  - Example: `gemini-2.5-flash`
  - Used in: Vertex AI chat/LLM calls

- **`VERTEX_RAG_CORPUS`** (optional_prod)
  - Type: string
  - Description: Vertex AI RAG corpus ID for retrieval-augmented generation
  - Used in: Vertex AI RAG queries

- **`VERTEX_CHAT_PROMPT_ID`** (optional_prod)
  - Type: string
  - Description: Vertex AI chat prompt template ID
  - Used in: Vertex AI chat initialization

### Analytics & Marketing
- **`NEXT_PUBLIC_GA_ID`** (optional_prod)
  - Type: string
  - Description: Google Analytics 4 measurement ID
  - Example: `G-XXXXXXXXXX`
  - Used in: Analytics tracking scripts

- **`NEXT_PUBLIC_GTM_ID`** (optional_prod)
  - Type: string
  - Description: Google Tag Manager container ID
  - Example: `GTM-XXXXXXX`
  - Used in: GTM script injection

- **`NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID`** (optional_prod)
  - Type: string
  - Description: Google Ads conversion tracking ID
  - Used in: Conversion tracking scripts

- **`SENTRY_DSN`** (optional_prod)
  - Type: URL
  - Description: Sentry DSN for error tracking
  - Used in: Error monitoring and reporting

- **`NEXT_PUBLIC_SENTRY_DSN`** (optional_prod - legacy)
  - Type: URL
  - Description: Legacy Sentry DSN for client-side error tracking
  - Status: Legacy - prefer `SENTRY_DSN` with server-side reporting

### Booking System Configuration
- **`MIN_APPOINTMENT_GAP_MINUTES`** (optional_prod)
  - Type: number
  - Description: Minimum gap between appointments in minutes
  - Used in: Booking availability calculations

- **`DISABLE_OVERLAP_CHECK`** (optional_prod)
  - Type: enum (`true` | `false`)
  - Description: Disable overlap checking for appointments (testing only)
  - Used in: Booking validation logic

### GHL Custom Field IDs (UTM Tracking)
These are optional but improve marketing attribution depth:
- **`GHL_CF_ID_UTM_SOURCE`** (optional_prod)
- **`GHL_CF_ID_UTM_MEDIUM`** (optional_prod)
- **`GHL_CF_ID_UTM_CAMPAIGN`** (optional_prod)
- **`GHL_CF_ID_UTM_TERM`** (optional_prod)
- **`GHL_CF_ID_UTM_CONTENT`** (optional_prod)
- Description: GoHighLevel custom field IDs for UTM parameter tracking
- Used in: CRM data enrichment (not hard blockers)

### Google My Business (GMB) Posting
- **`GMB_POSTING_ENABLED`** (optional_prod)
  - Type: enum (`true` | `false`)
  - Description: Enable GMB posting automation
  - Used in: GMB automation service

- **`GOOGLE_MY_BUSINESS_LOCATION_ID`** (optional_prod)
  - Type: string
  - Description: GMB location ID for posting
  - Used in: GMB API calls

- **`GOOGLE_MY_BUSINESS_CLIENT_ID`** (optional_prod)
  - Type: string
  - Description: GMB OAuth client ID
  - Security: SENSITIVE
  - Used in: GMB OAuth flow

- **`GOOGLE_MY_BUSINESS_CLIENT_SECRET`** (optional_prod)
  - Type: string
  - Description: GMB OAuth client secret
  - Security: SENSITIVE
  - Used in: GMB OAuth flow

- **`GOOGLE_MY_BUSINESS_REFRESH_TOKEN`** (optional_prod)
  - Type: string
  - Description: GMB OAuth refresh token
  - Security: SENSITIVE
  - Used in: GMB API authentication

- **`GOOGLE_MY_BUSINESS_ACCOUNT_ID`** (optional_prod)
  - Type: string
  - Description: GMB account ID
  - Used in: GMB API calls

### Vercel Deployment
- **`VERCEL_ENV`** (optional_prod)
  - Type: enum (`development` | `preview` | `production`)
  - Description: Vercel environment identifier
  - Used in: Environment detection

---

## Development-Only Variables (dev_only)

- **`SKIP_ENV_VALIDATION`** (dev_only)
  - Type: enum (`true` | `false`)
  - Description: Skip environment validation during development
  - Used in: Build-time validation bypass

- **`ANALYZE`** (dev_only)
  - Type: string
  - Description: Enable bundle analysis
  - Used in: Next.js build analysis

---

## Test-Only Variables (test_only)

- **`ENABLE_REAL_LLM_TESTS`** (test_only)
  - Type: enum (`true` | `false`)
  - Description: Enable real LLM API calls in tests (agents service)
  - Used in: Test suites

- **`ENABLE_REAL_IMAGE_TESTS`** (test_only)
  - Type: enum (`true` | `false`)
  - Description: Enable real image generation API calls in tests (agents service)
  - Used in: Test suites

---

## Legacy Variables (legacy - Safe to Remove)

### Proof.com RON (Legacy)
These variables are no longer used. RON is handled via Notary Hub UI with its own env vars:
- `PROOF_API_KEY`
- `PROOF_API_BASE_URL`
- `PROOF_BASE_URL`
- `PROOF_ENVIRONMENT`
- `PROOF_ORGANIZATION_ID`
- `PROOF_WEBHOOK_SECRET`
- `PROOF_REDIRECT_URL`
- `PROOF_FORCE_REDIRECT`
- `PROOF_REDIRECT_MESSAGE`

### Twilio SMS (Legacy)
These are defined in validation but have no runtime usage:
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`

### LaunchDarkly Feature Flags (Legacy)
These only appear in historical configs, no current code paths:
- `LAUNCHDARKLY_SERVER_SDK_KEY`
- `LAUNCHDARKLY_CLIENT_ID`
- `NEXT_PUBLIC_LAUNCHDARKLY_CLIENT_SDK_KEY`

---

## Agents Service Variables

For the `agents` subproject, see `agents/scripts/validateEnv.ts` for the complete list. Key variables:

### Core Runtime
- `PORT` - Server port
- `HMNP_ENV` - Environment identifier
- `NODE_ENV` - Node environment

### LLM Providers
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `GEMINI_API_KEY` / `GOOGLE_API_KEY`

### Image Providers
- `OPENAI_IMAGES_API_KEY`
- `STABILITY_API_KEY`
- `IMAGE_CLOUD_PROVIDER`
- `COMFYUI_BASE_URL`
- `COMFYUI_HEALTHCHECK_URL`
- `COMFYUI_API_KEY`

### Storage/Cache
- `REDIS_URL` or `REDIS_HOST`/`REDIS_PORT`/`REDIS_PASSWORD`
- `CACHE_BACKEND`

### Webhook Integration
- `NEXTJS_WEBHOOK_URL` - Next.js webhook endpoint
- `NEXTJS_API_SECRET` - Webhook secret

---

## Agents Integration Quick Checklist (All Environments)

| Variable | Dev Value | Staging/Prod Value | Notes |
|----------|-----------|--------------------|-------|
| `AGENTS_BASE_URL` | `http://localhost:4001` | `https://agents.<domain>` | Include the port if you are not terminating TLS on 443. |
| `NEXTJS_API_SECRET` | `local-shared-secret` | Strong 32+ character random string | Acts as the default webhook secret; must match between repos. |
| `AGENTS_WEBHOOK_SECRET` | Mirror `NEXTJS_API_SECRET` | Mirror `NEXTJS_API_SECRET` | Prefer setting both so scripts can compare them. |
| `AGENTS_ADMIN_SECRET` | `local-admin-secret` | Unique, strong string | Required for `/review/*` APIs consumed by admin dashboards. |

**Validation flow**
1. Populate `.env.local` (or `.env.production`) in both the root repo and the `agents/` repo.
2. Run `pnpm env:check` to ensure the Next.js app has everything it needs.
3. Run `pnpm check:agents-env` to verify webhook/admin secrets match across repos; the script fails fast if anything drifts.

Never deploy with empty webhook secrets—the guards in `lib/security/agents-webhook-auth.ts` will reject every request when both `AGENTS_WEBHOOK_SECRET` and `NEXTJS_API_SECRET` are missing.

---

## Quick Reference by Category

### Must Have for Production
1. `DATABASE_URL`
2. `NODE_ENV=production`
3. `NEXTAUTH_SECRET` (32+ chars)
4. `NEXTAUTH_URL`
5. `STRIPE_SECRET_KEY`
6. `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
7. `STRIPE_WEBHOOK_SECRET`
8. `NEXT_PUBLIC_BASE_URL`
9. `NEXT_PUBLIC_SUPABASE_URL`
10. `NEXT_PUBLIC_SUPABASE_ANON_KEY`
11. `SUPABASE_SERVICE_ROLE_KEY`
12. `GHL_LOCATION_ID`
13. `GHL_PRIVATE_INTEGRATION_TOKEN` (or legacy `GHL_API_KEY`)
14. `RESEND_API_KEY`
15. `FROM_EMAIL`
16. `AWS_ACCESS_KEY_ID`
17. `AWS_SECRET_ACCESS_KEY`
18. `AWS_REGION`
19. `S3_BUCKET` or `AWS_S3_BUCKET`
20. `GOOGLE_MAPS_API_KEY`
21. `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

### Nice to Have (Feature-Specific)
- Agents service vars (if using agents)
- n8n vars (if using n8n)
- Vertex AI vars (if using AI chat)
- Analytics vars (GA, GTM, Ads)
- Sentry (error tracking)
- GMB posting vars (if automating GMB posts)

### Safe to Remove
- All `PROOF_*` variables
- All `TWILIO_*` variables
- All `LAUNCHDARKLY_*` variables
- `NEXT_PUBLIC_SENTRY_DSN` (use `SENTRY_DSN` instead)

---

## Validation

Use `pnpm env:check` to validate your environment configuration against this reference.

---

**Last Updated:** 2025-01-27

