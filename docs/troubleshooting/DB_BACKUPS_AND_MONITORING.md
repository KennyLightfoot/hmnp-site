## Database Backups & Monitoring - Houston Mobile Notary Pros

This doc summarizes how production-grade backups and basic monitoring **should** be configured for the Postgres database used by this app. It does **not** change any provider settings by itself; you (or your infra admin) still need to click the buttons in your database provider dashboard.

---

### 1. Backups & Point-in-Time Recovery (PITR)

- **Goal**: You can recover the production database to any point within a reasonable retention window (for example, the last 7–30 days).
- **Where to configure**: In your Postgres provider dashboard (for example, Supabase → Project → Database → Backups / PITR).

**Recommended settings (for a small/medium SaaS app):**

- **Automatic backups**: Enabled.
- **Backup frequency**: Daily full backups (or whatever the provider’s default is for your plan).
- **Point-in-time recovery**: Enabled, with WAL/archive logs retained for at least 7–14 days.
- **Retention window**: At least 7 days; 30 days if storage and cost allow.

**Operational checklist:**

1. In your provider console, locate the **Backups** or **PITR** section for the project that corresponds to your `DATABASE_URL`.
2. Enable **automatic backups** and **point-in-time recovery** (if available on your plan).
3. Set a retention window that matches your risk tolerance (7–30 days is typical).
4. Confirm that:
   - A backup job schedule is visible.
   - You can see at least one completed backup after 24 hours.
5. Perform a **test restore** to a separate temporary database at least once (non-production) so you know the restore workflow before an emergency.

---

### 2. Basic Monitoring & Alerts

- **Goal**: You get notified before the database becomes a problem (connection failures, storage limits, CPU spikes), not after users are impacted.
- **Where to configure**: In your Postgres provider dashboard and your app/monitoring stack (logs, metrics, uptime monitors).

**Recommended provider-side alerts:**

- **Connection errors / refusal**: Alert when repeated connection failures occur.
- **Storage usage**: Alert at 70%, 85%, and 95% of allocated storage.
- **CPU / memory**: Alert when sustained CPU or memory usage exceeds ~80% for more than 5–10 minutes.
- **Slow queries (optional)**: If your provider exposes slow-query logs, enable them and route summaries to your logging system.

**Recommended app-side checks (using existing scripts):**

- `node test-db-connection.cjs`  
  - Verifies the app can connect using `DATABASE_URL` and read basic tables like `User`.
- `node database-health-check.mjs`  
  - Runs a deeper health check: critical table counts, presence of required services, business settings, and some security-related tables.

**Operational checklist:**

1. In the provider console, configure alerts for:
   - Connection failures / downtime.
   - Storage and CPU thresholds.
2. Route alerts to:
   - Email inbox monitored by the business.
   - Optional: Slack, PagerDuty, or similar (if available).
3. In your deployment pipeline (CI or release checklist), add a step to run:
   - `node test-db-connection.cjs`
   - `node database-health-check.mjs`
   and treat failures as **release blockers**.

---

### 3. Restore & Disaster Recovery Playbook (High Level)

If you ever need to restore the production database:

1. **Pause writes** to the application:
   - Temporarily disable booking and payment actions (maintenance page or feature flag).
2. **Create a new database instance** from backup or PITR:
   - In your provider console, restore to a new database (never overwrite the only copy on first attempt).
3. **Update `DATABASE_URL`** for the app to point at the restored database:
   - Update env vars in your hosting platform (for example, Vercel) and redeploy.
4. **Run health checks**:
   - `node test-db-connection.cjs`
   - `node database-health-check.mjs`
5. **Re-enable writes** once you’re confident data is correct and the app is functioning normally.

Document the **exact** steps you followed (timestamps, backup IDs, and decisions) in `SECURITY_AUDIT_REPORT.md` or another incident log so future recoveries are faster and safer.


