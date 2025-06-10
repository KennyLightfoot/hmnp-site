# Houston Mobile Notary Pros Website

Professional mobile notary services website built with Next.js, TypeScript, and Tailwind CSS.

## 🚀 AD LAUNCH SETUP GUIDE

### Required Environment Variables for Ad Tracking

Add these to your `.env.local` file:

```env
# Facebook Pixel
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=your_facebook_pixel_id_here

# Google Ads Conversion Tracking  
NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID=AW-XXXXXXXXX/XXXXXXXXX

# LinkedIn (if using)
NEXT_PUBLIC_LINKEDIN_PARTNER_ID=your_linkedin_partner_id_here
```

### 📱 Tracking Pixels Status
- ✅ Facebook Pixel: Ready (needs pixel ID)
- ✅ Google Analytics: Active (G-EXWGCN0D53)
- ✅ Google Ads: Ready (needs conversion ID)
- ✅ Lead Events: Configured on thank-you pages

### 📝 Landing Pages Ready
- `/lp/facebook-campaign` - Facebook ads
- `/lp/google-loan-signing` - Google Ads  
- `/lp/facebook-spring-promo` - Seasonal campaigns
- `/thank-you-ads` - Conversion tracking page

### 🔧 Quick Ad Launch Steps
1. Add pixel IDs to environment variables
2. Test conversion tracking on `/thank-you-ads`
3. Launch campaigns pointing to appropriate landing pages
4. Monitor conversions in Facebook/Google dashboards

## Development Setup 