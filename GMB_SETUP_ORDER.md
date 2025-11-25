# GMB Setup - Correct Order of Operations

**Last Updated:** 2025-01-27

---

## ✅ Correct Setup Order

### Step 1: Get OAuth Credentials (Client ID & Secret)
- ✅ **DONE** - You already have these in Google Cloud Console
- Client ID: `88574386279-5q11a6i5fcnkq59sa9imrks8fjeu1a2a.apps.googleusercontent.com`
- Make sure these are in your `.env.local`

### Step 2: Get Refresh Token ⭐ DO THIS FIRST
```bash
node scripts/get-gmb-refresh-token.js
```

**What this does:**
- Starts local callback server on port 8080
- Opens browser for Google OAuth
- You authorize the app
- Script captures authorization code
- Exchanges code for refresh token
- Shows you the refresh token to add to `.env.local`

**Prerequisites:**
- ✅ OAuth client created in Google Cloud Console
- ✅ Redirect URI `http://localhost:8080/callback` added to OAuth client
- ✅ Client ID and Secret in `.env.local`

### Step 3: Get Account ID & Location ID
```bash
node scripts/get-gmb-account-location.js
```

**What this does:**
- Uses refresh token to get access token
- Lists all your GMB accounts
- Shows Account IDs
- Lists all locations
- Shows Location IDs
- Displays environment variables you need

**Prerequisites:**
- ✅ Refresh token from Step 2
- ✅ Refresh token added to `.env.local`

### Step 4: Verify Everything Works
```bash
node scripts/verify-gmb-credentials.js
```

**What this does:**
- Tests all credentials
- Verifies access token refresh works
- Tests API access to your location
- Shows current GBP profile info

### Step 5: Update GBP Profile
```bash
node scripts/update-gbp-complete.js
```

**What this does:**
- Updates categories
- Sets service areas
- Updates business description
- Optimizes your GBP profile

---

## 🔄 Current Status

You're at **Step 2** - Need to get refresh token first!

---

## 📋 Quick Checklist

Before running `get-gmb-refresh-token.js`:

- [ ] OAuth client created in Google Cloud Console
- [ ] Redirect URI `http://localhost:8080/callback` added to OAuth client
- [ ] `GOOGLE_MY_BUSINESS_CLIENT_ID` in `.env.local`
- [ ] `GOOGLE_MY_BUSINESS_CLIENT_SECRET` in `.env.local`
- [ ] Using the correct Google Cloud project ("HMNP")

Then run:
```bash
node scripts/get-gmb-refresh-token.js
```

After getting refresh token:
- [ ] Add `GOOGLE_MY_BUSINESS_REFRESH_TOKEN` to `.env.local`
- [ ] Run `node scripts/get-gmb-account-location.js`
- [ ] Add Account ID and Location ID to `.env.local`

---

## 🆘 Troubleshooting

### "Bad Request" when getting refresh token
- Check redirect URI is exactly `http://localhost:8080/callback` in Google Cloud Console
- Verify Client ID and Secret match your OAuth client
- Make sure port 8080 is not in use

### "Bad Request" when getting account/location IDs
- **This means refresh token is invalid or missing**
- Go back to Step 2 and get a new refresh token
- Make sure refresh token is in `.env.local`

---

**Last Updated:** 2025-01-27

