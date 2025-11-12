<!-- Dispatch Procedures v2 - November 12, 2025 -->
# Dispatch Operations Playbook v2

This playbook supplements `docs/SOP_v2.md` and provides day-to-day guidance for dispatch coordinators managing Mobile Notary and RON services.

## 1. Intake Verification
- Review booking record for completeness (required fields listed in SOP Section 1).
- Confirm deposit status, travel tier, and surcharge calculations.
- Validate contractor availability before confirming with client.

## 2. Assignment Workflow

### 2.1 Automated Queue
Orders enter the dispatch queue with metadata:
- `serviceType`
- `appointmentWindow`
- `zipCode`
- `skillRequired`
- `depositStatus`

The automation suggests top three contractors using the prioritization ladder defined in SOP Section 2.1.

### 2.2 Manual Override
- Dispatch coordinator may override automatic selection when:
  - Client requests a specific notary.
  - Travel tier outside standard thresholds.
  - Contractor performance issues require rotation.
- Document override justification in `dispatch_notes`.

## 3. Communication Cadence

| Stage | Channel | Message Source |
|-------|---------|----------------|
| Assignment Pending | SMS + Email | GHL workflow `HMNP_Assignment_Notify` |
| Assignment Confirmed | In-app + Email | Booking app `DispatchNotificationService` |
| Pre-Arrival (2h) | SMS | GHL workflow `HMNP_PreArrival_Reminder` |
| Completion | SMS + Email | Booking app on completion event |
| Reassignment | Phone + SMS template | `docs/Dispatch_Templates.md` |

## 4. Escalation Handling

### 4.1 Contractor No-Show
1. Attempt contact (phone + SMS).
2. If unresponsive within 5 minutes, trigger reassignment automation.
3. Notify client of updated ETA.
4. File incident in QA tracker.

### 4.2 Client No-Show
1. Wait 15 minutes past scheduled start.
2. Attempt contact thrice (phone + SMS).
3. If unsuccessful, mark as no-show and apply policy (SOP 3.2).
4. Update Stripe invoice, send summary email.

### 4.3 Document Discrepancy
- Coordinate via secure upload link.
- If unsolved within 20 minutes, escalate to owner-operator.

## 5. Coverage Management

- Maintain weekly roster with availability blocks.
- Ensure minimum 1.5 contractors per peak slot (weekday evenings, weekends).
- Update coverage map (`docs/Coverage_Map.xlsx` reference) weekly.

## 6. Reporting & KPIs
- Daily dispatch log exported to analytics pipeline.
- Track reassignment rate (<5%), average response time (<3 minutes), and SLA adherence (>95%).

## 7. Tools Checklist
- GHL Workflow dashboard.
- Web app dispatch console (`/admin/dispatch`).
- Slack/Teams channel `#hmnp-dispatch` for real-time updates.
- Incident tracker (`/admin/qa`).

Review this playbook quarterly and align updates with SOP revisions.

