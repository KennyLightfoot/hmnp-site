## Testing & System Checks

### Core Commands

```bash
pnpm test         # Run all unit tests
pnpm test:unit    # Unit tests only
pnpm lint         # ESLint
pnpm type-check   # TypeScript
```

### Queue / BullMQ Tests

- **Script**: `scripts/test-queues.ts`  
  - Runs a BullMQ system test via `runQueueSystemTest`, which:
    - Connects to Redis using `REDIS_URL`.
    - Enqueues a small `system-test` job into the `notifications`,
      `booking-processing`, and `payment-processing` queues.
  - Intended for CI and local dev to ensure queues can accept jobs before
    workers are deployed.

### AI / Chat Tests

- Route under test: `/api/ai/chat` (`app/api/ai/chat/route.ts`).  
- Key unit tests:
  - `tests/unit/chatbot-route.test.ts` – happy path, including the
    `AI_CHAT_BACKEND=agents` feature flag.
  - `tests/unit/chatbot-route-edge.test.ts` – error handling and 400/502 cases.
  - `tests/legacy/ai-function-calling.legacy.test.ts` – legacy Vertex
    function-calling integration tests.

The route supports two backends behind a stable HTTP API:

- **Vertex** (default): calls `sendChat` in `lib/vertex.ts`.  
- **Agents**: when `AI_CHAT_BACKEND=agents`, it delegates to the agents service
  `/chat` endpoint via `sendAgentsChat` in `lib/agents-client.ts`.

### Webhooks & Automations

Unit tests for external automations live under `tests/unit`:

- `webhooks-ghl.test.ts` – basic contract and setup-mode behavior for
  `/api/webhooks/ghl`.
- `webhooks-reviews.test.ts` – review webhook processing, including:
  - Contact lookup/creation in GHL (mocked).
  - Tag application and GMB thank-you post trigger (mocked).
- `webhooks-stripe.test.ts` – Stripe webhook surface:
  - Signature missing → 400.
  - Handled event types flow through `webhookProcessor.processWebhook` (mocked).
- `cron-follow-ups.test.ts` – `/api/cron/follow-ups` runs follow-up automation.
- `cron-lead-nurturing.test.ts` – `/api/cron/lead-nurturing` runs the lead
  nurturing service.

These tests are designed to verify that webhooks/cron endpoints correctly
invoke downstream services and queue/agents logic without requiring live
external systems.

### Agents → Admin Demo Flow

Need to confirm the lead/job/pricing/blog pipeline renders inside the admin dashboards without firing real webhooks? Use the demo seeding script:

```bash
pnpm agents:seed-demo
```

This script calls the same persistence helpers used by the webhook routes (`persistAgentBlog`, `upsertAgentLead`, `upsertAgentJob`, `upsertAgentPricingQuote`) so you can instantly populate:

- `/admin/operations` – shows the demo lead/job counts.
- `/admin/network` – reflects the pending job/offer stats.
- `/admin/content` – displays the seeded blog in the review metrics.

Run it on any dev/staging database to exercise the full “webhooks → Prisma → admin dashboard” flow before wiring real agents traffic.

### System Tests & Admin UI

- **Library**: `lib/testing/system-tests.ts`
  - `runSystemTests()` – full system test suite (DB, cache, queues, APIs,
    security, integration flows).
  - `runQuickHealthCheck()` – lightweight health summary (DB/cache/queues).
  - `runQueueSystemTest()` (in `lib/testing/queue-system-test.ts`) – focused
    BullMQ queue check used by both the system tests and the queue test script.

- **API**: `/api/system-test` (`app/api/system-test/route.ts`)
  - `type=health` – quick summary from `runQuickHealthCheck()`.
  - `type=full` – full system test report from `runSystemTests()`.
  - `type=queues` – filtered view focused on BullMQ queue tests.
  - `type=ai` – filtered view for AI/chat-related tests.
  - `type=automations` – filtered view for webhook/cron/automation tests.

- **Admin UI**: `/admin/system-checks`
  - Server-rendered page that calls `/api/system-test` and shows a compact
    pass/fail view for health and queue checks.
  - Designed as a quick operator dashboard; deeper details remain in logs and
    the JSON responses from `/api/system-test`.


