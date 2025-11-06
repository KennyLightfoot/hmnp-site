# Status & Health Endpoints

- /api/health (HEAD/GET) – overall health
- /api/cron/synthetic-monitor?type=health|booking|full-flow – synthetic tests
- /api/rum – core web vitals intake (optional Upstash)

Configure CRON_SECRET and SLACK_WEBHOOK_URL for alerts.

