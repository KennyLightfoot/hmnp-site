# 🧹 GHL Custom Fields & Tags Cleanup Guide

## 🚨 **IMPORTANT: WHAT THIS DOES**

Your current GHL setup has **massive redundancy**:
- **1,200+ custom fields** (you only need 24)
- **534+ tags** (you only need ~40)

These cleanup scripts will **DELETE all unused fields and tags**, keeping only what your web app actually uses.

## ⚠️ **BACKUP FIRST**

Before running cleanup:
1. Export your GHL data as backup
2. Document any custom workflows using fields/tags not in the keep list
3. Confirm you're ready to permanently delete unused items

## 🎯 **What Will Be KEPT**

### Custom Fields (24 total):
```
✅ KEEP - Core booking fields:
- booking_id
- service_address, service_name, service_price
- payment_amount, appointment_date, appointment_time
- appointment_datetime, service_date, service_time
- number_of_signatures

✅ KEEP - Stripe webhook fields:  
- stripe_payment_intent_id
- refund_amount
- last_stripe_webhook_date

✅ KEEP - Contact form fields:
- cf_preferred_call_time
- cf_call_request_notes
- cf_lead_source_detail
- cf_consent_sms_communications
- cf_consent_terms_conditions

✅ KEEP - Marketing fields:
- cf_utm_source, cf_utm_medium, cf_utm_campaign

✅ KEEP - Payment tracking:
- cf_payment_status, cf_refund_amount
```

### Tags (~40 total):
```
✅ KEEP - Status tags:
- status:booking_pendingpayment
- status:payment_completed  
- status:booking_confirmed
- etc.

✅ KEEP - Stripe webhook tags:
- stripe:payment_completed
- stripe:payment_failed
- stripe:refund_processed

✅ KEEP - Workflow tags:
- urgency:new, urgency:high, urgency:critical
- client:first_time, source:website_booking
- etc.
```

## 🚀 **HOW TO RUN CLEANUP**

### Option 1: Full Cleanup (Recommended)
```bash
# Run complete cleanup of both fields and tags
node scripts/cleanup-all-ghl-unused.js
```

### Option 2: Individual Cleanups
```bash
# Clean up custom fields only
node scripts/cleanup-unused-ghl-fields.js

# Clean up tags only  
node scripts/cleanup-unused-ghl-tags.js
```

### Option 3: Just Create Minimal Setup (No Deletion)
```bash
# Only create the fields you need (doesn't delete existing)
node scripts/create-minimal-ghl-fields.js

# Only create the tags you need (doesn't delete existing)
node scripts/create-minimal-ghl-tags.js
```

## 📊 **Expected Results**

**Before Cleanup:**
- 1,200+ custom fields (96% unused)
- 534+ tags (93% unused)  
- Cluttered GHL interface
- Workflow confusion
- Broken Stripe webhooks

**After Cleanup:**
- 24 custom fields (100% used)
- ~40 tags (100% used)
- Clean GHL interface
- Clear workflow logic
- Working Stripe webhooks

## 🔧 **Environment Setup**

Ensure these are set in your `.env`:
```env
GHL_API_KEY=your_private_integration_token
GHL_LOCATION_ID=your_location_id
GHL_API_BASE_URL=https://services.leadconnectorhq.com
```

## ⚡ **What Each Script Does**

### `cleanup-unused-ghl-fields.js`
- Fetches all custom fields from GHL
- Compares against the "keep" list  
- Deletes everything not in the keep list
- Shows progress and results

### `cleanup-unused-ghl-tags.js`
- Fetches all tags from GHL
- Compares against the "keep" list
- Deletes everything not in the keep list  
- Shows progress and results

### `cleanup-all-ghl-unused.js` 
- Runs both cleanup scripts in sequence
- Provides comprehensive summary
- Handles errors gracefully

## 🛠️ **If Cleanup Fails**

Some items might not delete due to:
- GHL API limitations
- Items in use by contacts/workflows
- Rate limiting

**Fallback Options:**
1. **Rename unused items** with `zz_unused_` prefix
2. **Manually delete** in GHL interface
3. **Ignore** - they won't break anything, just clutter

## ✅ **Post-Cleanup Steps**

After successful cleanup:

1. **Verify minimal setup:**
   ```bash
   node scripts/create-minimal-ghl-fields.js
   node scripts/create-minimal-ghl-tags.js
   ```

2. **Test Stripe webhook workflow:**
   - Create test booking
   - Process test payment
   - Verify tags are applied correctly

3. **Check GHL interface:**
   - Fields list should be clean
   - Tags list should be manageable
   - Workflows should be easier to build

## 🎉 **Success Metrics**

You'll know it worked when:
- ✅ Only 24 custom fields remain
- ✅ Only ~40 tags remain  
- ✅ GHL interface is clean
- ✅ Stripe webhooks work
- ✅ No workflow confusion
- ✅ Fast field/tag selection

## 🆘 **Need Help?**

If cleanup fails or you have questions:
1. Check the error messages in console output
2. Verify your GHL API permissions
3. Try manual deletion in GHL interface
4. Run minimal setup scripts to ensure needed items exist

---

**Remember:** This is a one-time cleanup that will dramatically improve your GHL setup and ensure your Stripe webhook workflows function correctly! 