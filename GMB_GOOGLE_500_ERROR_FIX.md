# Fixing Google 500 Error During OAuth

## 🔴 The Problem

You're seeing a Google 500 error when trying to authorize the OAuth app:
```
500. That's an error.
There was an error. Please try again later.
```

This is a **server-side error on Google's end**, not your code.

---

## ✅ Quick Fixes (Try These First)

### Fix 1: Wait and Retry (Most Common)

Google 500 errors are often temporary. Try:

1. **Wait 2-3 minutes**
2. **Close the browser tab**
3. **Run the script again:**
   ```bash
   node scripts/get-gmb-refresh-token.js
   ```

**Why this works:** Google's OAuth service sometimes has temporary hiccups.

---

### Fix 2: Clear Browser Cache/Cookies

Sometimes cached OAuth data causes issues:

1. **Clear cookies for `accounts.google.com`:**
   - Chrome: Settings → Privacy → Cookies → See all cookies → Search "google.com" → Delete
   - Or use Incognito/Private mode

2. **Try again in a new incognito window**

---

### Fix 3: Verify OAuth Client Configuration

Make sure everything is set up correctly:

1. **Go to:** https://console.cloud.google.com/apis/credentials
2. **Select the correct project** (the one with your OAuth client)
3. **Click your OAuth 2.0 Client ID**
4. **Verify:**
   - ✅ **Application type:** "Web application"
   - ✅ **Authorized redirect URIs:** `http://localhost:8080/callback` (exact match)
   - ✅ **Authorized JavaScript origins:** `http://localhost:8080` (optional but recommended)

5. **Click "SAVE"** even if nothing changed (forces a refresh)

---

### Fix 4: Check OAuth Consent Screen

1. **Go to:** https://console.cloud.google.com/apis/credentials/consent
2. **Verify:**
   - ✅ **Publishing status:** "In production" (or "Testing" with you as test user)
   - ✅ **Scopes:** Should include `https://www.googleapis.com/auth/business.manage`
   - ✅ **App name:** Should be set (not empty)

3. **If in "Testing" mode:**
   - Make sure your email (`houstonmobilenotarypros@gmail.com`) is in "Test users"
   - Or publish the app

---

### Fix 5: Try Different Browser/Device

Sometimes browser-specific issues cause problems:

1. **Try a different browser** (Chrome → Firefox, or vice versa)
2. **Try on a different device** (if possible)
3. **Try mobile browser** (sometimes works when desktop doesn't)

---

### Fix 6: Check for Rate Limiting

If you've tried many times, Google might be rate-limiting:

1. **Wait 10-15 minutes**
2. **Try again**

---

## 🔍 Advanced Troubleshooting

### Check OAuth Client ID Format

Your Client ID should look like:
```
636360924375-390n6jmotm83ced05940u2m76pfthkg6.apps.googleusercontent.com
```

**Verify:**
- ✅ Starts with numbers
- ✅ Contains `-` (hyphen)
- ✅ Ends with `.apps.googleusercontent.com`
- ✅ Matches the one in `.env.local`

---

### Verify Redirect URI is Exact Match

The redirect URI in your script must **exactly match** the one in Google Cloud Console:

**In script:** `http://localhost:8080/callback`
**In Console:** `http://localhost:8080/callback` ✅

**Common mistakes:**
- ❌ `http://localhost:8080/callback/` (trailing slash)
- ❌ `https://localhost:8080/callback` (https instead of http)
- ❌ `http://127.0.0.1:8080/callback` (IP instead of localhost)

---

### Check Google Cloud Project Status

1. **Go to:** https://console.cloud.google.com/
2. **Check project status:**
   - ✅ Project is active (not suspended)
   - ✅ Billing is enabled (if required)
   - ✅ No quota limits exceeded

---

### Try Manual Authorization URL

If the script isn't working, try manually constructing the URL:

1. **Get your Client ID** from `.env.local`
2. **Open this URL in browser** (replace `YOUR_CLIENT_ID`):
   ```
   https://accounts.google.com/o/oauth2/v2/auth?client_id=YOUR_CLIENT_ID&redirect_uri=http%3A%2F%2Flocalhost%3A8080%2Fcallback&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fbusiness.manage&response_type=code&access_type=offline&prompt=consent
   ```

3. **After authorization**, copy the `code` parameter from the URL
4. **Manually exchange it** using curl or Postman

---

## 🆘 If Nothing Works

### Option 1: Create a New OAuth Client

Sometimes OAuth clients get into a bad state:

1. **Create a new OAuth 2.0 Client ID:**
   - Go to: https://console.cloud.google.com/apis/credentials
   - Click "+ CREATE CREDENTIALS" → "OAuth client ID"
   - Type: "Web application"
   - Redirect URI: `http://localhost:8080/callback`
   - Click "CREATE"

2. **Update `.env.local`:**
   ```bash
   GOOGLE_MY_BUSINESS_CLIENT_ID=new_client_id_here
   GOOGLE_MY_BUSINESS_CLIENT_SECRET=new_client_secret_here
   ```

3. **Try the script again**

---

### Option 2: Use a Different Redirect URI

If `localhost:8080` is causing issues, try a different port:

1. **Update script** to use port `8081` or `3000`
2. **Add new redirect URI** to OAuth client in Console
3. **Try again**

---

### Option 3: Contact Google Support

If the error persists for hours:

1. **Check Google Cloud Status:** https://status.cloud.google.com/
2. **File a support ticket** in Google Cloud Console
3. **Include:**
   - Error message
   - OAuth client ID (first 20 chars)
   - Timestamp of errors
   - Steps to reproduce

---

## ✅ Verification Checklist

Before trying again, verify:

- [ ] OAuth client is "Web application" type
- [ ] Redirect URI is exactly `http://localhost:8080/callback`
- [ ] Client ID and Secret are correct in `.env.local`
- [ ] OAuth consent screen is published (or you're a test user)
- [ ] GMB scope is added to consent screen
- [ ] No typos in Client ID/Secret
- [ ] Browser cookies cleared (or using incognito)
- [ ] Waited 2-3 minutes since last attempt

---

## 🎯 Most Likely Solution

**90% of the time**, Google 500 errors are temporary. Try:

1. **Wait 5 minutes**
2. **Clear browser cookies for google.com**
3. **Run script again in incognito mode**

This usually resolves it.

---

**Last Updated:** 2025-01-27

