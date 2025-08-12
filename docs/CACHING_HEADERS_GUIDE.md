### Caching Headers Guide

Defaults
- API responses via `withAPISecurity` now default to `Cache-Control: no-store, no-cache, must-revalidate` unless a handler sets its own header.

Recommended overrides
- Public GET APIs returning stable data (e.g., static lists):
  - `Cache-Control: public, max-age=60, s-maxage=300, stale-while-revalidate=120`
- Dynamic or sensitive data:
  - Keep default no-store (payments, auth, booking, documents).

How to set per-route
```ts
const res = NextResponse.json(data);
res.headers.set('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=120');
return res;
```

Pages/static assets
- Next.js handles static assets with long-lived caching by default via Vercel CDN.
- Ensure images/fonts are immutable when appropriate.

Notes
- Use `Vary: Origin` already added in CORS for proper cache key separation.
- Avoid caching responses with personalized content or secrets.

