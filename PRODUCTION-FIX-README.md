# Houston Mobile Notary Pros - Production Environment Fix

## 🚨 CRITICAL PRODUCTION ISSUE

Your production environment has corrupted environment variables with trailing `\n` characters causing:
- **Google Maps API**: REQUEST_DENIED errors
- **GHL Webhooks**: Buffer length mismatch in signature verification  
- **Stripe**: Invalid authorization headers
- **NODE_ENV**: Incorrectly set to "development"

## 📋 QUICK FIX EXECUTION

### Prerequisites
1. **Vercel CLI installed**: `npm install -g vercel`
2. **Logged in to Vercel**: `vercel login`
3. **In project directory**: Navigate to your HMNP site root

### Step 1: Execute the Fix
```bash
./fix-production-env-vars.sh
```

### Step 2: Verify the Fix
```bash
./verify-production-fix.sh
```

### Step 3: Manual Testing
1. **Test Google Maps**: Visit booking page, try address autocomplete
2. **Test Stripe**: Complete a test booking
3. **Test GHL**: Monitor webhook logs for signature verification
4. **Check NODE_ENV**: Verify production-specific behavior

## 🔧 DETAILED INSTRUCTIONS

### 1. Pre-Execution Checklist
- [ ] Vercel CLI installed and authenticated
- [ ] Project backup created (optional but recommended)
- [ ] All team members notified of production maintenance
- [ ] Low-traffic time window selected

### 2. Execute Fix Script
```bash
# Make script executable (if not already)
chmod +x fix-production-env-vars.sh

# Run the fix
./fix-production-env-vars.sh
```

**What this script does:**
1. Backs up current environment variables
2. Removes corrupted variables
3. Adds clean variables without trailing `\n`
4. Triggers automatic redeployment
5. Provides verification steps

### 3. Verification Process
```bash
# Run verification script
./verify-production-fix.sh
```

**Manual verification steps:**
1. **Google Maps Integration**
   - Visit: `https://your-production-domain.com/booking`
   - Test address autocomplete
   - Check browser console for errors
   - Verify distance calculations work

2. **Stripe Integration**
   - Complete a test booking
   - Verify payment processing
   - Check for authorization errors

3. **GHL Webhook Integration**
   - Monitor GHL dashboard webhook logs
   - Check for signature verification errors
   - Verify webhook payloads process correctly

4. **General Health Check**
   - Check Vercel deployment logs
   - Monitor application performance
   - Verify NODE_ENV behavior

## 🔄 ROLLBACK PLAN

If the fix causes issues:

```bash
# Emergency rollback (restores original corrupted state)
./rollback-production-env.sh
```

**⚠️ Warning**: Rollback restores the original problems but may resolve new issues.

## 📊 ENVIRONMENT VARIABLES BEING FIXED

| Variable | Issue | Fix |
|----------|--------|-----|
| `GOOGLE_MAPS_API_KEY` | Trailing `\n` | Remove newline |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Trailing `\n` | Remove newline |
| `GHL_WEBHOOK_SECRET` | Trailing `\n` | Remove newline |
| `STRIPE_SECRET_KEY` | Trailing `\n` | Remove newline |
| `STRIPE_WEBHOOK_SECRET` | Trailing `\n` | Remove newline |
| `NODE_ENV` | Set to "development" | Change to "production" |

## 🎯 EXPECTED OUTCOMES

After successful fix:
- ✅ Google Maps API requests work (no REQUEST_DENIED)
- ✅ GHL webhook signature verification works
- ✅ Stripe authorization headers valid
- ✅ NODE_ENV warnings disappear
- ✅ Production booking system fully functional

## 🛠️ TROUBLESHOOTING

### Common Issues

**1. "vercel command not found"**
```bash
npm install -g vercel
```

**2. "Not logged in to Vercel"**
```bash
vercel login
```

**3. "Permission denied"**
```bash
chmod +x *.sh
```

**4. Script fails midway**
- Check Vercel CLI authentication
- Verify internet connection
- Check Vercel project access permissions

### Still Having Issues?

1. **Check Vercel Dashboard**
   - Go to: https://vercel.com/dashboard
   - Navigate to your project
   - Check Environment Variables section
   - Verify deployment status

2. **Manual Environment Variable Setting**
   If scripts fail, manually set in Vercel dashboard:
   ```
   GOOGLE_MAPS_API_KEY=AIzaSyBEGc_wacW9IR8_XXY-P0sGn1EOfeUrGCw
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyBEGc_wacW9IR8_XXY-P0sGn1EOfeUrGCw
   GHL_WEBHOOK_SECRET=f1e2d3c4b5a6987654321098765432109876543210987654321098765432109876543210
   STRIPE_SECRET_KEY=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
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51QMx2aAx8ko8hXd8NSAYNXb4bMcPjIFZF8Gr7GJbrzn9XFxixpxBe07zJsIPgggy7CcpPXfLQY2WIpacZSMoEzfa00k7NSj6r7
   STRIPE_WEBHOOK_SECRET=whsec_D1PVCJxGGtjGUmGBCsUtfJGy31n8zRrJ
   NODE_ENV=production
   ```

## 📞 SUPPORT

If you encounter issues:
1. Check the backup file created by the script
2. Review Vercel deployment logs
3. Test individual API endpoints
4. Consider running the verification script multiple times

## 🔍 FILES CREATED

- `fix-production-env-vars.sh` - Main fix script
- `verify-production-fix.sh` - Verification script  
- `rollback-production-env.sh` - Emergency rollback
- `PRODUCTION-FIX-README.md` - This documentation
- `env-backup-[timestamp].txt` - Backup of original variables

## ⏱️ ESTIMATED TIMELINE

- **Script execution**: 2-3 minutes
- **Vercel redeployment**: 2-3 minutes  
- **Verification**: 5-10 minutes
- **Total downtime**: ~5-10 minutes

## 🎉 SUCCESS CRITERIA

Fix is successful when:
- [ ] All environment variables exist in Vercel dashboard
- [ ] No trailing newlines in variable values
- [ ] Google Maps autocomplete works
- [ ] Stripe payments process correctly
- [ ] GHL webhooks verify signatures
- [ ] NODE_ENV shows "production" behavior
- [ ] No API authentication errors in logs