# GMB OAuth Setup Guide - Fixing NextAuth Error

## Problem

When trying to get a refresh token, you're seeing:
```
Error: This action with HTTP GET is not supported by NextAuth.js
```

This happens because the redirect URI points to NextAuth's callback route, which expects POST requests, but Google OAuth redirects with GET.

## Solution: Use Out-of-Band (OOB) Redirect URI

The script has been updated to use `urn:ietf:wg:oauth:2.0:oob` which displays the authorization code on a page instead of redirecting.

### Step 1: Add Redirect URI to Google Cloud Console

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click on your OAuth 2.0 Client ID (the one matching your `GOOGLE_MY_BUSINESS_CLIENT_ID`)
3. Scroll to "Authorized redirect URIs"
4. Click "ADD URI"
5. Add: `urn:ietf:wg:oauth:2.0:oob`
6. Click "SAVE"

### Step 2: Run the Script

```bash
node scripts/get-gmb-refresh-token.js
```

### Step 3: Authorize

1. The script will show you a URL
2. Copy and paste it into your browser
3. Log in with your Google account (the one that owns the GBP)
4. Authorize the application
5. Google will show you an authorization code on the page (not in the URL)
6. Copy the code from the page

### Step 4: Enter the Code

1. Paste the authorization code into the terminal
2. The script will exchange it for a refresh token
3. Copy the refresh token and add it to your `.env.local` file

## Alternative: Use Google OAuth Playground (Easier)

If you prefer a visual interface:

1. Go to: https://developers.google.com/oauthplayground/
2. Click the gear icon (⚙️) in the top right
3. Check "Use your own OAuth credentials"
4. Enter your:
   - OAuth Client ID
   - OAuth Client Secret
5. In the left panel, find "Google My Business API v1"
6. Select: `https://www.googleapis.com/auth/business.manage`
7. Click "Authorize APIs"
8. Log in and authorize
9. Click "Exchange authorization code for tokens"
10. Copy the "Refresh token" value
11. Add it to your `.env.local`:
    ```
    GOOGLE_MY_BUSINESS_REFRESH_TOKEN=your_refresh_token_here
    ```

## Verify Setup

After adding the refresh token, verify it works:

```bash
node scripts/verify-gmb-credentials.js
```

You should see all credentials ✅ and successful token refresh.

## Troubleshooting

### "redirect_uri_mismatch" Error

- **Cause:** The redirect URI isn't added to your OAuth client
- **Fix:** Follow Step 1 above to add `urn:ietf:wg:oauth:2.0:oob` to authorized redirect URIs

### "invalid_client" Error

- **Cause:** Client ID or Secret is wrong
- **Fix:** Verify your credentials match Google Cloud Console exactly

### "access_denied" Error

- **Cause:** You didn't authorize the application
- **Fix:** Make sure to click "Allow" when Google asks for permission

### Still Getting NextAuth Error

- **Cause:** You're using the old redirect URI
- **Fix:** The script now uses `urn:ietf:wg:oauth:2.0:oob` - make sure you've updated the script and added this URI to Google Cloud Console

