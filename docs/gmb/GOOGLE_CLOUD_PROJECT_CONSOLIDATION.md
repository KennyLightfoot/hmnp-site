# Google Cloud Project Consolidation Plan

## Recommendation: Use ONE Main Project

**Yes, consolidating makes perfect sense!** Having multiple projects causes:
- ❌ Confusion about which credentials go where
- ❌ Credential mismatches (like you're experiencing)
- ❌ Harder to manage permissions
- ❌ More maintenance overhead

## Recommended Structure

### Option 1: Single Project (Simplest) ⭐ RECOMMENDED

**Use: "HMNP" project** (`hmnp-6aa08`)

**What goes in here:**
- ✅ Web app (Next.js/React)
- ✅ Google My Business API
- ✅ All business APIs (Calendar, Sheets, etc.)
- ✅ OAuth clients for all services
- ✅ Everything related to your business

**Benefits:**
- One place for everything
- Easier credential management
- Clear permissions
- Less confusion

### Option 2: Two Projects (If You Want Separation)

**Project 1: "HMNP" (Production)**
- Web app
- GMB API
- Production OAuth clients
- All production services

**Project 2: "HMNP-Dev" (Development)**
- Development/testing
- Test OAuth clients
- Development APIs

**Only do this if:** You have a separate dev/staging environment that needs isolation.

## For Your Current Situation

### Recommended: Consolidate to "HMNP"

1. **Use "HMNP" project** (`hmnp-6aa08`) for everything
2. **Enable all needed APIs** in this one project:
   - Google My Business API
   - Google My Business Business Information API
   - Google Calendar API (if you use it)
   - Google Sheets API (if you use it)
   - Any other APIs your app needs

3. **Create ONE OAuth client** for GMB:
   - Name: "HMNP GMB API Client"
   - Type: Web application
   - Redirect URI: `http://localhost:8080/callback`
   - Use this for all GMB operations

4. **Keep other projects for:**
   - "HMNP n8n Sheets" - If n8n automation needs separate project
   - "HMNP-Agent" - If AI agents need separate project
   - But for your main web app → Use "HMNP"

## Migration Steps

### Step 1: Choose Your Main Project

**Recommendation: Use "HMNP"** (`hmnp-6aa08`)

### Step 2: Enable APIs in Main Project

1. Go to: https://console.cloud.google.com/apis/library
2. Switch to "HMNP" project
3. Enable these APIs:
   - Google My Business API
   - Google My Business Business Information API
   - Any other APIs your app uses

### Step 3: Create/Use OAuth Client in Main Project

1. Go to: https://console.cloud.google.com/apis/credentials
2. In "HMNP" project
3. Create OAuth 2.0 Client ID:
   - Name: "HMNP Web App - GMB"
   - Type: Web application
   - Redirect URIs:
     - `http://localhost:8080/callback` (for GMB script)
     - `http://localhost:3000/api/auth/callback/google` (for NextAuth local)
     - `https://houstonmobilenotarypros.com/api/auth/callback/google` (for NextAuth production)

### Step 4: Update Environment Variables

Update `.env.local` with credentials from "HMNP" project:

```bash
# GMB API Credentials (from HMNP project)
GOOGLE_MY_BUSINESS_CLIENT_ID=from_hmnp_project
GOOGLE_MY_BUSINESS_CLIENT_SECRET=from_hmnp_project
GOOGLE_MY_BUSINESS_REFRESH_TOKEN=generate_new_one
GOOGLE_MY_BUSINESS_ACCOUNT_ID=your_account_id
GOOGLE_MY_BUSINESS_LOCATION_ID=your_location_id
```

### Step 5: Regenerate Refresh Token

Since you're switching projects/clients, regenerate:

```bash
node scripts/get-gmb-refresh-token.js
```

## What About Other Projects?

### Keep Separate IF:
- **"HMNP n8n Sheets"** - If n8n automation needs its own project (for isolation)
- **"HMNP-Agent"** - If AI agents need separate billing/permissions
- **"Google my business"** - Can delete or archive (consolidate into HMNP)

### Can Archive/Delete:
- **"Google my business"** - Move everything to HMNP, then delete
- **"My First Project"** - Test projects, can delete
- **"WP Mail SMTP"** - If not actively used

## Best Practice Structure

```
HMNP (Main Project)
├── Web App APIs
│   ├── Google My Business API ✅
│   ├── Google Calendar API (if needed)
│   └── Other business APIs
├── OAuth Clients
│   ├── GMB API Client ✅
│   └── Other service clients
└── Service Accounts (if needed)
    └── For server-to-server auth
```

## Benefits of Consolidation

1. ✅ **One place for credentials** - No more confusion
2. ✅ **Easier management** - All APIs in one project
3. ✅ **Clearer billing** - See all costs in one place
4. ✅ **Simpler permissions** - Manage once
5. ✅ **Less errors** - No credential mismatches

## Action Plan

1. **Decide:** Use "HMNP" as main project ✅
2. **Enable APIs:** Google My Business API in HMNP
3. **Create OAuth Client:** In HMNP project
4. **Update .env.local:** Use new credentials
5. **Regenerate Token:** Get new refresh token
6. **Test:** Verify everything works
7. **Archive:** Move/delete old projects if needed

## Summary

**Yes, consolidating to ONE main project makes perfect sense!**

Use **"HMNP"** project for:
- Your web app
- GMB API
- All business operations

Keep other projects ONLY if they serve a specific purpose (like n8n automation that needs isolation).

This will eliminate confusion and make everything much easier to manage.

