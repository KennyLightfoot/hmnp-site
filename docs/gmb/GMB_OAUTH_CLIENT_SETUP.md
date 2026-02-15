# GMB OAuth Client Setup Guide

## ✅ Yes - Use "Web application"

When creating the OAuth 2.0 Client ID, select **"Web application"** as the application type.

## Why "Web application"?

- ✅ Supports redirect URIs (needed for our localhost callback)
- ✅ Can securely store Client ID and Secret
- ✅ Works with the OAuth flow we're using
- ✅ Required for Google My Business API

## Step-by-Step Setup

### Step 1: Go to Credentials

1. In your chosen Google Cloud project, go to:
   https://console.cloud.google.com/apis/credentials

2. Make sure you're in the correct project (check the project dropdown at the top)

### Step 2: Create OAuth Client

1. Click **"+ CREATE CREDENTIALS"** (top of the page)
2. Select **"OAuth client ID"**

### Step 3: Configure OAuth Client

**If this is your first OAuth client in this project:**
- You'll be asked to configure the OAuth consent screen first
- Click "Configure consent screen"
- Choose "External" (unless you have a Google Workspace)
- Fill in required fields:
  - App name: "Houston Mobile Notary Pros" (or your business name)
  - User support email: Your email
  - Developer contact: Your email
- Click "Save and Continue"
- Skip scopes (click "Save and Continue")
- Add test users if needed (click "Save and Continue")
- Review and go back to credentials

**Now create the OAuth client:**
1. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
2. **Application type:** Select **"Web application"** ✅
3. **Name:** Enter something like:
   - "GMB API Client"
   - "Houston Mobile Notary Pros GMB"
   - Or any descriptive name

### Step 4: Add Redirect URI

**Authorized redirect URIs:**
1. Click **"+ ADD URI"**
2. Add: `http://localhost:8080/callback`
3. Click **"CREATE"**

### Step 5: Copy Credentials

After creation, you'll see a popup with:
- **Your Client ID** (looks like: `123456789-abc...apps.googleusercontent.com`)
- **Your Client Secret** (looks like: `GOCSPX-...`)

**IMPORTANT:** Copy these immediately - you won't be able to see the secret again!

### Step 6: Add to Environment Variables

Add to your `.env.local` file:

```bash
GOOGLE_MY_BUSINESS_CLIENT_ID=your_client_id_here
GOOGLE_MY_BUSINESS_CLIENT_SECRET=your_client_secret_here
```

## What About Other Application Types?

### ❌ Don't Use "Desktop app"
- Doesn't support redirect URIs properly
- Not suitable for our use case

### ❌ Don't Use "TV and Limited Input device"
- Wrong type for API access

### ✅ Use "Web application"
- This is the correct type for our script

## Troubleshooting

### "Invalid redirect URI" Error

**Problem:** Redirect URI not accepted

**Solution:**
- Make sure you added: `http://localhost:8080/callback`
- Check for typos (no trailing slashes, correct port)
- The URI must match exactly what's in the script

### "OAuth consent screen not configured"

**Problem:** First time creating OAuth client

**Solution:**
- Google will prompt you to configure consent screen
- Follow the steps above to set it up
- Choose "External" user type
- Fill in required fields

### Can't See Client Secret After Creation

**Problem:** Secret is hidden after first view

**Solution:**
- If you didn't copy it, you'll need to:
  1. Delete the OAuth client
  2. Create a new one
  3. Copy the secret immediately

## Quick Checklist

- [ ] Selected "Web application" as application type
- [ ] Added redirect URI: `http://localhost:8080/callback`
- [ ] Copied Client ID and Secret immediately
- [ ] Added credentials to `.env.local`
- [ ] Saved the file

## Next Steps

After setting up the OAuth client:

1. **Verify credentials are loaded:**
   ```bash
   node scripts/verify-gmb-credentials.js
   ```

2. **Get refresh token:**
   ```bash
   node scripts/get-gmb-refresh-token.js
   ```

3. **Update GBP profile:**
   ```bash
   node scripts/update-gbp-complete.js
   ```

## Summary

✅ **Use "Web application"** - it's the correct type for Google My Business API with our localhost callback setup.

