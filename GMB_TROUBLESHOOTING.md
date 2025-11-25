# GMB API Troubleshooting Guide

## ✅ Credentials Loading Successfully

Your environment variables are now loading correctly from `.env.local` or `.env` files.

## ❌ "Bad Request" Error When Refreshing Token

If you're getting a "Bad Request" error when trying to refresh the access token, here are the most common causes and solutions:

### 1. Invalid Refresh Token

**Symptoms:** "Bad Request" or "invalid_grant" error

**Solution:**
- Your refresh token may have expired or been revoked
- You need to generate a new refresh token

**Steps:**
```bash
# Run the refresh token script
node scripts/get-gmb-refresh-token.js
```

This will:
1. Open a browser window for Google OAuth
2. Ask you to authorize the application
3. Generate a new refresh token
4. Save it to your `.env.local` file

### 2. OAuth Credentials Mismatch

**Symptoms:** "Bad Request" or "invalid_client" error

**Check:**
- Ensure `GOOGLE_MY_BUSINESS_CLIENT_ID` matches your Google Cloud Console OAuth client ID
- Ensure `GOOGLE_MY_BUSINESS_CLIENT_SECRET` matches your OAuth client secret
- Both should be from the same OAuth 2.0 Client in Google Cloud Console

**Solution:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to: APIs & Services → Credentials
3. Find your OAuth 2.0 Client ID
4. Verify the Client ID and Secret match your `.env.local` file

### 3. API Not Enabled

**Symptoms:** "Bad Request" or "API not enabled" error

**Solution:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to: APIs & Services → Library
3. Search for "Google My Business API"
4. Click "Enable" if not already enabled
5. Also enable "Google My Business Business Information API"

### 4. Wrong Redirect URI

**Symptoms:** OAuth flow fails or token generation fails

**Check:**
- The redirect URI in your OAuth client must match exactly
- Current script uses: `https://houstonmobilenotarypros.com/api/auth/callback/google`

**Solution:**
1. Go to Google Cloud Console → Credentials
2. Edit your OAuth 2.0 Client
3. Add authorized redirect URI: `https://houstonmobilenotarypros.com/api/auth/callback/google`
4. For local testing, you might also need: `http://localhost:3000/api/auth/callback/google`

### 5. Token Expired or Revoked

**Symptoms:** Refresh token no longer works

**Common Causes:**
- Token was revoked in Google Account settings
- Token expired (refresh tokens can expire if not used for 6 months)
- User changed password (revokes all tokens)

**Solution:**
- Generate a new refresh token using `get-gmb-refresh-token.js`

## 🔧 Step-by-Step Fix

### Option 1: Generate New Refresh Token (Recommended)

1. **Run the refresh token script:**
   ```bash
   node scripts/get-gmb-refresh-token.js
   ```

2. **Follow the prompts:**
   - Script will open a browser
   - Log in with your Google account (the one that owns the GBP)
   - Authorize the application
   - Copy the authorization code from the URL
   - Paste it into the terminal

3. **Update your `.env.local` file:**
   - The script will show you the refresh token
   - Add it to your `.env.local`:
     ```
     GOOGLE_MY_BUSINESS_REFRESH_TOKEN=your_new_refresh_token_here
     ```

4. **Test again:**
   ```bash
   node scripts/verify-gmb-credentials.js
   ```

### Option 2: Verify OAuth Setup

1. **Check Google Cloud Console:**
   - Go to: https://console.cloud.google.com/
   - Navigate to: APIs & Services → Credentials
   - Find your OAuth 2.0 Client ID
   - Verify:
     - Client ID matches your `.env.local`
     - Client Secret matches your `.env.local`
     - Authorized redirect URIs include your callback URL

2. **Check API Enablement:**
   - Go to: APIs & Services → Library
   - Search for "Google My Business API"
   - Ensure it's enabled
   - Also check "Google My Business Business Information API"

3. **Verify Permissions:**
   - Ensure your Google account has "Owner" access to the GBP
   - Go to: https://business.google.com/
   - Check your business profile permissions

## 📋 Common Error Messages

### "invalid_grant"
- **Cause:** Refresh token expired or revoked
- **Fix:** Generate new refresh token

### "invalid_client"
- **Cause:** Client ID or Secret is wrong
- **Fix:** Verify credentials in Google Cloud Console

### "access_denied"
- **Cause:** User didn't authorize the application
- **Fix:** Re-run OAuth flow and authorize

### "Bad Request" (generic)
- **Cause:** Multiple possible issues
- **Fix:** Check the detailed error in the script output, then follow specific solution above

## 🆘 Still Having Issues?

1. **Check the detailed error output:**
   - The updated script now shows more error details
   - Look for specific error codes or messages

2. **Verify your Google Cloud Project:**
   - Ensure you're using the correct Google Cloud project
   - The project must have GBP API enabled

3. **Check GBP Access:**
   - Ensure your Google account owns or has "Owner" access to the GBP
   - Go to: https://business.google.com/
   - Verify you can see and edit the business profile

4. **Try Manual OAuth Flow:**
   - If scripts aren't working, you can manually generate tokens
   - Use Google OAuth Playground: https://developers.google.com/oauthplayground/
   - Select "Google My Business API v1" scope

## 📞 Additional Resources

- **Google My Business API Docs:** https://developers.google.com/my-business/content/overview
- **OAuth 2.0 Guide:** https://developers.google.com/identity/protocols/oauth2
- **GBP Help:** https://support.google.com/business

