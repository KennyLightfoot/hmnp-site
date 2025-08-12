### Synthetic Monitor Cron Setup

Endpoint
- `GET /api/cron/synthetic-monitor?type=health|booking|full-flow`
- Requires header: `Authorization: Bearer $CRON_SECRET`

Vercel configuration
- In Vercel → Project → Settings → Cron Jobs → Add Job:
  - Path: `/api/cron/synthetic-monitor?type=health`
  - Schedule: `*/5 * * * *` (every 5 minutes) or as desired
  - Environment: Production

Secrets
- Set `CRON_SECRET` in Vercel env.
- Optional `SLACK_WEBHOOK_URL` to receive alerts.

Manual trigger
```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://your-domain.com/api/cron/synthetic-monitor?type=health
```

What it does
- Runs health checks (API, DB, Redis, Stripe, Maps).
- Optionally booking flow checks.
- Sends alerts to Slack on failures.
- Emits metrics to `METRICS_ENDPOINT` if configured.

