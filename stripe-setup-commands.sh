#!/bin/bash
# Stripe Webhook Setup Commands
# Run these commands one by one

echo "🚀 Stripe Webhook Setup for Houston Mobile Notary Pros"
echo ""

echo "Step 1: Login to Stripe CLI"
echo "Run: stripe login"
echo "Then authenticate in your browser"
echo ""

echo "Step 2: Get webhook secret for local development"
echo "Run: stripe listen --forward-to localhost:3000/api/webhooks/stripe --print-secret"
echo "Copy the webhook secret (starts with whsec_)"
echo ""

echo "Step 3: Add webhook secret to .env.local"
echo "Run: echo 'STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE' >> .env.local"
echo ""

echo "Step 4: For Production - Create webhook endpoint via curl"
echo "Replace YOUR_SECRET_KEY with your actual Stripe secret key:"
echo ""
echo 'curl -X POST https://api.stripe.com/v1/webhook_endpoints \'
echo '  -H "Authorization: Bearer sk_live_YOUR_SECRET_KEY" \'
echo '  -d "url=https://houstonmobilenotarypros.com/api/webhooks/stripe" \'
echo '  -d "enabled_events[0]=checkout.session.completed" \'
echo '  -d "enabled_events[1]=payment_intent.succeeded" \'
echo '  -d "enabled_events[2]=payment_intent.payment_failed" \'
echo '  -d "enabled_events[3]=charge.refunded" \'
echo '  -d "description=Houston Mobile Notary Pros - Booking payments"'
echo ""

echo "Step 5: Test locally (after authentication)"
echo "Terminal 1: stripe listen --forward-to localhost:3000/api/webhooks/stripe"
echo "Terminal 2: stripe trigger checkout.session.completed"
echo ""

echo "Step 6: Add production webhook secret to Vercel"
echo "Run: vercel env add STRIPE_WEBHOOK_SECRET production"
echo "Paste the production webhook secret when prompted"
echo ""

echo "✅ All done! Your webhook endpoints will be ready." 