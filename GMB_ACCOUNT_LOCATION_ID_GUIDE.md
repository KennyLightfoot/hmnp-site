# How to Find Your GMB Account ID and Location ID

**Last Updated:** 2025-01-27

---

## 🚀 Method 1: Automated Script (Easiest)

### Step 1: Make Sure You Have Credentials

First, ensure you have:
- ✅ OAuth Client ID and Secret in `.env.local`
- ✅ Refresh token (run `node scripts/get-gmb-refresh-token.js` if needed)

### Step 2: Run the Script

```bash
node scripts/get-gmb-account-location.js
```

### Step 3: Copy the IDs

The script will:
1. List all your GMB accounts
2. Show Account IDs for each
3. List all locations in each account
4. Show Location IDs
5. Display the environment variables you need

**Example Output:**
```
📋 Found GMB Accounts:
────────────────────────────────────────────────────────────────────────────────
1. Houston Mobile Notary Pros
   Account ID: 424427793005
   Type: PERSONAL

🏢 Getting locations for account: Houston Mobile Notary Pros

📍 Found Locations:
────────────────────────────────────────────────────────────────────────────────
1. Houston Mobile Notary Pros
   Location ID: 8366963618766894899
   Address: 3118 FM 528 Rd, Webster, TX
   Primary Category: Notary Public

✅ Environment Variables for your first location:
────────────────────────────────────────────────────────────────────────────────
GOOGLE_MY_BUSINESS_ACCOUNT_ID="424427793005"
GOOGLE_MY_BUSINESS_LOCATION_ID="8366963618766894899"
────────────────────────────────────────────────────────────────────────────────
```

### Step 4: Add to Environment Variables

Copy the values and add to your `.env.local`:

```bash
GOOGLE_MY_BUSINESS_ACCOUNT_ID=424427793005
GOOGLE_MY_BUSINESS_LOCATION_ID=8366963618766894899
```

---

## 📋 Method 2: Manual Method (If Script Doesn't Work)

### Option A: From Google Business Profile Dashboard

1. **Go to Google Business Profile:**
   - Visit: https://business.google.com/
   - Sign in with your Google account
   - Select your business

2. **Find Location ID in URL:**
   - Look at the URL in your browser
   - It might look like: `https://business.google.com/locations/8366963618766894899`
   - The number at the end is your **Location ID**

3. **Find Account ID:**
   - Go to: https://business.google.com/manage
   - Check the URL or browser developer tools
   - Or use the API method below

### Option B: From Google Maps

1. **Search for your business on Google Maps**
2. **Click on your business listing**
3. **Look at the URL:**
   - Example: `https://www.google.com/maps/place/Houston+Mobile+Notary+Pros/@29.3838,-94.9027,15z/data=!4m6!3m5!1s0x0:0x0!8m2!3d29.3838!4d-94.9027!16s%2Fg%2F11c1234567`
   - The `g/11c1234567` part contains location info, but Location ID is usually not directly visible

### Option C: Using Google Business Profile API Directly

If you have API access working, you can use these endpoints:

**Get Accounts:**
```
GET https://mybusinessaccountmanagement.googleapis.com/v1/accounts
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Get Locations:**
```
GET https://mybusinessbusinessinformation.googleapis.com/v1/accounts/{ACCOUNT_ID}/locations
Authorization: Bearer YOUR_ACCESS_TOKEN
```

---

## 🔍 Method 3: Check Existing Environment Variables

You might already have them set! Check your `.env.local`:

```bash
# Look for these:
GOOGLE_MY_BUSINESS_ACCOUNT_ID=...
GOOGLE_MY_BUSINESS_LOCATION_ID=...
```

If they're already there, you're good to go!

---

## 🆘 Troubleshooting

### Script Says "No GMB accounts found"

**Possible causes:**
1. **Wrong Google account** - Make sure you're using the account that owns the GBP
2. **GBP not verified** - Your business profile must be verified
3. **API not enabled** - Enable Google My Business API in Google Cloud Console
4. **Wrong OAuth client** - Make sure you're using credentials from the correct project

**Fix:**
- Verify your GBP is claimed and verified
- Check you're using the correct Google account
- Enable Google My Business API in your Google Cloud project

### Script Says "No locations found"

**Possible causes:**
1. **Account has no locations** - Create a location in GBP first
2. **Wrong account** - You might have multiple accounts, check all of them
3. **Permissions issue** - Make sure you have "Owner" or "Manager" access

**Fix:**
- Go to https://business.google.com/
- Make sure you have at least one location created
- Verify you have proper access permissions

### Script Shows Multiple Accounts

**If you see multiple accounts:**
- Usually, you'll only have one account (PERSONAL type)
- If you have multiple, use the one that contains your business location
- The script will show locations for each account

### Can't Find Location ID in URL

**Alternative method:**
1. Go to: https://business.google.com/
2. Click on your business
3. Open browser developer tools (F12)
4. Go to Network tab
5. Refresh the page
6. Look for API calls - they'll contain the Location ID in the request/response

---

## ✅ Verification

After getting your IDs, verify they work:

```bash
node scripts/verify-gmb-credentials.js
```

This will test:
- ✅ Credentials are valid
- ✅ Account ID is correct
- ✅ Location ID is correct
- ✅ API access is working

---

## 📝 Quick Reference

**Account ID Format:**
- Usually a number: `424427793005`
- Sometimes called "Account Name" in API responses
- Found in: `accounts/{ACCOUNT_ID}`

**Location ID Format:**
- Usually a long number: `8366963618766894899`
- Found in: `accounts/{ACCOUNT_ID}/locations/{LOCATION_ID}`
- Unique to each business location

**Full Resource Names:**
- Account: `accounts/424427793005`
- Location: `accounts/424427793005/locations/8366963618766894899`

---

## 🎯 Next Steps

Once you have both IDs:

1. **Add to `.env.local`:**
   ```bash
   GOOGLE_MY_BUSINESS_ACCOUNT_ID=your_account_id
   GOOGLE_MY_BUSINESS_LOCATION_ID=your_location_id
   ```

2. **Verify everything works:**
   ```bash
   node scripts/verify-gmb-credentials.js
   ```

3. **Update your GBP:**
   ```bash
   node scripts/update-gbp-complete.js
   ```

---

**Last Updated:** 2025-01-27

