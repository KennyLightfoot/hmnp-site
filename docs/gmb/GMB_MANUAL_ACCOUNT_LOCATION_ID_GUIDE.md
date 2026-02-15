# Manual Guide: Finding GMB Account ID & Location ID

## 🎯 Quick Method (Easiest)

### Step 1: Open Google Business Profile Manager

1. Go to: https://business.google.com/
2. Sign in with your account (`houstonmobilenotarypros@gmail.com`)
3. Select your business profile

### Step 2: Get Location ID from URL

Once you're viewing your business profile, look at the browser URL. It will look like:

```
https://business.google.com/locations/1234567890123456789/dashboard
```

**The long number (`1234567890123456789`) is your Location ID!**

Copy that number - that's your `GOOGLE_MY_BUSINESS_LOCATION_ID`.

---

## 🔍 Alternative Method: From Google Business Profile Settings

### Step 1: Access Profile Settings

1. Go to: https://business.google.com/
2. Click on your business
3. Click **"Settings"** (gear icon) in the left sidebar

### Step 2: Find Location ID

1. Scroll down to **"Advanced settings"**
2. Look for **"Location ID"** or **"Place ID"**
3. Copy the ID shown there

---

## 📋 Finding Account ID

The Account ID is trickier to find manually. Here are a few methods:

### Method 1: Check Your .env Files

If you've run the script before (even if it failed), check if the Account ID was saved:

1. Open `.env.local` or `.env`
2. Look for `GOOGLE_MY_BUSINESS_ACCOUNT_ID`
3. If it exists, use that value

### Method 2: Use Google Business Profile API Explorer

1. Go to: https://developers.google.com/my-business/content/account-management
2. Use the API Explorer to list accounts
3. You'll need to authorize with your Google account

### Method 3: Check Google Cloud Console

1. Go to: https://console.cloud.google.com/
2. Make sure you're in the correct project
3. Go to **"APIs & Services"** → **"Credentials"**
4. Look for any saved Account IDs in your notes or documentation

---

## 🎯 Most Common Account ID Format

Account IDs typically look like:
- `accounts/1234567890123456789` (full format)
- `1234567890123456789` (just the number)

**For `.env.local`, use just the number part** (without `accounts/`).

---

## ✅ What You Need

Once you have both IDs, add them to `.env.local`:

```bash
GOOGLE_MY_BUSINESS_ACCOUNT_ID="your_account_id_here"
GOOGLE_MY_BUSINESS_LOCATION_ID="your_location_id_here"
```

**Important:**
- Account ID: Usually a long number (15-20 digits)
- Location ID: Usually a long number (15-20 digits)
- Don't include `accounts/` or `locations/` prefixes - just the numbers

---

## 🆘 If You Can't Find Account ID

**Option 1: Use Location ID Only**

Some scripts can work with just the Location ID. Try running:

```bash
node scripts/verify-gmb-credentials.js
```

If it works, you might not need the Account ID for basic operations.

**Option 2: Check Your GBP Dashboard**

1. Go to: https://business.google.com/
2. Look at the browser's developer console (F12)
3. Check Network tab for API calls
4. Look for requests to `mybusinessaccountmanagement.googleapis.com`
5. The Account ID will be in the request URLs

**Option 3: Contact Support**

If you're still stuck, you can:
- Check your Google Business Profile verification email (sometimes contains IDs)
- Contact Google Business Profile support
- Check any documentation or notes you have from initial GBP setup

---

## 📝 Quick Checklist

- [ ] Location ID found from business.google.com URL
- [ ] Location ID added to `.env.local`
- [ ] Account ID found (or determined not needed)
- [ ] Account ID added to `.env.local` (if found)
- [ ] Run `node scripts/verify-gmb-credentials.js` to test

---

**Last Updated:** 2025-01-27

