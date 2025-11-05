# QA Checklist - Ad Conversion Optimization

## 🎯 Critical Path Testing

### Pricing Consistency

- [ ] **Hero Section**: Shows "Starting at $75" (not "$75 flat")
- [ ] **Service Cards**: All show "Starting at $X"
- [ ] **Hero Description**: Says "Mobile notarization starting at $75 (includes travel...)"
- [ ] **Meta Descriptions**: No "$75 flat" mentions (✅ Verified - clean)
- [ ] **OpenGraph Tags**: No "$75 flat" mentions (✅ Verified - clean)
- [ ] **JSON-LD Schema**: Check pricing descriptions match
- [ ] **Transparent Pricing Hook**: Output matches homepage promise
- [ ] **Texas Compliance**: Verify "$75" is clearly labeled as mobile service package (travel/time/convenience), not per-notarization

### Lead Capture - QuickQuoteForm

- [ ] **Form Renders**: Displays correctly on homepage below PolicyStrip
- [ ] **Progressive Enhancement**: Works without JavaScript
  - [ ] Test with JS disabled in DevTools
  - [ ] Form submits via native POST
  - [ ] Gets proper validation errors
- [ ] **Validation**: 
  - [ ] Requires name (min 2 chars)
  - [ ] Requires email OR phone (not both required)
  - [ ] Shows clear error messages
  - [ ] Success message displays
- [ ] **API Integration**:
  - [ ] `/api/submit-ad-lead` returns 200 on success
  - [ ] Returns 400 with proper error details on bad payload
  - [ ] Returns 422 on validation failure
  - [ ] Accepts `event_id` parameter
- [ ] **Analytics**:
  - [ ] `leadQuickQuoteViewed` fires on mount
  - [ ] `leadQuickQuoteSubmitted` fires on success
  - [ ] `event_id` present in payload
  - [ ] UTM params captured when present
  - [ ] Device type tracked correctly

### Lead Capture - InFlowQuoteCard

- [ ] **Conditional Rendering**: Only shows when user has entered name, email, or phone
- [ ] **Intersection Observer**: Tracks view only when 50%+ visible for ≥750ms
- [ ] **Does Not Block**: User can still click "Continue" to advance
- [ ] **Partial Data Summary**: Shows name, email/phone, service type
- [ ] **Submit Behavior**:
  - [ ] Validates contact info is present
  - [ ] Shows error if missing
  - [ ] Success message displays
  - [ ] "Continue booking" message clear
- [ ] **Analytics**:
  - [ ] `leadInflowRequested` fires on view (with delay)
  - [ ] `leadInflowRequested` fires on submit
  - [ ] `event_id` included for dedupe
  - [ ] Partial fields tracked

### Booking Flow - Relaxed Validation

- [ ] **LocationStep Alert**: Blue alert shows "Just browsing? You can skip ahead..."
- [ ] **Skip Forward**: Can click "Next" without entering address
- [ ] **No Errors**: Location step doesn't block at step < 5
- [ ] **Final Validation**: Address IS required at step 5 (review) for in-person services
- [ ] **RON Exception**: RON services don't require address at all
- [ ] **Quote Mode**: Setting `isPreviewMode: true` bypasses address validation

### Mobile CTA

- [ ] **Sticky Bar Renders**: Shows on screens < 1024px width
- [ ] **Two Actions Only**: "Call Now" + "Continue" (no RON shortcut)
- [ ] **Call Now Tracking**:
  - [ ] `callClicked` fires on mouseDown (iOS-safe)
  - [ ] `tel:` link works
  - [ ] Service type captured
- [ ] **No Keyboard Overlap**: Test on:
  - [ ] iPhone SE (375px)
  - [ ] iPhone 12/13/14 (390px)
  - [ ] Pixel 7/8 (412px)
- [ ] **No Button Overlap**: Doesn't cover form submit buttons
- [ ] **WhatsApp/Messenger**: No conflicts with floating chat bubbles

### Availability Widget

- [ ] **Live Data**: Shows slot count when API succeeds
- [ ] **Caching**: On API failure:
  - [ ] Shows last cached count + "Last checked: X min ago"
  - [ ] Yellow indicator (not green)
  - [ ] Never shows scary "limited availability" warning
- [ ] **First Load Error**: Shows "We're confirming today's openings..." (neutral)
- [ ] **Format Time**: "just now", "5 min ago", "2 hrs ago" displays correctly
- [ ] **Auto-Refresh**: Updates every 60 seconds

---

## 📊 Analytics Validation

### GA4 DebugView

**How to Test:**
1. Open Chrome
2. Install GA DebugView extension
3. Navigate site with `?utm_source=test&utm_campaign=qa`
4. Check DebugView for events

**Expected Events:**

- [ ] **page_view**: Fires on homepage load
  - [ ] Has `device`, `utm_source`, `utm_campaign`, `path`, `referrer`
- [ ] **select_content** (quick_quote_view): Fires when QuickQuoteForm mounts
  - [ ] Has `source_component: 'quick_quote_home'`
  - [ ] Has `service_type`
- [ ] **generate_lead** (quick_quote): Fires on QuickQuote submit
  - [ ] Has `stage: 'quick_quote'`
  - [ ] Has `event_id`
  - [ ] PII stripped (no name/email/phone in GA4)
- [ ] **generate_lead** (inflow_quote): Fires on InFlowQuote submit
  - [ ] Has `stage: 'inflow_quote'`
  - [ ] Has `partial_fields` array
- [ ] **generate_lead** (call_click): Fires on mobile "Call Now"
  - [ ] Has `stage: 'call_click'`
  - [ ] Has `source_component: 'mobile_cta'`

### Meta Pixel Helper

**How to Test:**
1. Install Meta Pixel Helper extension
2. Navigate site
3. Submit forms
4. Check console for Pixel events

**Expected Events:**

- [ ] **PageView**: Fires on page load
- [ ] **ClickButton**: Fires on quick_quote_view
- [ ] **Lead**: Fires on quick_quote submit
  - [ ] Has `content_name: 'quick_quote'`
  - [ ] Has `source` (utm_source or 'direct')
  - [ ] Has `value: 75`
- [ ] **Lead**: Fires on inflow_quote submit
  - [ ] Has `content_name: 'in_flow_quote'`
- [ ] **Contact**: Fires on call_click
  - [ ] Has `content_name: 'mobile_call_cta'`

### Network Tab Verification

- [ ] Open DevTools → Network → Filter: Fetch/XHR
- [ ] Submit QuickQuote
- [ ] Check `/api/submit-ad-lead` request:
  - [ ] Has `event_id` in payload
  - [ ] Has `utm_source`, `utm_medium`, `utm_campaign` when present
  - [ ] Has `device`, `page`, `referrer`
  - [ ] Returns 200 with `success: true`

---

## 📱 Mobile Device Testing

### iPhone SE (375px)

- [ ] Hero section readable
- [ ] QuickQuoteForm renders correctly
  - [ ] Input fields full width
  - [ ] Trust indicators visible
  - [ ] Submit button accessible
- [ ] Sticky CTA visible at bottom
- [ ] No keyboard overlap when typing
- [ ] Forms submit successfully

### iPhone 12/13/14 (390px)

- [ ] All above tests pass
- [ ] InFlowQuoteCard renders properly
- [ ] No horizontal scroll

### Pixel 7/8 (412px)

- [ ] All above tests pass
- [ ] Call Now link triggers dialer
- [ ] Analytics fire correctly

### Galaxy Fold

- [ ] **Folded (280px)**:
  - [ ] Layout doesn't break
  - [ ] Forms remain usable
  - [ ] CTAs accessible
- [ ] **Unfolded (653px)**:
  - [ ] Uses tablet layout
  - [ ] Sticky CTA still shows

### Cross-Browser (Mobile)

- [ ] **Chrome Mobile**: All features work
- [ ] **Safari iOS**: onMouseDown fires for call tracking
- [ ] **Samsung Internet**: Progressive enhancement works

---

## 🔄 GHL Integration

### Webhook Configuration

- [ ] `GHL_QUOTE_WEBHOOK_URL` set in `.env.local`
- [ ] Webhook receives POST requests
- [ ] Payload includes:
  - [ ] `name`, `email`, `phone`
  - [ ] `pipeline: 'Quote Request'`
  - [ ] `stage: 'New Lead'`
  - [ ] `source` (utm_source or 'website')
  - [ ] `event_id` for tracking
  - [ ] `device`, `timestamp`

### GHL Pipeline

- [ ] Leads appear in "Quote Request" pipeline
- [ ] Mapped to "New Lead" stage
- [ ] Custom fields populated:
  - [ ] Service Type
  - [ ] Lead Source (utm_source)
  - [ ] Campaign Name (utm_campaign)
  - [ ] Device Type

### Auto-Reply (Optional - if enabled)

- [ ] Email sent to lead
  - [ ] Subject: "Quote Request Received"
  - [ ] Body includes 5-minute response promise
  - [ ] Compliance footer present
- [ ] SMS sent to lead (if phone provided)
  - [ ] Message < 160 chars
  - [ ] Includes company name
  - [ ] No legal advice disclaimer present

---

## 🐛 Error Handling

### API Errors

- [ ] **Network Failure**:
  - [ ] Form shows error message
  - [ ] User can retry
  - [ ] No console errors (or logged properly)
- [ ] **Validation Failure**:
  - [ ] Shows field-specific errors
  - [ ] Highlights invalid fields
  - [ ] User can correct and resubmit
- [ ] **Server Error (500)**:
  - [ ] Shows generic error message
  - [ ] Suggests calling directly
  - [ ] Error logged server-side

### Analytics Failures

- [ ] **GA4 Not Loaded**:
  - [ ] No console errors
  - [ ] Form still works
  - [ ] Fallback tracking attempts
- [ ] **Meta Pixel Blocked**:
  - [ ] No console errors
  - [ ] Form submission not affected

---

## 🎨 Polish Items

### Homepage

- [ ] **Transparency Messaging**: Clear and consistent
- [ ] **Trust Indicators**: Visible and compelling
- [ ] **FAQ Anchors**: Consider adding "What affects my price?" link near QuickQuoteForm

### SEO

- [ ] **Organization Schema**: Added to homepage
  - [ ] `priceRange` accurate
  - [ ] `serviceArea` includes Houston + radius
- [ ] **Service Schema**: Describes mobile notary service
- [ ] **Breadcrumbs**: Proper JSON-LD on subpages

### UX

- [ ] **Loading States**: All forms show spinners during submit
- [ ] **Success States**: Clear confirmation messages
- [ ] **Error States**: Helpful, actionable error messages

---

## ✅ Acceptance Criteria

Before marking DONE:

1. [ ] All "Critical Path Testing" items pass
2. [ ] GA4 DebugView shows all expected events
3. [ ] Meta Pixel Helper confirms Lead events
4. [ ] Mobile tested on at least 3 real devices
5. [ ] GHL receives test leads successfully
6. [ ] No linter errors in modified files
7. [ ] No console errors in production mode
8. [ ] Pricing compliance verified (mobile service package, not per-notarization)
9. [ ] "$75 flat" mentions corrected to "Starting at $75"

---

## 📈 Post-Launch Monitoring (Week 1-2)

### Metrics to Watch

- [ ] `/api/submit-ad-lead` success rate (target: >95%)
- [ ] GA4 "generate_lead" event count
- [ ] GHL "Quote Request" pipeline fill rate
- [ ] Bounce rate on homepage (expect ↓25-40%)
- [ ] Mobile conversion rate (expect ↑15-25%)
- [ ] Average response time to quote requests (target: <5 min)

### Alerts to Set

- [ ] API error rate >5%
- [ ] GHL webhook failures
- [ ] Analytics events drop >50% from baseline
- [ ] Form submissions drop to 0 (indicates breakage)

---

## 🚨 Rollback Plan

If critical issues found:

1. **Revert commit**: `git revert <commit-hash>`
2. **Push revert**: `git push origin <branch>`
3. **Notify team**: Document issue in GitHub
4. **Fix forward**: Create hotfix PR

**Critical Issues Warranting Rollback:**
- Forms not submitting
- Analytics completely broken
- Mobile layout breaks site
- GHL webhook causing data loss

