### Build Output Map (`pnpm build`)

This document maps the main classes of build-time messages to their underlying code/config so we can keep the output predictable and intentional.

---

### 1. npm / pnpm config warnings

- **Symptom**: Warnings about unsupported or unknown config keys when installing or building with `pnpm`.
- **Likely messages**:
  - Unknown config key `override.prismjs@<1.30.0`
  - Unknown config key `public-hoist-pattern[]`
- **Sources**:
  - `.npmrc`
    - `override.prismjs@<1.30.0>=>=1.30.0`
    - `public-hoist-pattern[]=*@prisma/client*`
    - `public-hoist-pattern[]=*.prisma*`
  - `package.json`
    - `"overrides"` block (safe for npm/pnpm, but can still surface as lockfile noise when versions change).
- **Planned action**:
  - Migrate `.npmrc` overrides to pnpm-supported fields or keep them as **documented, intentional** if pnpm ignores them without breaking.

---

### 2. Next.js / webpack “Critical dependency” warnings

- **Symptom**: Next.js build logs `Critical dependency: the request of a dependency is an expression` for certain server-only packages.
- **Known cases** (from current code + `CHANGELOG.md`):
  - **BullMQ child-processor**:
    - Dynamic `require()` usage inside BullMQ’s internal `child-processor.js` implementation.
    - Triggered when bundling server code that imports BullMQ:
      - `lib/bullmq/config.ts`
      - `lib/bullmq/worker.ts`
      - `lib/bullmq/booking-processor.ts`
  - **`require-in-the-middle` via Sentry / OpenTelemetry**:
    - Sentry’s Node/Next SDK uses `require-in-the-middle` to instrument modules, which Next.js flags as a critical dependency.
    - Primary touchpoint:
      - `lib/monitoring.ts` (`import * as Sentry from '@sentry/nextjs';`)
      - Transitive dependency: `require-in-the-middle` (see `pnpm-lock.yaml`).
- **Risk level**:
  - These are **server-only** dynamic requires and do **not** affect client bundles when the modules are imported exclusively in server contexts.
- **Planned action**:
  - Audit all imports of:
    - BullMQ modules (`lib/bullmq/*`),
    - Monitoring / Sentry wrappers (`lib/monitoring.ts`, `lib/monitoring/alert-manager.ts`),
  - Ensure they are only used in:
    - API routes,
    - server utilities,
    - workers / cron scripts.
  - Optionally use Next.js server-only patterns or webpack config to keep these dependencies out of client bundles.

---

### 3. Redis / BullMQ during build or system tests

- **Symptoms**:
  - Connection errors when Redis is unavailable.
  - Warnings about BullMQ queues being disabled when only Upstash REST is configured.
- **Redis sources**:
  - `lib/redis.ts`
    - `RedisClient` singleton exported as `redis`.
    - Build-time guard:
      - `ensureInitialized()` short-circuits when `SILENCE_SERVER_INIT_LOGS === '1'` (used in `package.json` build scripts) so builds don’t spam logs or hang on Redis.
    - Runtime behavior:
      - `isAvailable()` controls whether individual commands hit Redis or no-op with logged errors.
  - `lib/testing/system-tests.ts`
    - `testRedisCaching`, `testCacheInvalidation`, `testCachePerformance`:
      - Will **fail** cache-related system tests if Redis is unreachable.
- **BullMQ sources**:
  - `lib/bullmq/config.ts`
    - Creates TCP connections via `ioredis` using `REDIS_URL` or `REDIS_HOST` / `REDIS_PORT`.
    - Logs and **disables queues gracefully** when only `UPSTASH_REDIS_REST_URL` exists.
  - `lib/bullmq/worker.ts`
    - Uses `getQueues()` with the same Redis connection.
  - `lib/bullmq/booking-processor.ts`
    - Uses `createRedisClient()` from `lib/redis.ts` for queue connection.
- **Planned action**:
  - Treat Redis connectivity as:
    - **Non-fatal** for `next build` and SSG/ISR.
    - **Visible** via:
      - Health checks (`lib/testing/system-tests.ts`),
      - Admin/system-check surfaces.
  - Optionally introduce a dedicated flag (e.g. `SKIP_REDIS_DURING_BUILD=true`) and/or reuse `SILENCE_SERVER_INIT_LOGS` more explicitly for build/CI phases.

---

### 4. Environment variable validation and marketing flags

- **Symptoms**:
  - Log lines such as:
    - `✅ All critical environment variables are clean`
    - Warnings about missing optional keys (email, Maps, Redis).
    - Warnings when GMB posting is disabled.
- **Sources**:
  - `lib/env-clean.ts`
    - `detectEnvironmentCorruption()` prints:
      - `🚨 CRITICAL: Corrupted environment variables detected!` when issues are found.
      - `✅ All critical environment variables are clean` when everything passes.
  - `lib/env-validation.ts`
    - `validateEnvironment()` & `validateEnvironmentOrThrow()`:
      - Uses Zod schemas to enforce **hard-required** env vars (DB, auth, Stripe, GHL).
      - Emits warnings for optional-but-recommended vars:
        - `RESEND_API_KEY`, `GOOGLE_MAPS_API_KEY`, Redis/Upstash config, etc.
      - `shouldSkipValidation` is `true` during build/CI when:
        - `SKIP_ENV_VALIDATION === 'true'`, or
        - `isBuildTime` heuristic detects a production build phase.
  - `lib/gmb/automation-service.ts`
    - Uses `GMB_POSTING_ENABLED`:
      - Logs: `GMB posting is disabled - set GMB_POSTING_ENABLED=true to enable` when feature is intentionally off.
- **Planned action**:
  - Explicitly separate:
    - **Hard-required** env vars (DB, auth, queues, Stripe, core GHL).
    - **Optional-but-recommended** vars (email providers, Maps, Redis).
    - **Marketing / campaign flags** (GHL custom UTM fields, GMB posting).
  - Ensure GMB-related logs clearly indicate **“disabled by config” vs “misconfigured”**.

---

### 5. AI / monitoring / chatbot-related noise

- **Symptoms**:
  - Occasional warnings or logs when AI backends or monitoring integrations are misconfigured.
- **Sources**:
  - `app/api/ai/chat/route.ts`
    - Uses `sendChat` from `lib/vertex.ts` and `ConversationTracker` for logging.
    - Returns a friendly 502 with `Upstream AI service unavailable` when Vertex is down or misconfigured.
  - `lib/monitoring.ts` and `lib/monitoring/alert-manager.ts`
    - Integrate with `@sentry/nextjs`, Resend, Slack, Better Stack, and CrowdSec **only when relevant env vars are set**.
    - Missing DSNs or webhooks typically result in **skipped integration** rather than hard errors.
- **Planned action**:
  - Keep AI/monitoring failures as **non-fatal for builds**, but surface them:
    - In system-test results,
    - Via `alertManager` (Sentry/Slack/email) when configured.

---

### 6. Summary: Expected vs. Problematic Messages

- **Expected / allowed (documented)**:
  - `Critical dependency` warnings from:
    - BullMQ internal `child-processor.js` (server-only).
    - `require-in-the-middle` via Sentry / OpenTelemetry (server-only).
  - Informational env logs:
    - `✅ All critical environment variables are clean`
    - `GMB posting is disabled - set GMB_POSTING_ENABLED=true to enable`
  - Redis/BullMQ “disabled” warnings when no TCP Redis is configured (e.g., Upstash REST only).
- **Should be treated as regressions**:
  - New `Critical dependency` warnings coming from **client bundles** or non-server-only code.
  - Build-time crashes due to:
    - Redis connection failures,
    - Env validation throwing outside clearly defined `build/CI` rules.
  - Unhandled AI/monitoring exceptions surfacing as build failures.

Going forward, any new build warning should be:

1. Classified into one of the buckets above (or a new, clearly documented bucket), and  
2. Either eliminated or explicitly documented here as **expected** with a clear rationale.


