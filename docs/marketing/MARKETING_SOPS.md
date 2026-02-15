# Marketing Standard Operating Procedures (SOPs)
**Houston Mobile Notary Pros LLC**  
**Ads Weekly | GA4 Sanity | GBP Monthly | Security**

---

## 🎯 Overview

This document outlines standard operating procedures for maintaining and optimizing HMNP's marketing operations, ensuring consistent performance and security compliance.

---

## 📅 SOP 1: Google Ads Weekly Routine

**Frequency:** Every Monday morning (30-45 minutes)

**Owner:** Marketing Manager / Campaign Manager

---

### **Monday Morning Checklist**

#### **1. Performance Review (10 min)**

**Check Last Week's KPIs:**
- [ ] Total leads (bookings + calls)
- [ ] Cost per lead (CPL) — Target: < $30
- [ ] Total spend — Compare to weekly budget
- [ ] Conversion rate — Target: 5-10%
- [ ] Quality Score (avg) — Target: 7-10

**Action:**
- If CPL > $35 for any campaign → Flag for optimization
- If spend > 125% of weekly budget → Reduce bids or pause low performers
- If conversion rate < 3% → Review landing pages and ad copy

**Dashboard:**
- Open Looker Studio dashboard → Executive Overview page
- Export weekly summary (screenshot or PDF)

---

#### **2. Search Terms Cleanup (15 min)**

**Why:** Remove irrelevant search queries that waste budget

**Steps:**
1. **Google Ads → Campaigns → Insights & reports → Search terms**
2. **Sort by:** Cost (highest first)
3. **Review top 50 search terms:**
   - ❌ Irrelevant? → Add as negative keyword
   - ✅ High-performing? → Add as exact match keyword
   - ⚠️ Low CTR/CR? → Consider excluding or bid down

**Common Negative Keywords to Add:**
- "free notary"
- "UPS notary"
- "bank notary"
- "DMV notary"
- "notary template"
- "notary immigration"
- "legal advice"
- "lawyer"
- Wrong locations (if appearing outside service area)

**Action:**
- Add negatives at campaign level (applies to all ad groups)
- Add high-performers as keywords in relevant ad groups

---

#### **3. Bid & Budget Adjustments (10 min)**

**Review:**
- Campaigns with CPL < $25 → Increase budget by 10-20%
- Campaigns with CPL > $40 → Decrease bids or pause
- Ad groups with low impression share → Increase bids

**Steps:**
1. **Campaigns → Column: CPL (custom metric)**
2. **Sort by CPL**
3. **Green (CPL < $25):**
   - Increase daily budget by $5-$10
   - Or increase bids by $0.25
4. **Red (CPL > $40):**
   - Decrease bids by $0.50
   - Or pause campaign and investigate

**Budget Pacing:**
- Check: Current spend / Monthly budget
- If > 90% before month end → Reduce bids
- If < 70% mid-month → Increase bids for top campaigns

---

#### **4. Ad Asset Testing (5 min)**

**Review:**
- Which headlines are performing best?
- Which descriptions have highest CTR?
- Are sitelinks being clicked?

**Steps:**
1. **Campaigns → Ads & assets → Ads**
2. **Review RSA (Responsive Search Ads) performance:**
   - Click "View asset details"
   - Check asset performance rating (Low, Good, Best)
3. **Actions:**
   - Remove "Low" performing headlines/descriptions
   - Add new variants to test (keep 10-15 headlines, 4-5 descriptions)
4. **Sitelink Review:**
   - Check click-through rate on sitelinks
   - Update URLs if needed (e.g., link to seasonal offers)

---

#### **5. Location & Call Asset Health Check (5 min)**

**Location Asset:**
- [ ] GBP is linked and active
- [ ] Address is correct (service area business)
- [ ] Business hours are up to date

**Call Asset:**
- [ ] Phone number: (832) 617-4285 is active
- [ ] Call forwarding is working (test by calling)
- [ ] Call reporting shows recent calls (if not, investigate)

**Steps:**
1. **Campaigns → Assets → Location assets**
   - Status should be "Eligible" (green)
2. **Campaigns → Assets → Call assets**
   - Test phone number → Call and verify it rings
3. **If issues:** Relink GBP or re-add call asset

---

### **Weekly Reporting**

**Create Summary Email/Slack Post:**

```
📊 **Google Ads Weekly Summary** (Nov 4-10)

✅ **Performance:**
- Leads: 12 (+3 vs. last week)
- CPL: $28.50 (-$4.50 vs. last week)
- Spend: $342 (68% of weekly budget)
- Conv Rate: 7.2% (+1.5% vs. last week)

🔧 **Actions Taken:**
- Added 8 negative keywords (free, UPS, DMV, etc.)
- Increased RON campaign budget by $10/day (CPL = $22)
- Paused "Loan Signing - Broad" ad group (CPL = $45)
- Updated RSA headlines (removed 2 low performers)

🎯 **Next Week Focus:**
- Monitor RON campaign after budget increase
- Test new sitelink: "Emergency Notary 24/7"
- Review mobile device performance (mobile CPL = $32 vs. desktop $25)

cc: @owner @team
```

---

## 🔍 SOP 2: GA4 Events Sanity Checklist

**Frequency:** Weekly (15 minutes) + After any website changes

**Owner:** Web Developer / Marketing Manager

---

### **GA4 DebugView Check**

**Purpose:** Ensure all tracking events are firing correctly

**Steps:**
1. **GA4 → Admin → DebugView**
2. **Open website in incognito mode** with `?debug_mode=1` parameter
3. **Test critical events:**

#### **Events to Verify:**

| Event | Trigger | How to Test | Expected Parameters |
|-------|---------|-------------|---------------------|
| `page_view` | Every page load | Navigate to homepage | `page_location`, `page_title` |
| `session_start` | New session | Clear cookies, reload | `session_id`, `engagement_time_msec` |
| `booking_complete` | Form submission | Submit booking form | `value`, `currency`, `transaction_id` |
| `click` | Button clicks | Click phone, CTA buttons | `link_text`, `outbound` |
| `form_start` | Booking form opened | Click "Book Now" | `form_id`, `form_name` |
| `scroll` | Page scroll | Scroll to 90% | `percent_scrolled` |

**Action:**
- ✅ Event fires correctly → No action
- ❌ Event missing or incorrect parameters → Fix GTM/GA4 config
- ⚠️ Event firing multiple times → Check for duplicate tags

---

### **GTM Publish Flow Checklist**

**Before Publishing Changes:**
- [ ] Test in Preview mode (GTM → Preview → Connect to website)
- [ ] Verify events fire in GA4 DebugView
- [ ] Check for JavaScript errors (Browser DevTools → Console)
- [ ] Test on mobile device (responsive design)
- [ ] Verify `gclid` is being captured (check URL parameters)
- [ ] Test booking form submission end-to-end

**After Publishing:**
- [ ] Wait 24 hours
- [ ] Check GA4 Reports → Realtime → Events (verify live data)
- [ ] Review conversions in Google Ads (should match GA4)
- [ ] Document changes in GTM version notes

**GTM Version Notes Example:**
```
Version 12 - Added booking_complete event
- Trigger: Form submit - #booking-form
- Event parameters: value=35, currency=USD, transaction_id=[auto]
- Tested: ✅ Desktop, ✅ Mobile, ✅ GA4 DebugView
- Deployed: 2025-11-06
```

---

### **Conversion Tracking Validation**

**Monthly Check (1st of month):**

1. **Compare Google Ads vs. GA4 Conversions:**
   - Google Ads: Tools → Conversions → Check last month's count
   - GA4: Reports → Conversions → Check last month's count
   - **Expected:** Should match within ±10% (some discrepancy is normal)

2. **If Mismatch > 20%:**
   - Check GTM tags are firing
   - Verify GA4 is linked to Google Ads
   - Review conversion attribution settings (GA4 vs. Ads may use different attribution models)

3. **Check Conversion Delay:**
   - Google Ads: Tools → Conversions → Select conversion → "Days to conversion"
   - Most conversions should be 0-1 days (same-day)
   - If many are 7+ days → May indicate tracking issues

---

## 🗺️ SOP 3: Google Business Profile (GBP) Monthly Routine

**Frequency:** 1st of every month (45-60 minutes)

**Owner:** Marketing Manager / Owner

---

### **Monthly GBP Checklist**

#### **1. Upload Fresh Photos (10 min)**

**Why:** Active profiles rank higher in local search

**Photo Requirements:**
- Minimum: 3 new photos per month
- Types: Logo, exterior, interior, team, at work, products/services
- Quality: High-resolution (1200x900px minimum), well-lit, professional

**Upload Process:**
1. **Go to:** https://business.google.com/
2. **Photos → Add photos**
3. **Upload:**
   - 1 team photo (you or your notary team)
   - 1 service photo (notarizing documents, mobile setup)
   - 1 location photo (service area, office, or vehicle)

**Best Practices:**
- Avoid stock photos (Google can detect and deprioritize)
- Include people (builds trust)
- Show your service in action

---

#### **2. Create Monthly Post (10 min)**

**Why:** Fresh content signals active business to Google

**Post Ideas:**
- Monthly special/promotion
- Service highlight (RON, Mobile, Loan Signing)
- Customer testimonial (with permission)
- Behind-the-scenes (service preparation, travel setup)
- Seasonal reminder (tax season, estate planning, real estate closings)

**Post Template:**
```
🔔 [Month] Special: [Service Name]

[Brief description of offer or service benefit]

✅ [Benefit 1]
✅ [Benefit 2]
✅ [Benefit 3]

📞 Call: (832) 617-4285
🌐 Book Online: houstonmobilenotarypros.com/booking

#Houston #Notary #MobileNotary #[City]
```

**Example (November):**
```
🔔 November Special: Mobile Notary Service

Need documents notarized at your home or office? We come to you! 
Same-day appointments available.

✅ Flawless service guaranteed—or we pay the redraw fee
✅ Serving Webster, League City, Texas City & surrounding areas
✅ After-hours & weekend appointments available

📞 Call: (832) 617-4285
🌐 Book Online: houstonmobilenotarypros.com/booking

#Houston #Notary #MobileNotary #Webster #LeagueCity
```

**Upload Process:**
1. **GBP Dashboard → Posts → Create post**
2. **Add photo** (optional but recommended)
3. **Add call-to-action:** "Book" → Link to booking page
4. **Schedule or publish immediately**

---

#### **3. Seed/Answer Q&A (15 min)**

**Why:** Proactively answer common questions, improve SEO

**Questions to Seed (if not already asked):**

1. **"What services do you offer?"**
   - Answer: "We provide Remote Online Notarization (RON), Mobile Notary services, and Loan Signing Agent services. Serving Webster, League City, Texas City, and surrounding areas. Book online: houstonmobilenotarypros.com/booking"

2. **"How much does a mobile notary cost?"**
   - Answer: "Mobile notary starts at $75 (includes 20 miles). After-hours: $125. RON: $25/act. Loan signing: $175. View full pricing: houstonmobilenotarypros.com/pricing"

3. **"Do you offer same-day appointments?"**
   - Answer: "Yes! Same-day mobile notary appointments available. Call (832) 617-4285 or book online."

4. **"What areas do you serve?"**
   - Answer: "We serve Webster, League City, Texas City, Pearland, Sugar Land, Galveston, Baytown, and surrounding areas within 50 miles of Texas City, TX."

5. **"Can you notarize documents remotely?"**
   - Answer: "Yes! We offer Remote Online Notarization (RON) starting at $25/act. Book online: houstonmobilenotarypros.com/ron"

6. **"What forms of payment do you accept?"**
   - Answer: "We accept cash, credit/debit cards, Zelle, and Venmo for mobile notary services."

7. **"Are you available after hours?"**
   - Answer: "Yes! After-hours mobile notary available starting at $125. Call (832) 617-4285 to schedule."

8. **"Do I need to bring ID?"**
   - Answer: "Yes, all signers must present valid government-issued photo ID (driver's license, passport, etc.)."

**How to Seed:**
1. **GBP Dashboard → Messaging or Q&A section**
2. **Click "Ask a question"** (or have someone else ask)
3. **Answer publicly** within 24 hours
4. **Include booking link or phone in answer**

---

#### **4. Review & Respond to Reviews (10 min)**

**Check for New Reviews:**
- GBP Dashboard → Reviews
- Sort by: Most recent

**Response Template (Positive Reviews):**
```
Hi [Customer Name],

Thank you so much for your kind words! We're thrilled we could help with your [service type] needs. If you ever need notary services again, don't hesitate to reach out!

Best regards,
Houston Mobile Notary Pros
(832) 617-4285
houstonmobilenotarypros.com
```

**Response Template (Negative Reviews):**
```
Hi [Customer Name],

We sincerely apologize for your experience. This is not the level of service we strive for. We'd love to make this right—please contact us directly at (832) 617-4285 or contact@houstonmobilenotarypros.com so we can resolve this.

Thank you,
Houston Mobile Notary Pros
```

**Best Practices:**
- Respond to ALL reviews within 24-48 hours
- Keep responses professional and friendly
- Include phone or booking link in positive review responses
- Never argue with negative reviews publicly (take offline)

---

#### **5. Update Business Information (5 min)**

**Monthly Check:**
- [ ] Business hours still correct (including after-hours note)?
- [ ] Service areas still accurate?
- [ ] Appointment link working? (test `/booking` page)
- [ ] Phone number correct: (832) 617-4285
- [ ] Messaging enabled and notifications set up?
- [ ] Business description up to date?

**If Changes Needed:**
1. **GBP Dashboard → Info**
2. **Edit relevant sections**
3. **Save changes**
4. **Wait 24-48 hours for Google to approve**

---

#### **6. Export GBP Insights (10 min)**

**For Looker Studio Dashboard:**

1. **GBP Dashboard → Performance → Insights**
2. **Export data:**
   - Date range: Last 30 days
   - Metrics: Profile views, search queries, actions (calls, directions, website clicks)
3. **Save as CSV or Google Sheets**
4. **Upload to Looker Studio** (if not using API connector)

**Key Metrics to Track:**
- Profile views (month vs. last month)
- Direct vs. Discovery searches
- Calls from GBP
- Directions requests
- Website clicks
- Booking button clicks (if available)

**Goal:** Month-over-month growth in all metrics

---

## 🔒 SOP 4: Security & PII Handling

**Frequency:** Always (ongoing compliance)

**Owner:** All team members with access to customer data

---

### **PII (Personally Identifiable Information) Guidelines**

**What is PII?**
- Names
- Phone numbers
- Email addresses
- Addresses (home or business)
- Social Security Numbers (SSNs)
- Driver's License Numbers
- Passport Numbers
- Financial information (credit cards, bank accounts)
- Any document content (contracts, wills, deeds, etc.)

**Rules:**
1. ✅ **DO:** Store PII in secure systems only (GHL, encrypted database)
2. ✅ **DO:** Use HTTPS for all web forms
3. ✅ **DO:** Redact PII in screenshots or screen recordings
4. ❌ **DON'T:** Share PII in Slack, email, or unsecured channels
5. ❌ **DON'T:** Store PII in Looker Studio or public dashboards
6. ❌ **DON'T:** Include PII in Google Ads or GA4 tracking

---

### **Google Ads Restricted Topics**

**DO NOT advertise or mention:**
- Legal advice (we are NOT attorneys)
- Immigration services (notary public ≠ notario publico)
- Guarantees of specific outcomes ("Guaranteed approval", etc.)
- Medical advice or services
- Government services (DMV, passport, birth certificate issuance)

**Why:** Violates Google Ads policies → Account suspension

**Safe Messaging:**
- "Professional notary services for document notarization"
- "Mobile notary for real estate, estate planning, and business documents"
- "Remote Online Notarization (RON) available"

---

### **Data Access & Credentials**

**Who Has Access:**
- Owner: Full admin access (Google Ads, GA4, GBP, GHL)
- Marketing Manager: Admin access (Google Ads, GA4, GBP)
- Campaign Manager: Standard access (Google Ads)
- Web Developer: Editor access (GA4, GTM)

**Password Security:**
- Use password manager (1Password, LastPass, Bitwarden)
- Enable 2FA (two-factor authentication) on all accounts
- Never share passwords via email or Slack
- Rotate passwords every 90 days

**Access Audit (Quarterly):**
1. Review all users with access to Google Ads, GA4, GBP, GHL
2. Remove access for anyone who left the team
3. Update permissions if roles changed

---

### **Customer Data Retention**

**GHL / CRM:**
- Keep customer records for 7 years (legal requirement for notaries)
- Store securely with encryption
- Backup weekly to secure cloud storage

**Google Ads / GA4:**
- No PII should be stored in these platforms
- If PII is accidentally captured (e.g., in a form field), delete immediately
- Set GA4 data retention to 14 months (Admin → Data Settings → Data Retention)

**Documents:**
- Notarized documents (if stored) → Secure, encrypted storage only
- Delete temporary uploads after 30 days (prebooking uploads)
- Never store SSNs, credit card numbers, or financial documents online

---

### **Incident Response (Data Breach)**

**If Customer Data is Compromised:**

1. **Immediately:**
   - Change all passwords
   - Revoke access for any compromised accounts
   - Notify owner/management

2. **Within 24 hours:**
   - Assess scope of breach (what data? how many customers?)
   - Notify affected customers via email/phone
   - Report to authorities if required by law (GDPR, CCPA, etc.)

3. **Within 1 week:**
   - Conduct security audit
   - Implement fixes to prevent recurrence
   - Document incident in security log

**Emergency Contact:**
- Owner: [Phone number]
- IT Support: [If applicable]

---

## 📋 SOP Summary: Weekly & Monthly Calendar

### **Weekly Tasks (Every Monday)**
- [ ] Google Ads performance review (10 min)
- [ ] Search terms cleanup (15 min)
- [ ] Bid & budget adjustments (10 min)
- [ ] Ad asset testing (5 min)
- [ ] Location & call asset health check (5 min)
- [ ] GA4 event sanity check (15 min)

**Total Time:** 60 minutes/week

---

### **Monthly Tasks (1st of Month)**
- [ ] GBP: Upload 3 new photos (10 min)
- [ ] GBP: Create monthly post (10 min)
- [ ] GBP: Seed/answer Q&A (15 min)
- [ ] GBP: Review & respond to reviews (10 min)
- [ ] GBP: Update business information (5 min)
- [ ] GBP: Export insights to dashboard (10 min)
- [ ] Google Ads: Monthly performance report (20 min)
- [ ] GA4: Conversion tracking validation (15 min)
- [ ] Security: Access audit (quarterly, 30 min)

**Total Time:** 95 minutes/month + 30 min/quarter

---

## 📞 Support & Escalation

**If Issues Arise:**

**Google Ads Issues:**
- Check Google Ads Help: https://support.google.com/google-ads
- Contact Google Ads Support: In-platform chat (Tools → Help)

**GA4 Issues:**
- Check GA4 Help: https://support.google.com/analytics
- Review GTM configuration (Admin → Tag Manager)

**GBP Issues:**
- Check GBP Help: https://support.google.com/business
- GBP Support: https://support.google.com/business/gethelp

**Data Security Issues:**
- Notify owner immediately
- Follow incident response procedure (above)

---

**Last Updated:** 2025-11-06  
**Version:** 1.0  
**Next Review:** 2025-12-06








