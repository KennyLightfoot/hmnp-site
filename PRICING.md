# Houston Mobile Notary Pros — Pricing Sheet

Last updated: 2025-08-17

Authoritative source of truth: `lib/services/config.ts` and `lib/pricing/*`.

Note: Where public-facing pages differ, this document and the config files prevail.

## Mobile & RON Services

| Service ID | Display name | Base price | Included radius | Fee/mi beyond radius | Max docs | Default duration | Business hours |
|---|---|---:|---:|---:|---:|---:|---|
| `QUICK_STAMP_LOCAL` | Quick-Stamp Local | $50 | 10 mi | $0.50 | 1 | 45 min | Mon–Fri 9–17 |
| `STANDARD_NOTARY` | Standard Mobile Notary | $75 | 20 mi | $0.50 | 4 | 60 min | Mon–Fri 9–17 |
| `EXTENDED_HOURS` | Extended Hours Mobile | $125 | 30 mi | tiered | 4 | 60 min | Daily 7–21 |
| `LOAN_SIGNING` | Loan Signing Specialist | $175 | 30 mi | tiered | Unlimited | 90 min | Mon–Fri 8–18 |
| `RON_SERVICES` | Remote Online Notarization | $25/session + $10 notarial (=$35 for acknowledgments); $5 per seal | N/A | N/A | 10 | 30 min | 24/7 |
| `BUSINESS_ESSENTIALS` | Business Subscription — Essentials | $125/mo | 30 mi | $0.50 | 10 | 60 min | Mon–Fri 9–17 |
| `BUSINESS_GROWTH` | Business Subscription — Growth | $349/mo | 50 mi | $0.25 | 50 | 60 min | Mon–Fri 9–17 |

### RON details (Texas-compliant)
- Base: $25 session + $10 notarial = $35 for acknowledgments
- Per-seal: $5 per seal
- Included: Credential Analysis, KBA, audio-video recording; statewide availability; 24/7

## Add-ons and extras
- Extra documents when exceeding included max:
  - Quick‑Stamp: $5/doc
  - Standard: $10/doc
  - Extended: $10/doc
  - RON: $5/seal
  - Business Essentials: $3/doc
  - Business Growth: $2/doc
  - Loan Signing: $0 (unlimited)
- Extra signer (public UX cues): Quick‑Stamp $10 each; Standard/Extended $5 each

## Surcharges
Classic surcharges (applied by core engine):
- After‑hours (outside 9–5 for Standard): $30
- Weekend: $40
- Priority booking: $25
- Loan Signing evening/weekend: +$25
- RON after 9pm convenience: +$10

Dynamic surcharges (unified engine; restricted to `EXTENDED_HOURS` when scheduled time provided):
- Same‑day: +50%
- After‑hours: +30%
- Weekend: +10%
- Holiday: +40%

## Discounts
- First‑time customer: $15
- Referral: $20
- Volume (Standard Notary, 3+ docs): +10% of base
- Loyalty (internal): up to 20% based on customer type

## Travel policy
- Travel within included radius is free per service config.
- Tiered travel zones from ZIP 77591 (max 50 miles):
  - 0–20 mi: included (Standard)
  - 21–30 mi: +$25 (Extended/Loan include 30)
  - 31–40 mi: +$45
  - 41–50 mi: +$65
- RON has no travel fees.

## Subscriptions (Business)
- Essentials ($125/mo): up to 10 RON seals/mo; 10% off mobile rates; overage $5/seal
- Growth ($349/mo): up to 40 RON seals/mo; 10% off mobile rates; 1 free loan signing; overage $4/seal

## APIs
- Public listing: GET `/api/pricing/transparent`
- Full calculation: POST `/api/pricing/transparent` (transparent breakdown)

## Notes
- All prices USD. Taxes not included unless specified by feature.
- Subject to business rules and service area limits.


