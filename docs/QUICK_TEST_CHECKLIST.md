# Quick Testing Checklist - New Booking Flow

## 🚀 Step 1: Start Dev Server

```bash
pnpm dev
```

Wait for: `✓ Ready in X.Xs` message

---

## 🧪 Step 2: Test Express Booking Path (Fastest - 2 minutes)

1. **Navigate to:** `http://localhost:3000/booking`

2. **Verify UI:**
   - ✅ See two tabs: "Express (Fast Callback)" and "Full Online Booking"
   - ✅ Express tab should be selected by default
   - ✅ Form shows: Name, Email, Phone (optional), Message fields

3. **Submit Express Form:**
   - Fill in: Name, Email, Message
   - Click "Request Call Back"
   - ✅ Should see success message: "You're All Set!"

4. **Check Backend:**
   - Open browser DevTools → Network tab
   - Look for POST to `/api/submit-ad-lead`
   - ✅ Should return 200 OK
   - ✅ Check response has lead ID

5. **Verify GHL/CRM:**
   - Check your CRM/GHL dashboard
   - ✅ New lead created with tags: `Source:BookingExpress`, `Intent:BookSoon`, `Path:Express`

---

## 🧪 Step 3: Test Full Booking Wizard - RON Service (3 minutes)

1. **Switch to Full Booking:**
   - Click "Full Online Booking" tab
   - ✅ Should see wizard with progress bar

2. **Step 1 - Service Selection:**
   - Select "Remote Online Notarization" (RON)
   - Click "Continue"
   - ✅ Progress shows "Step 1 of 4"

3. **Step 2 - Contact Info:**
   - Enter name and email
   - Click "Continue"
   - ✅ Progress shows "Step 2 of 4"

4. **Step 3 - When & Where:**
   - ✅ Should see "Remote Service Selected" message (no location fields)
   - ✅ Scheduling calendar should be visible immediately
   - Select a date
   - Select a time slot
   - Click "Continue"
   - ✅ Progress shows "Step 3 of 4"

5. **Step 4 - Review:**
   - ✅ See booking summary
   - ✅ Pricing breakdown shown
   - Check "I agree to terms" checkbox
   - Click "Confirm Booking"
   - ✅ Should redirect to success page

6. **Verify Database:**
   - Check booking was created
   - ✅ `ghlContactId` should be populated
   - ✅ `addressStreet` should be null/empty (RON service)

---

## 🧪 Step 4: Test Full Booking Wizard - Mobile Service (4 minutes)

1. **Start New Booking:**
   - Navigate to `/booking` again
   - Click "Full Online Booking" tab

2. **Step 1:**
   - Select "Standard Mobile Notary"
   - Click "Continue"

3. **Step 2:**
   - Enter name and email
   - Click "Continue"

4. **Step 3 - Location & Scheduling:**
   - **Test Case A: Full Address**
     - Enter: Street="123 Main St", City="Houston", State="TX", ZIP="77001"
     - ✅ Scheduling section should appear automatically
     - Select date and time
     - Click "Continue"
   
   - **Test Case B: City/ZIP Only (New Feature)**
     - Go back to Step 3
     - Clear street address
     - Keep: City="Houston", State="TX", ZIP="77001"
     - ✅ Should still allow proceeding
     - ✅ Scheduling should still work
     - Select date and time
     - Click "Continue"

5. **Step 4:**
   - Review details
   - ✅ Address should show what you entered (full or city/ZIP)
   - Confirm booking

6. **Verify GHL Appointment:**
   - Check GHL calendar/appointments
   - ✅ Appointment created with correct date/time
   - ✅ Address should be:
     - Full address booking: "123 Main St, Houston, TX 77001"
     - City/ZIP only: "Houston, TX 77001"

---

## 🧪 Step 5: Verify Analytics Tracking

1. **Open Browser DevTools:**
   - Console tab
   - Filter for: `booking_funnel` or `dataLayer`

2. **Test Express Path:**
   - Submit Express form
   - ✅ Should see: `funnel_stage: 'express_booking_success'`, `path: 'express'`

3. **Test Full Path:**
   - Complete full booking
   - ✅ Should see events:
     - `funnel_stage: 'booking_view'`, `path: 'full'`
     - `funnel_stage: 'booking_start'`, `path: 'full'`
     - `event: 'booking_step'` for each step (step_index: 0, 1, 2, 3)
     - `funnel_stage: 'submit'`, `path: 'full'`, `stepCount: 4`
     - `funnel_stage: 'success'`, `path: 'full'`

---

## 🧪 Step 6: Mobile Responsiveness Test

1. **Open DevTools:**
   - Toggle device toolbar (Ctrl+Shift+M / Cmd+Shift+M)
   - Set to iPhone 12 Pro (375px width)

2. **Test Express:**
   - ✅ Form should be readable
   - ✅ Buttons should be tappable (min 44px)
   - ✅ Success message displays correctly

3. **Test Full Wizard:**
   - ✅ Progress bar shows correctly
   - ✅ Steps are clear and not overwhelming
   - ✅ Date picker works on mobile
   - ✅ Time slots are tappable
   - ✅ Can scroll through all steps

---

## 🧪 Step 7: Edge Cases

### Test Validation Errors:
1. Try proceeding without name/email
   - ✅ Should show validation errors
   - ✅ Cannot proceed

2. Try proceeding without city/ZIP (mobile service)
   - ✅ Should show validation error
   - ✅ Cannot proceed

3. Try proceeding without date/time
   - ✅ Should show validation error
   - ✅ Cannot proceed

### Test Navigation:
1. Go to Step 3, then click "Back"
   - ✅ Should return to Step 2
   - ✅ Data should persist

2. Go forward again
   - ✅ Should return to Step 3
   - ✅ Previously entered data should still be there

---

## ✅ Success Criteria

**Express Path:**
- ✅ Form submits successfully
- ✅ Lead appears in CRM with correct tags
- ✅ Analytics event fires

**Full Wizard:**
- ✅ 4 steps complete successfully
- ✅ Can book with full address OR city/ZIP only
- ✅ RON service skips location correctly
- ✅ GHL contact created
- ✅ GHL appointment created with correct address
- ✅ Booking saved to database

**Mobile:**
- ✅ Responsive and usable on mobile devices
- ✅ All buttons tappable
- ✅ Forms readable

---

## 🐛 If Something Breaks

1. **Check Browser Console:**
   - Look for JavaScript errors
   - Check network tab for failed API calls

2. **Check Server Logs:**
   - Look for errors in terminal where `pnpm dev` is running

3. **Common Issues:**
   - **GHL not creating contact:** Check `ENABLE_GHL_INTEGRATION` env var
   - **Appointment address wrong:** Check what `locationAddress` is being sent (see BookingForm.tsx line 705)
   - **Validation errors:** Check that required fields match schema

---

## 📝 Quick Test Script (Copy/Paste)

```bash
# 1. Start server
pnpm dev

# 2. Open browser to:
# http://localhost:3000/booking

# 3. Test Express:
# - Fill form → Submit → Check success

# 4. Test Full - RON:
# - Select RON → Name/Email → Date/Time → Confirm

# 5. Test Full - Mobile:
# - Select Mobile → Name/Email → City/ZIP → Date/Time → Confirm

# 6. Check GHL dashboard for contacts/appointments
```

---

**Ready to test? Start with Step 1 and work through each section!**

