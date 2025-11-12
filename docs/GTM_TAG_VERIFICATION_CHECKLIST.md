# GTM Tag Configuration Verification Checklist

## Your Current Setup
- **GTM Container ID:** `GTM-M7CB2XJ2`
- **GA4 Measurement ID:** `G-EXWGCN0D53`
- **Google Ads Conversion ID:** `AW-17079349538`
- **Google Ads Conversion Label:** `ItryCJmg0IkbEKLiiNA_`

---

## Step 1: Verify GTM Container is Published ✅

1. Go to [tagmanager.google.com](https://tagmanager.google.com)
2. Select container `GTM-M7CB2XJ2`
3. Check top right corner - should show **"Published"** with a recent date
4. If not published, click **"Submit"** → **"Publish"**

**Status:** ☐ Published

---

## Step 2: Verify Required Tags Exist

### Tag 1: GA4 Configuration Tag

**Location:** GTM → Tags → Look for "GA4 Configuration" or similar

**Required Settings:**
- **Tag Type:** Google Analytics: GA4 Configuration
- **Measurement ID:** `G-EXWGCN0D53`
- **Trigger:** All Pages
- **Tag Name:** "GA4 - Configuration" (or similar)

**Additional Settings to Check:**
- ☐ Enable Enhanced Ecommerce (if you want purchase tracking)
- ☐ Enable Google Signals (for demographics)
- ☐ Enable Send page view (should be ON)

**Status:** ☐ Exists and Configured

---

### Tag 2: Google Ads Conversion Tracking

**Location:** GTM → Tags → Look for "Google Ads Conversion" or similar

**Required Settings:**
- **Tag Type:** Google Ads: Conversion Tracking
- **Conversion ID:** `AW-17079349538`
- **Conversion Label:** `ItryCJmg0IkbEKLiiNA_`
- **Trigger:** Custom Event - `booking_complete` (see Trigger section below)

**Value & Currency Settings:**
- ☐ Use dataLayer variable for value: `{{DLV - value}}`
- ☐ Use dataLayer variable for currency: `{{DLV - currency}}`
- ☐ Use dataLayer variable for transaction_id: `{{DLV - transaction_id}}`

**Enhanced Conversions:**
- ☐ Enable Enhanced Conversions
- ☐ Use dataLayer variable: `{{DLV - enhanced_conversion_data}}`

**Status:** ☐ Exists and Configured

---

## Step 3: Verify Required Triggers

### Trigger 1: All Pages

**Location:** GTM → Triggers → "All Pages"

**Required Settings:**
- **Trigger Type:** Page View
- **This trigger fires on:** All Pages
- **Used by:** GA4 Configuration tag

**Status:** ☐ Exists

---

### Trigger 2: Booking Complete

**Location:** GTM → Triggers → Look for "booking_complete" or "EVT - booking_complete"

**Required Settings:**
- **Trigger Type:** Custom Event
- **Event name:** `booking_complete`
- **This trigger fires on:** Custom Event
- **Used by:** Google Ads Conversion tag

**Status:** ☐ Exists

**If Missing, Create It:**
1. GTM → Triggers → New
2. Name: `EVT - booking_complete`
3. Trigger Type: Custom Event
4. Event name: `booking_complete`
5. Save

---

### Trigger 3: Booking Started (Optional but Recommended)

**Location:** GTM → Triggers → "EVT - booking_started"

**Required Settings:**
- **Trigger Type:** Custom Event
- **Event name:** `booking_started`
- **Used by:** Can create a GA4 Event tag to track this

**Status:** ☐ Exists (Optional)

---

### Trigger 4: Click to Call (Optional but Recommended)

**Location:** GTM → Triggers → "EVT - click_to_call"

**Required Settings:**
- **Trigger Type:** Custom Event
- **Event name:** `click_to_call`
- **Used by:** Can create a GA4 Event tag to track this

**Status:** ☐ Exists (Optional)

---

## Step 4: Verify Required Variables (DataLayer Variables)

These variables pull data from the `dataLayer.push()` events your site sends.

### Variable 1: DLV - value

**Location:** GTM → Variables → User-Defined Variables

**Required Settings:**
- **Variable Type:** Data Layer Variable
- **Data Layer Variable Name:** `value`
- **Data Layer Version:** Version 2
- **Variable Name:** `DLV - value`

**Status:** ☐ Exists

**If Missing, Create It:**
1. GTM → Variables → User-Defined Variables → New
2. Variable Type: Data Layer Variable
3. Data Layer Variable Name: `value`
4. Name: `DLV - value`
5. Save

---

### Variable 2: DLV - currency

**Location:** GTM → Variables → User-Defined Variables

**Required Settings:**
- **Variable Type:** Data Layer Variable
- **Data Layer Variable Name:** `currency`
- **Data Layer Version:** Version 2
- **Variable Name:** `DLV - currency`

**Status:** ☐ Exists

---

### Variable 3: DLV - transaction_id

**Location:** GTM → Variables → User-Defined Variables

**Required Settings:**
- **Variable Type:** Data Layer Variable
- **Data Layer Variable Name:** `transaction_id`
- **Data Layer Version:** Version 2
- **Variable Name:** `DLV - transaction_id`

**Status:** ☐ Exists

---

### Variable 4: DLV - enhanced_conversion_data

**Location:** GTM → Variables → User-Defined Variables

**Required Settings:**
- **Variable Type:** Data Layer Variable
- **Data Layer Variable Name:** `enhanced_conversion_data`
- **Data Layer Version:** Version 2
- **Variable Name:** `DLV - enhanced_conversion_data`

**Status:** ☐ Exists

---

## Step 5: Events Your Site Pushes to GTM

Your site automatically pushes these events to `dataLayer`. Make sure GTM is configured to handle them:

### Event 1: `booking_complete`
**When:** User completes a booking on `/booking/success`
**Data Sent:**
```javascript
{
  event: 'booking_complete',
  value: 35-125, // Estimated booking value
  currency: 'USD',
  transaction_id: 'booking-id-here',
  service: 'STANDARD_NOTARY' | 'EXTENDED_HOURS' | 'LOAN_SIGNING' | 'RON_SERVICES',
  enhanced_conversion_data: {
    email: 'hashed-email',
    first_name: 'hashed-first-name',
    // ... more hashed PII
  }
}
```
**GTM Action Required:** Google Ads Conversion tag should fire on this event

**Status:** ☐ Tag fires correctly

---

### Event 2: `booking_started`
**When:** User clicks a link to `/booking`
**Data Sent:**
```javascript
{
  event: 'booking_started',
  event_category: 'booking',
  event_label: '/current-page-path'
}
```
**GTM Action Required:** Optional - Create GA4 Event tag to track this

**Status:** ☐ Tracked (Optional)

---

### Event 3: `click_to_call`
**When:** User clicks a `tel:` link
**Data Sent:**
```javascript
{
  event: 'click_to_call',
  event_category: 'engagement',
  event_label: `tel:${getBusinessTel()}`
}
```
**GTM Action Required:** Optional - Create GA4 Event tag to track this

**Status:** ☐ Tracked (Optional)

---

### Event 4: `estimate_requested`
**When:** User uses the pricing estimator
**Data Sent:**
```javascript
{
  event: 'estimate_requested',
  event_category: 'engagement',
  mode: 'MOBILE' | 'RON',
  zip: '77591',
  acts: 1
}
```
**GTM Action Required:** Optional - Create GA4 Event tag to track this

**Status:** ☐ Tracked (Optional)

---

## Step 6: Testing Your GTM Setup

### Test 1: GTM Preview Mode

1. Go to [tagmanager.google.com](https://tagmanager.google.com)
2. Select container `GTM-M7CB2XJ2`
3. Click **"Preview"** button (top right)
4. Enter your site URL: `https://houstonmobilenotarypros.com` (or `http://localhost:3000` for local)
5. Click **"Connect"**

**What to Check:**
- ☐ Preview window opens showing your site
- ☐ Left panel shows "Tags Fired" with GA4 Configuration tag
- ☐ Navigate to different pages - GA4 tag should fire on each page
- ☐ Check "Data Layer" tab - should show page view events

**Status:** ☐ Preview Mode Working

---

### Test 2: Test Booking Complete Event

1. In GTM Preview Mode, navigate to your booking flow
2. Complete a test booking (or use `/booking/success?bookingId=test`)
3. Check GTM Preview panel:

**What to Check:**
- ☐ "Tags Fired" shows Google Ads Conversion tag
- ☐ "Variables" tab shows:
  - `DLV - value` = a number (35-125)
  - `DLV - currency` = "USD"
  - `DLV - transaction_id` = booking ID
  - `DLV - enhanced_conversion_data` = object with hashed data
- ☐ "Data Layer" tab shows `booking_complete` event

**Status:** ☐ Booking Event Fires Correctly

---

### Test 3: Verify in Google Ads

1. Go to [ads.google.com](https://ads.google.com)
2. Tools & Settings → Conversions
3. Find conversion action with ID `AW-17079349538`
4. Click on it → "Tag setup" tab
5. Check "Recent conversions" - should show test conversions within 24 hours

**Status:** ☐ Conversions Appearing in Google Ads

---

### Test 4: Verify in GA4

1. Go to [analytics.google.com](https://analytics.google.com)
2. Select property `G-EXWGCN0D53`
3. Reports → Realtime
4. Visit your site
5. Should see yourself as an active user within 30 seconds

**Status:** ☐ GA4 Tracking Working

---

## Step 7: Common Issues & Fixes

### Issue: GTM loads but tags don't fire

**Possible Causes:**
- Tags not published
- Triggers not configured correctly
- Variables not set up

**Fix:**
1. Check all tags are published (Step 1)
2. Verify triggers are attached to tags
3. Use Preview Mode to debug

---

### Issue: Booking conversion not tracking

**Possible Causes:**
- `booking_complete` trigger not set up
- Variables not configured
- Enhanced conversions data format wrong

**Fix:**
1. Verify Trigger 2 exists (Step 3)
2. Verify all DLV variables exist (Step 4)
3. Check Preview Mode when completing booking

---

### Issue: Duplicate tracking (both GTM and direct gtag)

**Possible Causes:**
- Both `NEXT_PUBLIC_GTM_ID` and `NEXT_PUBLIC_GA_ID` set
- Direct gtag loading alongside GTM

**Fix:**
- Your code automatically prevents this (line 153 in `app/layout.tsx`)
- If GTM is set, direct gtag won't load
- This is correct behavior ✅

---

## Quick Reference: Your Site's Event Structure

```javascript
// Booking Complete (MOST IMPORTANT)
dataLayer.push({
  event: 'booking_complete',
  value: 35-125,
  currency: 'USD',
  transaction_id: 'booking-id',
  service: 'STANDARD_NOTARY',
  enhanced_conversion_data: { /* hashed PII */ }
});

// Booking Started
dataLayer.push({
  event: 'booking_started',
  event_category: 'booking',
  event_label: '/current-path'
});

// Click to Call
dataLayer.push({
  event: 'click_to_call',
  event_category: 'engagement',
  event_label: `tel:${getBusinessTel()}`
});
```

---

## Final Checklist

Before going live, verify:

- [ ] GTM Container is published
- [ ] GA4 Configuration tag exists and fires on All Pages
- [ ] Google Ads Conversion tag exists and fires on `booking_complete`
- [ ] All 4 DataLayer Variables exist (value, currency, transaction_id, enhanced_conversion_data)
- [ ] `booking_complete` trigger exists
- [ ] Preview Mode shows tags firing correctly
- [ ] Test booking shows conversion in Preview Mode
- [ ] GA4 Realtime shows visitors
- [ ] Google Ads shows test conversions (within 24 hours)

---

## Need Help?

If something isn't working:
1. Use GTM Preview Mode - it's your best debugging tool
2. Check browser console for errors
3. Verify environment variables are set in Vercel
4. Make sure container is published after any changes



