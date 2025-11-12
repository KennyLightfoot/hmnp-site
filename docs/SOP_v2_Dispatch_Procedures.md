# SOP v2 — Dispatch Operations Playbook

**Purpose:** Provide dispatch contractors and backup owner-operators with a repeatable workflow for assigning jobs, monitoring appointments, and handling escalations for both Mobile Notary and RON services.

**Systems Covered:** HighLevel (GHL), Stripe, Google Calendar, Slack, HMNP Web App Dispatch Console, Proof.com (RON)

---

## 1. Intake to Dispatch Pipeline

1. **Lead Capture**
   - Web form → GHL pipeline `New Lead`
   - Phone call → AI receptionist transcript + call recording upload
   - GBP/LSA/Yelp lead → Zapier/GHL integration pushes into `New Lead`
2. **Qualification Review** (within 15 minutes)
   - Verify required intake fields per `[docs/SOP_v2.md](SOP_v2.md)` §1.1
   - Confirm radius & service type eligibility
   - Ensure deposit link sent for services ≥ $100 or any same-day/after-hours
3. **Move to Scheduling**
   - Once deposit authorized (Stripe payment intent `requires_capture`), advance deal to `Scheduling`
   - Auto-trigger dispatch scoring via backend job (`dispatch:score`) to propose top 3 contractors

---

## 2. Auto-Assignment Workflow

1. Dispatch console lists pending jobs with:
   - Service modality, location, desired window, deposit status, urgency flags
   - Suggested contractors sorted by proximity, availability, QA rating
2. **Assignment Rule Set**
   - Assign to first available contractor meeting criteria:
     - Active status, compliance docs current, skills match
     - Travel tier cost acceptable (auto-calculated)
     - No conflicting job within 90 minutes of requested window
3. **Confirmation Loop**
   - System sends SMS + push notification: "HMNP Dispatch Assignment" with accept/decline link
   - Contractor must respond within 10 minutes; otherwise escalate to runner-up
4. **Calendar Sync**
   - On acceptance, push event to shared Google Calendar with travel buffer (30 minutes pre, 15 minutes post)
   - Update GHL opportunity stage to `Assigned`

---

## 3. Monitoring & Check-Ins

- **T-24h:** Automated reminder to contractor (GHL workflow) requesting confirmation
- **T-2h:** Dispatch verifies travel plan; confirm documents received (loan packet, RON credentials)
- **T-30m:** SMS check-in with contractor; if no response within 5 minutes, initiate escalation tree
- **In-Flight:** Track GPS via optional location-sharing link for hospital or high-security visits

---

## 4. Escalation Tree & Templates

### 4.1 Contractor No Response / Decline
1. Send alternate assignment to next ranked contractor
2. Notify client: "We are confirming your notary; expect an update shortly"
3. Update owner via Slack #dispatch-alerts if replacement required

### 4.2 Contractor Delay (>10 minutes)
- Template: "Your notary is en route and running approximately X minutes behind due to Y. We appreciate your patience."
- Offer discount if delay >20 minutes and caused by HMNP

### 4.3 Client No-Show
1. Contractor waits 15 minutes; attempts phone call twice
2. Dispatch attempts direct contact; if unsuccessful, mark as no-show and apply policy charges
3. Log outcome in QA form; attach call recordings

### 4.4 Document Issues On-Site
- Contractor uploads photo or scan via secure form
- Dispatch reviews and coordinates with client; escalate to owner if legal interpretation needed

Templates reside in GHL `Library > Templates > Dispatch` with EN/ES variants.

---

## 5. Special Handling

### 5.1 Loan Signing Packages
- Confirm full document receipt 12 hours prior
- Ensure contractor printed dual copies if required
- Allocate 2-hour table block + 30-minute buffer

### 5.2 Hospital / SNF Assignments
- Require facility contact and access instructions
- Confirm parking logistics and PPE requirements
- Allow +15 minutes buffer for security checkpoints

### 5.3 RON Sessions
- Contractors must run tech check 1 hour prior
- Provide backup dial-in number for client if Proof.com link fails
- Dispatch monitors session transcript availability post-completion

---

## 6. Daily & Weekly Routines

### Daily
- 8:00 AM: Review `New Lead` + `Scheduling` stages; clear backlog
- 12:00 PM: Spot-check afternoon appointments for document readiness
- 6:00 PM: Confirm next-day schedule; send summary to owner
- Close of business: Update incident log and outstanding escalations

### Weekly
- Monday: Sync payouts with finance; reconcile completed jobs vs ledger
- Wednesday: Review utilization report (goal 70–85% load)
- Friday: Prep weekend coverage roster; confirm after-hours availability

---

## 7. Metrics & Reporting

- **Assignment SLA:** 90% of qualified leads assigned within 60 minutes
- **Response Time:** Contractor acceptance within 10 minutes (track via audit log)
- **Coverage:** Maintain ≥2 available contractors per primary ZIP cluster (77591, 77590, 77573, 77058)
- **Escalations:** <5% of jobs require owner intervention

Weekly report auto-generated to owner dashboard summarizing:
- Open leads >24h
- Assignment SLA compliance
- No-shows/cancellations with reason codes
- Contractor performance flags (QA issues, response delays)

---

## 8. Tool Access & Permissions

- Dispatch contractors use least-privilege GHL accounts (pipeline + automations only)
- Stripe limited to payment intents view; refunds handled by owner/finance
- Slack access restricted to #dispatch-alerts and #field-support channels
- All access reviewed quarterly; revoke inactive accounts >30 days

---

## 9. Version Control

- Managed through Git (`docs/SOP_v2_Dispatch_Procedures.md`)
- Update log maintained in Appendix B of `[docs/SOP_v2.md](SOP_v2.md)`
- Any procedural changes require QA sign-off and owner approval
