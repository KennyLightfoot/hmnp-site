# Fixing OAuth Consent Screen "Access Blocked" Error

## Problem

You're seeing:
```
Access blocked: HMNP Map has not completed the Google verification process
Error 403: access_denied
```

This means your OAuth consent screen is in **"Testing"** mode and you're not added as a test user.

---

## ✅ Solution: Add Yourself as Test User

### Step 1: Go to OAuth Consent Screen

1. Go to: https://console.cloud.google.com/apis/credentials/consent
2. Make sure you're in the **"HMNP"** project (or whichever project has your OAuth client)
3. You should see "OAuth consent screen" configuration

### Step 2: Add Test Users

1. Scroll down to **"Test users"** section
2. Click **"+ ADD USERS"**
3. Add your email: `houstonmobilenotarypros@gmail.com`
4. Click **"ADD"**
5. Click **"SAVE"** at the bottom of the page

### Step 3: Try Again

After adding yourself as a test user:
1. Wait 1-2 minutes for changes to propagate
2. Run the script again:
   ```bash
   node scripts/get-gmb-refresh-token.js
   ```
3. You should now be able to authorize

---

## 🔄 Alternative: Publish the App (If Ready)

If you want anyone to be able to use it (not just test users):

### Option A: Publish for Internal Use (Recommended for Now)

1. Go to: https://console.cloud.google.com/apis/credentials/consent
2. Under **"Publishing status"**, click **"PUBLISH APP"**
3. Select **"Internal"** (if you have Google Workspace) or **"External"**
4. For **"External"**, you'll need to:
   - Complete the OAuth consent screen form
   - Add privacy policy URL
   - Add terms of service URL
   - Submit for verification (can take days/weeks)

### Option B: Keep in Testing Mode (Easier for Now)

**Just add yourself as a test user** (see Step 2 above) - this is the quickest solution!

---

## 📋 OAuth Consent Screen Configuration

### Required Information

If you need to complete the consent screen:

1. **App name:** "Houston Mobile Notary Pros" (or "HMNP")
2. **User support email:** `houstonmobilenotarypros@gmail.com`
3. **Developer contact:** `houstonmobilenotarypros@gmail.com`
4. **App domain:** `houstonmobilenotarypros.com`
5. **Privacy policy URL:** `https://houstonmobilenotarypros.com/privacy` (if you have one)
6. **Terms of service URL:** `https://houstonmobilenotarypros.com/terms` (if you have one)

### Scopes Needed

Make sure these scopes are added:
- `https://www.googleapis.com/auth/business.manage` (for GMB API)

---

## 🎯 Quick Fix (Do This Now)

1. **Go to:** https://console.cloud.google.com/apis/credentials/consent
2. **Scroll to:** "Test users" section
3. **Click:** "+ ADD USERS"
4. **Add:** `houstonmobilenotarypros@gmail.com`
5. **Click:** "ADD" then "SAVE"
6. **Wait:** 1-2 minutes
7. **Try again:** `node scripts/get-gmb-refresh-token.js`

---

## 🔍 Verify OAuth Client Name

The error mentions "HMNP Map" - this might be the name of your OAuth client or consent screen app name.

**To check/change:**
1. Go to: https://console.cloud.google.com/apis/credentials/consent
2. Check the "App name" field
3. If it says "HMNP Map", you can change it to "Houston Mobile Notary Pros" or "HMNP"
4. Save changes

**Note:** The app name doesn't affect functionality, but "HMNP Map" might be confusing since this is for GMB, not Maps.

---

## 📝 Step-by-Step Screenshot Guide

### Finding Test Users Section

1. Go to: https://console.cloud.google.com/apis/credentials/consent
2. You'll see sections:
   - App information
   - App domain
   - Authorized domains
   - **Scopes** ← Make sure GMB scope is here
   - **Test users** ← This is what you need!
   - Publishing status

3. Under "Test users":
   - Click "+ ADD USERS"
   - Enter your email
   - Click "ADD"
   - Click "SAVE" (at bottom of page)

---

## ✅ After Adding Test User

1. **Wait 1-2 minutes** for Google to update
2. **Clear browser cache** (optional but recommended)
3. **Run script again:**
   ```bash
   node scripts/get-gmb-refresh-token.js
   ```
4. **Authorize** - You should now be able to sign in!

---

## 🆘 Still Having Issues?

### If you still can't authorize:

1. **Check you're using the right Google account:**
   - Make sure `houstonmobilenotarypros@gmail.com` is the account that owns the GBP
   - Try signing out and signing back in

2. **Check OAuth client:**
   - Make sure you're using the OAuth client from the same project as the consent screen
   - Verify Client ID matches in `.env.local`

3. **Check scopes:**
   - Make sure `https://www.googleapis.com/auth/business.manage` is in the consent screen scopes

4. **Try incognito/private browser:**
   - Sometimes browser cache causes issues
   - Open the authorization URL in incognito mode

---

## 📋 Checklist

Before running the script:
- [ ] OAuth consent screen configured
- [ ] Your email added as test user
- [ ] GMB scope added to consent screen
- [ ] Changes saved
- [ ] Waited 1-2 minutes for propagation
- [ ] Client ID and Secret in `.env.local`
- [ ] Redirect URI added to OAuth client

---

**Last Updated:** 2025-01-27

