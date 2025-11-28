### Agents, Queues, and Automations Map

This doc links together the Next.js app (`hmnp`), the Agents service (`agents/`), BullMQ / Upstash queues, GHL, Stripe, reviews, and GMB so you can answer:  
**“When X happens, which agent/queue runs, and how does the web app get updated?”**

---

### 1. Core components

- **Next.js web app (this repo)**  
  - Booking + payment flows, admin UI, API routes.  
  - Queues:
    - **BullMQ (TCP Redis)** – `lib/bullmq/*`  
      - Queues: `notifications`, `booking-processing`, `payment-processing` (`QueueName` in `lib/bullmq/config.ts`).  
      - Workers: `lib/bullmq/worker.ts`, `lib/bullmq/booking-processor.ts`.  
    - **Upstash Queue (HTTP)** – `lib/queue/*` (see `docs/job-queue.md`).  
      - Queues: `notifications`, `booking-processing`, `payment-processing` (`lib/queue/config.ts`).
- **Agents service (separate repo under `agents/`)**  
  - Runs LLM agents: `classificationAgent`, `pricingAgent`, `sopAgent`, `blogAgent`, `customerReplyAgent`, `reviewReplyAgent`, etc. (see `agents/AGENTS.md`).  
  - Exposes HTTP API on port 4001 (see `agents/src/server.ts` + `agents/WEB_APP_INTEGRATION.md`).  
  - Next.js talks to it via `lib/agents-client.ts` (`fetchApprovedBlogsFromAgents`, `fetchAgentsLeads`, `fetchAgentsJobs`, `fetchAgentsPricing`, `runAgentsJob`).
- **External systems**
  - **GHL** – CRM, calendar, messaging.  
  - **n8n** – Orchestration and workflow engine for Agents + GHL + Sheets (see `agents/N8N_*` docs).  
  - **Stripe** – Payments and invoices (`app/api/webhooks/stripe/route.ts`, `lib/stripe.ts`).  
  - **GMB / GBP** – Google Business Profile automation (`lib/gmb/*`, GMB API routes under `app/api/gmb/*`).  
  - **Notary Hub** – Current RON provider; used **manually** via their UI, not integrated yet (Proof.com integration being decommissioned).

---

### 2. Website → queues → notifications & payments

**Booking created from website**

1. User submits booking form → `POST /api/booking/create` (`app/api/booking/create/route.ts`).  
2. Route:
   - Validates input (`bookingSchemas.createBookingFromForm`).  
   - Writes booking to DB via `lib/booking/create.ts`.  
   - Uses Redis-based idempotency cache (`lib/redis.ts`) when `Idempotency-Key` is present, but falls back gracefully if Redis is unavailable.
3. Downstream automation:
   - Email + SMS notifications are enqueued via the queue bridge:
     - `addJob('notification', 'send', {...})` in payment/booking flows → `lib/queue/queue-config.ts`.  
     - That calls `QueueClient` → Upstash queues (`lib/queue/client.ts`, `lib/queue/config.ts`).  
   - Payment flows can enqueue payment jobs:
     - `addJob('payment', 'create' | 'capture' | 'refund', {...})` → handled by queue workers.

**Payment succeeded / failed (Stripe)**

1. Stripe sends webhook → `POST /api/webhooks/stripe` (`app/api/webhooks/stripe/route.ts`).  
2. Handler:
   - Verifies signature with `STRIPE_WEBHOOK_SECRET`.  
   - Delegates to `webhookProcessor.processWebhook` (idempotency + race protection).  
   - Processes events in `processStripeEvent`:
     - Updates `payment` and `booking` rows via Prisma.  
     - Enqueues jobs via `addJob`:
       - `addJob('invoice', 'generate', {...})` → booking job in `booking-processing` queue.  
       - `addJob('notification', 'send', {...})` → notification queue for payment confirmation emails.
3. Queue workers:
   - **Upstash workers**: `lib/queue/worker.ts` + scheduler / cron (see `docs/job-queue.md`, `lib/schedulers/unified-scheduler.ts`).  
   - **BullMQ workers**: `lib/bullmq/worker.ts` and `lib/bullmq/booking-processor.ts` (for richer, TCP-Redis-backed processing in non-serverless contexts).

---

### 3. GHL, reviews, and phone webhooks

**GHL webhooks** – `/api/webhooks/ghl` (`app/api/webhooks/ghl/route.ts`)

- Receives events like:
  - `ContactCreate`, `ContactUpdate`, `OpportunityCreate`, `OpportunityStatusUpdate`, `AppointmentCreate/Update`, inbound messages, etc.  
- Flow:
  - Verifies authenticity via:
    - HMAC signature (`x-ghl-signature` / `x-wh-signature` + `GHL_WEBHOOK_SECRET`), or  
    - Shared secret headers (`x-webhook-secret`/`x-shared-secret` + `GHL_WORKFLOW_SHARED_SECRET`).  
  - Applies in-memory rate limiting to prevent spam.  
  - Routes events to contact/opportunity handlers (`handleContactWebhook`, `handleOpportunityWebhook`, etc. in `lib/handlers/*`).  
  - Today: primarily logging + tagging + internal state updates; ready to be extended to enqueue queue jobs or call Agents for classification/scoring.

**Reviews webhook** – `/api/webhooks/reviews` (`app/api/webhooks/reviews/route.ts`)

- Triggered by Zapier or direct review platform integrations (Google/Yelp/Facebook).  
- Flow:
  1. Validates payload with Zod.  
  2. Finds or creates a GHL contact (`findContactByEmail`, `searchContacts`, `createContact` in `lib/ghl/*`).  
  3. Applies tags like `review:platform_google`, `review:rating_5`, `review:positive_given` via `addTagsToContact`.  
  4. Triggers GMB “thank you” automation:
     - Calls `triggerReviewThankYouPost` from `lib/gmb/automation-service.ts`.  
     - That schedules/executes automation tasks through `GMBAutomationService` and `GMBAPIService`.  
  5. In the future, this route is a natural hook to:
     - Call `reviewReplyAgent` in the Agents service (via n8n or direct HTTP) to draft reply text.

**Missed phone call webhook** – `/api/webhooks/phone/missed` (`app/api/webhooks/phone/missed/route.ts`)

- Called by telephony provider with `MISSED_CALL_WEBHOOK_SECRET`.  
- On missed calls or zero-duration calls:
  - Invokes `sendMissedCallTextback` (`lib/ghl/automation-service`) to send SMS follow-ups via GHL.  
- This is a good integration point for future AI follow-ups (e.g., a small agent deciding the best SMS template).

---

### 4. Cron tasks and synthetic monitors

Cron routes live under `app/api/cron/*`:

- `/api/cron/follow-ups`  
- `/api/cron/lead-nurturing`  
- `/api/cron/synthetic-monitor`

These routes typically:

- Are secured via secrets / admin guards.  
- Call into:
  - `lib/schedulers/unified-scheduler.ts` (centralized job scheduling against queues).  
  - Business logic modules for follow-up campaigns, lead nurturing, and synthetic checks of booking/AI endpoints.  
- From there, they enqueue jobs through:
  - Upstash `QueueClient` (notification/booking/payment jobs), and/or  
  - BullMQ `BullQueueClient` (heavier, TCP-Redis-backed workers for long-running jobs).

---

### 5. Agents service integration

**REST API calls from Next.js → Agents**

- Implemented via `lib/agents-client.ts`, which always uses `fetch` with `cache: 'no-store'` and a base URL from env (`AGENTS_BASE_URL` / similar).  
- Key helpers:
  - `fetchApprovedBlogsFromAgents()` → `GET /blogs/approved`  
  - `fetchAgentsLeads()` → `GET /api/business/leads`  
  - `fetchAgentsJobs()` → `GET /api/business/jobs`  
  - `fetchAgentsPricing()` → `GET /api/business/pricing`  
  - `fetchAgentsStats()` → `GET /api/business/stats`  
  - `runAgentsJob()` → `POST /jobs` with `RunAgentsJobRequest` (text/questions/metadata, optional `enqueue` flag).
- Typical flows:
  - Blog content: Agents generates + exports markdown, then either:
    - Syncs via `pnpm blogs:export && pnpm blogs:sync` into `content/blogs`, or  
    - Exposes approved blogs via `/blogs/approved` for the web app to import.  
  - Lead and job analytics: Admin dashboards can call `fetchAgentsLeads/Jobs/Pricing/Stats` to show AI-enriched KPIs.

**Webhooks from Agents → Next.js**

- Implemented under `app/api/webhooks/*` and documented in `agents/WEB_APP_INTEGRATION.md` (`blog.approved`, `lead.created`, `job.created`, `pricing.quoted`).  
- Authentication: `X-Webhook-Secret` or `Authorization: Bearer <NEXTJS_API_SECRET>` (see `lib/security/agents-webhook-auth.ts`).  
- Behavior:
  - Blogs are rendered to markdown under `content/blogs/` and tracked via the `AgentBlog` table, so marketing pages can statically import them.
  - Leads, jobs, and pricing quotes upsert into `AgentLead`, `AgentJob`, and `AgentPricingQuote` tables for admin analytics.
  - Admin dashboards can also fetch live data through the new proxy routes (`/api/admin/agents/leads|jobs|pricing|stats`) which call the agents service via `lib/agents-client.ts`.

---

### 6. AI chat and future agents routing

- **Current state**:
  - `/api/ai/chat` (`app/api/ai/chat/route.ts`) calls `sendChat` in `lib/vertex.ts` (Vertex AI Gemini) directly.  
  - `/api/ai/test` and `/api/ai/diagnostics` provide admin/test endpoints for Vertex.  
  - Redis is used only for chat caching (`lib/ai/chat-cache.ts`), not as a hard requirement.
- **Planned integration (from `HMNP_AGENTS_INTEGRATION_PLAN.md`)**:
  - Introduce `POST /chat` in the Agents service, which:
    - Runs `classificationAgent` + `llmRouterAgent`.  
    - Delegates to `customerReplyAgent`, `pricingAgent`, `sopAgent`, `reviewReplyAgent`, etc.  
  - Update `/api/ai/chat` in Next.js to:
    - Handle auth, PII scrubbing, and rate limiting.  
    - Delegate to Agents’ `/chat` endpoint (with a feature flag) instead of calling Vertex directly.  
  - High-risk or review-required outputs can be funneled into a review queue in the Agents pipeline (e.g., “review reply approval”).

---

### 7. External tools overview

- **GHL**:
  - Webhooks → `/api/webhooks/ghl` and `/api/webhooks/phone/missed`.  
  - Outbound calls from Next.js via `lib/ghl/*` for contacts, appointments, tags, and messaging.  
  - n8n workflows also talk to GHL directly and/or via Agents.
- **n8n**:
  - Orchestrates long-running automations and multi-step flows.  
  - Talks to:
    - Agents service (`/n8n/webhook` handlers in `agents/src/n8n`),  
    - GHL (HTTP nodes),  
    - The web app’s API routes (e.g. lead/booking endpoints, system tests).  
  - See `agents/N8N_*` docs for exact workflows and triggers.
- **Notary Hub**:
  - Currently used manually for RON; no live HTTP integration in this repo.  
  - Legacy Proof.com-based integration (`lib/proof/api.ts`, `/api/webhooks/proof`, related scripts) has been fully decommissioned and removed. Future HTTP integration should use a clean `lib/notary-hub/*` + `/api/notary/*` namespace.

---

### 8. Quick mental model: “event → agent/queue → update”

- **Website lead/booking**  
  → `/api/booking/create`  
  → DB write + optional Redis idempotency  
  → `addJob('notification' | 'payment' | 'invoice', ...)`  
  → Upstash/BullMQ workers  
  → Emails/SMS + booking/payment status updates in DB/UI.

- **Stripe payment events**  
  → `/api/webhooks/stripe`  
  → DB payment + booking updates  
  → Queue jobs for invoices + notifications.

- **GHL contact/opportunity/appointment events**  
  → `/api/webhooks/ghl`  
  → Contact/opportunity handlers in `lib/ghl/*`  
  → Today: logging + tagging; future: queue jobs + Agents calls for scoring/next-best-action.

- **Reviews**  
  → `/api/webhooks/reviews`  
  → GHL contact + tags  
  → GMB thank-you automation via `GMBAutomationService`  
  → Future: `reviewReplyAgent` drafts replies via Agents.

- **Agents pipeline (LLM jobs)**  
  → n8n / web app calls `runAgentsJob` or Agents webhooks  
  → Agents choose appropriate LLM + agent pipeline  
  → Results pushed to Next.js via webhooks or pulled via REST endpoints (leads/jobs/pricing/blogs).

This should give you a single place to reason about how HMNP’s web app, Agents pipeline, queues, and external systems fit together. For deeper details, see `docs/job-queue.md`, `docs/HMNP_AGENTS_REPO_ANALYSIS.md`, and `agents/WEB_APP_INTEGRATION.md`.


