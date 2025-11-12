<!-- QA Checklist v2 -->
# Quality Assurance Checklist

This checklist is used inside the QA workflow for every completed appointment. Each step must be marked complete with supporting evidence.

## 1. Appointment Verification
- Booking ID matches contractor submission.
- Service type aligned with executed work.
- Time stamps within SLA tolerance (±15 minutes).

## 2. Documentation Review
- **Journal Entry**: confirms signer names, IDs, document type, and seal number.
- **Seal Photo**: clear image uploaded; legible commission number.
- **Document Count**: matches intake record; note discrepancies.

## 3. Client Confirmation
- Post-service call/SMS logged.
- Satisfaction rating captured (1–5 scale).
- Issues escalated to dispatch lead if <4 rating.

## 4. Payment Validation
- Stripe payment intent succeeded or fallback collection recorded.
- Deposit + balance reconciliation stored in payout ledger.
- Any refunds documented with reason code.

## 5. Compliance Check
- Travel tier recorded correctly.
- Weekend/after-hours surcharge applied when applicable.
- RON session logs (if applicable) stored with access link.

## 6. Final Sign-Off
- QA reviewer initials and timestamp.
- Incident flag toggled if follow-up required.
- Triggers review automation if client rating ≥4.

Store QA artifacts for 7 years in compliance vault. Review aggregated QA scores weekly.

