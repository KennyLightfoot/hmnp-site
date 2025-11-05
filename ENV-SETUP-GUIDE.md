# 🔐 Environment Variables Setup Guide

## Current Status Analysis

### ✅ Already Set in Vercel (Good to Go!)

| Variable | Status | Value |
|----------|--------|-------|
| `GHL_API_KEY` | ✅ SET | Production |
| `GHL_LOCATION_ID` | ✅ SET | Production |
| `GOOGLE_MAPS_API_KEY` | ✅ SET | Production |
| `DATABASE_URL` | ✅ SET | Production |
| `REDIS_URL` | ✅ SET | Production |
| `STRIPE_SECRET_KEY` | ✅ SET | Production |
| `NEXTAUTH_SECRET` | ✅ SET | Production |

---

## ⚠️ REQUIRED: Missing Variables for New Features

### 1. GA4 Tracking ID

**Current:** You have `NEXT_PUBLIC_GA_ID=G-EXWGCN0D53`  
**Needed:** Our code uses `NEXT_PUBLIC_GA4_ID`

**Options:**

**A) Use Existing GA4 Property (Recommended)**
```bash
# Add via CLI (uses same value as NEXT_PUBLIC_GA_ID)
vercel env add NEXT_PUBLIC_GA4_ID production
# When prompted, enter: G-EXWGCN0D53
```

**B) Create New GA4 Property for Testing**
1. Go to: https://analytics.google.com
2. Admin → Create Property
3. Copy Measurement ID (starts with `G-`)
4. Add to Vercel:
```bash
vercel env add NEXT_PUBLIC_GA4_ID production
# Enter your new G-XXXXXXXX
```

---

### 2. Meta Pixel ID (CRITICAL - Not Set!)

**Status:** ❌ **NOT SET** (Required for Lead event tracking)

**How to Get It:**
1. Go to: https://business.facebook.com/events_manager2
2. Click your Pixel
3. Copy the Pixel ID (e.g., `1234567890123456`)

**Add to Vercel:**
```bash
vercel env add NEXT_PUBLIC_META_PIXEL_ID production
# Paste your 16-digit Pixel ID
```

**Also add to Preview & Development:**
```bash
vercel env add NEXT_PUBLIC_META_PIXEL_ID preview
vercel env add NEXT_PUBLIC_META_PIXEL_ID development
```

---

### 3. GHL Quote Webhook URL (CRITICAL - Not Set!)

**Status:** ❌ **NOT SET** (Required for lead capture)

**How to Get It:**
1. Go to: https://app.gohighlevel.com
2. Settings → Integrations → Webhooks
3. Create new **Inbound Webhook**
4. Name: "Quote Request - Ad Leads"
5. Copy the webhook URL

**Add to Vercel:**
```bash
vercel env add GHL_QUOTE_WEBHOOK_URL production
# Paste: https://services.leadconnectorhq.com/hooks/XXXXX
```

**Also add to Preview & Development:**
```bash
vercel env add GHL_QUOTE_WEBHOOK_URL preview
vercel env add GHL_QUOTE_WEBHOOK_URL development
```

---

## 📋 Quick Setup Checklist

```bash
# 1. Check current env vars
vercel env ls

# 2. Add GA4 ID (use existing or create new)
vercel env add NEXT_PUBLIC_GA4_ID production
# Enter: G-EXWGCN0D53 (or your new property ID)

# 3. Add Meta Pixel ID (get from Facebook Business Manager)
vercel env add NEXT_PUBLIC_META_PIXEL_ID production
# Enter: Your 16-digit Pixel ID

vercel env add NEXT_PUBLIC_META_PIXEL_ID preview
vercel env add NEXT_PUBLIC_META_PIXEL_ID development

# 4. Add GHL Quote Webhook (get from GHL Settings)
vercel env add GHL_QUOTE_WEBHOOK_URL production
# Enter: https://services.leadconnectorhq.com/hooks/XXXXX

vercel env add GHL_QUOTE_WEBHOOK_URL preview
vercel env add GHL_QUOTE_WEBHOOK_URL development

# 5. Verify all set
vercel env ls | grep -E "GA4_ID|META_PIXEL|QUOTE_WEBHOOK"
```

---

## 🔍 Verification Commands

### Check What's Set
```bash
# List all env vars
vercel env ls

# Search for specific vars
vercel env ls | grep "NEXT_PUBLIC_GA4_ID"
vercel env ls | grep "META_PIXEL"
vercel env ls | grep "QUOTE_WEBHOOK"
```

### Pull Current Values (Encrypted)
```bash
# Pull to .env.local (will show encrypted)
vercel env pull .env.local

# Check if variables exist
grep "NEXT_PUBLIC_GA4_ID" .env.local
grep "NEXT_PUBLIC_META_PIXEL_ID" .env.local
grep "GHL_QUOTE_WEBHOOK_URL" .env.local
```

---

## 📝 Step-by-Step: Add Meta Pixel ID

**1. Get Your Pixel ID:**
```
Visit: https://business.facebook.com/events_manager2
→ Click your Pixel name
→ Settings tab
→ Copy "Pixel ID" (16 digits)
```

**2. Add to Vercel Production:**
```bash
vercel env add NEXT_PUBLIC_META_PIXEL_ID
? What's the value of NEXT_PUBLIC_META_PIXEL_ID? 1234567890123456
? Add NEXT_PUBLIC_META_PIXEL_ID to which Environments? Production
✅ Added Environment Variable NEXT_PUBLIC_META_PIXEL_ID to Project hmnp-site
```

**3. Add to Preview:**
```bash
vercel env add NEXT_PUBLIC_META_PIXEL_ID preview
? What's the value of NEXT_PUBLIC_META_PIXEL_ID? 1234567890123456
✅ Added Environment Variable NEXT_PUBLIC_META_PIXEL_ID to Project hmnp-site (preview)
```

**4. Add to Development:**
```bash
vercel env add NEXT_PUBLIC_META_PIXEL_ID development
? What's the value of NEXT_PUBLIC_META_PIXEL_ID? 1234567890123456
✅ Added Environment Variable NEXT_PUBLIC_META_PIXEL_ID to Project hmnp-site (development)
```

---

## 📝 Step-by-Step: Add GHL Quote Webhook

**1. Create Webhook in GHL:**
```
1. Login to: https://app.gohighlevel.com
2. Settings → Integrations → Webhooks
3. Click "+ Add Webhook"
4. Select: "Inbound Webhook"
5. Name: "Quote Request - Ad Leads"
6. Click "Create"
7. Copy the webhook URL (starts with https://services.leadconnectorhq.com/hooks/)
```

**2. Add to Vercel:**
```bash
vercel env add GHL_QUOTE_WEBHOOK_URL production
? What's the value of GHL_QUOTE_WEBHOOK_URL? https://services.leadconnectorhq.com/hooks/XXXXX
✅ Added Environment Variable GHL_QUOTE_WEBHOOK_URL to Project hmnp-site
```

**3. Test the webhook (optional):**
```bash
curl -X POST https://services.leadconnectorhq.com/hooks/XXXXX \
  -H "Content-Type: application/json" \
  -d '{"test": "data", "name": "Test Lead"}'
  
# Should return 200 OK
```

---

## 🚀 After Adding Variables

**1. Redeploy to pick up new env vars:**
```bash
vercel --prod
```

**2. Verify in logs:**
```bash
# Check deployment logs for env var loading
vercel logs --prod
```

**3. Test in browser:**
```
1. Visit: https://your-domain.com/?utm_source=test
2. Open DevTools → Console
3. Check for GA4/Pixel loading:
   - typeof window.gtag (should be 'function')
   - typeof window.fbq (should be 'function')
```

---

## ⚠️ Important Notes

### NEXT_PUBLIC_ Prefix
- Variables with `NEXT_PUBLIC_` are **exposed to the browser**
- Only use for public IDs (GA4, Pixel, Maps)
- Never use for secrets (API keys, tokens)

### Environment Targets
- **Production:** Live site
- **Preview:** PR deployments
- **Development:** Local dev (not used in Vercel, only local)

### After Adding Env Vars
- **Must redeploy** for changes to take effect
- No need to rebuild, just redeploy
- Use `vercel --prod` to redeploy

---

## 🔒 Security Best Practices

✅ **DO:**
- Use `NEXT_PUBLIC_` for client-side values only
- Keep secrets in server-side vars (no prefix)
- Add env vars to all environments (Production, Preview, Development)
- Test in Preview before Production

❌ **DON'T:**
- Put API keys in `NEXT_PUBLIC_` vars
- Hardcode sensitive values in code
- Share .env files in git (already .gitignored)
- Use same secrets for dev/prod

---

## 📊 Final Verification

After adding all variables, run:

```bash
# Check all critical vars are set
vercel env ls | grep -E "GA4|PIXEL|WEBHOOK" | wc -l
# Should show at least 9 entries (3 vars × 3 environments)

# Redeploy
vercel --prod

# Test live site
open https://your-domain.com
# DevTools → Console:
# - window.gtag should exist
# - window.fbq should exist
# - Submit QuickQuote form
# - Check Network tab for /api/submit-ad-lead (200 OK)
```

---

## 🆘 Troubleshooting

### "Variable not found" after adding
**Solution:** Redeploy with `vercel --prod`

### "window.gtag is undefined"
**Check:**
```bash
vercel env ls | grep "NEXT_PUBLIC_GA4_ID"
# Should show Production, Preview, Development
```

### "GHL webhook failing"
**Check:**
```bash
# Test webhook manually
curl -X POST <YOUR_WEBHOOK_URL> \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'

# Should return 200 OK
```

### "Pixel not firing"
**Check:**
1. Meta Pixel Helper extension installed
2. Correct Pixel ID set
3. No ad blockers enabled
4. Privacy Badger/uBlock disabled for testing

---

## ✅ You're Ready When...

- [ ] `NEXT_PUBLIC_GA4_ID` set in Production/Preview/Development
- [ ] `NEXT_PUBLIC_META_PIXEL_ID` set in Production/Preview/Development
- [ ] `GHL_QUOTE_WEBHOOK_URL` set in Production/Preview/Development
- [ ] Redeployed with `vercel --prod`
- [ ] Verified `window.gtag` exists in browser console
- [ ] Verified `window.fbq` exists in browser console
- [ ] Tested QuickQuote form submit (200 OK)
- [ ] Checked GHL pipeline for test lead

**Next:** Follow `GO-LIVE-SEQUENCE.md` for deployment!

