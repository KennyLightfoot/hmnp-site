Title: HMNP — Performance Ad Brief (Single-Prompt for AI)

Goal: Generate high-performing ad copy (Search, Social, Display) for Houston Mobile Notary Pros with strict factual accuracy and brand consistency.

How to use:
- Feed this brief to your AI along with the three template files in this folder.
- Provide the campaign-specific inputs in the Inputs section before asking for variants.

Inputs (fill before use):
- Campaign objective: {{objective}} (e.g., lead gen/bookings)
- Primary service focus: {{serviceType}} (STANDARD_NOTARY | EXTENDED_HOURS | LOAN_SIGNING | RON_SERVICES)
- Geo focus: {{geo}} (e.g., Greater Houston metro + nearby suburbs)
- Offer/promo (optional): {{offer}} (e.g., $10 off first booking)
- Start/end dates (optional): {{startDate}} → {{endDate}}
- Channel(s): {{channels}} (Search | Social | Display)
- Target audience: {{audience}} (e.g., individuals needing urgent notarization, title/escrow, small biz)
- CTA priority: {{cta}} (Book Now | Call Now | Start RON Session | Get Quote)
- Compliance notes (optional): {{complianceNotes}}

Brand, value props, and proof points (authoritative sources)
- Flexible scheduling and rescheduling: see `components/guarantees/policy-strip.tsx` and `app/faq/FAQClientPage.tsx`.
- Transparent pricing language and value framing: see `lib/pricing/unified-pricing-engine.ts`.
- Services offered and durations: see `app/services/*` and `lib/services/config` if present.
- 24/7 Remote Online Notarization (RON) availability and workflow: see `app/ron/*` and `components/ron/*`.
- Policies and terms (cancellations, no-shows, fees): see `app/terms/page.tsx` and `lib/business-rules/config.ts`.
- Social proof/tone references (optional): `components/reviews/*`, `content/blog/*`.

Key differentiators (may be used if true for the selected service)
- Mobile to-you service in Houston area (for in-person services).
- Same-day and after-hours options (use “subject to availability” where needed).
- 24/7 RON with secure Proof.com sessions (for RON_SERVICES).
- Transparent, upfront pricing; no hidden fees.
- Friendly, professional, and fast communication.

Messaging guardrails
- Accuracy first: Only claim what we actually do. If uncertain, use qualified language (e.g., “subject to availability”).
- Don’t promise exact arrival windows for mobile unless explicitly provided.
- Avoid regulated language around legal advice; we notarize documents, we don’t provide legal counsel.
- Maintain a professional, reassuring, and helpful tone.

Voice/tone
- Clear, confident, helpful. Short sentences for headlines; natural, friendly body copy.
- Use urgency when appropriate (e.g., “Same‑day appointments”), but avoid fear-mongering.

CTAs (pick 1 primary, 1 backup)
- Book Now, Schedule Today, Start Online, Call Now, Get Instant Quote

Compliance hints
- If referencing discounts or fees, include conditions or “where applicable.”
- For emergency/weather caveats, defer to `app/terms/page.tsx`.

Channel-specific guidance
- Search: prioritize keywords in headlines; keep to Google Ads limits (H≤30 char, D≤90 char). Use multiple variants.
- Social: short, medium, and long primary texts; headlines ≤40 char; descriptions ≤30 char; optional emojis but keep professional.
- Display: very short headlines (3–5 words), clear sublines, strong CTA; avoid tiny legalese—save details for landing page.

Deliverables expected from the AI
1) Search Ads: 10–15 headlines, 4 descriptions per ad group; 2–3 responsive ad bundles.
2) Social Ads: 3 primary text lengths (short/med/long) × 3 variants; 3 headlines; 2 descriptions; suggested image hooks.
3) Display Ads: 6 short headlines, 6 sublines, 3 CTAs; optional long headline.
4) Negative claims/phrases to avoid; top keyword themes.

Placeholders available
- {{serviceType}}, {{geo}}, {{offer}}, {{cta}}, {{audience}}, {{benefit}}, {{proofPoint}}

Call-to-action for the AI
- Using this brief and the templates in this folder, produce ad sets optimized for: {{channels}}.
- Ensure all copy is consistent with the sources listed above and compliant with the guardrails.


