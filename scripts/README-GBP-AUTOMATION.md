# GBP Automation - Setup & Usage Guide

This guide covers automated updates to your Google Business Profile using the Google My Business API.

---

## 🎯 What Gets Automated

✅ **These can be automated:**
- Secondary categories (Mobile Notary Service, Loan Signing Agent)
- Service areas (10 cities)
- Business description
- Business hours
- Phone number

⚠️ **These need manual setup:**
- Appointment links (API limitation)
- Photo uploads (requires additional setup)
- Posts (separate script available)

❌ **Yelp updates:**
- No public API available - must be done manually
- See: `scripts/yelp-manual-fix-guide.md`

---

## 🚀 Quick Start

### Step 1: Get OAuth Credentials

First time setup only:

```bash
# Get OAuth tokens (opens browser for Google login)
node scripts/get-gmb-refresh-token.js
```

This will:
1. Open your browser
2. Ask you to log in to Google
3. Save your OAuth tokens

### Step 2: Get Account & Location IDs

```bash
# Find your GBP Account ID and Location ID
node scripts/get-gmb-account-location.js
```

This will display your Account ID and Location ID. Copy them!

### Step 3: Set Environment Variables

Add to your `.env.local`:

```bash
# From Step 1 (get-gmb-refresh-token.js)
GOOGLE_MY_BUSINESS_CLIENT_ID="your-client-id"
GOOGLE_MY_BUSINESS_CLIENT_SECRET="your-client-secret"
GOOGLE_MY_BUSINESS_REFRESH_TOKEN="your-refresh-token"

# From Step 2 (get-gmb-account-location.js)
GOOGLE_MY_BUSINESS_ACCOUNT_ID="your-account-id"
GOOGLE_MY_BUSINESS_LOCATION_ID="your-location-id"
```

### Step 4: Run the Update Script

```bash
# Update categories, service areas, and description
node scripts/update-gbp-complete.js
```

---

## 📋 What the Script Does

```bash
node scripts/update-gbp-complete.js
```

**Updates:**
1. ✅ Adds secondary categories:
   - Mobile Notary Service
   - Notary Public (secondary for broader reach)

2. ✅ Sets service areas:
   - Webster, TX
   - League City, TX
   - Texas City, TX
   - Pearland, TX
   - Sugar Land, TX
   - Galveston, TX
   - Baytown, TX
   - The Woodlands, TX
   - Katy, TX
   - Houston, TX

3. ✅ Updates business description (if needed)

**Does NOT update:**
- Appointment link (you'll need to add this manually in GBP dashboard)
- Photos (requires separate upload script)

---

## ⚠️ Manual Steps Still Required

After running the script, you still need to:

### 1. Add Appointment Link (2 minutes)
- Go to: https://business.google.com/
- Select "Houston Mobile Notary Pros"
- Edit profile → Appointment links
- Add URL: `https://houstonmobilenotarypros.com/booking`
- Label: "Book Online"
- Save

**Why manual?** Google's API doesn't support appointment links yet.

### 2. Fix Yelp Phone (5 minutes)
- Go to: https://biz.yelp.com/
- Change phone: (832) 650-0629 → (832) 617-4285
- Save

**Why manual?** Yelp has no public API for business updates.

See: `scripts/yelp-manual-fix-guide.md` for detailed steps.

---

## 🔧 Troubleshooting

### Error: "Missing OAuth credentials"
**Solution:** Run `node scripts/get-gmb-refresh-token.js` first

### Error: "Missing Account ID or Location ID"
**Solution:** 
1. Run `node scripts/get-gmb-account-location.js`
2. Copy the IDs to your `.env.local`

### Error: "Invalid credentials" or "401 Unauthorized"
**Solution:** Your refresh token expired. Re-run `get-gmb-refresh-token.js`

### Error: "Insufficient permissions"
**Solution:** 
- Verify you have "Owner" access to the GBP listing
- Go to: https://business.google.com/
- Check Settings → Users → Your role should be "Owner"

### Changes not showing in Google search
**Normal:** Google takes 24-48 hours to index profile updates

---

## 📊 Verification

After 24-48 hours:

1. **Check GBP Dashboard:**
   - Go to: https://business.google.com/
   - Verify categories show: Notary Public, Mobile Notary Service
   - Verify service areas are listed

2. **Check Google Search:**
   - Search: "mobile notary webster tx"
   - Your listing should appear with updated info

3. **Check Google Maps:**
   - Search: "Houston Mobile Notary Pros"
   - Click on your listing
   - Verify all info is correct

---

## 🔄 Re-running Updates

Safe to run multiple times! The script will:
- Preserve your existing primary category
- Add/update secondary categories
- Update service areas
- Not create duplicates

---

## 📝 What's Next?

After automation:
1. ✅ Run the GBP script
2. ⚠️ Manually add appointment link (2 min)
3. ⚠️ Manually fix Yelp phone (5 min)
4. ⏳ Wait 24-48 hours for indexing
5. ✅ Verify all changes in Google search

---

## 🆘 Need Help?

If you get stuck:
1. Check error messages carefully
2. Review troubleshooting section above
3. Verify OAuth tokens and IDs are correct
4. Make sure you have Owner access to GBP

Common commands:
```bash
# Re-authenticate
node scripts/get-gmb-refresh-token.js

# Get fresh IDs
node scripts/get-gmb-account-location.js

# Run updates
node scripts/update-gbp-complete.js
```

---

**Last Updated:** 2025-11-06  
**Script Version:** 1.0








