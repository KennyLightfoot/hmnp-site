# Houston Mobile Notary Pros — Unified Master Pricing Model

**Last updated:** 2026-02-17
**Authoritative source:** This file + `HMNP-Unified-Master-Pricing-Model.docx`
**Code source of truth:** `lib/services/config.ts` and `lib/pricing/*`

> Where public-facing pages differ from this document, **this document prevails**.
> This file supersedes the previous PRICING.md, fee-schedule.md, and client-fee-explanation.md.

---

## Texas Statutory Compliance (§406.024)

All receipts MUST separate statutory notarial fees from service fees.

| Notarial Act | Texas Max | Our Fee | Citation |
|---|---:|---:|---|
| Acknowledgment (first signature) | $10.00 | $6.00 | §406.024 |
| Each additional signature | $1.00 | $1.00 | §406.024 |
| Jurats / Oaths / Affirmations | $10.00 | $8.00 | §406.024 |
| Depositions (per 100 words) | $1.00 | $1.00 | §406.024 |
| Certificates under seal | $10.00 | $10.00 | §406.024 |
| RON Online Session Fee | $25.00 | $25.00 | §406.111 |
| Travel / Admin / Convenience | Unregulated | See below | TX SOS Guidance |

**SB 693 Compliance (effective Sept 2025):** Traditional notarization records must be retained for **10 years** (up from 5). RON retention remains 5 years per §406.108(c).

---

## Core Services

| Service ID | Display Name | Base Price | Radius | Max Docs | Duration | Hours |
|---|---|---:|---:|---:|---:|---|
| `STANDARD_NOTARY` | Standard Mobile Notary | **$85** | 20 mi | 4 | 60 min | Mon-Fri 9-17 |
| `EXTENDED_HOURS` | Extended Hours Mobile | $125 | 30 mi | 4 | 60 min | Daily 7-21 |
| `LOAN_SIGNING` | Loan Signing Specialist | $175 | 30 mi | Unlimited | 90 min | Mon-Fri 8-18 |
| `RON_SERVICES` | Remote Online Notarization | $35* | N/A | 20 | 30 min | 24/7 |
| `STARTER_PARTNER` | Starter Partner Subscription | $199/mo | 20 mi | 15/mo | 60 min | Mon-Fri 9-17 |
| `GROWTH_PARTNER` | Growth Partner Subscription | $499/mo | 30 mi | 50/mo | 60 min | Daily 7-21 |
| `ENTERPRISE_PARTNER` | Enterprise Partner Subscription | $1,199/mo | 40 mi | 150/mo | 60 min | 24/7 |

*\*RON basePrice of $35 bundles $25 session + $10 notarial act. Display as "From $25" on website.*

### RON Details (Texas-Compliant)
- Base: $25 session + $10 notarial = $35 for acknowledgments
- Per additional seal: $10 (sealPrice: 10)
- Per additional signer: $15 (signerFee: 15)
- Remote witness service: $25 (witnessFee: 25)
- Estate Planning Bundle: $75 (2 signers + 5 seals)
- Real Estate Seller Package: $125 (2 signers + unlimited seals)
- After 9 PM surcharge: +$10
- 2-Hour Rush Priority: +$15
- **Average target ticket: $45-$55**

---

## Add-Ons & Extras

| Add-On | Standard | Extended | RON | Loan Signing |
|---|---:|---:|---:|---:|
| Extra document (beyond included) | $10/doc | $10/doc | $10/seal | $0 (unlimited) |
| Extra signer | $5 each | $5 each | $15 each | Included (up to 4) |

### Subscription Add-Ons
| Tier | Extra Stamp Fee | Extra Loan Signing | Extra Travel |
|---|---:|---:|---|
| Starter ($199) | $8 each | N/A | +$0.50/mi beyond 20mi |
| Growth ($499) | $7 each | $140 each | +$0.50/mi beyond 30mi |
| Enterprise ($1,199) | $6 each | $130 each | +$0.50/mi beyond 40mi |

---

## Surcharges

### Static Surcharges (applied by core engine)
- After-hours (outside 9-5 for Standard): **$30**
- Weekend (Sat/Sun): **$40**
- Priority booking: **$25**
- Loan Signing evening/weekend: **+$25**
- RON after 9pm convenience: **+$10**
- Same-day booking: **+50% of base**

### Weather Surcharge
- Severe weather fuel surcharge: **$0.65/mile** beyond service area

---

## Travel Policy

Travel from ZIP 77591:

| Zone | Distance | Fee |
|---|---|---:|
| Primary (free) | 0-20 miles | Included (Standard) |
| Extended Zone 1 | 21-30 miles | +$25 |
| Extended Zone 2 | 31-40 miles | +$45 |
| Extended Zone 3 | 41-50 miles | +$65 |
| RON | N/A | No travel fees |

---

## Specialty Services

| Service | Rate | Notes |
|---|---:|---|
| Hospital / Jail / Facility Visit | $150+ | Starting rate |
| Apostille Services | $75 + state fees | **Updated from $35** |
| Apostille: Expedited Processing | +$75 | |
| Apostille: Document Preparation | $20/doc | |
| Background Check Verification | $55 | |
| Wedding Certificate Expediting | $75 | |
| Medallion Signature (High-Risk) | $150 | **Updated from $95** |
| Bilingual Services (Span/Eng) | +$20 | |
| Weekly On-Site Office Day | $699/mo | 4 half-days, 25 notarizations each |
| Secure Cloud Document Storage | $15/mo | |
| Printing - B&W | $0.30/pg | |
| Printing - Color | $1.00/pg | |
| Basic Fax/Scan | $15 | |
| Secure Email Delivery | $10 | |
| USPS Certified Mail | $20 | |

---

## Loan Signing Volume Pricing (Title Companies)

| Volume Tier | Price | Subcontractor Payout | Company Margin |
|---|---:|---:|---:|
| 1-9 signings/month (retail) | $175 | $125-$135 | $40-$50 |
| 10-24 signings/month | $160 | $125-$130 | $30-$35 |
| 25+ signings/month | $150 | $120-$125 | $25-$30 |

**HARD FLOOR: Never accept below $125 net.**

---

## Bulk Prepaid Packages

Valid 3-6 months. Discounts apply to service fees only, not statutory notarial fees.

| Package | Notarizations | Price | Per Notarization |
|---|---:|---:|---:|
| Starter Pack | 20 | $249 | $12.45 |
| Growth Pack | 50 | $549 | $10.98 |
| Enterprise Pack | 100 | $999 | $9.99 |

---

## Professional Industry Packages

| Package | Base Rate | Key Includes | Target |
|---|---:|---|---|
| Title Company Partnership | $125/mo + volume | Priority scheduling, dedicated line | Title & escrow |
| Business Concierge | $200/mo | 10 notarizations, 2x on-site visits | Corporate HR |
| Healthcare Provider | $175/mo | HIPAA-compliant, 90-min emergency | Hospitals, clinics |
| Education Institution | $150/mo | Student ID verification, campus hours | Universities |
| Real Estate Developer | $250/mo | Multi-site, lien releases, emergency weekends | Developers |

---

## Discounts

| Discount | Amount | Code Reference |
|---|---:|---|
| First-time customer | $15 off | firstTime: 15 |
| Referral | $20 credit | referral: 20 |
| Volume (3+ docs, Standard) | +10% of base | volume: 0.10 |

---

## Deposit & Cancellation Policy

### Deposits
| Service Type | Deposit | Conditions |
|---|---|---|
| RON | None | Low friction for conversions |
| Mobile (any) | 50% of total | All mobile appointments |
| Loan Signing (direct) | 50% of total | Remainder at signing |
| Title/Signing Services | None | Net-15 invoicing |
| Cash payments | $50 security hold | Exact change required |
| Subscriptions | First month upfront | Monthly auto-billing |

### Cancellation
| Scenario | Fee |
|---|---|
| 24+ hours notice | Full refund |
| Less than 2 hours | $35 |
| No-show | $50 + travel |
| Signer refuses | $75 documentation fee |
| Weather emergency | 15% reschedule discount |

### Security Holds
| Type | Hold |
|---|---:|
| Essential weekday (<15mi) | $50 |
| Priority (after 5pm or >15mi) | $75 |
| Weekend / Holiday | $100 |

---

## Internal: RON Margin Model

Per city target: 150-200 sessions/month

| Item | Per Session |
|---|---:|
| Average customer payment | $50.00 |
| Subcontractor payout | $22-$25 |
| Platform/processing | ~$3.00 |
| **Gross margin** | **$22-$25 (44-50%)** |

---

## Internal: Revenue Targets (Per City)

| Source | Volume | Rate | Gross |
|---|---|---:|---:|
| RON Sessions | 175/mo | ~$50 avg | $8,750 |
| Loan Signings | 10/mo | $175 | $1,750 |
| Starter Subs | 4 clients | $199/mo | $796 |
| Growth Subs | 3 clients | $499/mo | $1,497 |
| Enterprise Sub | 1 client | $1,199/mo | $1,199 |
| Specialty | Misc | Various | ~$500 |
| **TOTAL** | | | **~$14,492** |

Owner net margin target: $6,000-$8,500 per city.

---

## APIs
- Public listing: GET `/api/pricing/transparent`
- Full calculation: POST `/api/pricing/transparent`

## Legal
"I AM NOT AN ATTORNEY LICENSED TO PRACTICE LAW IN TEXAS AND MAY NOT GIVE LEGAL ADVICE OR ACCEPT FEES FOR LEGAL ADVICE." -- Texas Government Code §406.017

---

*This file complies with Texas Government Code §406.024. Service fees are separate from statutory notarial fees.*
