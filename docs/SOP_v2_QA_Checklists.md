# SOP v2 — Quality Assurance Checklists

These checklists standardize QA review for mobile and remote notarization appointments. QA contractors must audit a minimum of 10% of weekly jobs (all jobs for new contractors during first 30 days).

---

## 1. Mobile Notary QA Checklist

1. **Booking Metadata**
   - [ ] Service type matches appointment (Standard, Extended Hours, Loan Signing)
   - [ ] Travel tier and surcharges correctly applied
   - [ ] Deposit captured or documented exception
2. **Journal Entry Review**
   - [ ] Signer names and ID numbers recorded
   - [ ] Document titles logged accurately
   - [ ] Fee breakdown recorded (base, travel, surcharges, witness)
3. **Seal Verification**
   - [ ] Photo of sealed document uploaded
   - [ ] Stamp impression legible and matches commission info
   - [ ] Any embossed seal captured if required
4. **Document Completion**
   - [ ] Document count matches intake scope
   - [ ] Corrections initialed and dated
   - [ ] Copies left with client when applicable
5. **Client Confirmation**
   - [ ] Satisfaction checkbox or signature in closeout form
   - [ ] Notes on any issues, delays, or accommodations
6. **Payment & Receipts**
   - [ ] Stripe payment confirmed (or cash receipt uploaded)
   - [ ] Refunds or adjustments documented with reason
7. **Compliance**
   - [ ] Notary commission active on service date
   - [ ] E&O coverage verified in contractor record
   - [ ] Incident log updated if exceptions occurred

QA Outcome:
- **Pass:** All items verified
- **Conditional Pass:** Minor issue logged with remediation task
- **Fail:** Material breach; suspend payouts pending review

---

## 2. Loan Signing Specialist Addendum

Additional checks for mortgage/real estate packages:
- [ ] HUD/CD totals verified against intake notes
- [ ] Affidavits and jurats executed correctly
- [ ] Scan-backs uploaded within 2 hours (if required)
- [ ] Shipping label used and tracking logged

---

## 3. RON Session QA Checklist

1. **Platform Log**
   - [ ] Proof.com session record accessible
   - [ ] KBA + credential analysis passed (or manual override documented)
2. **Identity Verification**
   - [ ] Backup knowledge-based questions recorded for overrides
   - [ ] Audio/video quality sufficient for ID inspection
3. **Document Handling**
   - [ ] Digital seal applied correctly
   - [ ] Downloaded documents stored in encrypted archive
   - [ ] Seal audit trail exported to compliance storage
4. **Client Communication**
   - [ ] Confirmation email with session recording link delivered
   - [ ] Post-session FAQ or support link included
5. **Security Checks**
   - [ ] Session took place in private environment (no unauthorized parties)
   - [ ] Platform incident reports (if any) reviewed and resolved

---

## 4. QA Remediation Workflow

- Create task in GHL pipeline `QA Follow-Up`
- Assign remediation deadline (default 3 business days)
- Track completion status via internal dashboard; escalate overdue tasks to owner
- Repeat infractions (>2 in 60 days) trigger retraining or suspension review

---

## 5. Documentation & Storage

- Store completed checklists in secure drive (`QA/Year/Month/JobID`)
- Summaries ingested into weekly owner KPI report
- Maintain version history for audit readiness (update log appended below)

---

### Revision Log
- 2025-11-12: Initial SOP v2 QA checklist release
