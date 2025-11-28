# Status & Health Endpoints

- /api/health (HEAD/GET) – overall health
- /api/cron/synthetic-monitor?type=health|booking|full-flow – synthetic tests
- /api/rum – core web vitals intake (optional Upstash)

Configure CRON_SECRET and SLACK_WEBHOOK_URL for alerts.

## CLI Quick Checks (run from repo root)
- `pnpm agents:health` – hits `AGENTS_BASE_URL + AGENTS_HEALTH_ENDPOINT`
- `pnpm n8n:health` – checks `N8N_BASE_URL + /healthz`
- `pnpm automation:status` – PM2 status for `hmnp-agents` & `hmnp-n8n`

