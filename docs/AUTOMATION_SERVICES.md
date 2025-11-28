# Automation Services (Agents + n8n)

This guide explains how to keep the HMNP agents server and n8n workflows running 24/7 on your local automation box (WSL/Ubuntu) using **PM2**. The goal is a “semi-production” setup that auto-restarts on reboot so automations continue even when you are not actively coding.

## 1. Prerequisites

- Node.js 20+ (already required for the repo)
- pnpm installed globally (`corepack enable && corepack prepare pnpm@latest --activate`)
- n8n installed via `npx` (no global install required) and configured per `agents/N8N_SETUP_GUIDE.md`
- Agents repo bootstrapped (`pnpm install`, `.env` populated, models pulled if you use local LLMs)
- PM2 (added as a dev dependency; installed via `pnpm install`)

## 2. One-time PM2 setup

1. Copy the automation env example:
   ```bash
   cp automation/env.example automation/.env.local
   ```
   Update any overrides (ports, auth, memory limits). **Do not** commit `.env.local`; it is gitignored by default.

2. Install dependencies at the root (this pulls in PM2):
   ```bash
   pnpm install
   ```

3. Start the automation stack (agents + n8n) under PM2:
   ```bash
   pnpm automation:start
   ```

4. Check status:
   ```bash
   pnpm automation:status
   # or
   pm2 status
   ```

Logs for both processes are available via:
```bash
pnpm automation:logs
```

To stop/delete the processes:
```bash
pnpm automation:stop
```

## 3. What the PM2 config does

`automation/pm2.ecosystem.config.cjs` defines two managed apps:

| Process        | Command                                | Notes |
|----------------|----------------------------------------|-------|
| `hmnp-agents`  | `pnpm dev:server` (cwd: `./agents`)    | Loads `.env` inside `agents/` and exposes the HTTP server on port 4001. Restarts automatically if the process crashes. |
| `hmnp-n8n`     | `npx n8n start` (cwd: repo root)       | Exposes n8n on `N8N_PORT` (default 5678) with basic auth enabled. Shares secrets via `automation/.env.local`. |

Both entries:

- Autorestart with exponential backoff (2s, capped at 20 retries)
- Restart when memory usage exceeds the configured cap (defaults 1 GB)
- Load overrides from `automation/.env.local` so you can set auth creds without editing tracked files

## 4. Running on Windows + WSL

1. Launch PM2 inside WSL (Ubuntu) using the commands above.
2. To talk to agents/n8n from Windows applications (e.g., GHL desktop browser, Postman, or n8n UI in Windows), use the WSL IP:
   ```powershell
   wsl hostname -I
   # Example output: 172.24.32.1
   ```
   - Agents URL: `http://172.24.32.1:4001`
   - n8n URL: `http://172.24.32.1:5678`
3. If the IP changes after reboot, re-run `wsl hostname -I` and update any webhook/N8N references.

## 5. Boot-time auto start

PM2 saves the current process list so it can respawn services on machine reboot:

```bash
pm2 save                 # run once after pnpm automation:start
pm2 startup systemd      # prints a command; run it with sudo to register
```

After that, WSL automatically brings the processes back. Run `pm2 resurrect` manually if needed.

## 6. Updating or restarting

- After changing agents/n8n code, reload the processes:
  ```bash
  pnpm automation:restart
  ```
- If you only touched one service, you can use PM2 directly:
  ```bash
  pm2 restart hmnp-agents
  pm2 restart hmnp-n8n
  ```

## 7. Troubleshooting quick reference

| Symptom | Checks |
|---------|--------|
| `pnpm automation:start` fails with `pm2: command not found` | `pnpm install` to pull dev dependencies, or install PM2 globally (`pnpm add -g pm2`). |
| Agents webhooks return connection refused | `pnpm automation:status` to ensure `hmnp-agents` is online; confirm port 4001 is reachable from Windows using `wsl hostname -I`. |
| n8n UI unreachable | Verify `hmnp-n8n` is running, check `N8N_PORT`, and confirm firewall settings on Windows allow access. |
| Need to rotate n8n basic auth | Edit `automation/.env.local`, run `pnpm automation:restart`, and then `pm2 save`. |

## 8. Relation to the broader automation plan

- This PM2 setup satisfies the “semi-production, always-running on your main machine” requirement from `hm.plan.md`.
- Later plan steps (agents/webhook integration, admin dashboards, security hardening) assume these services stay online so webhooks, queues, and cron jobs can reach them reliably.

Keep this document alongside `agents/N8N_SETUP_GUIDE.md` and `docs/agents-and-automations.md` for a complete automation reference. Once ready to move to a dedicated VPS, reuse the same ecosystem file and `.env.local`—only the host IPs and TLS termination will change.

## 9. Quick agents & n8n verification

- **Agents** – run:
  ```bash
  pnpm agents:verify   # deep validation (build + tests)
  pnpm agents:health   # lightweight /health ping
  ```
  The `agents:verify` chain executes the documented setup commands (`env:validate`, `env:check-models`, `build`, `test:agents`), while `agents:health` simply hits the HTTP health endpoint defined by `AGENTS_BASE_URL` so you can confirm the server is reachable after PM2 restarts.

- **n8n** – run:
  ```bash
  pnpm n8n:health
  ```
  The script hits `N8N_BASE_URL` (default `http://localhost:5678/healthz`) with Basic Auth if configured and fails fast if the workflow engine is offline or misconfigured.

See `docs/OPS_RUNBOOK.md` for the full daily checklist, restart commands, and escalation paths.

