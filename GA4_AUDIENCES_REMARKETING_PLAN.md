# GA4 Audiences & Remarketing Strategy
**Houston Mobile Notary Pros LLC**  
**Integration: GA4 → Google Ads**

---

## 🎯 Overview

This document defines all GA4 audiences for remarketing, optimization, and reporting. These audiences will be shared with Google Ads to enable targeted remarketing campaigns and smart bidding optimization.

---

## 📊 Audience Strategy

### Primary Goals

1. **Remarketing:** Re-engage users who didn't convert
2. **Smart Bidding:** Help Google Ads identify high-value user patterns
3. **Reporting:** Segment performance by user behavior
4. **Exclusions:** Avoid wasting budget on converted users

---

## 👥 GA4 Audience Definitions

### **1. All Engagers (7/30/90-day)**

**Purpose:** Users who showed interest but didn't book

**Criteria:**
- Visited site
- Session duration ≥ 30 seconds OR
- Viewed ≥ 2 pages OR
- Engaged with any interactive element (click phone, pricing calculator, etc.)

**Lookback Windows:**
```
- Engagers 7d: Last 7 days
- Engagers 30d: Last 30 days  
- Engagers 90d: Last 90 days
```

**GA4 Configuration:**
```
Audience name: "Engagers - 7 days"
Membership duration: 7 days
Conditions:
  - Event: page_view (count ≥ 2) OR
  - Event: session_start (session duration ≥ 30s) OR
  - Event: engagement_time_msec (≥ 10000)
```

**Use Cases:**
- Remarketing: Show brand awareness ads
- Smart bidding: Identify engaged traffic patterns
- Exclusion: Exclude from cold prospecting

---

### **2. RON (Remote Online Notarization) Visitors**

**Purpose:** Users interested in remote online notarization services

**Criteria:**
- Visited `/services/ron` OR
- Viewed RON service page OR
- Clicked "Book RON" button OR
- Search query contains "remote" OR "online notary"

**GA4 Configuration:**
```
Audience name: "RON Service Visitors"
Membership duration: 30 days
Conditions:
  - Event: page_view
    - page_location contains "/services/ron" OR "/ron"
  OR
  - Event: view_item
    - item_name = "Remote Online Notarization"
  OR
  - Event: click
    - link_text contains "RON" OR "Remote Notary"
```

**Use Cases:**
- Remarketing: RON-specific ads ($25/act special)
- Audience targeting: Bid higher for RON intent
- Reporting: RON marketing effectiveness

---

### **3. Mobile Notary Visitors**

**Purpose:** Users interested in mobile notary services

**Criteria:**
- Visited `/services/mobile-notary` OR
- Viewed mobile notary pricing OR
- Clicked "Book Mobile Notary" OR
- Searched for "mobile notary near me"

**GA4 Configuration:**
```
Audience name: "Mobile Notary Service Visitors"
Membership duration: 30 days
Conditions:
  - Event: page_view
    - page_location contains "/services/mobile" OR "/mobile-notary"
  OR
  - Event: view_item
    - item_name = "Mobile Notary"
  OR
  - Event: click
    - link_text contains "Mobile" AND "Notary"
```

**Use Cases:**
- Remarketing: Mobile notary ads (emergency, after-hours)
- Audience targeting: Geo-specific (within 30 miles)
- Reporting: Mobile service demand by location

---

### **4. Loan Signing Visitors**

**Purpose:** Users interested in loan signing services

**Criteria:**
- Visited `/services/loan-signing` OR
- Viewed loan signing pricing OR
- Clicked "Book Loan Signing" OR
- Referral from title company / escrow sites

**GA4 Configuration:**
```
Audience name: "Loan Signing Service Visitors"
Membership duration: 45 days
Conditions:
  - Event: page_view
    - page_location contains "/services/loan" OR "/loan-signing"
  OR
  - Event: view_item
    - item_name = "Loan Signing Agent"
  OR
  - Event: click
    - link_text contains "Loan Signing"
  OR
  - Event: first_visit
    - source contains "escrow" OR "title"
```

**Use Cases:**
- Remarketing: B2B loan signing ads (title companies, lenders)
- Audience targeting: Higher value ($175 avg)
- Reporting: Loan signing lead quality

---

### **5. Abandoned Booking**

**Purpose:** Users who started but didn't complete booking

**Criteria:**
- Viewed `/booking` page
- Did NOT complete booking form submission
- Session ended without `booking_complete` event

**GA4 Configuration:**
```
Audience name: "Abandoned Booking"
Membership duration: 14 days
Conditions:
  Include:
    - Event: page_view
      - page_location contains "/booking"
  Exclude:
    - Event: booking_complete OR form_submit
      - form_id = "booking_form"
```

**Use Cases:**
- Remarketing: Urgent retargeting with discount/incentive
- Optimization: Highest intent, highest priority
- Analysis: Identify booking friction points

---

### **6. Pricing Page Visitors**

**Purpose:** Users who reviewed pricing but didn't book

**Criteria:**
- Visited `/pricing` page OR
- Clicked pricing calculator OR
- Viewed any service pricing section

**GA4 Configuration:**
```
Audience name: "Pricing Page Visitors"
Membership duration: 30 days
Conditions:
  - Event: page_view
    - page_location contains "/pricing"
  OR
  - Event: calculator_use
  OR
  - Event: view_item_list
    - item_list_name = "Services Pricing"
```

**Use Cases:**
- Remarketing: Address price objections, show value props
- Optimization: Price-sensitive segment
- Testing: A/B test pricing messaging

---

### **7. Service Area Visitors (Geo-Specific)**

**Purpose:** Users from high-value service areas

**Criteria:**
- Geolocation in:
  - Webster, TX (77598)
  - League City, TX (77573)
  - Texas City, TX (77590, 77591)
  - Pearland, TX (77581, 77584)
  - Sugar Land, TX (77478, 77479)

**GA4 Configuration:**
```
Audience name: "Primary Service Area - Texas Gulf Coast"
Membership duration: 60 days
Conditions:
  - User property: city
    - city = "Webster" OR "League City" OR "Texas City" OR "Pearland" OR "Sugar Land"
  OR
  - Event: first_visit
    - geo_region = "TX" AND
    - geo_city matches_regex "(Webster|League City|Texas City|Pearland|Sugar Land)"
```

**Use Cases:**
- Remarketing: Geo-specific ads ("Serving Webster, TX")
- Bid adjustments: Higher bids for primary service area
- Reporting: Performance by location

---

### **8. Converters (Exclusion Audience)**

**Purpose:** Users who already booked (exclude from ads)

**Criteria:**
- Completed booking form submission
- Event: `booking_complete` fired

**GA4 Configuration:**
```
Audience name: "Converters - Exclude"
Membership duration: 90 days
Conditions:
  - Event: booking_complete OR purchase OR conversion
```

**Use Cases:**
- Exclusion: Don't show ads to recent converters
- Cost savings: Avoid wasted impressions
- Exception: Can show cross-sell/upsell ads for different services

---

### **9. High-Value Engagers**

**Purpose:** Users with strong engagement signals

**Criteria:**
- Viewed ≥ 5 pages
- Session duration ≥ 3 minutes
- Multiple visits (≥ 2)
- Engaged with interactive elements

**GA4 Configuration:**
```
Audience name: "High-Value Engagers"
Membership duration: 30 days
Conditions:
  - Event: page_view (count ≥ 5) AND
  - Event: session_start (avg session duration ≥ 180s) AND
  - User property: sessions_count ≥ 2
```

**Use Cases:**
- Remarketing: Premium messaging, testimonials, trust signals
- Optimization: Similar audience targeting (Lookalike)
- Reporting: Identify conversion path patterns

---

### **10. Mobile Device Users**

**Purpose:** Users on mobile devices (high intent for mobile notary)

**Criteria:**
- Device category = mobile OR tablet
- Visited mobile notary pages

**GA4 Configuration:**
```
Audience name: "Mobile Device - Mobile Notary Interest"
Membership duration: 30 days
Conditions:
  - User property: device_category = "mobile" OR "tablet" AND
  - Event: page_view
    - page_location contains "/mobile" OR "/services"
```

**Use Cases:**
- Remarketing: Click-to-call ads, mobile-optimized landing pages
- Optimization: Mobile-first ad creative
- Reporting: Mobile vs. desktop conversion rates

---

## 🔗 Sharing Audiences to Google Ads

### Setup Process

**In GA4:**

1. **Admin → Audience Definitions → Audiences**
2. For each audience above, click "Create Audience"
3. Configure conditions as specified
4. Set membership duration
5. Click "Publish to Google Ads"
6. Select linked Google Ads account (Customer ID: 5072649468)
7. Save and publish

**In Google Ads:**

1. **Tools → Shared Library → Audience Manager**
2. Verify GA4 audiences appear under "Your data sources → Google Analytics"
3. Add audiences to campaigns:
   - Campaign → Audiences → "Edit audience segments"
   - Select GA4 audiences
   - Set observation mode (to start) or targeting mode (for remarketing)

**Observation vs. Targeting:**
- **Observation:** Collect data without restricting ad delivery (recommended to start)
- **Targeting:** Only show ads to users in audience (for remarketing campaigns)

---

## 🎯 Campaign-Specific Audience Strategy

### **RON Campaign**
**Audiences to Add (Observation):**
- RON Service Visitors
- Engagers 30d
- High-Value Engagers

**Why:** Learn which user patterns convert for RON

---

### **Mobile Notary Campaign**
**Audiences to Add (Observation):**
- Mobile Notary Service Visitors
- Primary Service Area
- Mobile Device - Mobile Notary Interest
- Engagers 30d

**Why:** Optimize for local mobile traffic

---

### **Loan Signing Campaign**
**Audiences to Add (Observation):**
- Loan Signing Service Visitors
- High-Value Engagers
- Engagers 30d

**Why:** Identify B2B patterns (title companies, lenders)

---

### **Remarketing Campaign (Future)**
**Audiences to Target:**
- Abandoned Booking (highest priority)
- Pricing Page Visitors
- Engagers 7d / 30d
- Service-specific visitors (RON, Mobile, Loan)

**Exclusions:**
- Converters - Exclude (90d)

**Why:** Re-engage warm leads with tailored messaging

---

## 📈 Remarketing Campaign Structure (Future)

### Campaign: "HMNP – Remarketing – All Services"

**Budget:** $100-$200/month (start small, scale based on performance)

**Ad Groups:**
1. **Abandoned Booking**
   - Audience: Abandoned Booking
   - Message: "Still need a notary? Book now – same-day available!"
   - CTA: "Complete Your Booking"

2. **RON Visitors**
   - Audience: RON Service Visitors
   - Message: "Remote notarization from $25 – Fast & secure online"
   - CTA: "Book RON Online"

3. **Mobile Notary Visitors**
   - Audience: Mobile Notary Service Visitors
   - Message: "We come to you! Mobile notary service – Call now"
   - CTA: "Book Mobile Notary"

4. **Pricing Viewers**
   - Audience: Pricing Page Visitors
   - Message: "Transparent pricing, no hidden fees – Book with confidence"
   - CTA: "See Pricing & Book"

**Bidding:**
- Start: Manual CPC ($1.50 cap)
- Scale: Target CPA (~$25-$30)

**Ad Formats:**
- Responsive Display Ads (GDN)
- Responsive Search Ads (Search remarketing)
- Gmail Sponsored Promotions (GSP) for high-intent

---

## 🔬 Lookalike / Similar Audiences (Google Optimized)

Google Ads automatically creates "Similar Audiences" based on your GA4 audiences.

**Setup:**
1. Create a "seed" audience in GA4 (e.g., "Converters")
2. Share to Google Ads
3. Google Ads → Audience Manager → Your data sources
4. Click on audience → "Create similar audience"
5. Add similar audience to campaigns (observation mode)

**Recommended Seed Audiences:**
- Converters (users who booked)
- High-Value Engagers
- Service-specific converters (RON bookers, Mobile bookers, Loan bookers)

**Why:** Reach new users who resemble your best customers

---

## ⚙️ Technical Implementation

### GA4 Events to Verify

Make sure these events are firing correctly (check via GA4 DebugView):

- `page_view` ✅
- `session_start` ✅
- `booking_complete` (form submission)
- `view_item` (service views)
- `click` (button clicks)
- `calculator_use` (pricing calculator)

### GTM Setup Required

If any audiences rely on custom events:

1. **GTM → Tags → New Tag**
2. Tag type: GA4 Event
3. Event name: `booking_complete` or `calculator_use`
4. Trigger: Form submission or button click
5. Publish and test

---

## 📊 Reporting & Monitoring

### Weekly Audience Review

**GA4 → Audiences:**
- Check audience size (should grow over time)
- Review membership trends (spikes = campaign working)
- Verify audience is populating Google Ads

**Google Ads → Audience Manager:**
- Check audience size (must be ≥1,000 for Display, ≥100 for Search)
- Review performance by audience (observation mode data)
- Identify high-performing audiences for targeting

### Key Metrics by Audience

| Audience | Ideal Size | Conv. Rate | CPL Target |
|----------|------------|-----------|------------|
| Abandoned Booking | 50-200/mo | 20-30% | $15-$20 |
| RON Visitors | 100-500/mo | 10-15% | $20-$25 |
| Mobile Notary Visitors | 200-800/mo | 8-12% | $25-$30 |
| Loan Signing Visitors | 50-200/mo | 5-10% | $30-$40 |
| Engagers 30d | 500-2000/mo | 3-5% | $30-$35 |

---

## ✅ Implementation Checklist

### Phase 1: Create GA4 Audiences (Week 1)
- [ ] Create "Engagers 7d/30d/90d" audiences
- [ ] Create "RON Service Visitors" audience
- [ ] Create "Mobile Notary Service Visitors" audience
- [ ] Create "Loan Signing Service Visitors" audience
- [ ] Create "Abandoned Booking" audience
- [ ] Create "Pricing Page Visitors" audience
- [ ] Create "Primary Service Area" audience
- [ ] Create "Converters - Exclude" audience
- [ ] Create "High-Value Engagers" audience
- [ ] Create "Mobile Device - Mobile Notary Interest" audience

### Phase 2: Share to Google Ads (Week 1)
- [ ] Publish all audiences to Google Ads
- [ ] Verify audiences appear in Google Ads Audience Manager
- [ ] Wait 24-48 hours for audiences to populate

### Phase 3: Add to Campaigns (Week 2)
- [ ] Add audiences to RON campaign (observation mode)
- [ ] Add audiences to Mobile Notary campaign (observation mode)
- [ ] Add audiences to Loan Signing campaign (observation mode)
- [ ] Monitor audience performance data

### Phase 4: Remarketing Campaign (Month 2+)
- [ ] Build remarketing campaign structure
- [ ] Create remarketing ads (Display + Search)
- [ ] Set up audience targeting and exclusions
- [ ] Launch with $100/month budget
- [ ] Scale based on performance

---

## 🎯 Expected Impact

**After implementing GA4 audiences:**
- 📊 Better visibility into user behavior patterns
- 🎯 Smarter bidding optimization (Google learns faster)
- 💰 Lower CPL for remarketing (warmer audiences)
- 📈 Higher conversion rates (targeted messaging)
- 🔍 Identify best customer profiles for expansion

**Timeline:**
- Week 1-2: Audience creation and setup
- Week 3-4: Data collection (observation mode)
- Month 2+: Remarketing activation
- Month 3+: Lookalike audience expansion

---

## 📞 Support Resources

**GA4 Audience Builder:**
https://support.google.com/analytics/answer/9267572

**Google Ads Audience Manager:**
https://support.google.com/google-ads/answer/2497941

**Remarketing Best Practices:**
https://support.google.com/google-ads/answer/2453998

---

**Last Updated:** 2025-11-06  
**Status:** Ready for GA4 implementation








