# Houston Mobile Notary Pros - Google Ads Setup & Configuration

**Date:** 2025-11-06  
**GA4 Property ID:** 479840000  
**Google Ads Customer ID:** 507-264-9468 (HMNP account)  
**Primary Phone:** (832) 617-4285  
**Budget Split:** RON 50% | Mobile 35% | Loan 15%  
**Offline Call Imports:** Yes (from GHL)

---

## 1. GA4 ↔ Google Ads Linking

### Steps to Execute:
1. **In GA4 (Property 479840000):**
   - Admin → Product Links → Google Ads Links
   - Click "Link" → Select account: 507-264-9468
   - Enable:
     - ✅ Enable personalized advertising
     - ✅ Enable auto-tagging
     - ✅ Enable Google Signals data collection
   - Click "Submit"

2. **In Google Ads (507-264-9468):**
   - Tools & Settings → Linked accounts → Google Analytics (GA4)
   - Verify link shows "479840000 - Houston Mobile Notary Pros"
   - Status should be "Linked"

### Verification:
- GA4 → Admin → Product Links → Google Ads Links → Should show "507-264-9468"
- Ads → Tools & Settings → Linked accounts → Should show GA4 property

---

## 2. GA4 Audiences (Create & Share to Ads)

### Audience Definitions:

#### 1. Engagers - 7 Days
- **Type:** Event-based
- **Conditions:** 
  - Users who triggered `page_view` OR `booking_started` OR `phone_click` in last 7 days
- **Share to:** Google Ads

#### 2. Engagers - 30 Days
- **Type:** Event-based
- **Conditions:**
  - Users who triggered `page_view` OR `booking_started` OR `phone_click` in last 30 days
- **Share to:** Google Ads

#### 3. Engagers - 90 Days
- **Type:** Event-based
- **Conditions:**
  - Users who triggered `page_view` OR `booking_started` OR `phone_click` in last 90 days
- **Share to:** Google Ads

#### 4. RON Visitors
- **Type:** Event-based
- **Conditions:**
  - Users who visited `/booking?mode=RON` OR `/services/remote-online-notarization`
  - OR triggered `service_view` with parameter `service_type = RON`
- **Share to:** Google Ads

#### 5. Mobile Notary Visitors
- **Type:** Event-based
- **Conditions:**
  - Users who visited `/booking?mode=MOBILE` OR `/services/mobile-notary`
  - OR triggered `service_view` with parameter `service_type = MOBILE`
- **Share to:** Google Ads

#### 6. Loan Signing Visitors
- **Type:** Event-based
- **Conditions:**
  - Users who visited `/booking?serviceType=LOAN_SIGNING` OR `/services/loan-signing-specialist`
  - OR triggered `service_view` with parameter `service_type = LOAN_SIGNING`
- **Share to:** Google Ads

#### 7. Abandoned Booking
- **Type:** Event-based
- **Conditions:**
  - Users who triggered `booking_started` but NOT `booking_completed`
  - Time window: Last 30 days
- **Share to:** Google Ads

### Steps to Create:
1. GA4 → Admin → Data display → Audiences
2. Click "New audience" → "Create a custom audience"
3. Build each audience using conditions above
4. Under "Audience triggers" → Enable "Google Ads" sharing
5. Save

---

## 3. Google Ads Campaign Structure

### Campaign 1: RON (Remote Online Notarization)
- **Budget:** 50% of total (e.g., $5.00/day if $300/mo, $8.50/day if $500/mo)
- **Bidding:** Maximize Conversions (move to tCPA after 30 conversions)
- **Target CPA:** TBD after data
- **Geo Targeting:**
  - Include: Radius 50mi from 77591 (Texas City, TX)
  - Include: ZIP codes (list all service areas)
  - Exclude: Downtown Houston (specific ZIPs)
  - Exclude: Areas >50mi from 77591
- **Ad Groups:**
  1. **RON - Exact Intent**
     - Keywords: [remote online notary], [ron notary], [online notarization], [virtual notary]
  2. **RON - Phrase Intent**
     - Keywords: "remote online notary", "ron notary service", "online notarization texas"
  3. **RON - RON + Location**
     - Keywords: "remote online notary houston", "ron notary texas", "online notary texas city"

### Campaign 2: Mobile Notary
- **Budget:** 35% of total (e.g., $3.50/day if $300/mo, $6.00/day if $500/mo)
- **Bidding:** Maximize Conversions
- **Geo Targeting:** Same as RON
- **Ad Groups:**
  1. **Mobile - Emergency/Near Me**
     - Keywords: "mobile notary near me", "notary near me", "mobile notary emergency", "same day notary"
  2. **Mobile - Open Now**
     - Keywords: "mobile notary open now", "24/7 mobile notary", "mobile notary today"
  3. **Mobile - Location + Service**
     - Keywords: "mobile notary houston", "mobile notary texas city", "mobile notary webster"

### Campaign 3: Loan Signing
- **Budget:** 15% of total (e.g., $1.50/day if $300/mo, $2.50/day if $500/mo)
- **Bidding:** Maximize Conversions
- **Geo Targeting:** Same as RON
- **Ad Groups:**
  1. **Loan Signing - Escrow/Title Intent**
     - Keywords: "loan signing agent", "notary signing agent", "loan signing houston", "escrow notary"
  2. **Loan Signing - Real Estate**
     - Keywords: "real estate notary", "mortgage signing agent", "title company notary"

### Negative Keywords (Campaign Level):
- free, free notary, free mobile notary
- ups, ups store, ups notary
- bank, bank notary, bank of america
- dmv, dmv notary, dmv services
- template, notary template, document template
- immigration, immigration lawyer, immigration attorney
- lawyer, attorney, legal advice, legal counsel
- diy, do it yourself, how to become
- jobs, hiring, employment, career

### Ad Extensions (All Campaigns):

#### Sitelinks:
1. Book Now → `https://houstonmobilenotarypros.com/booking`
2. Pricing → `https://houstonmobilenotarypros.com/pricing`
3. RON Services → `https://houstonmobilenotarypros.com/services/remote-online-notarization`
4. Mobile Notary → `https://houstonmobilenotarypros.com/services/mobile-notary`

#### Callouts:
- Same-day available
- 25-mile radius included
- Transparent pricing
- Licensed & bonded
- 24/7 availability
- Pay on site

#### Structured Snippets:
- Services: Mobile Notary, RON, Loan Signing
- Service Options: Same-day, After-hours, Emergency

#### Call Extension:
- Phone: (832) 617-4285
- Call reporting: Enabled

#### Location Extension:
- Link to Google Business Profile (after GBP linking)

---

## 4. Conversion Actions

### Primary Conversions (Include in "Conversions" column):

#### 1. Booking (Website)
- **Type:** Website action
- **Category:** Purchase
- **Value:** Yes (use value from booking)
- **Count:** One
- **Attribution:** Data-driven
- **Action:** `booking_completed` event from GA4
- **Include in "Conversions":** Yes

#### 2. Calls from Ads
- **Type:** Phone calls
- **Category:** Lead
- **Value:** No
- **Count:** One
- **Attribution:** Data-driven
- **Call length:** 60 seconds minimum
- **Include in "Conversions":** Yes

### Secondary Conversions (Do NOT include in "Conversions" column):

#### 3. Click-to-Call (Website)
- **Type:** Phone calls from website
- **Category:** Lead
- **Value:** No
- **Count:** One
- **Attribution:** Data-driven
- **Include in "Conversions":** No (tracking only)

#### 4. Qualified Call - HMNP (Offline Import)
- **Type:** Offline conversion import
- **Category:** Lead
- **Value:** No
- **Count:** One
- **Attribution:** Data-driven
- **Include in "Conversions":** No (tracking only, used for optimization)

---

## 5. Offline Conversion Import Setup (GHL)

### Prerequisites:
1. **GHL Custom Field:** Ensure `gclid` field exists
   - Settings → Custom Fields → Text field "gclid"
   - Add to booking form/contact capture

2. **GHL Export Format (Daily CSV):**
   - Columns required:
     - `gclid` (Google Click ID)
     - `call_start_time` (UTC format: YYYY-MM-DD HH:MM:SS)
     - `call_duration_seconds` (integer)
     - `contact_id` or `email` (for reference)
   - Filter: Calls ≥ 60 seconds, Status = Answered/Qualified
   - Export daily at end of business day

3. **Google Ads Offline Conversion Setup:**
   - Tools & Settings → Conversions → "+" → Import → Offline conversions
   - Create conversion action: "Qualified Call - HMNP"
   - Upload CSV with columns: `gclid`, `conversion_time`, `conversion_value` (optional)
   - Map: `gclid` → Google Click ID, `call_start_time` → Conversion time

### Import Script (To be built):
- Daily automated import from GHL CSV
- Format: `gclid`, `conversion_time` (UTC), `conversion_value` = 0
- Upload to Google Ads via API or manual upload

---

## 6. Google Business Profile Linking

### Steps:
1. **In Google Ads:**
   - Tools & Settings → Linked accounts → Business Profile
   - Click "Link" → Search for "Houston Mobile Notary Pros LLC"
   - Select and link

2. **Attach Location Asset:**
   - After campaigns are live
   - Campaigns → Select campaign → Assets → Location assets
   - Add linked GBP location

### GBP Optimization Checklist:
- [ ] Name: Houston Mobile Notary Pros LLC
- [ ] Business type: Service-area business
- [ ] Service areas: List all ZIPs/cities
- [ ] Categories: Notary Public (primary), Mobile Notary Service, Loan Signing Agent
- [ ] Services: RON ($25/act), Mobile ($75 base), Loan ($175 base) with pricing
- [ ] Hours: Standard hours + "After-hours by appointment" note
- [ ] Messaging: Enabled
- [ ] Appointment link: `https://houstonmobilenotarypros.com/booking`
- [ ] Photos: Logo, staff, service context, service-area friendly
- [ ] Q&A: Seed 5-8 questions with answers + booking links
- [ ] Review reply template: Prepared

---

## 7. GA4 ↔ Search Console Linking

### Steps:
1. **In GA4:**
   - Admin → Product Links → Search Console Links
   - Click "Link" → Select property: `houstonmobilenotarypros.com` (domain property)
   - Enable data sharing
   - Submit

### Verification:
- GA4 → Admin → Product Links → Search Console Links → Should show linked property

---

## 8. Campaign Launch Checklist

### Pre-Launch:
- [ ] GA4 ↔ Ads linked
- [ ] Audiences created and shared
- [ ] Campaigns built (3 campaigns, 7 ad groups total)
- [ ] Ad extensions added (sitelinks, callouts, structured snippets, call, location)
- [ ] Negative keywords added
- [ ] Geo targeting set (include/exclude)
- [ ] Conversion actions created (Booking, Calls from ads)
- [ ] Tag Assistant validation (GTM/GA4 events firing)
- [ ] GBP linked to Ads
- [ ] Location asset attached

### Day 1 Monitoring:
- [ ] Campaigns live and spending
- [ ] Impressions/clicks tracking
- [ ] Conversions firing (Booking, Calls)
- [ ] Search terms report (add negatives)
- [ ] Quality Score check
- [ ] Ad position monitoring
- [ ] Budget pacing (not overspending)

---

## 9. Budget Allocation Examples

### If $300/month (~$10/day):
- RON: $5.00/day ($150/mo)
- Mobile: $3.50/day ($105/mo)
- Loan: $1.50/day ($45/mo)

### If $500/month (~$16.67/day):
- RON: $8.50/day ($255/mo)
- Mobile: $6.00/day ($180/mo)
- Loan: $2.50/day ($65/mo)

---

## 10. Next Steps (After Launch)

1. **Week 1:**
   - Daily search terms review (add negatives)
   - Monitor Quality Scores
   - Check conversion tracking
   - Adjust bids if needed

2. **Week 2-4:**
   - Weekly search terms cleanup
   - Budget adjustments based on performance
   - Ad copy testing
   - Asset performance review

3. **Month 2:**
   - Move to tCPA bidding (if 30+ conversions)
   - Build "warm start" remarketing campaign
   - Optimize geo targeting
   - Expand top-performing keywords

---

## Notes:
- Primary phone standardized: (832) 617-4285
- NAP cleanup needed: Yelp, Facebook, Chamber (update phone)
- GBP appointment link: `/booking`
- Offline conversion imports: Daily from GHL (calls >60s)

---

**Status:** Ready to execute once Google Ads access confirmed.










