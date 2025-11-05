# 🚦 Pre-Launch Checklist (15-25 min)

**Run this checklist before deploying to production**

---

## ✅ 1. Analytics Sanity (5 min)

### GA4 DebugView
```bash
# Load: http://localhost:3000/?utm_source=qa&utm_campaign=smoke
```

- [ ] **page_view** event fires with:
  - [ ] `utm_source: 'qa'`
  - [ ] `utm_campaign: 'smoke'`
  - [ ] `device: 'mobile'` or `'desktop'` or `'tablet'`
  - [ ] `path: '/'`
  - [ ] `referrer` present
  - [ ] `event_id` (UUID format)

- [ ] **select_content** (quick_quote_view) fires when QuickQuote mounts:
  - [ ] `content_type: 'quick_quote_view'`
  - [ ] `source_component: 'quick_quote_home'`

- [ ] **generate_lead** fires on QuickQuote submit:
  - [ ] `stage: 'quick_quote'`
  - [ ] `event_id` present
  - [ ] **NO PII** (no name/email/phone in GA4)

### Meta Pixel Helper
```bash
# Install: https://chrome.google.com/webstore/detail/meta-pixel-helper
```

- [ ] **PageView** fires on page load
- [ ] **ClickButton** fires on quick_quote_view  
- [ ] **Lead** fires on QuickQuote submit with:
  - [ ] `content_name: 'quick_quote'`
  - [ ] `source` (utm_source or 'direct')
  - [ ] `value: 75`
  - [ ] `event_id`

### Network Tab
```bash
# DevTools → Network → Filter: Fetch/XHR
# Submit QuickQuote form
```

- [ ] `/api/submit-ad-lead` POST request shows:
  - [ ] `event_id` in request body
  - [ ] `utm_source`, `utm_medium`, `utm_campaign` present (if in URL)
  - [ ] `device`, `page`, `referrer` present
  - [ ] Returns **200** with `success: true`
  - [ ] Response has `event_id` (no PII)

---

## ✅ 2. Compliance + Copy (5 min)

### Pricing Language Check

```bash
# Run these searches - should find ZERO customer-facing instances
cd /home/fleece-johnson/HMNP-Site/hmnp-site
grep -r "75 flat" --include="*.tsx" --include="*.ts" app/ components/ | grep -v ".md"
grep -r "flat rate" --include="*.tsx" --include="*.ts" app/ components/ | grep -v ".md"
```

**Expected:** No matches in .tsx/.ts files (only docs allowed)

### Verify Correct Copy

- [ ] **Hero**: Says "Mobile notarization starting at $75 (includes travel...)"
- [ ] **Service Cards**: Show "Starting at $75" with tooltip
- [ ] **FAQ**: Pricing language consistent
- [ ] **JSON-LD Schema**: Has "Starting price" descriptions
- [ ] **OpenGraph**: No "$75 flat" in descriptions

### RON Pricing Consistency

- [ ] All RON prices show: "$25/session + $5/seal" OR "$35 ($25 + $10)"
- [ ] FAQ, services page, and schema match
- [ ] $10 after-hours fee documented consistently

---

## ✅ 3. Mobile CTA + InFlow UX (7 min)

### Test on Real Devices (or DevTools Emulation)

**iPhone SE (375px):**
- [ ] Click "Call Now" → dialer opens
- [ ] Analytics fires **before** dialer (onMouseDown)
- [ ] Double-tap → only **1 event** fires (debounced 600ms)
- [ ] Sticky bar doesn't cover keyboard
- [ ] Sticky bar doesn't cover "Continue" button

**iPhone 12/13/14 (390px):**
- [ ] All above tests pass
- [ ] InFlowQuoteCard renders properly in booking flow

**Pixel 7/8 (412px):**
- [ ] Call CTA works
- [ ] Analytics tracks correctly
- [ ] No layout issues

### IntersectionObserver Behavior

Start booking flow → enter name + email → scroll to InFlowQuoteCard:

- [ ] Card appears in viewport
- [ ] Wait 750ms
- [ ] **generate_lead** (stage: inflow_quote) fires **once**
- [ ] Scroll card out of view → no additional events
- [ ] Scroll back in → no additional events (already tracked)

---

## ✅ 4. Availability Widget (3 min)

### Simulate API Failure

```javascript
// In DevTools Console:
// Block /api/availability in Network tab (or rename the endpoint temporarily)
```

- [ ] Widget shows: "Last checked: **X** slots available Y min ago"
- [ ] OR: "We're confirming today's openings..." (if no cache)
- [ ] Yellow indicator (not red/green)
- [ ] **NO scary warning** like "Limited availability"
- [ ] **NO layout shift** (min-height prevents CLS)

### With API Working

- [ ] Shows live count: "Same-day mobile slots left today: **5**"
- [ ] Green indicator
- [ ] Updates every 60 seconds
- [ ] Caches count on success

---

## ✅ 5. SEO / Schema (5 min)

### Validate JSON-LD

```bash
# View page source → search for "@type": "LocalBusiness"
# Copy the entire JSON-LD block
```

Paste into: https://validator.schema.org/

- [ ] **Zero errors**
- [ ] Warnings acceptable (optional fields)
- [ ] Check fields:
  - [ ] `priceRange: "$$"`
  - [ ] `areaServed` → GeoCircle with 50-mile radius
  - [ ] `hasOfferCatalog` → includes both services
  - [ ] `priceSpecification` → says "Starting price includes..."

### Meta Tags

View source → check:

- [ ] `<title>` has no "$75 flat"
- [ ] `<meta name="description">` has no "$75 flat"  
- [ ] `og:title` has no "$75 flat"
- [ ] `og:description` has no "$75 flat"
- [ ] `canonical` tag present

---

## 🔒 Bonus: Security & Privacy

- [ ] No PII in GA4 events (check DebugView payloads)
- [ ] No PII in server logs (check `/api/submit-ad-lead` console output - should show `***` redaction)
- [ ] Consent defaults set (ad_storage: denied, analytics_storage: granted)
- [ ] CORS headers appropriate for your domain

---

## 📊 Post-Launch Monitoring (First Hour)

### Immediately After Deploy

**Watch GA4 DebugView (Real-Time):**
```
https://analytics.google.com/analytics/web/#/p<YOUR_PROPERTY_ID>/realtime/overview
```

- [ ] Events flowing: `page_view`, `generate_lead`, `select_content`
- [ ] UTM params captured correctly
- [ ] Device breakdown looks correct (mobile vs desktop)

**Watch GHL Pipeline:**
```
https://app.gohighlevel.com/location/<YOUR_LOCATION>/pipelines
```

- [ ] "Quote Request" pipeline
- [ ] "New Lead" stage
- [ ] Leads appearing with:
  - [ ] Name, email/phone
  - [ ] Service type
  - [ ] UTM source/campaign
  - [ ] Device
  - [ ] event_id

**Check API Logs:**
```bash
# Vercel: https://vercel.com/<project>/deployments
# Check function logs for /api/submit-ad-lead
```

- [ ] Requests logging with PII redacted (`***`)
- [ ] GHL webhook returning 200
- [ ] Duration < 2000ms
- [ ] No 500 errors

### First 24 Hours

**Alert Thresholds:**

| Metric | Threshold | Action |
|--------|-----------|--------|
| Lead submissions | Down >25% vs previous day | Investigate Pixel/gtag |
| `/api/submit-ad-lead` 5xx rate | >2% (12hr window) | Check logs, consider rollback |
| GHL pipeline count | ≠ GA4 `generate_lead` by >15% | Check webhook, spam filters |
| Bounce rate | Up >50% | Check for JS errors, layout breaks |

---

## ✅ All Clear → Deploy!

Once all checks pass:

```bash
# Push to GitHub
git push origin restore/ui-from-f052667

# Deploy to production (Vercel/your platform)
vercel --prod

# Monitor for first hour
# - GA4 RealTime
# - GHL Pipeline
# - API logs
```

---

## 🚨 Rollback Plan

**If critical issues found:**

```bash
# Option 1: Vercel instant rollback (1 click)
# Dashboard → Deployments → Previous version → Promote to Production

# Option 2: Git revert
git revert HEAD~3  # Reverts last 3 commits
git push origin restore/ui-from-f052667

# Option 3: Kill switch (temporary)
# Set env var: FEATURE_LEAD_CAPTURE=false
# Add guard in components to check this flag
```

**Critical Issues Warranting Rollback:**
- Forms not submitting (>50% failure rate)
- Analytics completely broken (no events for 15+ min)
- Mobile layout breaks site usability
- GHL webhook causing data loss/corruption
- API 5xx rate >10%

---

## 📈 Success Criteria (Week 1)

| Metric | Target | How to Measure |
|--------|--------|---------------|
| **Lead Submissions** | Baseline + 30-50% | GA4 → Events → `generate_lead` count |
| **API Success Rate** | >95% | Vercel logs → 200 responses / total requests |
| **Mobile Call CTR** | Baseline + 15-25% | GA4 → Events → `generate_lead` (stage: call_click) |
| **Bounce Rate** | Baseline - 25-40% | GA4 → Reports → Engagement → Bounce rate |
| **GHL Fill Rate** | Matches GA4 ±5% | GHL pipeline count vs GA4 event count |

---

## 🎉 You're Cleared for Launch!

**Checklist Complete → Ship with Confidence** 🚀

*Questions? Review:*
- `READY-TO-SHIP.md` - Deployment guide
- `QA-CHECKLIST.md` - Comprehensive testing
- `IMPLEMENTATION-SUMMARY.md` - Technical details

