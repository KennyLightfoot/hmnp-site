# 🚀 Production Environment Configuration Checklist

## ⚠️ **CRITICAL CHANGES REQUIRED FOR PRODUCTION**

### 1. **Stripe Configuration (MUST CHANGE)**
```bash
# CHANGE FROM TEST TO LIVE KEYS:
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_PRODUCTION_WEBHOOK_SECRET
```

### 2. **Environment & URLs (MUST CHANGE)**
```bash
# Change environment to production
NODE_ENV=production

# Update all localhost URLs to your production domain
NEXTAUTH_URL=https://houstonmobilenotarypros.com
NEXTAUTH_URL_INTERNAL=https://houstonmobilenotarypros.com
NEXT_PUBLIC_APP_URL=https://houstonmobilenotarypros.com
NEXT_PUBLIC_BASE_URL=https://houstonmobilenotarypros.com
WEBHOOK_URL=https://houstonmobilenotarypros.com

# Update test URLs
PLAYWRIGHT_BASE_URL=https://houstonmobilenotarypros.com
```

### 3. **Security Credentials (SECURITY RISK)**
```bash
# ⚠️ REMOVE OR SECURE THESE CREDENTIALS:
# Current admin credentials are exposed - change immediately:
ADMIN_USERNAME=YourSecureUsername
ADMIN_PASSWORD=YourVerySecurePassword123!

# Consider removing if not needed in production:
PLAYWRIGHT_TEST_USERNAME=(remove for production)
PLAYWRIGHT_TEST_PASSWORD=(remove for production)
```

### 4. **Email Configuration (INCOMPLETE)**
```bash
# Complete your email setup:
SMTP_USER=houstonmobilenotarypros@gmail.com  # Your actual email
SMTP_PASS=your_gmail_app_password           # Generate Gmail app password
```

## ✅ **ALREADY CORRECTLY CONFIGURED**

### Database & External Services
- ✅ DATABASE_URL (Neon PostgreSQL)
- ✅ DATABASE_URL_UNPOOLED
- ✅ SENTRY_DSN
- ✅ RESEND_API_KEY
- ✅ AWS S3 Configuration
- ✅ Google Maps API

### GoHighLevel Integration
- ✅ Complete GHL configuration
- ✅ All workflow IDs configured
- ✅ Custom field mappings
- ✅ Calendar integrations

## 🔧 **OPTIONAL PRODUCTION OPTIMIZATIONS**

### Add Redis for Caching (Recommended)
```bash
# Add if you have Redis available:
REDIS_URL=redis://your-redis-instance:6379
```

### Enhanced Logging
```bash
# Production logging configuration:
LOG_LEVEL=warn                    # Reduce log verbosity
LOG_FILE_PATH=/var/log/hmnp.log  # Production log path
```

## 🚨 **SECURITY RECOMMENDATIONS**

### 1. **Immediate Actions:**
- Change ADMIN_PASSWORD to a strong password
- Remove test credentials from production
- Ensure JWT secrets are secure (yours look good)

### 2. **Before Going Live:**
- Test Stripe webhooks with live keys
- Verify all GoHighLevel workflows
- Test email functionality

## 📋 **VERCEL DEPLOYMENT ENVIRONMENT VARIABLES**

### Critical Variables for Vercel:
```bash
# Set these in Vercel dashboard:
vercel env add NODE_ENV production
vercel env add DATABASE_URL "your_neon_url"
vercel env add NEXTAUTH_SECRET "your_nextauth_secret"
vercel env add STRIPE_SECRET_KEY "sk_live_..."
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY "pk_live_..."
vercel env add SENTRY_DSN "your_sentry_dsn"
vercel env add GHL_API_KEY "your_ghl_key"
vercel env add RESEND_API_KEY "your_resend_key"
```

## 🎯 **PRODUCTION DEPLOYMENT STEPS**

### 1. **Update Environment Variables** (5 minutes)
- Switch Stripe to live keys
- Update all URLs to production domain
- Secure admin credentials

### 2. **Test Critical Flows** (10 minutes)
- Test Stripe payment with live keys
- Verify GHL integration
- Test email notifications

### 3. **Deploy to Vercel** (10 minutes)
- Set environment variables in Vercel
- Deploy with `vercel --prod`
- Verify health check endpoint

### 4. **Post-Deployment Verification** (10 minutes)
- Complete test booking
- Check Sentry for errors
- Verify all integrations working

## ✅ **YOU'RE ALMOST READY!**

**Current Status: 90% Production Ready** 🚀

**Remaining Tasks:**
1. Switch Stripe to live keys
2. Update URLs to production domain  
3. Secure admin credentials
4. Deploy to Vercel

**Estimated Time to Production: 30 minutes** ⏰ 