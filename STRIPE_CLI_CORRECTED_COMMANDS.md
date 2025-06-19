# 🚀 Corrected Stripe CLI Commands
**Fixed commands for Houston Mobile Notary Pros**

## Issue with Previous Commands
The `stripe webhooks` command doesn't exist in newer versions. Use these corrected commands instead:

## Step 1: Check Stripe CLI Version
```bash
stripe --version
# Should be 1.8.0 or higher
```

## Step 2: Login to Stripe
```bash
stripe login
```

## Step 3: Create Webhook Endpoint (CORRECTED)
```bash
# Method 1: Using the listen command with --print-secret flag
stripe listen --print-secret --forward-to https://houstonmobilenotarypros.com/api/webhooks/stripe

# Method 2: Create via Dashboard API (recommended for production)
curl -X POST https://api.stripe.com/v1/webhook_endpoints \
  -H "Authorization: Bearer sk_live_YOUR_SECRET_KEY" \
  -d "url=https://houstonmobilenotarypros.com/api/webhooks/stripe" \
  -d "enabled_events[]=checkout.session.completed" \
  -d "enabled_events[]=payment_intent.succeeded" \
  -d "enabled_events[]=payment_intent.payment_failed" \
  -d "enabled_events[]=charge.refunded"
```

## Step 4: Get Webhook Secret for Local Testing
```bash
# For local development, use this to get the webhook secret:
stripe listen --forward-to localhost:3000/api/webhooks/stripe --print-secret
```

## Step 5: Test Events Locally
```bash
# In one terminal, start listening:
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# In another terminal, trigger test events:
stripe trigger checkout.session.completed
stripe trigger payment_intent.succeeded
stripe trigger payment_intent.payment_failed
stripe trigger charge.refunded
```

## Production Setup (Recommended Approach)

### Option A: Using Stripe Dashboard (Easiest)
1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. URL: `https://houstonmobilenotarypros.com/api/webhooks/stripe`
4. Events: Select the 4 events we need
5. Copy the signing secret

### Option B: Using curl (Programmatic)
```bash
# Replace sk_live_... with your actual secret key
curl -X POST https://api.stripe.com/v1/webhook_endpoints \
  -H "Authorization: Bearer sk_live_YOUR_SECRET_KEY_HERE" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "url=https://houstonmobilenotarypros.com/api/webhooks/stripe" \
  -d "enabled_events[0]=checkout.session.completed" \
  -d "enabled_events[1]=payment_intent.succeeded" \
  -d "enabled_events[2]=payment_intent.payment_failed" \
  -d "enabled_events[3]=charge.refunded" \
  -d "description=Houston Mobile Notary Pros - Booking payments"
```

## Step 6: List Existing Webhooks
```bash
# List all webhook endpoints
curl -H "Authorization: Bearer sk_live_YOUR_SECRET_KEY_HERE" \
  https://api.stripe.com/v1/webhook_endpoints
```

## Environment Variables Setup
```bash
# Add to your .env.local file
echo "STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE" >> .env.local

# For Vercel deployment
vercel env add STRIPE_WEBHOOK_SECRET production
```

## Quick Test Script
Create a file `test-stripe-webhook.sh`:

```bash
#!/bin/bash
echo "🧪 Testing Stripe webhook locally..."

# Start the webhook listener in background
stripe listen --forward-to localhost:3000/api/webhooks/stripe > webhook.log 2>&1 &
LISTEN_PID=$!

# Wait for listener to start
sleep 3

# Trigger test events
echo "Triggering test events..."
stripe trigger checkout.session.completed
stripe trigger payment_intent.succeeded

# Stop the listener
kill $LISTEN_PID

echo "✅ Test complete! Check webhook.log for results"
```

Make it executable and run:
```bash
chmod +x test-stripe-webhook.sh
./test-stripe-webhook.sh
```

## Troubleshooting

### If you get "Unknown command" errors:
```bash
# Update Stripe CLI
brew upgrade stripe/stripe-cli/stripe
# or download latest from GitHub releases
```

### If webhooks aren't working:
```bash
# Check endpoint status
stripe listen --forward-to localhost:3000/api/webhooks/stripe --log-level debug
```

### View recent events:
```bash
stripe events list --limit 5
```

## Summary
The key difference is that modern Stripe CLI doesn't have a direct `webhooks create` command. Instead:

1. **For local development**: Use `stripe listen`
2. **For production**: Use the Stripe Dashboard or curl with the API
3. **For testing**: Use `stripe trigger` with the listener running

This approach is more reliable and matches current Stripe CLI capabilities. 