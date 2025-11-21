<!-- HMNP SOP v2 - Generated November 12, 2025 -->
# Houston Mobile Notary Pros — SOP v2

This document supersedes prior SOP versions and codifies all operational policies required for contractor-led delivery of Mobile Notary and Remote Online Notary (RON) services. Policies here inherit from `SOP_ENHANCED.md` and incorporate the RevOps initiatives for hands-off execution.

**Updated:** Includes network notary hiring, onboarding, and job distribution procedures (First-Come-First-Serve system).

## 1. Intake & Qualification

### 1.1 Required Intake Fields
- Client full name, phone, and email.
- Service location (physical address for mobile, `Remote` for RON).
- Document count, type, and signing party count.
- Preferred appointment window(s) with timezone.
- Government-issued ID image upload or verification flag.
- For RON: device compatibility confirmation and KBA readiness acknowledgement.

### 1.2 Eligibility & Risk Checks
- Validate service radius against live geofencing data (`lib/maps/sop-service-area.ts`).
- Cross-check blacklist and outstanding balances (Stripe + GHL).
- Confirm document type is within Texas allowed notarial acts.
- Reject if insufficient lead time per service rules (see 1.3).

### 1.3 Same-Day, After-Hours, & Capacity Controls
- **Same-Day Mobile**: auto-escalate if request received after 12:00 PM for same-day completion. Deposit required and urgency bonus applied.
- **After-Hours**: 9:00 PM – 7:00 AM requests incur after-hours fee and require two-pass availability confirmation.
- **Capacity Gate**: block bookings when contractor pool coverage ratio < 1.5 active notaries per time slot or booking queue > 6 pending jobs.

## 2. Dispatch & Scheduling

### 2.1 Network Notary Assignment (First-Come-First-Serve)

**When to Use Network Distribution:**
- Booking marked "Send to Network" by admin/staff
- No specific notary assigned
- Booking requires mobile notary service
- Standard or extended-hours service types

**Eligibility Criteria for Network Notaries:**
1. Active notary commission (not expired)
2. Valid E&O insurance (not expired)
3. Onboarding status: COMPLETE
4. Availability status: AVAILABLE
5. Geographic match:
   - State licensed matches booking state
   - Service radius covers booking location
   - Preferred ZIP codes match (if specified)

**Job Offer Process:**
1. System creates `JobOffer` records for all eligible notaries
2. Offers expire after 30 minutes (configurable)
3. Notaries receive email notification with job details
4. First notary to accept gets the assignment
5. All other offers automatically cancelled
6. Booking assigned to accepting notary
7. Customer notified of notary assignment

**Manual Assignment Override:**
- Admin/staff can manually assign specific notary at any time
- Manual assignment cancels all pending offers
- Use when specific notary expertise required or customer preference

### 2.2 Auto-Assignment Logic (Legacy/Manual)
1. Identify eligible contractors within service radius (default 15 miles, extend to 50 miles with travel tiers).
2. Filter by skill profile (`standard`, `extended-hours`, `loan-signing-specialist`, `ron-agent`).
3. Match availability window, considering travel buffer (15 minutes default).
4. Prioritize contractors by:
   - Deposit confirmed,
   - Proximity (ascending),
   - SLA performance score (descending),
   - Least recently assigned.

### 2.3 Escalation Tree
- **Contractor No-Show**: reassign within 10 minutes, notify client via SMS + email, log incident.
- **Client No-Show**: follow cancellation policy (Section 3) and submit QA note.
- **Document Issues**: escalate to dispatch lead; use template communications in `docs/Dispatch_Templates.md`.
- **Network Offer Expired**: If no notary accepts within 30 minutes, escalate to manual assignment or extend offer window.

### 2.4 Communication Templates
- Stored in GHL sequences and mirrored in `docs/Dispatch_Templates.md`.
- Include SMS/email copy for confirmations, reminders, reassignments, and closures.
- Network notaries receive job offer emails with booking details and expiration time.

## 3. Payment & Policies

### 3.1 Deposits & Thresholds
- Services ≥ $100 require 50% deposit at booking (Stripe Payment Intent).
- Loan Signing Specialist always requires deposit.
- Deposits auto-forfeit if cancelled inside 24-hour window.

### 3.2 Cancellation / No-Show
- **Standard Window**: 24 hours before appointment.
- **Client-Initiated inside window**: retain deposit + travel already incurred.
- **Contractor-Initiated**: no penalty to client; contractor incident review.

### 3.3 Surcharges & Travel
- Weekend surcharge auto-applies for Saturday/Sunday bookings.
- After-hours fee applies 9:00 PM – 7:00 AM.
- Travel tier table:
  - 0–15 miles: included.
  - 16–30 miles: +$25.
  - 31–40 miles: +$45.
  - 41–50 miles: +$65 (requires dispatch lead approval).

### 3.4 On-Site Fallback Collection
- Mobile agents equipped with Stripe Terminal or secure payment link.
- Collect outstanding balance before notarization proceeds.

### 3.5 Corporate / B2B Flow
- Net-15 invoicing via Stripe Billing.
- Require signed service agreement and billing contact.

## 4. Field Execution & QA

### 4.1 Mobile Notary Kit Checklist
- Commission certificate + journal.
- Two ink pens (blue + black) + spare.
- Embosser + inked seal.
- Portable scanner / mobile scanning app ready.
- PPE (mask optional) for sensitive environments.

### 4.2 RON Checklist
- Verify credential analysis + KBA passed.
- Confirm document upload integrity.
- Record session per Proof.com requirements.

### 4.3 Five-Step QA Closeout
1. Journal entry completed with signer details.
2. Embossed seal photo captured and uploaded.
3. Document count verified and matched to intake.
4. Client satisfaction confirmation logged.
5. Closeout form submitted via web app QA workflow.

## 5. Network Notary Management

### 5.1 Notary Application & Hiring Process

**Application Submission:**
- Applications submitted via `/work-with-us` public page
- Required information:
  - Personal details (name, email, phone)
  - Notary commission details (number, state, expiry)
  - States licensed and counties served
  - Service types offered
  - E&O insurance information
  - Years of experience
  - Availability preferences

**Application Review:**
- Admin reviews applications in `/admin/notary-applications`
- Status workflow: PENDING → UNDER_REVIEW → APPROVED/REJECTED → CONVERTED
- Review criteria:
  - Valid commission in target service areas
  - E&O insurance coverage
  - Experience level appropriate for service types
  - Geographic coverage matches business needs

**Conversion to User Account:**
- Approved applications converted to user accounts with NOTARY role
- Notary profile automatically created with application data
- Temporary password generated and sent via email
- Onboarding status set to IN_PROGRESS

### 5.2 Notary Onboarding Checklist

**Required Steps (all must be completed):**
1. **Commission Verification**
   - Upload commission certificate
   - Verify commission number and expiry date
   - Confirm state(s) of commission

2. **E&O Insurance**
   - Upload insurance certificate
   - Provide provider name, policy number, expiry date
   - Minimum coverage: $25,000 (verify current requirements)

3. **Background Check**
   - Complete background check verification
   - Upload background check document
   - Status must be APPROVED before activation

4. **W-9 Form**
   - Submit W-9 form for tax purposes
   - Required for contractor payments
   - Upload signed form

5. **Profile Completion**
   - Set base address and ZIP code
   - Define service radius (default: 25 miles)
   - Specify states licensed and counties served
   - Set availability preferences (hours, days)
   - Add languages spoken and special certifications

**Onboarding Completion:**
- Notary completes checklist and submits for review
- Admin reviews completed profile
- Admin activates notary (sets `is_active: true`, `onboarding_status: COMPLETE`)
- Notary can now receive job offers

### 5.3 Job Offer System

**Offer Creation:**
- Triggered when booking marked "Send to Network"
- System identifies eligible notaries based on:
  - Active commission and E&O insurance
  - Geographic coverage (state, ZIP, service radius)
  - Availability status (must be AVAILABLE)
  - Onboarding status (must be COMPLETE)

**Offer Distribution:**
- All eligible notaries receive offer simultaneously
- Email notification sent with:
  - Booking details (service, time, location, price)
  - Expiration time (default: 30 minutes)
  - Link to accept/decline in notary portal

**Acceptance Process:**
- First-come-first-serve: first notary to accept gets assignment
- Atomic transaction ensures only one acceptance
- Other offers automatically cancelled
- Booking assigned to accepting notary
- Customer notified of notary assignment

**Offer Expiration:**
- Offers expire after 30 minutes (configurable)
- Expired offers cannot be accepted
- If no acceptance: escalate to manual assignment or extend window

**Rate Limiting:**
- Maximum 5 job offer acceptances per minute per notary
- Prevents abuse and ensures fair distribution
- Rate limit headers included in API responses

### 5.4 Notary Profile Management

**Availability Status:**
- AVAILABLE: Active and accepting offers
- BUSY: Temporarily unavailable (has active bookings)
- UNAVAILABLE: Not accepting new offers
- ON_LEAVE: Extended absence (vacation, etc.)

**Profile Updates:**
- Notaries can update availability, service areas, preferences
- Changes take effect immediately for new offers
- Existing offers not affected by status changes

**Performance Tracking:**
- Acceptance rate
- Completion rate
- Customer satisfaction scores
- Response time to offers
- No-show incidents

## 6. Post-Service & Reviews

- Automated receipt and payment confirmation immediately.
- Review request triggered 24 hours post-service (GHL automation).
- Reactivation campaigns at 7 days (upsell) and 30 days (repeat business).
- Negative feedback auto-escalates to QA lead.

## 7. Compliance & Data Governance

- Maintain Texas fee schedule compliance.
- Retain digital records for 7 years with scheduled purge + verification.
- Encrypt sensitive data in transit and at rest per SOP_ENHANCED controls.
- Follow incident reporting for privacy breaches within 24 hours.

## 7. Contractor Payouts

- Compensation structure = Base fee + travel tier share + urgency bonus.
- Weekly payouts automated via Stripe Connect or ACH batch.
- Dispute process: contractor submits claim within 5 business days; dispatch lead resolves within 3 business days.

## 8. Technology & Automation

- Booking system uses enhanced flow `/booking/enhanced`.
- GHL automations manage communications, deposits, and review ask.
- Stripe handles deposits, invoicing, and corporate billing.
- Proof.com powers RON sessions with audit logs.
- Real User Monitoring (RUM) tracks Core Web Vitals with SLO dashboard.

## 9. Governance & Review

- SOP review quarterly or upon regulatory changes.
- Maintain change log in `CHANGELOG.md` under `docs`.
- Contractors acknowledge SOP updates via onboarding portal.

# Houston Mobile Notary Pros — SOP v2

**Version:** 2.0  
**Last Updated:** 2025-11-12  
**Applies To:** Owner, Dispatch, Field Notaries (Mobile + RON), Quality Assurance, RevOps Contractors

---

## Table of Contents
1. Intake & Qualification
2. Dispatch & Scheduling
3. Payment & Policies
4. Field Execution & QA
5. Post-Service & Reviews
6. Compliance & Data
7. Contractor Payouts
8. Role Guides
9. Integrations & Automations
10. Appendices

---

## 1. Intake & Qualification

### 1.1 Required Intake Data
Collect the following via the booking form, phone intake, or chat automations:
- Legal name(s) as shown on government-issued ID
- Two contact methods (mobile + email)
- Document type(s) and total document count
- Signer count and witness requirements
- Service modality (Standard Mobile, Extended Hours, Loan Signing Specialist, RON)
- Physical signing address (validated) or confirmation of RON session
- Desired appointment window (start/end), urgency indicator, and timezone confirmation
- Deposit authorization (Stripe) for bookings ≥ $100
- Same-day or after-hours flags (auto-surface fees)
- Accessibility and security requirements (e.g., gated community, hospital access)
- Notes for additional services (printing, scanning, courier)

### 1.2 Eligibility Checks
- **Geofencing:**
  - Standard Mobile: within 20 miles from ZIP 77591
  - Extended Hours & Loan Signing: within 30 miles from ZIP 77591
  - RON: State of Texas signers only; verify ID via Proof.com
- **Capacity Gating:**
  - Hard limit of 3 concurrent field appointments per notary; 1 concurrent RON session
  - Auto-hold new leads when utilization ≥ 85%; trigger overflow queue for contractor bench
- **Same-Day & After-Hours Rules:**
  - Same-day accepted until 3:00 PM local if capacity allows; apply $25 same-day surcharge
  - After-hours (9:00 PM–7:00 AM) requires Extended Hours tier + $50 surcharge; deposit is mandatory regardless of ticket size
- **Document Fit:**
  - Reject documents requiring legal advice or beyond notarial authority
  - Loan packages capped at 2 hours on-site; escalate longer appointments to owner review
- **ID Verification:**
  - Physical: inspect valid government-issued ID; capture journal entry
  - RON: rely on Proof.com KBA + credential analysis; fallback to manual vetting if fail occurs twice

### 1.3 Intake Workflows
- Intake form submissions flow to GHL pipeline `New Lead > Intake Review`
- Missed calls trigger immediate SMS + booking link auto-response
- Owner dashboard highlights intakes requiring manual review (missing ID, outside radius, escalation triggers)

---

## 2. Dispatch & Scheduling

### 2.1 Auto-Assignment Logic
1. Normalize service request (ZIP, timeframe, modality, skill requirement).
2. Filter contractor roster:
   - Active status, background check current, E&O ≥ $100k
   - Skill tags: `standard`, `loan-signing`, `ron`
   - Availability window covering requested slot
3. Score candidates:
   - Distance from assignment origin (closest preferred)
   - Utilization (lowest load favored)
   - Performance rating (QA compliance ≥ 95%, review score ≥ 4.7)
4. Auto-assign top match; notify via SMS + GHL mobile app task
5. If no match, escalate to owner queue with suggested bench contractors

### 2.2 Dispatch Rules
- **ZIP Radius:**
  - Tier 1: 0–20 miles -> Standard
  - Tier 2: 21–30 miles -> Extended Travel Fee $25
  - Tier 3: 31–40 miles -> Extended Travel Fee $45
  - Tier 4: 41–50 miles -> Extended Travel Fee $65 (max service area)
- **Time Windows:**
  - Maintain 30-minute arrival buffer for travel
  - Allow 15-minute grace for signers; dispatch to call if delay exceeds 10 minutes
- **Skill Matching:**
  - Loan Signing requires certified LSA tag
  - Hospital/SNF visits require medical access clearance
  - RON requires platform certification + KBA proficiency training

### 2.3 Escalation Tree
- **No-Show Contractor:**
  1. Auto-alert owner & dispatch at T-30
  2. Trigger standby contractor list
  3. Notify client with ETA update and apology template
- **Client Reschedule/Cancel Within 24h:**
  - Apply cancellation policy (see §3.2) and release contractor
- **Document Issues On-Site:**
  - Field notary contacts dispatch via Slack #field-support
  - Dispatch consults owner if legal guidance or exception required

### 2.4 Communication Templates
- Stored in GHL library: confirmation, reschedule, delay, no-show, completion follow-up
- Ensure bilingual (English/Spanish) variants for high-volume templates

---

## 3. Payment & Policies

### 3.1 Deposits & Pricing
- **Deposits:**
  - 50% deposit for bookings ≥ $100 (auto-charged via Stripe link)
  - Same-day, after-hours, and loan signings always require deposit regardless of value
- **Standard Rates:**
  - Standard Mobile: $75 base (includes 20 miles, 2 signers, ≤4 documents)
  - Extended Hours Mobile: $125 base (includes 30 miles, 2 signers, ≤5 documents)
  - Loan Signing Specialist: $175 flat (120-minute table time, ≤4 signers)
  - RON Session: $35 base + $5 per seal
- **Add-ons:** Printing ($0.50/page), scanning ($10 bundle), witness ($35 each)

### 3.2 Cancellations & No-Shows
- More than 24 hours: refund deposit minus $15 processing
- 24–6 hours: retain deposit or charge minimum $75 if no deposit
- Less than 6 hours / no-show: charge 100% of quoted fee
- Weather exceptions granted at owner discretion; apply 15% goodwill credit if HMNP initiates reschedule

### 3.3 Weekend & After-Hours Fees
- Weekend surcharge: +$40 (Saturday/Sunday)
- After-hours surcharge: +$50 (9:00 PM–7:00 AM window)
- Cumulative with travel fees and urgency surcharges

### 3.4 On-Site Collection & Refunds
- Field notaries carry mobile POS (Stripe Tap to Pay); fallback to QR code payment link
- Cash accepted only with exact change; log in Stripe as cash payment with receipt upload
- Refunds processed within 3 business days; document reason in GHL & Stripe notes

### 3.5 Corporate Terms
- Net-15 available with signed MSA and card on file as backup
- Send auto-generated invoice; sync to payout ledger for contractor compensation once payment clears

---

## 4. Field Execution & QA

### 4.1 Mobile Notary Kit Checklist
- Commission certificate + physical/notary journal
- Two ink stamps (primary + backup) and embossing seal (if required)
- Blue/black pens, retractable stapler, extra paper clips
- Portable scanner or scan app with encryption
- PPE and sanitizer (hospital visits)
- Printer access confirmation for loan packages

### 4.2 RON Session Checklist
- Verify customer completed ID upload + KBA in Proof.com
- Confirm audio/video equipment test via staging session
- Ensure stable internet >10 Mbps and backup hotspot
- Screen recording enabled when platform allows; archive transcripts
- Have fallback manual ID verification questions ready

### 4.3 Five-Step QA Workflow
1. **Journal Entry:** Capture signer info, document title, ID reference, fee
2. **Seal Photo:** Snap photo of stamped page; upload to secure storage (7-year retention)
3. **Document Count Check:** Verify completed document set before leaving/ending session
4. **Client Confirmation:** Verbal confirmation scripted; log satisfaction in GHL task
5. **Closeout Submission:** Complete QA form inside web app (auto-triggers post-service automations)

### 4.4 Owner & QA Oversight
- QA lead audits 10% of weekly jobs (higher for new contractors)
- Flagged jobs generate remediation tasks with due dates
- Repeat QA failures (>2 within 60 days) trigger contractor suspension review

---

## 5. Post-Service & Reviews

### 5.1 Automated Sequence
- Immediate: Payment receipt & completed service email (Stripe + GHL)
- 24 hours: Review request SMS + email (Google, Yelp)
- 7 days: Reactivation tip (reminder of services, referral ask)
- 30 days: Long-tail nurture (business accounts, estate planners, RON upsell)

### 5.2 Issue Resolution
- Disputes logged in GHL `QA Follow-Up` pipeline
- Owner responds within 4 business hours; maintain log for exit-readiness documentation

### 5.3 Referral & Partner Touchpoints
- Tag satisfied clients for partner referrals (title companies, attorneys)
- Auto-generate introduction email with tracked CTA using GHL campaigns

---

## 6. Compliance & Data

- Follow Texas fee table (Government Code §406.024); display on website and intake forms
- Retain journals and copies for 7 years; schedule automated deletion at 7y + 6m
- Encrypt all digital artifacts at rest (Stripe, Supabase, S3 buckets)
- Limit RON recordings to Proof.com; store access logs
- Adhere to HMNP Privacy Policy & OWASP best practices
- Monthly compliance checklist: commission status, insurance renewal, background check review

---

## 7. Contractor Payouts

### 7.1 Compensation Model
- Base fee per service (aligned with client pricing minus margin)
- Travel tiers: share 70% of extended travel fees with contractor
- Urgency bonus: +$25 for same-day within 6 hours; +$40 for after-hours acceptance
- Witness fees split 50/50 when contractor arranges witness

### 7.2 Payment Schedule & Method
- Weekly payouts every Monday via Stripe Connect
- Provide ledger preview by Friday 5 PM for dispute window (24 hours)

### 7.3 Dispute Process
- Contractor submits dispute via portal form; QA reviews within 2 business days
- Resolved adjustments reflected in next payout cycle; document in ledger for audit

---

## 8. Role Guides

### Owner
- Monitor daily KPI dashboard (bookings, utilization, revenue)
- Approve exceptions (over-radius, special documents, major discounts)
- Maintain contractor bench and training cadence

### Dispatch Coordinator
- Oversee auto-assignment queue; intervene on escalations
- Confirm contractor acceptance within 15 minutes
- Coordinate communication templates and schedule adjustments

### Field Notary (Mobile + RON)
- Maintain readiness (kit, device, internet)
- Follow QA steps; submit closeout promptly
- Report incidents immediately via Slack #field-support

### Quality Assurance
- Conduct audits, manage remediation tasks, update training materials
- Maintain compliance logs and version control of SOP documents

---

## 9. Integrations & Automations

- **Stripe:** Deposits, payment links, Tap to Pay, refund workflows
- **HighLevel (GHL):** Intake pipeline, automations (reminders, review asks, missed-call SMS), reporting
- **Proof.com:** RON KBA, credential analysis, recording storage
- **Google Workspace:** Shared calendar visibility, document storage, templated communications
- **Slack:** Incident alerts, dispatch escalations, QA notifications

Ensure API keys stored in environment variables and rotated every 180 days.

---

## 10. Appendices

### A. Travel & Fee Reference
| Item | Amount |
| --- | --- |
| Standard Mobile Base | $75 |
| Extended Hours Base | $125 |
| Loan Signing Base | $175 |
| RON Base | $35 |
| RON Seal | $5 (per seal) |
| Same-Day Surcharge | $25 |
| Weekend Surcharge | $40 |
| After-Hours Surcharge | $50 |
| Travel Tier 2 (21–30 mi) | +$25 |
| Travel Tier 3 (31–40 mi) | +$45 |
| Travel Tier 4 (41–50 mi) | +$65 |

### B. Intake Decision Matrix
- Auto-approve if within radius, capacity < 85%, and deposit confirmed
- Queue for review if high-risk docs, capacity ≥ 85%, or deposit declined
- Decline if outside 50-mile service area, missing valid ID, or non-notarial request

### C. Revision Log
- 2025-11-12: Initial release of SOP v2 replacing SOP_ENHANCED baseline for operational execution
