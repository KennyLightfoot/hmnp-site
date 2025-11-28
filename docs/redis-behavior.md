### Redis Behavior & Build Safety

This document explains how Redis is used in the app and how builds behave when Redis is unavailable.

---

### 1. Goals

- **Keep `next build` and SSG/ISR from failing** when Redis is down or misconfigured.
- **Fail soft at runtime**: features that depend on Redis should degrade gracefully, not crash the app.
- **Surface real problems** via system tests and admin/monitoring surfaces.

---

### 2. Core Redis client (`lib/redis.ts`)

- **Implementation**: `RedisClient` singleton exported as `redis` (and default export).
- **Initialization**:
  - Lazy: no connection attempt at module import time.
  - `ensureInitialized()` is called on first use and:
    - Skips initialization when:
      - `NEXT_PHASE === 'phase-production-build'`, or
      - `SKIP_REDIS_DURING_BUILD === 'true'`, or
      - `SILENCE_SERVER_INIT_LOGS === '1'`.
    - In those phases, `redis.isAvailable()` is `false` and commands are effectively no-ops.
- **Runtime behavior**:
  - When Redis is reachable, `redis` exposes a small, safe subset of commands (`get`, `set`, `del`, `incr`, `expire`, `keys`, etc.) plus `getStats`.
  - When Redis is down, operations log at error level and return safe defaults (e.g. `null`, `false`, `0`).

**Implication**: Building the app **does not require** a live Redis instance.

---

### 3. Caching layer (`lib/cache.ts`)

- **Purpose**: Higher-level cache service for:
  - API responses and DB query results.
  - Rate limiting counters.
  - Tag-based invalidation (`invalidateByTags`).
- **Build/SSG safety**:
  - The `CacheService` constructor now checks:
    - `NEXT_PHASE === 'phase-production-build'`, or
    - `SKIP_REDIS_DURING_BUILD === 'true'`, or
    - `SILENCE_SERVER_INIT_LOGS === '1'`.
  - In those phases, it **does not create a Redis client** and logs a single info message (unless logs are silenced).
  - All operations guard on `isAvailable()`; when Redis is unavailable they:
    - Return safe defaults (e.g. `null` for `get`, `false` for `set`, empty stats).
    - Never throw due to missing Redis.

---

### 4. Pricing cache (`lib/pricing/pricing-cache.ts`)

- **Behavior**:
  - Uses its own optional `Redis` instance, initialized via `PricingCache.initialize()`.
  - If no Redis URL is configured or connection fails:
    - Falls back to an in-memory cache.
    - Logs a warning, but does **not** crash the app or build.

---

### 5. Queue / BullMQ interactions

- **BullMQ**:
  - Uses TCP Redis via `REDIS_URL` and fails soft when only Upstash REST is configured.
  - When Redis is not available:
    - `lib/bullmq/config.ts` logs `BullMQ queues disabled: no TCP Redis connection available` and returns `null`.
    - Workers and enqueue helpers should check for `null` and skip processing.
- **Upstash Queue (`lib/queue/config.ts`)**:
  - Uses Upstash REST (`@upstash/queue`, `@upstash/redis`) and validates credentials in production.
  - When credentials are missing, it falls back to local processing or returns `null`.

---

### 6. Build vs runtime failure policy

- **Build / SSG / ISR**:
  - Builds **must succeed** even if Redis is:
    - Unreachable,
    - Misconfigured, or
    - Completely absent.
  - Redis-dependent modules either:
    - Skip initialization (Redis client, cache), or
    - Short-circuit queue features with logged warnings (BullMQ/queues).
- **Runtime**:
  - Health and system tests:
    - `lib/testing/system-tests.ts` includes Redis/cache tests (`testRedisCaching`, `testCacheInvalidation`, `testCachePerformance`).
    - Failures there should show up in:
      - `/api/system-test` (when implemented),
      - Admin/system-check dashboards.
  - Application behavior:
    - Booking idempotency: `/api/booking/create` treats Redis as an **optional** safeguard and falls back to normal behavior when Redis is unavailable.
    - Rate limiting and other cache-based features should treat Redis as an optimization, not a requirement.

---

### 7. Configuration flags

- **`SKIP_REDIS_DURING_BUILD`**:
  - When `true`, forces all Redis initialization to be skipped.
  - Set automatically in build scripts (see `package.json`) so CI/vercel builds are safe even without Redis.
- **`SILENCE_SERVER_INIT_LOGS`**:
  - Used in build scripts to prevent noisy server-init logs during `next build`.
  - Also used as a secondary guard to avoid connecting Redis when logs are silenced.

---

### 8. Expectations for developers & ops

- You **do not** need Redis running to:
  - Install dependencies,
  - Run `pnpm build`,
  - Execute pure frontend tests.
- You **do** need Redis (or Upstash) running to:
  - Exercise queue workers (BullMQ, Upstash Queue).
  - Run full system tests that validate cache behavior.
  - Validate rate limiting and high-traffic scenarios.

If Redis-related build failures appear in the future, they should be treated as regressions against this policy and fixed or documented here.


