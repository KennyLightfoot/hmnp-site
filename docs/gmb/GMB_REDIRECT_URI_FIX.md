# Fixing redirect_uri_mismatch Error

## Problem

You're seeing:
```
Error 400: redirect_uri_mismatch
```

This means the redirect URI in the OAuth request doesn't match what's configured in Google Cloud Console.

## Common Causes

1. **Different OAuth Client**: You're using credentials from one OAuth client, but checking redirect URIs in another
2. **Port Mismatch**: Script uses port 8080, but redirect URI is configured for a different port
3. **Exact Match Required**: Google requires EXACT match (including `http://`, no trailing slashes, exact port)

## Solution

### Step 1: Verify Your OAuth Client

1. Check which Client ID you're using in `.env.local`:
   ```bash
   # Should match: 88574386279-5q11a6i5fcnkq59sa9imrks8fjeu1a2a.apps.googleusercontent.com
   ```

2. Go to Google Cloud Console: https://console.cloud.google.com/apis/credentials

3. Find the OAuth client with Client ID matching your `.env.local`

4. Verify it has this EXACT redirect URI:
   ```
   http://localhost:8080/callback
   ```
   - No trailing slash
   - Exact port (8080)
   - Must be `http://` not `https://`

### Step 2: Check for Port Conflicts

If port 8080 is already in use, the script will try a different port, causing a mismatch.

**Fix:**
1. Close any apps using port 8080
2. Or manually set a different port in the script
3. Update the redirect URI in Google Cloud Console to match

### Step 3: Verify Exact Match

The redirect URI must match EXACTLY:

✅ **Correct:**
- `http://localhost:8080/callback`

❌ **Wrong (won't work):**
- `http://localhost:8080/callback/` (trailing slash)
- `https://localhost:8080/callback` (https instead of http)
- `http://127.0.0.1:8080/callback` (IP instead of localhost)
- `http://localhost:3000/callback` (wrong port)

### Step 4: Regenerate Refresh Token

Since you're getting `invalid_grant` error, your refresh token is likely from the old OAuth client. You need a new one:

1. Make sure redirect URI is correct in Google Cloud Console
2. Run: `node scripts/get-gmb-refresh-token.js`
3. This will generate a new refresh token for your current OAuth client

## Quick Checklist

- [ ] Client ID in `.env.local` matches OAuth client in Google Cloud Console
- [ ] Redirect URI `http://localhost:8080/callback` exists in Google Cloud Console
- [ ] No trailing slash, correct port, uses `http://`
- [ ] Port 8080 is not in use by another app
- [ ] Regenerate refresh token after fixing redirect URI

## Still Having Issues?

1. **Double-check Client ID match:**
   - Your `.env.local` has: `88574386279-...`
   - Google Cloud Console OAuth client shows: `88574386279-...`
   - They must match exactly

2. **Try a different port:**
   - Change script to use port 8081
   - Add `http://localhost:8081/callback` to Google Cloud Console
   - Update script to use port 8081

3. **Check for multiple OAuth clients:**
   - You might have multiple OAuth clients
   - Make sure you're using the right one's credentials

