# Fixing "HTML Response" Error in GMB API

## 🔴 The Problem

You're seeing: `Unexpected token '<', "<!DOCTYPE "... is not valid JSON`

This means the API is returning an HTML error page instead of JSON data.

---

## ✅ Most Common Causes & Fixes

### Fix 1: Enable Google My Business API (Most Likely)

The API might not be enabled in your Google Cloud project.

**Steps:**

1. **Go to:** https://console.cloud.google.com/apis/library
2. **Make sure you're in the correct project** (the one with your OAuth client)
3. **Search for:** "Google My Business API"
4. **Click on:** "Google My Business API" (or "My Business API")
5. **Click:** "ENABLE"
6. **Wait 1-2 minutes** for it to activate
7. **Try the script again:**
   ```bash
   node scripts/verify-gmb-credentials.js
   ```

**Note:** There are actually TWO APIs you might need:
- **Google My Business API** (older, might be deprecated)
- **My Business Account Management API**
- **My Business Business Information API**

Enable all three if you see them.

---

### Fix 2: Check Account ID Format

Your Account ID (`424427793005`) looks like it might be a **Project Number** instead of an Account ID.

**Account IDs:**
- Usually 15-20 digits long
- Format: `accounts/1234567890123456789` (full) or just `1234567890123456789` (number only)

**Project Numbers:**
- Usually 10-12 digits
- Format: `424427793005` (what you have)

**How to find the real Account ID:**

1. **Go to:** https://business.google.com/
2. **Open Developer Tools** (F12)
3. **Go to Network tab**
4. **Refresh the page**
5. **Look for API calls** to `mybusinessaccountmanagement.googleapis.com`
6. **Check the request URLs** - they'll contain the Account ID
7. **Look for:** `accounts/1234567890123456789` in the URL

**Or use the API directly:**

If you have the Location ID working, you can sometimes skip the Account ID for basic operations.

---

### Fix 3: Verify API Endpoint

The script uses:
```
mybusinessbusinessinformation.googleapis.com/v1/accounts/{ACCOUNT_ID}/locations/{LOCATION_ID}
```

**Make sure:**
- ✅ The API endpoint is correct
- ✅ Your Account ID and Location ID are in the right format
- ✅ No extra slashes or characters

---

### Fix 4: Check API Permissions

Make sure your OAuth token has the right scopes:

1. **Go to:** https://console.cloud.google.com/apis/credentials/consent
2. **Check "Scopes" section**
3. **Verify:** `https://www.googleapis.com/auth/business.manage` is listed
4. **If missing:** Add it and save

---

## 🔍 Diagnostic Steps

### Step 1: Check What HTML is Being Returned

Run the script again - the improved error handling will show you the first 200 characters of the HTML response. This will tell you what the actual error is.

### Step 2: Verify API is Enabled

1. Go to: https://console.cloud.google.com/apis/dashboard
2. Make sure you're in the correct project
3. Look for these APIs (should show "Enabled"):
   - My Business Account Management API
   - My Business Business Information API
   - Google My Business API (if available)

### Step 3: Test with curl (Optional)

If you want to test the API directly:

```bash
# Get access token first (from the script output)
ACCESS_TOKEN="your_access_token_here"
ACCOUNT_ID="your_account_id"
LOCATION_ID="your_location_id"

curl -H "Authorization: Bearer $ACCESS_TOKEN" \
  "https://mybusinessbusinessinformation.googleapis.com/v1/accounts/$ACCOUNT_ID/locations/$LOCATION_ID"
```

This will show you the raw response.

---

## 🎯 Quick Fix Checklist

- [ ] Google My Business API is enabled in Google Cloud Console
- [ ] My Business Account Management API is enabled
- [ ] My Business Business Information API is enabled
- [ ] Account ID is correct (15-20 digits, not project number)
- [ ] Location ID is correct (from business.google.com URL)
- [ ] OAuth scope includes `business.manage`
- [ ] Waited 1-2 minutes after enabling APIs

---

## 🆘 If Still Not Working

### Option 1: Use Location ID Only

Some operations can work with just the Location ID. Try modifying the script to skip Account ID validation.

### Option 2: Check Browser Network Tab

1. Go to https://business.google.com/
2. Open Developer Tools → Network tab
3. Look for successful API calls
4. Copy the Account ID from the request URLs

### Option 3: Contact Support

If nothing works:
- Check Google Cloud Status: https://status.cloud.google.com/
- File a support ticket in Google Cloud Console
- Include the HTML response preview from the error message

---

**Last Updated:** 2025-01-27

