# 🚀 GO-LIVE SEQUENCE (15-20 Minutes)

**Mission:** Deploy to production and verify all systems operational

---

## ⏱️ Timeline

| Phase | Duration | Status |
|-------|----------|--------|
| **Env Setup** | 3 min | 🔲 |
| **Push & Deploy** | 5 min | 🔲 |
| **Real-Time Verification** | 10 min | 🔲 |
| **Smoke Test** | 2 min | 🔲 |
| **Total** | **20 min** | 🔲 |

---

## Step 1: Set Environment Variables (3 min)

### Vercel Dashboard

**URL:** `https://vercel.com/<your-project>/settings/environment-variables`

**Add These (Copy/Paste):**

```bash
# Analytics
NEXT_PUBLIC_GA4_ID=G-XXXXXXX
NEXT_PUBLIC_META_PIXEL_ID=1234567890

# Lead Capture
GHL_QUOTE_WEBHOOK_URL=https://services.leadconnectorhq.com/hooks/XXXXX

# Build (already set, verify)
PREVIEW_UI_ONLY=false
```

**Apply to:** ✅ Production, ✅ Preview, ✅ Development

**Save** → Redeploy if needed

---

## Step 2: Push & Deploy (5 min)

### Push to GitHub

```bash
cd /home/fleece-johnson/HMNP-Site/hmnp-site

# SSH (recommended)
git remote set-url origin git@github.com:KennyLightfoot/hmnp-site.git
git push origin restore/ui-from-f052667
```

### Deploy to Production

```bash
# Option A: Vercel CLI (fastest)
vercel --prod

# Option B: Merge to main (auto-deploy)
git checkout main
git merge restore/ui-from-f052667
git push origin main
```

**Wait for:** ✅ Build success, ✅ Deployment complete

**Note deployment URL:** `https://your-domain.com`

---

## Step 3: First 15-Min Verification

### 3A. GA4 DebugView (3 min)

**URL:** `https://analytics.google.com/analytics/web/#/p<PROPERTY_ID>/realtime/overview`

**Test URL:** `https://your-domain.com/?utm_source=qa&utm_campaign=smoke`

#### Expected Events (in order):

**1. page_view** ✅
```json
{
  "utm_source": "qa",
  "utm_campaign": "smoke",
  "device": "desktop" | "mobile" | "tablet",
  "path": "/",
  "referrer": "",
  "event_id": "uuid-format"
}
```

**2. select_content** (QuickQuote viewed) ✅
```json
{
  "content_type": "quick_quote_view",
  "source_component": "quick_quote_home",
  "event_id": "uuid-format"
}
```

**3. generate_lead** (Submit form) ✅
```json
{
  "stage": "quick_quote",
  "source_component": "quick_quote_home",
  "device": "desktop",
  "utm_source": "qa",
  "event_id": "uuid-format",
  // NO PII (name/email/phone)
}
```

**Checkpoints:**
- [ ] All events firing
- [ ] UTM params captured
- [ ] Device detected correctly
- [ ] event_id present (UUID format)
- [ ] No PII in event parameters

---

### 3B. Meta Pixel Helper (2 min)

**Install:** [Chrome Extension](https://chrome.google.com/webstore/detail/meta-pixel-helper)

**Test same URL:** `https://your-domain.com/?utm_source=qa`

#### Expected Events:

**1. PageView** ✅
```
Standard Event: PageView
Status: Active
Pixel ID: <YOUR_PIXEL_ID>
```

**2. ClickButton** (QuickQuote view) ✅
```
Standard Event: ClickButton
Content Name: quick_quote_view
```

**3. Lead** (Form submit) ✅
```
Standard Event: Lead
Content Name: quick_quote
Source: qa
Value: 75
Currency: USD
```

**Checkpoints:**
- [ ] Pixel loads once (no duplicates)
- [ ] All events show "Active" status
- [ ] event_id matches GA4 (check Network tab)

---

### 3C. Network Tab Verification (3 min)

**DevTools → Network → Filter: Fetch/XHR**

**Submit QuickQuote form**

#### Expected Request:

```http
POST /api/submit-ad-lead
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "phone": "7135551234",
  "serviceType": "standard",
  "event_id": "abc-123-def-456",
  "utm_source": "qa",
  "utm_medium": null,
  "utm_campaign": "smoke",
  "device": "desktop",
  "page": "/",
  "referrer": "",
  "source": "quick_quote"
}
```

#### Expected Response:

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": true,
  "message": "Thanks! We'll text/email your quote within 5 minutes.",
  "data": {
    "event_id": "abc-123-def-456"
  }
}
```

**Checkpoints:**
- [ ] Status: 200 OK
- [ ] Response time: <2000ms
- [ ] event_id returned (matches request)
- [ ] No PII in response (only event_id)

---

### 3D. GHL Pipeline (2 min)

**URL:** `https://app.gohighlevel.com/location/<YOUR_LOCATION>/pipelines`

**Navigate to:** Pipeline "Quote Request" → Stage "New Lead"

#### Expected Lead Entry:

```
Contact: Test User
Email: test@example.com
Phone: (713) 555-1234

Custom Fields:
✅ service_type: "standard"
✅ utm_source: "qa"
✅ utm_campaign: "smoke"
✅ device: "desktop"
✅ source: "quick_quote"
✅ event_id: "abc-123-def-456"
✅ timestamp: <recent>
```

**Checkpoints:**
- [ ] Lead appears within 10 seconds
- [ ] All fields populated correctly
- [ ] UTM attribution present
- [ ] event_id matches analytics

---

### 3E. Vercel Logs (3 min)

**URL:** `https://vercel.com/<project>/deployments → Latest → View Function Logs`

**Filter:** `/api/submit-ad-lead`

#### Expected Log Entries:

```
✅ [API] Processing lead: { 
  event_id: 'abc-123...', 
  source: 'quick_quote', 
  device: 'desktop',
  utm_source: 'qa' 
}

✅ [GHL] Lead sent successfully { 
  event_id: 'abc-123...', 
  source: 'quick_quote',
  retryCount: 0 
}

✅ [API] Lead processed: { 
  event_id: 'abc-123...',
  ghl_success: true, 
  duration_ms: 1234 
}
```

**PII Redaction Check:**
```
✅ Email: te***@example.com
✅ Phone: 713-***-1234
✅ Name: Test ***
```

**Checkpoints:**
- [ ] Logs showing PII redaction
- [ ] Response times <2000ms
- [ ] GHL webhook succeeding
- [ ] No retry loops
- [ ] Status codes: Majority 200

---

## Step 4: Smoke Test (2 min)

### Mobile Device Test

**Use:** iPhone Safari OR Chrome DevTools mobile emulation

**Test:**
1. Visit homepage
2. Scroll to QuickQuote form
3. Fill out: Name + Phone
4. Submit
5. See success message

**Verify:**
- [ ] Form loads quickly
- [ ] No layout shifts
- [ ] Submit button works
- [ ] Success message appears
- [ ] GA4 event fires (check DebugView)

### Call CTA Test

**Click "Call Now" button**

**Verify:**
- [ ] Dialer opens immediately
- [ ] GA4 event fires (`generate_lead`, stage: `call_click`)
- [ ] No double-fire (debounced)

---

## ✅ Go-Live Checklist

Before declaring success, confirm:

- [ ] **GA4 Events:** page_view, select_content, generate_lead all firing
- [ ] **Meta Pixel:** PageView, Lead firing with event_id
- [ ] **GHL Pipeline:** Leads appearing with attribution
- [ ] **API Logs:** PII redacted, <2s, 200s
- [ ] **Mobile Test:** Form submits successfully
- [ ] **Call CTA:** Tracking fires before dialer

---

## 🚨 If Something's Wrong

### GA4 Events Not Firing

```bash
# Check console for errors
# Verify script loads: <head> should have gtag/analytics.js
# Confirm NEXT_PUBLIC_GA4_ID is set correctly
# Check consent mode defaults (should allow analytics_storage)
```

### Meta Pixel Not Firing

```bash
# Verify NEXT_PUBLIC_META_PIXEL_ID is set
# Check for script blockers (Privacy Badger, uBlock)
# Confirm fbq() exists: window.fbq in console
```

### GHL Leads Not Appearing

```bash
# Test webhook manually: curl -X POST <GHL_WEBHOOK_URL> -d '{"test":"data"}'
# Check GHL webhook is active and not paused
# Verify env var GHL_QUOTE_WEBHOOK_URL is correct
# Check Vercel logs for [GHL] errors
```

### API 500 Errors

```bash
# Check Vercel logs for stack traces
# Verify all env vars are set
# Test locally: npm run dev
# Check for rate limiting or webhook failures
```

---

## 🎉 Success Criteria

### All Green → Production is Live! ✅

**You should see:**
- ✅ GA4 RealTime showing events
- ✅ Meta Pixel Helper: 3+ events
- ✅ GHL Pipeline: New lead(s)
- ✅ Vercel Logs: PII redacted, 200s
- ✅ Mobile form: Submits successfully
- ✅ Call tracking: Fires correctly

**Next:** Monitor for first 24 hours → See `7-DAY-EXPERIMENT-PLAN.md`

---

## 📞 Escalation Contacts

**If critical issues found:**

| Issue | Contact | Action |
|-------|---------|--------|
| **Analytics broken** | GA4 admin | Check property settings |
| **Pixel not firing** | Meta Business Manager | Verify Pixel ID |
| **GHL webhook down** | GHL support | Check webhook status |
| **Site down** | Vercel support | Check deployment logs |

**Rollback:** See `DEPLOY-NOW.md` → Rollback Plan

---

## 🚀 You're Live!

**Time to completion:** 15-20 minutes  
**Status after completion:** Production monitoring begins  
**Next action:** Follow `7-DAY-EXPERIMENT-PLAN.md` for first week KPIs

**Congratulations! Your conversion-optimized system is live!** 🎊

