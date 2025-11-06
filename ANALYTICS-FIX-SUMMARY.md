# Analytics Scripts Fix - Implementation Summary

## Date: November 6, 2025

## Problem Resolved
Analytics scripts (GA4 `window.gtag` and Meta Pixel `window.fbq`) were not loading on the preview deployment due to:
1. **GA4 env var name mismatch**: Code used `NEXT_PUBLIC_GA_ID` but Vercel has `NEXT_PUBLIC_GA4_ID`
2. **Meta Pixel script missing**: No Meta Pixel initialization code in the root layout

## Changes Made

### 1. Fixed GA4 Environment Variable Name

**File: `app/layout.tsx`**
- **Line 115**: Changed `process.env.NEXT_PUBLIC_GA_ID` → `process.env.NEXT_PUBLIC_GA4_ID`
- This now aligns with:
  - Vercel environment variable: `NEXT_PUBLIC_GA4_ID`
  - Analytics helper expectations: `lib/analytics/events.ts` line 6

**File: `components/analytics/GAPathTracker.tsx`**
- **Line 13**: Changed `process.env.NEXT_PUBLIC_GA_ID` → `process.env.NEXT_PUBLIC_GA4_ID`
- Ensures path tracking uses correct measurement ID

**File: `IMPLEMENTATION-SUMMARY.md`**
- **Line 159**: Updated documentation from `NEXT_PUBLIC_GA_ID` → `NEXT_PUBLIC_GA4_ID`

### 2. Added Meta Pixel Script Initialization

**File: `app/layout.tsx`**
- **Lines 138-154**: Added complete Meta Pixel initialization block
- Uses standard Meta Pixel loader with `fbq('init', ...)` 
- Includes automatic initial PageView tracking
- Guards with `process.env.NEXT_PUBLIC_META_PIXEL_ID` check
- Uses `strategy="afterInteractive"` to match GA4 loading behavior

```typescript
{/* Meta Pixel */}
{process.env.NEXT_PUBLIC_META_PIXEL_ID && (
  <Script id="meta-pixel" strategy="afterInteractive">
    {`
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${process.env.NEXT_PUBLIC_META_PIXEL_ID}');
      fbq('track', 'PageView');
    `}
  </Script>
)}
```

## Verification Checklist

After deployment, verify the following:

### Browser DevTools Console
```javascript
// Should both return 'function'
typeof window.gtag
typeof window.fbq
```

### Network Tab
- ✅ `https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXX` loads
- ✅ `https://connect.facebook.net/en_US/fbevents.js` loads

### Analytics Events
Test a QuickQuote form submission:
- ✅ GA4 `generate_lead` event fires
- ✅ Meta Pixel `Lead` event fires
- ✅ Events include proper attribution (UTM, device, event_id)

### Real-Time Dashboards
- ✅ GA4 DebugView shows page_view and lead events
- ✅ Meta Events Manager shows PageView and Lead events

## Expected Results

1. **GA4 Script Loads**
   - Properly initializes with `NEXT_PUBLIC_GA4_ID` from Vercel
   - `window.gtag` function available globally
   - PageView tracking works on all routes

2. **Meta Pixel Loads**
   - Properly initializes with `NEXT_PUBLIC_META_PIXEL_ID` from Vercel
   - `window.fbq` function available globally
   - Automatic PageView tracking on all page loads

3. **Analytics Helpers Work**
   - `lib/analytics/events.ts` functions execute without errors
   - `lib/analytics/lead-events.ts` wrappers fire correctly
   - Consent mode defaults are applied
   - Event deduplication via `event_id` works

4. **Lead Tracking Active**
   - QuickQuoteForm submissions tracked
   - InFlowQuoteCard impressions and submissions tracked
   - Call CTA clicks tracked (with debounce)
   - All events include full attribution metadata

## Files Modified

1. `/app/layout.tsx` - Fixed GA4 var, added Meta Pixel
2. `/components/analytics/GAPathTracker.tsx` - Fixed GA4 var
3. `/IMPLEMENTATION-SUMMARY.md` - Updated documentation

## Files Already Correct

- `/lib/analytics/events.ts` - Already using `NEXT_PUBLIC_GA4_ID`
- `/lib/analytics/lead-events.ts` - No changes needed
- `/ENV-SETUP-GUIDE.md` - Correctly documents migration

## Next Steps

1. **Commit Changes**
   ```bash
   git add app/layout.tsx components/analytics/GAPathTracker.tsx IMPLEMENTATION-SUMMARY.md
   git commit -m "fix(analytics): correct GA4 env var name and add Meta Pixel initialization"
   ```

2. **Push to Vercel**
   ```bash
   git push origin restore/ui-from-f052667
   ```

3. **Verify Deployment**
   - Wait for Vercel build to complete
   - Visit preview URL
   - Open DevTools Console
   - Verify `window.gtag` and `window.fbq` are defined
   - Submit a test QuickQuote form
   - Check GA4 DebugView and Meta Events Manager

4. **Monitor for 24 Hours**
   - Verify lead events are flowing to both platforms
   - Check event counts match between GA4 and Meta
   - Confirm attribution data (UTM, device) is captured
   - Validate no JavaScript errors in production logs

## Rollback Plan

If issues arise:
```bash
# Revert the layout changes
git revert HEAD
git push origin restore/ui-from-f052667
```

Or use Vercel's instant rollback:
```bash
vercel rollback
```

## Success Metrics

Within 24 hours of deployment, you should see:
- ✅ GA4 real-time users tracking correctly
- ✅ Meta Pixel showing active PageView events
- ✅ Lead events (generate_lead, Lead) flowing to both platforms
- ✅ Event counts between GA4 and Meta within ±15%
- ✅ No JavaScript console errors related to analytics
- ✅ QuickQuote conversion rate maintained or improved

---

**Implementation completed by:** AI Assistant  
**Status:** ✅ Ready for deployment  
**Estimated time to verify:** 15 minutes post-deployment

