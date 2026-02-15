# Booking Flow Testing Guide

**Updated:** After streamlining implementation (Express + Simplified 4-step wizard)

## Quick Test Checklist

- [ ] Express booking path works end-to-end
- [ ] Full booking wizard (4 steps) works end-to-end
- [ ] GHL contact creation still works
- [ ] GHL appointment creation still works
- [ ] Location validation (city/ZIP minimum) works
- [ ] RON services skip location correctly
- [ ] Analytics tracking fires correctly
- [ ] Mobile responsiveness works

---

## 1. Express Booking Path Testing

### Test Steps:
1. Navigate to `/booking`
2. Should see two tabs: "Express (Fast Callback)" and "Full Online Booking"
3. Express tab should be selected by default (especially on mobile)
4. Fill out the Express form:
   - Name (required)
   - Email (required)
   - Phone (optional but recommended)
   - Message (required)
   - Service type (optional dropdown)
   - Preferred timing (optional dropdown)
5. Click "Request Call Back"
6. Should see success message: "You're All Set!"

### What to Verify:
- ✅ Form submits successfully
- ✅ Success state shows correct messaging
- ✅ Lead appears in your CRM/GHL with tags: `Source:BookingExpress`, `Intent:BookSoon`, `Path:Express`
- ✅ Analytics event fires: `booking_funnel` with `funnel_stage: 'express_booking_success'`
- ✅ Can switch to "Full Online Booking" tab and back

### Edge Cases:
- Try submitting with only name + email (no phone)
- Try submitting with only name + phone (no email)
- Try submitting with invalid email format
- Try submitting with very long message

---

## 2. Full Booking Wizard Testing (4 Steps)

### Step 1: Service Selection
**Test:**
1. Click "Full Online Booking" tab
2. Should see service selector with Mobile/Online toggle
3. Select a service (e.g., "Standard Mobile Notary")
4. Click "Continue"

**Verify:**
- ✅ Progress bar shows "Step 1 of 4"
- ✅ Service comparison section is collapsed (click to expand)
- ✅ Can toggle between Mobile and Online service types
- ✅ Pricing updates when service changes

### Step 2: Contact Information
**Test:**
1. Enter name and email (required)
2. Optionally enter phone
3. Click "Continue"

**Verify:**
- ✅ Validation works (can't proceed without name/email)
- ✅ "Quick quote" button works (optional)
- ✅ Progress bar shows "Step 2 of 4"
- ✅ Trust indicators display correctly

### Step 3: When & Where (Combined Step)
**Test for Mobile Service:**
1. Should see location section first
2. Enter at minimum: City, State, ZIP (address optional)
3. Once city/ZIP entered, scheduling section should appear automatically
4. Select a date from calendar
5. Select a time slot
6. Click "Continue"

**Test for RON Service:**
1. Should see "Remote Service Selected" message
2. No location fields required
3. Scheduling section should be visible immediately
4. Select date and time
5. Click "Continue"

**Verify:**
- ✅ Can proceed with just city/ZIP (no full address required)
- ✅ Scheduling appears automatically when location complete
- ✅ Real-time availability loads correctly
- ✅ Can select date and time
- ✅ Progress bar shows "Step 3 of 4"

### Step 4: Review & Confirm
**Test:**
1. Review all booking details
2. Check pricing breakdown
3. Accept terms checkbox
4. Click "Confirm Booking"

**Verify:**
- ✅ All details display correctly
- ✅ Pricing matches what was shown earlier
- ✅ Terms checkbox required
- ✅ Success redirect works
- ✅ Booking appears in database

---

## 3. GHL Integration Testing

### Contact Creation:
**Test:**
1. Complete a full booking
2. Check GHL dashboard/API

**Verify:**
- ✅ Contact created with correct name, email, phone
- ✅ Tags added: `Source:Website_Booking`, `status:booking_confirmed`
- ✅ Contact source shows "Website Booking"
- ✅ `ghlContactId` saved to booking record in database

### Workflow Trigger:
**Test:**
1. Complete a booking
2. Check GHL workflows

**Verify:**
- ✅ Workflow triggered (if `GHL_NEW_BOOKING_WORKFLOW_ID` is set)
- ✅ Contact added to correct workflow

### Appointment Creation:
**Test:**
1. Complete a mobile service booking with full address
2. Complete a mobile service booking with only city/ZIP
3. Complete a RON booking

**Verify:**
- ✅ Appointment created in correct GHL calendar
- ✅ Appointment has correct date/time
- ✅ Appointment address:
  - Full address booking: Uses full street address
  - City/ZIP only booking: Uses "Houston, TX 77001" format (or whatever city/ZIP provided)
  - RON booking: Uses "Remote/Online Service"
- ✅ Appointment status is "confirmed"
- ✅ Contact linked correctly

### Database Check:
```sql
-- Check booking has GHL contact ID
SELECT id, customerName, customerEmail, ghlContactId, scheduledDateTime 
FROM Booking 
WHERE createdAt > NOW() - INTERVAL '1 hour'
ORDER BY createdAt DESC;
```

---

## 4. Location Validation Testing

### Test Cases:

**Case 1: Full Address (Preferred)**
- Enter: Street, City, State, ZIP
- ✅ Should work fine
- ✅ GHL gets full address

**Case 2: City/ZIP Only (Minimum)**
- Enter: City="Houston", State="TX", ZIP="77001", Address=""
- ✅ Should allow proceeding
- ✅ GHL gets "Houston, TX 77001" as locationAddress

**Case 3: RON Service**
- Select RON service
- ✅ No location fields shown
- ✅ Can proceed directly to scheduling

**Case 4: Missing City/ZIP**
- Try to proceed with only state
- ✅ Should show validation error
- ✅ Cannot proceed

---

## 5. Analytics Tracking Testing

### Express Path:
Open browser console and check for:
```javascript
// Should see:
dataLayer.push({
  event: 'booking_funnel',
  funnel_stage: 'express_booking_success',
  path: 'express',
  leadId: '...'
})
```

### Full Path:
Check for these events:
```javascript
// Step 1 start
{ event: 'booking_funnel', funnel_stage: 'booking_view', path: 'full' }
{ event: 'booking_funnel', funnel_stage: 'booking_start', path: 'full' }

// Step progression
{ event: 'booking_step', step_index: 0, step_id: 'service' }
{ event: 'booking_step', step_index: 1, step_id: 'customer' }
{ event: 'booking_step', step_index: 2, step_id: 'location-scheduling' }
{ event: 'booking_step', step_index: 3, step_id: 'review' }

// Submit
{ event: 'booking_funnel', funnel_stage: 'submit', path: 'full', stepCount: 4 }
{ event: 'booking_funnel', funnel_stage: 'success', path: 'full' }
```

### How to Check:
1. Open browser DevTools → Console
2. Filter for `dataLayer` or `booking_funnel`
3. Complete booking flows and watch events fire

---

## 6. Mobile Responsiveness Testing

### Test on Mobile Device or Browser DevTools:
1. Set viewport to mobile (375px width)
2. Test Express path:
   - ✅ Form is readable
   - ✅ Buttons are tappable (min 44px height)
   - ✅ Success message displays correctly

3. Test Full wizard:
   - ✅ Progress bar shows correctly
   - ✅ Steps are clear and not overwhelming
   - ✅ Date picker works on mobile
   - ✅ Time slots are tappable
   - ✅ Can scroll through all steps

---

## 7. Edge Cases & Error Handling

### Test These Scenarios:

**Availability Conflicts:**
1. Book a time slot
2. Try to book same slot again immediately
3. ✅ Should show "time no longer available" error

**Network Errors:**
1. Disconnect internet
2. Try to submit booking
3. ✅ Should show user-friendly error
4. ✅ Can retry after reconnecting

**Validation Errors:**
1. Try to proceed without required fields
2. ✅ Should show field-specific errors
3. ✅ Cannot proceed until fixed

**Back Navigation:**
1. Go to step 3
2. Click "Back" to step 2
3. ✅ Data persists correctly
4. ✅ Can navigate forward again

---

## 8. Automated Testing (If Available)

Run existing test suite:
```bash
# Quick booking system tests
pnpm test:booking:quick

# Full E2E tests
pnpm test:e2e tests/e2e/booking-system-comprehensive.spec.ts

# All unit tests
pnpm test:unit
```

**Note:** You may need to update E2E tests to account for:
- New 4-step flow (was 6 steps)
- Express booking path
- Relaxed location validation

---

## 9. Production Checklist

Before deploying:

- [ ] Test Express path end-to-end
- [ ] Test Full wizard end-to-end (all service types)
- [ ] Verify GHL contact creation
- [ ] Verify GHL appointment creation (with full address and city/ZIP only)
- [ ] Verify GHL workflow triggers
- [ ] Check analytics events fire correctly
- [ ] Test on mobile device
- [ ] Test RON service flow
- [ ] Test error handling (network errors, validation errors)
- [ ] Verify database records created correctly
- [ ] Check booking confirmation emails send

---

## 10. Quick Smoke Test (5 Minutes)

**Fastest way to verify everything works:**

1. **Express Path:**
   - Go to `/booking`
   - Fill Express form → Submit
   - ✅ Success message appears

2. **Full Path - RON:**
   - Switch to "Full Online Booking"
   - Select "Remote Online Notarization"
   - Enter name/email → Continue
   - Skip location (should auto-skip) → Select date/time → Continue
   - Review → Confirm
   - ✅ Redirects to success page

3. **Full Path - Mobile:**
   - Start new booking
   - Select "Standard Mobile Notary"
   - Enter name/email → Continue
   - Enter city="Houston", state="TX", zip="77001" (no address)
   - Select date/time → Continue
   - Review → Confirm
   - ✅ Booking created
   - ✅ Check GHL for appointment with "Houston, TX 77001" address

---

## Troubleshooting

### Express form not submitting?
- Check browser console for errors
- Verify `/api/submit-ad-lead` endpoint is working
- Check network tab for failed requests

### GHL contact not created?
- Check `ENABLE_GHL_INTEGRATION` env var is 'true'
- Check GHL API credentials are valid
- Check server logs for GHL errors

### Appointment address wrong?
- Check what `locationAddress` value is being sent
- Verify city/ZIP fallback logic in BookingForm.tsx line 705
- Check GHL appointment creation logs

### Analytics not firing?
- Check browser console for `dataLayer` errors
- Verify GTM/GA is loaded
- Check network tab for analytics requests

---

## Need Help?

Check these files for implementation details:
- `components/booking/ExpressBookingPanel.tsx` - Express form
- `components/booking/BookingForm.tsx` - Main wizard logic
- `components/booking/steps/LocationAndSchedulingStep.tsx` - Combined step
- `lib/booking/create.ts` - GHL integration (unchanged)
- `app/booking/page.tsx` - Page with tabs

