# 🚨 GHL Integration Fix Plan

## Critical Issue Summary

Your workflows are failing because:
1. **The booking API is NOT populating custom fields** - It's using a tags-only approach
2. **The `appointment_datetime` field is missing** from the custom fields script
3. **The pending payments API doesn't return the payment URL** needed by workflows

## 🔧 Required Fixes

### Fix 1: Update Booking API to Populate Custom Fields

**File:** `app/api/bookings/route.ts`

**Current Issue:** Line 506 shows:
```javascript
customField: {}, // Using tags-only approach - no custom fields needed
```

**Required Change:** Update the GHL contact creation to include custom fields:

```javascript
// Around line 506, replace the empty customField object with:
customField: {
  booking_id: newBooking.id,
  payment_url: checkoutUrl || '',
  payment_amount: finalAmountDueAfterDiscount.toString(),
  service_requested: service.name,
  service_address: serviceAddressForGhl,
  appointment_date: scheduledDateTime ? new Date(scheduledDateTime).toLocaleDateString() : '',
  appointment_time: scheduledDateTime ? new Date(scheduledDateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '',
  appointment_datetime: scheduledDateTime ? new Date(scheduledDateTime).toISOString().replace('T', ' ').substring(0, 19) : '',
  service_price: service.basePrice.toNumber().toString(),
  urgency_level: 'new', // Will be updated by workflow
  hours_old: '0', // Will be updated by workflow
  preferred_datetime: scheduledDateTime || '',
}
```

### Fix 2: Add Missing Custom Field to Script

**File:** `scripts/create-ghl-custom-fields.js`

✅ **Already Fixed!** The `appointment_datetime` field has been added.

### Fix 3: Update Pending Payments API

**File:** `app/api/bookings/pending-payments/route.ts`

**Issue:** The API doesn't return the payment URL needed by workflows.

**Add to the transformedBookings mapping (around line 137):**

```javascript
// In the transformedBookings.map() function, add:
paymentUrl: booking.stripePaymentUrl || '', // Add this field to the booking schema if needed
scheduledDate: booking.scheduledDateTime ? new Date(booking.scheduledDateTime).toLocaleDateString() : '',
scheduledTime: booking.scheduledDateTime ? new Date(booking.scheduledDateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '',
```

### Fix 4: Update Booking Schema (if needed)

**File:** `prisma/schema.prisma`

If the `stripePaymentUrl` field doesn't exist in your Booking model, add:

```prisma
model Booking {
  // ... existing fields ...
  stripePaymentUrl String? @db.Text
  // ... rest of model ...
}
```

Then run: `npx prisma migrate dev`

### Fix 5: Store Payment URL When Creating Stripe Session

**File:** `app/api/bookings/route.ts`

After creating the Stripe session (around line 428), update the booking:

```javascript
if (checkoutUrl) {
  await prisma.booking.update({
    where: { id: newBooking.id },
    data: { stripePaymentUrl: checkoutUrl }
  });
}
```

## 📋 Implementation Steps

1. **Update the custom fields script** ✅ (Already done)
2. **Run the script to create fields:**
   ```bash
   node scripts/create-ghl-custom-fields.js
   ```

3. **Update the booking API** to populate custom fields
4. **Update the pending payments API** to return payment URLs
5. **Test the integration:**
   - Create a test booking
   - Verify custom fields are populated in GHL
   - Verify workflows trigger correctly

## 🧪 Testing Checklist

- [ ] Create a booking via the website
- [ ] Check GHL contact has all custom fields populated
- [ ] Verify `status:booking_pendingpayment` tag is applied
- [ ] Confirm Payment Follow-up workflow triggers
- [ ] Check that the workflow can access `{{contact.custom_fields.payment_url}}`
- [ ] Verify reminder emails contain correct payment link
- [ ] Test the booking confirmation workflow with `appointment_datetime`

## 🎯 Expected Outcome

After implementing these fixes:
1. **All workflows will have access to required data**
2. **Payment reminders will include working payment links**
3. **Time-based actions will work with the combined datetime field**
4. **The pending payments API will provide complete data for workflows**

## ⚠️ Important Notes

1. **Environment Variables:** Ensure these are set:
   - `GHL_LOCATION_ID`
   - `GHL_API_KEY`
   - `STRIPE_SECRET_KEY`
   - `NEXTAUTH_URL`

2. **Field Naming:** The workflows expect fields WITHOUT the `cf_` prefix

3. **Date/Time Format:** 
   - `appointment_date`: MM/DD/YYYY
   - `appointment_time`: HH:MM AM/PM
   - `appointment_datetime`: YYYY-MM-DD HH:MM

4. **Testing:** Always test with a real booking flow, not just API calls

## 🚀 Quick Implementation Code

Here's the complete custom field object for the booking API:

```javascript
const customFields = {
  // Core booking fields
  booking_id: newBooking.id,
  payment_url: checkoutUrl || '',
  payment_amount: finalAmountDueAfterDiscount.toString(),
  
  // Service details
  service_requested: service.name,
  service_address: serviceAddressForGhl,
  service_price: service.basePrice.toNumber().toString(),
  
  // Date/Time fields (all three for compatibility)
  appointment_date: scheduledDateTime ? 
    new Date(scheduledDateTime).toLocaleDateString('en-US') : '',
  appointment_time: scheduledDateTime ? 
    new Date(scheduledDateTime).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }) : '',
  appointment_datetime: scheduledDateTime ? 
    new Date(scheduledDateTime).toISOString()
      .replace('T', ' ')
      .substring(0, 19) : '',
  
  // Workflow support fields
  preferred_datetime: scheduledDateTime || '',
  urgency_level: 'new',
  hours_old: '0',
  
  // Additional fields from the booking form
  booking_number_of_signers: body.booking_number_of_signers?.toString() || '1',
  booking_location_type: locationType || '',
  booking_special_instructions: notes || '',
  
  // Referral tracking
  referred_by_name_or_email: referredBy || '',
  
  // Consent tracking (if not using tags)
  consent_sms_communications: body.smsNotifications ? 'Yes' : 'No',
  consent_email_marketing: body.emailUpdates ? 'Yes' : 'No',
};

// Then in the GHL contact payload:
const ghlContactPayload = {
  // ... other fields ...
  customField: customFields,
};
``` 