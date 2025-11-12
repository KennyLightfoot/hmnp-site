# GTM Verification Guide

## Quick Browser Console Check

Run this in your browser console (F12) on your live site:

```javascript
// Check if GTM is loaded
console.log('GTM Container ID:', window.dataLayer?.[0]?.gtm?.containerId || 'Not found');
console.log('DataLayer exists:', !!window.dataLayer);
console.log('DataLayer events:', window.dataLayer?.length || 0);

// Check if GTM script is loaded
const gtmScript = document.querySelector('script[src*="googletagmanager.com/gtm.js"]');
console.log('GTM Script tag:', gtmScript ? 'Found ✓' : 'Missing ✗');

// Check if noscript iframe exists
const gtmNoscript = document.querySelector('noscript iframe[src*="googletagmanager.com"]');
console.log('GTM Noscript iframe:', gtmNoscript ? 'Found ✓' : 'Missing ✗');

// Check environment variable (if accessible)
console.log('GTM ID from env:', process.env?.NEXT_PUBLIC_GTM_ID || 'Not accessible in browser');
```

## Expected Results

✅ **All Good:**
- GTM Container ID: `GTM-M7CB2XJ2`
- DataLayer exists: `true`
- DataLayer events: `> 0`
- GTM Script tag: `Found ✓`
- GTM Noscript iframe: `Found ✓`

## Common Issues

### Issue 1: GTM not loading
**Symptoms:** No GTM script in Network tab, dataLayer is empty
**Fix:** 
- Check `NEXT_PUBLIC_GTM_ID` is set in Vercel environment variables
- Redeploy after setting the variable
- Check browser console for errors

### Issue 2: Tags not firing
**Symptoms:** GTM loads but tags don't fire in Preview mode
**Fix:**
- Check tags are published in GTM
- Verify triggers are set correctly
- Check tag conditions aren't blocking

### Issue 3: Duplicate tracking
**Symptoms:** Both GTM and direct gtag.js loading
**Fix:**
- If using GTM, remove `NEXT_PUBLIC_GA_ID` from env (or configure GA4 tag in GTM instead)
- The code automatically prevents direct gtag when GTM is present

## Production Checklist

- [ ] `NEXT_PUBLIC_GTM_ID` set in Vercel (Production, Preview, Development)
- [ ] GTM container published
- [ ] GA4 Configuration tag set up in GTM
- [ ] Google Ads conversion tags configured (if needed)
- [ ] Preview mode shows tags firing
- [ ] Real-time GA4 shows visitors
- [ ] No console errors related to GTM







