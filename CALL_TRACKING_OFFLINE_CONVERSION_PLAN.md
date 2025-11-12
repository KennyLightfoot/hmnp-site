# Call Tracking & Offline Conversion Import Plan
**Houston Mobile Notary Pros LLC**  
**Integration: Google Ads ↔ GoHighLevel (GHL)**

---

## 🎯 Overview

This document outlines the complete call tracking and offline conversion import strategy for HMNP, ensuring all qualified calls from Google Ads are properly attributed and optimized.

---

## 📞 Call Tracking Strategy

### Primary Call Tracking Methods

#### **1. Google Ads Call Conversions (Already Set Up)**

**Conversion Actions Created:**
- ✅ **"Calls from ads"** — Google forwarding number (auto-tracked)
- ✅ **"Click-to-call (website)"** — Website button clicks

**How It Works:**
- Google Ads inserts dynamic forwarding numbers on ads
- Tracks calls automatically when users call from ads
- Reports duration, time, caller area code
- No additional setup needed (already active)

**Pros:**
- Automatic tracking
- Real-time data in Google Ads
- No technical implementation needed

**Cons:**
- Only tracks calls directly from ads
- Doesn't capture website calls from organic/direct traffic
- No qualification criteria (counts all calls)

---

#### **2. Website Call Tracking via GTM (Secondary)**

**Setup:**
- Click-to-call buttons instrumented with GTM events
- Fires "Click-to-call (website)" conversion
- Captures `gclid` when present

**Current Implementation:**
```javascript
// Already implemented on site
<a href="tel:+18326174285" 
   onClick="gtag('event', 'conversion', {
     'send_to': 'AW-17079349538/CONVERSION_LABEL',
     'value': 35.0
   })">
   (832) 617-4285
</a>
```

**Tracking:**
- Phone clicks from website
- Captures referral source via UTM parameters
- Links to Google Ads via `gclid`

---

#### **3. Offline Conversion Imports from GHL (Recommended)**

**Why This Matters:**
- Google Ads only knows a call happened, not if it was qualified
- GHL captures actual call outcomes (booked, qualified, spam, etc.)
- Feed qualified call data back to Google Ads for better optimization

**Flow:**
```
Google Ads → User clicks ad → Website captures gclid → GHL stores gclid
↓
User calls → GHL logs call + duration + outcome
↓
Export qualified calls from GHL → Import to Google Ads → Better bidding
```

---

## 🔧 Implementation Plan

### Phase 1: Capture `gclid` in GHL (Already Done ✅)

**Current Implementation:**
- Website already captures `gclid` from URL parameters
- Persists in session storage
- Passed to GHL on booking/contact form submission

**GHL Custom Field:**
- **Field Name:** `google_click_id` or `gclid`
- **Type:** Text
- **Value:** Auto-populated from URL parameter

**Verification:**
```bash
# Check if gclid is being passed
# Look at booking form submissions in GHL
# Custom field should show: gclid=CjwKCAiA...
```

---

### Phase 2: Track Call Outcomes in GHL

**Required GHL Configuration:**

1. **Call Tracking Number Setup:**
   - Use GHL call tracking numbers OR
   - Forward (832) 617-4285 to GHL for logging

2. **Custom Fields for Call Data:**
   - `call_duration` (seconds)
   - `call_start_time` (ISO 8601 timestamp)
   - `call_qualified` (boolean: true/false)
   - `google_click_id` (text: gclid from website)

3. **Call Qualification Criteria:**
   - **Qualified Call:** Duration ≥ 60 seconds + human interaction
   - **Unqualified:** < 60 seconds, spam, wrong number, existing client
   
4. **Automation/Workflow in GHL:**
   - When call ends → Check duration
   - If ≥ 60 seconds → Tag as "Qualified Call"
   - If < 60 seconds → Tag as "Unqualified"
   - Update `call_qualified` custom field

---

### Phase 3: Export Qualified Calls from GHL

**Daily Export Process:**

1. **Manual Export (Initial Setup):**
   - GHL → Contacts → Filter: "Qualified Call" tag
   - Filter: Date range = Yesterday
   - Export CSV with columns:
     - `contact_id`
     - `google_click_id` (gclid)
     - `call_start_time`
     - `call_duration`
     - `phone_number`

2. **CSV Format Required:**
```csv
google_click_id,conversion_time,conversion_value
CjwKCAiA...,2025-11-06T14:30:00-06:00,35
CjwKCAiA...,2025-11-06T15:45:00-06:00,35
```

**Key Fields:**
- `google_click_id`: The gclid captured on website
- `conversion_time`: ISO 8601 format with timezone (UTC or local)
- `conversion_value`: 35 (average lead value)

---

### Phase 4: Import to Google Ads

**Google Ads Setup:**

1. **Create Offline Conversion Action:**
   - Google Ads → Tools → Conversions → "+" → Import
   - Select: "Offline conversions"
   - Name: **"Qualified Call – HMNP"**
   - Category: Lead
   - Value: 35 (default)
   - Count: One per click
   - Click-through conversion window: 60 days
   - Primary for goal: No (use "Booking" as primary)

2. **Upload CSV:**
   - Google Ads → Tools → Conversions → Uploads → "Upload"
   - Select: "Qualified Call – HMNP"
   - Upload CSV file
   - Map columns: `google_click_id` → Google Click ID, `conversion_time` → Conversion time
   - Review and submit

**Upload Frequency:**
- Daily (morning) for previous day's calls
- Or weekly if daily volume is low

---

## 🤖 Automation Options

### Option A: Manual Daily Upload (Recommended to Start)

**Process:**
1. Each morning: Export qualified calls from GHL (yesterday's date)
2. Format CSV
3. Upload to Google Ads (2-3 minutes)

**Pros:**
- Simple, no coding required
- Full control and visibility
- Easy to troubleshoot

**Cons:**
- Manual labor (5 min/day)
- Can forget to upload

---

### Option B: Automated Upload via Script (Future Enhancement)

**Requirements:**
- GHL API access (webhook or REST API)
- Google Ads API credentials (already have)
- Cron job or scheduled task

**Script Flow:**
```python
# Pseudo-code
1. Query GHL API for qualified calls (yesterday)
2. Extract: gclid, call_time, duration
3. Format as CSV or use Google Ads API directly
4. Upload offline conversions via Google Ads API
5. Log results and errors
```

**Implementation:**
```bash
# Cron job (daily at 8 AM)
0 8 * * * /usr/bin/python3 /path/to/import-qualified-calls.py
```

**Script Location:**
- `scripts/ads/import-ghl-qualified-calls.py` (to be built)

**Pros:**
- Fully automated
- No manual work
- Consistent daily uploads

**Cons:**
- Requires GHL API setup
- More complex to troubleshoot
- Initial build time

---

## 📊 Conversion Action Summary

| Conversion Action | Type | Auto-Tracked | Qualification | Primary? |
|-------------------|------|--------------|---------------|----------|
| **Booking – HMNP** | Website | Yes | Form submit | ✅ Yes |
| **Calls from ads** | Phone | Yes | Google forwarding | ✅ Yes |
| **Click-to-call (website)** | Phone | Yes | Button click | No |
| **Qualified Call – HMNP** | Offline import | No (manual/script) | ≥60s + human | No |

**Optimization Strategy:**
- Primary conversions: "Booking" + "Calls from ads"
- Secondary conversions: "Click-to-call", "Qualified Call"
- Use "Qualified Call" data to refine bidding but don't make it primary (avoid double-counting)

---

## 🎯 Attribution & Value Assignment

### Call Value Structure

**Conversion Values:**
- **Booking (website):** $35 (average lead value)
- **Calls from ads:** $35 (same as booking)
- **Click-to-call (website):** $0 (click intent, not conversion)
- **Qualified Call – HMNP:** $35 (qualified lead)

**Why $35?**
- Based on average service value (~$75-$175)
- 40-50% close rate
- Conservative lead value for optimization

**Adjusting Values:**
- Review actual booking/close rates monthly
- If close rate is higher: increase conversion value
- If lower: decrease to align with true ROI

---

## 🔍 Monitoring & Optimization

### Weekly Review Checklist

**Google Ads Dashboard:**
- [ ] Check "Calls from ads" volume and duration
- [ ] Review "Qualified Call" uploads (should match GHL data)
- [ ] Compare click-to-call vs. actual calls
- [ ] Identify campaigns with high call volume but low bookings

**GHL Dashboard:**
- [ ] Review call durations and qualification tags
- [ ] Verify `gclid` is being captured (check recent contacts)
- [ ] Check call outcomes (qualified vs. unqualified ratio)
- [ ] Export and upload qualified calls to Google Ads

**Metrics to Track:**
- **Call-through rate:** Calls / Clicks
- **Qualified call rate:** Qualified calls / Total calls
- **Booking rate from calls:** Bookings / Qualified calls
- **Cost per qualified call:** Spend / Qualified calls

---

## ⚙️ GHL Setup Checklist

To enable full call tracking and offline conversions:

### Required GHL Configuration

- [ ] **1. Add custom field:** `google_click_id` (text)
- [ ] **2. Update website forms** to pass `gclid` to GHL (already done ✅)
- [ ] **3. Set up call tracking number** in GHL OR forward main number
- [ ] **4. Create call qualification workflow:**
  - Trigger: Call ends
  - Condition: Duration ≥ 60 seconds
  - Action: Add tag "Qualified Call"
  - Action: Set `call_qualified` = true
- [ ] **5. Test workflow** with test calls
- [ ] **6. Export qualified calls** (daily or weekly)
- [ ] **7. Upload to Google Ads** via CSV or API

---

## 🚀 Quick Start (Week 1)

### Day 1-2: Verify GHL Setup
- Confirm `gclid` custom field exists in GHL
- Test a booking to ensure `gclid` is captured
- Review call logs in GHL (check if call data is available)

### Day 3-4: Set Up Call Qualification
- Create workflow: Tag calls ≥60s as "Qualified"
- Test with live calls
- Verify tags are applied correctly

### Day 5: First Export & Upload
- Export yesterday's qualified calls from GHL
- Format CSV
- Upload to Google Ads
- Verify conversions appear in dashboard (24-48 hour delay)

### Week 2+: Daily Routine
- Morning: Export previous day's qualified calls
- Upload to Google Ads
- Review weekly: Adjust campaigns based on qualified call data

---

## 📞 Support & Troubleshooting

### Common Issues

**Issue: `gclid` not captured in GHL**
- **Solution:** Check UTM parameter passing on website forms
- Verify GHL custom field mapping
- Test with `?gclid=test123` in URL

**Issue: Qualified calls not uploading to Google Ads**
- **Solution:** Check CSV format (must match Google's requirements)
- Verify `gclid` format (starts with `Cj` or `EAIa`)
- Check conversion window (60 days from click to conversion)

**Issue: Double-counting conversions**
- **Solution:** Keep "Qualified Call" as non-primary conversion
- Use for reporting only, not bidding optimization
- Primary conversions: "Booking" + "Calls from ads"

---

## 📈 Expected Impact

**After implementing full call tracking:**
- 📊 Better visibility into call quality (not just quantity)
- 🎯 Smarter bidding based on qualified leads
- 💰 Lower cost per qualified lead (CPL)
- 📞 Higher booking rate from paid traffic
- 🔍 Identify best-performing keywords/ads by call outcome

**Timeline:**
- Week 1-2: Setup and testing
- Week 3-4: Data collection
- Month 2+: Optimization based on qualified call data

---

## ✅ Summary

**What's Already Working:**
- ✅ "Calls from ads" (Google forwarding)
- ✅ "Click-to-call (website)" tracking
- ✅ `gclid` capture on website

**What Needs Setup:**
- ⚠️ GHL call qualification workflow
- ⚠️ Daily export of qualified calls
- ⚠️ Upload to Google Ads (manual or automated)

**Next Steps:**
1. Verify GHL `gclid` capture
2. Set up call qualification workflow in GHL
3. Test with live calls
4. Start daily export/upload routine
5. Review weekly performance

**Time Investment:**
- Initial setup: 2-3 hours
- Daily maintenance: 5 minutes (manual upload)
- Weekly review: 15-20 minutes

---

**Last Updated:** 2025-11-06  
**Status:** Ready for GHL configuration






