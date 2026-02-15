### Emphasis

- SMS/10DLC compliance: explicit opt-in/opt-out, consent logging, brand/campaign registration.
- Data governance: clear retention/deletion timelines, vendor DPAs, immutable audit trails for notarial actions.
- Reliability: on-call rotation, uptime/error monitoring, synthetic checks on booking/checkout.
- Performance guardrails: enforce RUM SLOs in CI/CD; block deploys on regressions.
- Attribution discipline: UTM governance + call tracking so CAC/ROAS are trustworthy.

### To-dos

- [ ] Register 10DLC (brand/campaign), implement SMS consent flows and logging in GHL
- [ ] Update Privacy/Terms to reflect SOP v2; publish data retention/deletion policy; map data flows (Stripe/GHL/Proof)
- [ ] Sign/confirm DPAs with vendors; create incident response + breach notification runbook
- [ ] Implement immutable audit trail for bookings/notarial actions and payout edits
- [ ] WCAG 2.2 AA accessibility audit for landing/booking/RON pages; fix blockers
- [ ] Add error tracking + uptime/status + synthetic monitors; define on-call schedule and escalation SLAs
- [ ] Define/verify backup/restore and disaster recovery for app + third-party data
- [ ] Automate e2e tests for booking → payment → confirmation; run on every deploy
- [ ] A/B test deposit threshold/copy; enable Stripe Radar rules; create dispute SOP
- [ ] Ad ops hygiene: budget pacing alerts, weekly negatives review, LSA dispute SOP
- [ ] Attribution rigor: UTM standards, call tracking mapping, campaign → revenue data dictionary
- [ ] Collect NPS/CSAT post-service; add "close-the-loop" workflow for detractors
- [ ] Finance ops: W-9 intake, 1099 year-end workflow, weekly payout reconciliation against Stripe
- [ ] After-hours coverage: on-call roster, response targets, customer comms templates
- [ ] Multilingual support (e.g., Spanish) for calls, key pages, and message templates
- [ ] Local SEO: citations/NAP audit, review response policy and Q&A management cadence
- [ ] Security hardening: admin 2FA, least-privilege roles, secret management, IP allowlist for admin
- [ ] Enforce RUM SLO gates in CI/CD; fail deploys if LCP/INP/CLS regress
- [ ] Evaluate/contract a backup RON provider to ensure availability


