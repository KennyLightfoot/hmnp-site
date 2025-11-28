# Operations Run Book

This document captures the day-to-day steps for keeping the HMNP automation stack (Next.js app, agents service, n8n workflows, queues) healthy.

## Daily quick checks

1. **Verify background services are running**
   ```bash
   pnpm automation:status
   ```
   Expect to see `hmnp-agents` and `hmnp-n8n` in the `online` state. If not, restart with `pnpm automation:restart`.

2. **Check agents pipeline health**
   ```bash
   pnpm agents:health   # fast /health ping
   pnpm agents:verify   # full env/models/build/test sweep
   ```
   `agents:health` confirms the HTTP server is reachable (and uses `AGENTS_HEALTH_ENDPOINT`). `agents:verify` runs `env:validate`, `env:check-models`, `build`, and the scripted agent tests inside the `agents/` workspace. Failures usually mean missing API keys or a stopped Ollama instance.

3. **Check n8n workflow engine**
   ```bash
   pnpm n8n:health
   ```
   Hits `N8N_BASE_URL` (default `http://localhost:5678/healthz`) using basic auth. If it fails, ensure pm2 is running and that `N8N_BASIC_AUTH_*` env vars are set.

4. **Spot-check the admin System Checks page**
   - Visit `/admin/system-checks`.
   - Review the Quick Health and Full Suite cards.
   - Queues/Agents/Automations sections should be `PASS`. `WARN` indicates degraded state; `FAIL` means take action (restart workers, validate agents/n8n).

## Restarting services

- **Agents + n8n together:** `pnpm automation:restart`
- **Agents only:** `pnpm dlx pm2 restart hmnp-agents`
- **n8n only:** `pnpm dlx pm2 restart hmnp-n8n`
- Save process list (so PM2 resurrects them on reboot): `pnpm dlx pm2 save`

## Webhook & secret management

- All agents → Next.js webhooks (`/api/webhooks/blog-approved`, `lead-created`, `job-created`, `pricing-quoted`) require `AGENTS_WEBHOOK_SECRET` or `NEXTJS_API_SECRET`.
- n8n must run with basic auth (`N8N_BASIC_AUTH_ACTIVE=true`, `N8N_BASIC_AUTH_USER`, `N8N_BASIC_AUTH_PASSWORD`).
- Agents admin actions (review queue) use `AGENTS_ADMIN_SECRET`; keep it in `.env` and never in workflow JSON.

## When something breaks

1. **Queues failing**  
   - Check `/admin/system-checks` → Queues section.  
   - Tail worker logs (`pnpm dlx pm2 logs hmnp-agents --lines 200`).  
   - Verify Redis/Upstash credentials.

2. **Content automation stalled**  
   - Look at `/admin/content` summary cards.  
   - If pending reviews keep climbing, run `pnpm agents:verify` and restart `hmnp-agents`.

3. **n8n workflows not triggering**  
   - `pnpm n8n:health` should pass.  
   - Open `http://localhost:5678` (basic auth) and confirm workflows are still active.  
   - Re-run `pnpm agents:verify` to ensure webhook consumer is working.

4. **Webhooks failing auth**  
   - Rotate `AGENTS_WEBHOOK_SECRET` and update both the Next.js `.env` and the agents repo `.env`.  
   - Update n8n HTTP Request nodes that send events to the new secret header (`X-Webhook-Secret`).

## Command reference

| Area | Command |
|------|---------|
| PM2 status | `pnpm automation:status` |
| Restart services | `pnpm automation:restart` |
| Agents diagnostics | `pnpm agents:verify` |
| Agents health | `pnpm agents:health` |
| n8n health | `pnpm n8n:health` |
| System tests API | `curl -X GET $BASE_URL/api/system-test?type=full` |

Keep this run book close to `docs/AUTOMATION_SERVICES.md` so the on-call person can move from detection → restart → validation quickly.

