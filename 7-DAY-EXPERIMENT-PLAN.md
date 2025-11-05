# 📊 7-DAY EXPERIMENT PLAN

**Goal:** Prove 30-50% lift in lead capture with data

**Duration:** 7 days (168 hours)  
**Start:** After go-live verification complete  
**Review:** Daily for first 3 days, then at day 7

---

## Primary KPI: Lead Submit Rate

### Definition
```
Lead Submit Rate = generate_lead / quick_quote_view
```

**Where:**
- `generate_lead` = Total lead events (all stages: quick_quote, inflow_quote, call_click)
- `quick_quote_view` = Total QuickQuote form views (select_content events)

### Baseline
**Measure Week -1 (pre-launch):**
- Leads: X
- Form views: Y
- Rate: Z%

### Target (Week 1)
- **Conservative:** Baseline + 30%
- **Expected:** Baseline + 40%
- **Optimistic:** Baseline + 50%

### How to Measure

**GA4 Exploration:**
1. Navigate to: **Explore → Create new exploration**
2. Set up:
   ```
   Dimensions: 
   - Event name
   - Custom parameter: stage
   - Device category
   
   Metrics:
   - Event count
   
   Filters:
   - Event name IN ['quick_quote_view', 'generate_lead']
   ```
3. Save as: **"Lead Funnel - Week 1"**

**Daily Check:**
```
Day 1: ___ generate_lead / ___ quick_quote_view = ___%
Day 2: ___ generate_lead / ___ quick_quote_view = ___%
Day 3: ___ generate_lead / ___ quick_quote_view = ___%
Day 7: ___ generate_lead / ___ quick_quote_view = ___%
```

---

## Secondary KPI 1: Mobile Call CTR

### Definition
```
Mobile Call CTR = call_click / page_view (device = mobile)
```

**Where:**
- `call_click` = generate_lead events with stage='call_click'
- `page_view` = Page views on mobile devices only

### Target
- **Conservative:** Baseline + 15%
- **Expected:** Baseline + 20%
- **Optimistic:** Baseline + 25%

### How to Measure

**GA4 Exploration:**
```
Dimensions:
- Device category (filter: mobile)
- Event name

Metrics:
- Event count

Filters:
- Event name IN ['page_view', 'generate_lead']
- Custom parameter: stage = 'call_click'
```

**Why This Matters:**
- Mobile users convert differently
- Simplified CTAs should increase call rate
- Debounced tracking prevents double-counting

---

## Secondary KPI 2: QuickQuote → Booking Start Rate

### Definition
```
QuickQuote Quality = booking_started / generate_lead (stage = 'quick_quote')
```

**Where:**
- `booking_started` = Users who clicked "Book Now" after QuickQuote
- `generate_lead (quick_quote)` = Leads from homepage QuickQuote form

### Target
**Maintain or improve baseline** (not decrease)

### How to Measure

**GA4 Exploration:**
```
Dimensions:
- User pseudo ID
- Event name
- Custom parameter: stage

Sequence:
1. generate_lead (stage='quick_quote')
2. booking_started (within 30 min)
```

**Why This Matters:**
- Validates lead quality (not just volume)
- If rate decreases >10%, leads may be lower intent
- Should stay flat or improve slightly

---

## Secondary KPI 3: Bounce Rate

### Definition
```
Bounce Rate = Sessions with <2 page views / Total sessions
```

### Target
- **Conservative:** Baseline - 25%
- **Expected:** Baseline - 30%
- **Optimistic:** Baseline - 40%

### How to Measure

**GA4 Built-in Report:**
1. Navigate to: **Reports → Engagement → Pages and screens**
2. Filter: Landing page = `/` (homepage)
3. View: Bounce rate column

**Why This Matters:**
- Early lead capture reduces bounce
- Skip-ahead messaging keeps browsers engaged
- Transparent pricing builds trust

---

## Cuts: UTM Source × Device

### Purpose
Confirm paid traffic leads ≥ organic baseline

### Setup

**GA4 Exploration:**
```
Dimensions:
- Session source / medium
- Device category

Metrics:
- generate_lead count
- Conversion rate (if configured)

Rows: utm_source
Columns: device (mobile, desktop, tablet)
Values: generate_lead count
```

### Expected Patterns

| Source | Device | Expected Behavior |
|--------|--------|-------------------|
| **google / cpc** | mobile | Highest lead volume (paid ads) |
| **google / cpc** | desktop | High lead volume, lower than mobile |
| **facebook / cpc** | mobile | High lead volume (Meta ads) |
| **google / organic** | all | Baseline (should not decrease) |
| **(direct)** | all | Should increase (returning visitors) |

### Red Flags

⚠️ **Paid traffic leads down** → Check ad targeting, landing pages  
⚠️ **Organic leads down >20%** → SEO issue or site issue  
⚠️ **Mobile leads <50% of total** → Mobile UX issue

---

## Alert Thresholds

### Daily Monitoring (First 3 Days)

| Condition | Threshold | Action |
|-----------|-----------|--------|
| **Leads ↓** | >25% day-over-day | Check Pixel/gtag + webhook status |
| **API 5xx** | >2% (12hr rolling) | Inspect logs, consider rollback |
| **GHL variance** | ≠ GA4 by >15% | Check webhook, spam filters, retry logs |
| **Bounce rate ↑** | >50% increase | Check for JS errors, layout breaks |
| **Call CTA silent** | Zero call_click events for >1hr | Check analytics integration |

### Escalation Playbook

#### Webhook Hiccups
```
Symptom: GHL leads <80% of GA4 generate_lead
Diagnosis: Webhook failures, retry exhaustion, or spam filter

Actions:
1. Check Vercel logs: [GHL] Webhook failed
2. Verify GHL webhook status (active, not paused)
3. Test webhook manually: curl -X POST <URL> -d '{"test":"data"}'
4. Check spam/junk folders in GHL
5. If >20% loss: enable fallback logging to database

Note: API returns 200 even if GHL fails → lead is captured client-side
```

#### Analytics Silent
```
Symptom: Zero events in GA4 DebugView for >15 min
Diagnosis: Script not loading, consent blocked, or adblock

Actions:
1. Open DevTools → Console: Check for errors
2. Verify window.gtag exists: typeof window.gtag
3. Check Network tab: analytics.js or gtag/js loaded?
4. Confirm NEXT_PUBLIC_GA4_ID in env vars
5. Test in incognito (rules out extensions)
6. Check consent defaults: analytics_storage = 'granted'
```

#### Copy Regression
```
Symptom: Compliance issue reported (e.g., "$75 flat" found)
Diagnosis: Someone edited hero/pricing without reviewing

Actions:
1. Run compliance check:
   grep -r "75 flat|flat rate" app/ components/ --include="*.tsx"
2. Fix copy immediately
3. Deploy hotfix
4. Add pre-commit hook (future):
   if git diff --cached | grep -i "flat rate"; then
     echo "⚠️  Compliance: Use 'Starting at \$75' instead"
     exit 1
   fi
```

---

## Day 1 Quick Report (Template)

**Date:** YYYY-MM-DD  
**Hours Live:** 24

### Volume Check ✅
- **Leads (generate_lead):** ___
- **QuickQuote views:** ___
- **Call clicks:** ___
- **Booking starts:** ___

### Rate Check ✅
- **Lead submit rate:** ___% (vs ___ % baseline) → **+/- ___%**
- **Mobile call CTR:** ___% (vs ___ % baseline) → **+/- ___%**
- **Bounce rate:** ___% (vs ___ % baseline) → **+/- ___%**

### Quality Check ✅
- **GHL leads received:** ___
- **GA4 vs GHL variance:** ___% (target: <15%)
- **QuickQuote → Booking rate:** ___% (vs ___ % baseline)

### Technical Health ✅
- **API 5xx rate:** ___% (target: <2%)
- **Avg response time:** ___ ms (target: <2000ms)
- **PII redaction:** ✅ Verified in logs

### Red Flags 🚨
- [ ] None
- [ ] Leads down >25%
- [ ] Analytics variance >15%
- [ ] API errors >2%
- [ ] Bounce rate up significantly

**Action Items:**
1. ___
2. ___
3. ___

---

## Day 7 Final Report (Template)

**Date:** YYYY-MM-DD  
**Experiment Duration:** 7 days (168 hours)

### Primary KPI: Lead Submit Rate

| Metric | Baseline | Week 1 | Change | Target |
|--------|----------|--------|--------|--------|
| **Leads** | ___ | ___ | +___% | +30-50% |
| **Submit Rate** | ___% | ___% | +___pp | +30-50% |

**Verdict:** ✅ Success / ⚠️ Partial / ❌ Miss

---

### Secondary KPIs

| KPI | Baseline | Week 1 | Change | Target | Status |
|-----|----------|--------|--------|--------|--------|
| **Mobile Call CTR** | ___% | ___% | +___% | +15-25% | ✅ / ⚠️ / ❌ |
| **Booking Start Rate** | ___% | ___% | +___% | Maintain | ✅ / ⚠️ / ❌ |
| **Bounce Rate** | ___% | ___% | -___% | -25-40% | ✅ / ⚠️ / ❌ |

---

### Attribution Breakdown

**Leads by Source × Device:**

| Source/Medium | Mobile | Desktop | Tablet | Total | % of Total |
|---------------|--------|---------|--------|-------|------------|
| google / cpc | ___ | ___ | ___ | ___ | ___% |
| facebook / cpc | ___ | ___ | ___ | ___ | ___% |
| google / organic | ___ | ___ | ___ | ___ | ___% |
| (direct) | ___ | ___ | ___ | ___ | ___% |
| Other | ___ | ___ | ___ | ___ | ___% |
| **Total** | **___** | **___** | **___** | **___** | **100%** |

**Key Insights:**
- Paid traffic conversion: ___% (vs baseline: ___%)
- Mobile share of leads: ___% (target: >50%)
- Top performing channel: ___________

---

### Technical Performance

| Metric | Week 1 Avg | Target | Status |
|--------|------------|--------|--------|
| **API Success Rate** | ___% | >95% | ✅ / ❌ |
| **Avg Response Time** | ___ ms | <2000ms | ✅ / ❌ |
| **GHL Fill Rate** | ___% | >85% | ✅ / ❌ |
| **Event Dedupe Rate** | ___% | >98% | ✅ / ❌ |

**Issues Encountered:**
- [ ] None
- [ ] Webhook timeouts: ___ occurrences
- [ ] Analytics gaps: ___ occurrences
- [ ] API 5xx errors: ___% rate

---

### ROI Calculation (if ad spend known)

**Ad Spend (Week 1):** $____  
**Leads Generated:** ____  
**Cost Per Lead:** $____ (vs baseline: $____)  
**Improvement:** ___% lower CPL

**Estimated Value:**
- Leads × Avg. booking value ($___) = $____
- ROAS: ____ : 1
- Break-even leads: ____

---

## Recommendations

### ✅ What Worked

1. **QuickQuote Form:** ___ leads (___% of total)
   - Key insight: ___________
   
2. **In-Flow Capture:** ___ leads (___% of total)
   - Key insight: ___________
   
3. **Call Tracking:** ___ calls (___% of total)
   - Key insight: ___________

4. **Mobile UX:** ___% conversion improvement
   - Key insight: ___________

---

### 🔧 What to Optimize

1. **[Area]:**
   - Observation: ___________
   - Recommendation: ___________
   - Expected lift: ___%
   
2. **[Area]:**
   - Observation: ___________
   - Recommendation: ___________
   - Expected lift: ___%

---

### 🚀 Fast Follow-Ups

**Immediate (Week 2):**
- [ ] Implement server-side CAPI (deduped with event_id)
- [ ] A/B test QuickQuote copy variants
- [ ] Add pricing tooltip to service cards

**Short-term (Month 1):**
- [ ] GA4 Audience: "QuickQuote Leads" for retargeting
- [ ] Email automation: Auto-reply with pricing guide
- [ ] SMS follow-up: 5-min response time

**Long-term (Quarter 1):**
- [ ] Predictive lead scoring (ML model)
- [ ] Dynamic pricing display based on location
- [ ] Multi-step QuickQuote with progressive disclosure

---

## 🎉 Success Declaration

### Criteria for "Ship It Permanently"

✅ **Primary KPI:** Lead submit rate +30% or better  
✅ **Quality:** Booking start rate maintained (±5%)  
✅ **Technical:** >95% API success, GHL fill rate >85%  
✅ **No Regressions:** Bounce rate improved or flat  

**If all ✅ → Merge to main, sunset old flow, iterate on winners!**

---

## 📞 Stakeholder Update Template

**Subject:** Week 1 Results - Lead Capture Optimization

**Headline:** [Success / Partial Success / Needs Iteration]

**Key Metrics:**
- Leads: +___% (target: +30-50%)
- Cost per lead: -___% (if applicable)
- Mobile conversion: +___%
- Technical uptime: ___% (target: >95%)

**What Worked:**
- [Feature/Change]: +___% impact
- [Feature/Change]: +___% impact

**What's Next:**
- [Action item 1]
- [Action item 2]

**ROI:** $____ in estimated lead value (vs $____ ad spend)

**Recommendation:** [Continue / Iterate / Rollback]

---

**You're ready to prove lift with data!** 📈

