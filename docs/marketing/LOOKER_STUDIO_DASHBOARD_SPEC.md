# Looker Studio Dashboard Specification
**Houston Mobile Notary Pros LLC**  
**Marketing Performance Dashboard**

---

## 🎯 Overview

This document specifies the complete Looker Studio dashboard for tracking leads, cost per lead (CPL), GBP insights, and overall marketing performance for HMNP.

---

## 📊 Dashboard Structure

### Data Sources

1. **Google Ads** — Campaign performance, costs, conversions
2. **Google Analytics 4 (GA4)** — Website traffic, user behavior, conversions
3. **Google Business Profile (GBP)** — Profile views, actions, calls, directions
4. **Google Search Console** — Organic search performance, rankings
5. **(Optional) GoHighLevel API** — CRM data, booking details, qualified calls

---

## 📄 Dashboard Pages

### **Page 1: Executive Overview**

**Purpose:** High-level KPIs at a glance

**Metrics:**
- **Total Leads (Month):** Bookings + Qualified Calls
- **Cost Per Lead (CPL):** Total spend ÷ Leads
- **Total Ad Spend (Month)**
- **Conversion Rate:** Leads ÷ Clicks
- **ROAS (Return on Ad Spend):** Revenue ÷ Spend (if revenue tracking available)

**Visualizations:**
1. **Scorecard:** Total Leads (current month vs. last month)
2. **Scorecard:** CPL (current month vs. last month)
3. **Scorecard:** Total Spend (current month vs. last month)
4. **Line Chart:** Leads by Day (last 30 days)
5. **Pie Chart:** Leads by Service Type (RON, Mobile, Loan Signing)
6. **Bar Chart:** Leads by Campaign (top 5)

**Filters:**
- Date range picker
- Campaign type (Search, Display, Remarketing)
- Service type (RON, Mobile Notary, Loan Signing)

**Example Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  HOUSTON MOBILE NOTARY PROS - MARKETING DASHBOARD           │
│                                                              │
│  [Date Range: Last 30 Days ▼]  [Campaign Type: All ▼]      │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Leads    │  │   CPL    │  │  Spend   │  │  Conv %  │   │
│  │   45     │  │  $28.50  │  │ $1,283   │  │   7.2%   │   │
│  │  ▲12%    │  │  ▼8%     │  │  ▲5%     │  │  ▲1.5%   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
├─────────────────────────────────────────────────────────────┤
│  Leads by Day (Last 30 Days)                                │
│  [Line chart: Daily lead volume]                            │
├────────────────────────┬────────────────────────────────────┤
│  Leads by Service      │  Leads by Campaign                 │
│  [Pie chart]           │  [Bar chart]                       │
│  - RON: 45%            │  - RON Campaign: 20                │
│  - Mobile: 35%         │  - Mobile Campaign: 15             │
│  - Loan: 20%           │  - Loan Campaign: 10               │
└────────────────────────┴────────────────────────────────────┘
```

---

### **Page 2: Channel & Geo Performance**

**Purpose:** Break down performance by traffic source and location

**Metrics by Channel:**
- Leads by channel (Paid Search, Organic, Direct, Referral, Social)
- CPL by channel
- Conversion rate by channel
- Spend by channel (Paid only)

**Metrics by Geography:**
- Leads by city (Webster, League City, Texas City, etc.)
- CPL by service area
- Clicks by ZIP code
- Conversion rate by location

**Visualizations:**
1. **Table:** Performance by Channel (Clicks, Conversions, CPL, Spend)
2. **Geo Map:** Leads by City (Houston metro area)
3. **Bar Chart:** Top 10 Cities by Lead Volume
4. **Heatmap:** ZIP Code Performance (optional, requires geo data)
5. **Line Chart:** Organic vs. Paid Leads Over Time

**Filters:**
- Date range
- Channel
- City/ZIP code
- Device (Mobile, Desktop, Tablet)

---

### **Page 3: Campaign → Ad Group → Keyword Drill-Down**

**Purpose:** Granular performance analysis for Google Ads

**Campaign Level:**
- Campaign name
- Impressions, Clicks, CTR
- Conversions, Conversion rate
- Cost, CPL
- Quality Score (avg)

**Ad Group Level:**
- Ad group name (by campaign)
- Same metrics as campaign

**Keyword Level:**
- Keyword text
- Match type (Exact, Phrase, Broad)
- Search terms (actual queries)
- Same performance metrics

**Visualizations:**
1. **Table (Campaign):** All campaigns, sortable by CPL, conversions, spend
2. **Table (Ad Group):** Filter by selected campaign
3. **Table (Keywords):** Filter by selected ad group, show search terms
4. **Bar Chart:** Top 10 Keywords by Conversions
5. **Scatter Plot:** CPL vs. Conversion Volume (identify sweet spots)

**Filters:**
- Date range
- Campaign (multi-select)
- Ad group (multi-select)
- Match type
- Quality Score range

**Pro Tip:** Color-code rows:
- Green: CPL < $25
- Yellow: CPL $25-$35
- Red: CPL > $35

---

### **Page 4: Conversions (Booking & Calls)**

**Purpose:** Track all conversion types in detail

**Conversion Actions:**
- **Booking – HMNP** (primary)
- **Calls from ads** (primary)
- **Click-to-call (website)** (secondary)
- **Qualified Call – HMNP** (offline import)

**Metrics by Conversion Type:**
- Total conversions
- Conversion rate
- Cost per conversion
- Conversion value (if available)
- Conversion lag time (click to conversion)

**Visualizations:**
1. **Stacked Bar Chart:** Conversions by Type (daily/weekly)
2. **Line Chart:** Booking vs. Calls Trend (last 90 days)
3. **Table:** Conversion Performance by Campaign
4. **Funnel Chart:** Booking Path (Homepage → Services → Pricing → Booking)
5. **Time-of-Day Heatmap:** Conversions by Hour & Day (identify peak times)

**Filters:**
- Date range
- Conversion type
- Campaign
- Device
- Hour of day

**Key Insights:**
- Which campaigns drive bookings vs. calls?
- Best time/day for conversions (optimize ad schedule)
- Booking funnel drop-off points

---

### **Page 5: Cost & CPL Analysis**

**Purpose:** Deep dive into cost efficiency

**Metrics:**
- Total spend by campaign
- CPL by campaign, ad group, keyword
- CPC (cost per click) trends
- CPM (cost per 1000 impressions) for Display
- Budget pacing (% of monthly budget spent)

**Visualizations:**
1. **Line Chart:** Daily Spend vs. Budget (pacing chart)
2. **Waterfall Chart:** Spend Breakdown by Campaign
3. **Scatter Plot:** CPC vs. Conversion Rate (efficiency quadrant)
4. **Table:** CPL by Day of Week (Monday = $30, Tuesday = $25, etc.)
5. **Gauge Chart:** Budget Utilization (75% of $500 spent)

**Filters:**
- Date range
- Campaign
- Day of week
- Device

**Alerts/Highlights:**
- If CPL > $40 for any campaign → Highlight in red
- If budget pacing > 90% before month end → Alert
- If CPC suddenly spikes → Flag for review

---

### **Page 6: Google Business Profile (GBP) Insights**

**Purpose:** Track GBP performance and local search visibility

**Metrics:**
- **Profile Views:** How many times GBP appeared
- **Search Queries:** What people searched to find you
- **Actions Taken:**
  - Calls from GBP
  - Directions requests
  - Website clicks
  - Booking button clicks
- **Photos:** Views, clicks on photos
- **Reviews:** New reviews, avg rating, response rate

**Visualizations:**
1. **Scorecard:** Total Profile Views (month vs. last month)
2. **Scorecard:** Calls from GBP (month)
3. **Scorecard:** Directions Requests (month)
4. **Bar Chart:** Top 10 Search Queries Leading to GBP
5. **Line Chart:** GBP Actions Over Time (calls, directions, website clicks)
6. **Table:** Reviews Summary (date, rating, text snippet, response status)

**Filters:**
- Date range
- Search query category (Discovery vs. Direct search)
- Action type

**Data Source:**
- GBP Insights API (manual export or API connection)
- Alternatively: Monthly manual upload to Google Sheets → Looker Studio

**Note:** GBP data has a 3-day delay, so expect lag in reporting

---

### **Page 7: Search Console (Organic Performance)**

**Purpose:** Track organic search rankings and traffic

**Metrics:**
- Total organic impressions
- Total organic clicks
- Average CTR (click-through rate)
- Average position (search ranking)
- Top queries by impressions/clicks
- Top landing pages by clicks

**Visualizations:**
1. **Line Chart:** Organic Clicks & Impressions (last 90 days)
2. **Table:** Top 20 Queries (Query, Impressions, Clicks, CTR, Position)
3. **Table:** Top 10 Landing Pages (URL, Clicks, Impressions, CTR)
4. **Scatter Plot:** CTR vs. Avg Position (identify ranking opportunities)
5. **Comparison:** Organic vs. Paid Performance (same keywords)

**Filters:**
- Date range
- Query contains (keyword filter)
- Landing page
- Device

**Key Insights:**
- Which keywords rank well organically? (Reduce paid spend on those)
- Which queries have high impressions but low CTR? (Improve title/meta)
- Organic traffic trends vs. paid trends

---

## 🎨 Design & Branding

### Color Scheme

**Primary Colors:**
- Brand Blue: #1E40AF (headers, primary CTA)
- Success Green: #10B981 (positive metrics, conversions)
- Warning Yellow: #F59E0B (alerts, budget pacing)
- Error Red: #EF4444 (high CPL, issues)
- Neutral Gray: #6B7280 (secondary text)

**Background:**
- White (#FFFFFF) for main content
- Light Gray (#F9FAFB) for cards/sections

### Typography

- **Headers:** Poppins Bold, 24px
- **Subheaders:** Poppins Medium, 18px
- **Body Text:** Inter Regular, 14px
- **Metrics (Large):** Poppins Bold, 36px

### Logo & Branding

- Add HMNP logo in top-left corner
- Include tagline: "Houston Mobile Notary Pros – Marketing Dashboard"
- Footer: "Last updated: [Auto-refresh timestamp]"

---

## ⚙️ Technical Setup

### Step 1: Connect Data Sources

**Google Ads:**
1. Looker Studio → Create → Data Source → Google Ads
2. Authorize account (Customer ID: 5072649468)
3. Select: All campaigns
4. Import fields: Campaign, Ad Group, Keyword, Cost, Conversions, etc.

**GA4:**
1. Looker Studio → Create → Data Source → Google Analytics
2. Select: GA4 Property (479840000)
3. Import: Sessions, Users, Conversions, Events, etc.

**Google Search Console:**
1. Looker Studio → Create → Data Source → Search Console
2. Select: houstonmobilenotarypros.com (domain property)
3. Import: Queries, Impressions, Clicks, Position

**GBP (Optional):**
1. Export GBP Insights monthly → Upload to Google Sheets
2. Connect Google Sheets as data source in Looker Studio
3. Or use GBP API connector (third-party)

---

### Step 2: Create Calculated Fields

**CPL (Cost Per Lead):**
```
Cost / Conversions
```

**Conversion Rate:**
```
(Conversions / Clicks) * 100
```

**ROAS (if revenue tracking):**
```
Revenue / Cost
```

**Budget Pacing:**
```
(Current Spend / Monthly Budget) * 100
```

**Organic vs. Paid Comparison:**
```
CASE
  WHEN Medium = "cpc" THEN "Paid"
  WHEN Medium = "organic" THEN "Organic"
  ELSE "Other"
END
```

---

### Step 3: Set Up Filters & Date Controls

**Global Filters (Apply to All Pages):**
- Date range picker (default: Last 30 days)
- Campaign filter (multi-select, default: All)
- Device filter (Mobile, Desktop, Tablet, default: All)

**Page-Specific Filters:**
- Page 2: City/ZIP code
- Page 3: Match type, Quality Score
- Page 4: Conversion type
- Page 5: Day of week
- Page 6: GBP action type
- Page 7: Query contains

---

### Step 4: Configure Auto-Refresh

**Data Freshness:**
- Google Ads: Auto-refresh every 4 hours
- GA4: Auto-refresh every 1 hour
- Search Console: Auto-refresh daily (Google limitation)
- GBP: Manual upload monthly (or API daily if available)

**Dashboard Refresh:**
- Set dashboard to auto-refresh every 12 hours
- Add "Last updated" timestamp to footer

---

## 📈 Key Metrics Definitions

| Metric | Definition | Formula | Target |
|--------|-----------|---------|--------|
| **Leads** | Total conversions (bookings + calls) | Booking + Calls from ads | 40-60/month |
| **CPL** | Cost per lead | Spend ÷ Leads | < $30 |
| **Conversion Rate** | % of clicks that convert | (Conversions ÷ Clicks) × 100 | 5-10% |
| **CPC** | Cost per click | Spend ÷ Clicks | $1.50-$2.50 |
| **CTR** | Click-through rate | (Clicks ÷ Impressions) × 100 | 5-8% (Search) |
| **Quality Score** | Google Ads keyword quality | Google auto-calc | 7-10 |
| **ROAS** | Return on ad spend | Revenue ÷ Spend | 3:1 or higher |

---

## ✅ Implementation Checklist

### Week 1: Setup
- [ ] Create Looker Studio account
- [ ] Connect Google Ads data source
- [ ] Connect GA4 data source
- [ ] Connect Search Console data source
- [ ] Set up GBP data (Google Sheets or API)
- [ ] Test data connections (verify data is flowing)

### Week 2: Build Dashboard
- [ ] Create Page 1: Executive Overview
- [ ] Create Page 2: Channel & Geo Performance
- [ ] Create Page 3: Campaign → Ad Group → Keyword
- [ ] Create Page 4: Conversions (Booking & Calls)
- [ ] Create Page 5: Cost & CPL Analysis
- [ ] Create Page 6: GBP Insights
- [ ] Create Page 7: Search Console (Organic)

### Week 3: Customization
- [ ] Add calculated fields (CPL, Conversion Rate, etc.)
- [ ] Apply branding (colors, logo, fonts)
- [ ] Set up global and page-specific filters
- [ ] Configure auto-refresh settings
- [ ] Add date comparisons (vs. last month)
- [ ] Test on mobile (responsive design)

### Week 4: Launch & Training
- [ ] Share dashboard with team (view or edit access)
- [ ] Document how to use filters and drill-downs
- [ ] Schedule weekly review meetings
- [ ] Set up email reports (optional, daily/weekly summaries)

---

## 📊 Sample Dashboard URL

Once built, Looker Studio dashboard will be accessible at:
```
https://lookerstudio.google.com/reporting/XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
```

**Access Control:**
- Owner: Your Google account
- Viewers: Marketing team, stakeholders (view-only)
- Editors: Campaign managers (can edit dashboard)

---

## 🔄 Maintenance & Updates

### Weekly Tasks
- Review data accuracy (spot-check conversions vs. Google Ads UI)
- Check for missing data or broken connections
- Update date range filters for current week

### Monthly Tasks
- Upload GBP Insights data (if manual)
- Review dashboard layout (add/remove widgets as needed)
- Update targets/benchmarks based on performance
- Archive old data (if using Google Sheets)

### Quarterly Tasks
- Audit calculated fields for accuracy
- Optimize dashboard performance (remove unused data sources)
- Add new pages/reports based on business needs
- Review access permissions

---

## 📞 Looker Studio Resources

**Looker Studio Help Center:**
https://support.google.com/looker-studio

**Google Ads Connector Docs:**
https://support.google.com/looker-studio/answer/6370296

**GA4 Connector Docs:**
https://support.google.com/looker-studio/answer/9004296

**Community Gallery (Templates):**
https://lookerstudio.google.com/gallery

---

**Last Updated:** 2025-11-06  
**Status:** Ready for build








