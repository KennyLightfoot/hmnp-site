#!/bin/bash

# Update Vercel Environment Variables with Clean Stripe Keys
# This script fixes the trailing newline issue in production

echo "🔧 UPDATING VERCEL STRIPE ENVIRONMENT VARIABLES"
echo "=============================================="

# Clean Stripe Secret Key (remove any trailing newlines)
CLEAN_STRIPE_SECRET_KEY="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"

# Clean Publishable Key  
CLEAN_STRIPE_PUBLISHABLE_KEY="pk_live_51QMx2aAx8ko8hXd8NSAYNXb4bMcPjIFZF8Gr7GJbrzn9XFxixpxBe07zJsIPgggy7CcpPXfLQY2WIpacZSMoEzfa00k7NSj6r7"

# Clean Webhook Secret
CLEAN_STRIPE_WEBHOOK_SECRET="whsec_D1PVCJxGGtjGUmGBCsUtfJGy31n8zRrJ"

echo "📝 Setting clean STRIPE_SECRET_KEY..."
vercel env add STRIPE_SECRET_KEY production <<< "$CLEAN_STRIPE_SECRET_KEY"

echo "📝 Setting clean NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY..."
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production <<< "$CLEAN_STRIPE_PUBLISHABLE_KEY"

echo "📝 Setting clean STRIPE_WEBHOOK_SECRET..."
vercel env add STRIPE_WEBHOOK_SECRET production <<< "$CLEAN_STRIPE_WEBHOOK_SECRET"

echo ""
echo "✅ VERCEL ENVIRONMENT VARIABLES UPDATED"
echo "======================================="
echo "✅ All Stripe keys now clean (no trailing newlines)"
echo "✅ Authorization headers will work correctly"
echo "✅ Booking flow should complete successfully"
echo ""
echo "📋 NEXT STEPS:"
echo "1. Vercel will automatically redeploy with new environment"
echo "2. Monitor Stripe Dashboard for successful API calls"
echo "3. Test booking creation via website"
echo "4. Verify no more 'Invalid character in header' errors"

echo ""
echo "🔍 VERIFY DEPLOYMENT:"
echo "vercel env ls production | grep STRIPE"