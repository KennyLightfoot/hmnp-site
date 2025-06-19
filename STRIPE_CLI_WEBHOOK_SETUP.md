# 🚀 Stripe CLI Webhook Setup Commands
**Quick setup for Houston Mobile Notary Pros**

## Prerequisites
```bash
# Install Stripe CLI (if not already installed)
# macOS
brew install stripe/stripe-cli/stripe

# Windows (using scoop)
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe

# Linux
# Download from https://github.com/stripe/stripe-cli/releases
```

## Step 1: Login to Stripe
```bash
stripe login
# This will open your browser to authenticate
```

## Step 2: Create Webhook Endpoint (Production)
```bash
# Create the webhook endpoint
stripe webhooks create \
  --url "https://houstonmobilenotarypros.com/api/webhooks/stripe" \
  --description "Booking payment and refund handler" \
  --enabled-events checkout.session.completed,payment_intent.succeeded,payment_intent.payment_failed,charge.refunded

# The command will output something like:
# Created webhook endpoint wehook_xxxxx
# Signing secret: whsec_xxxxxxxxxxxxxxxxx
```

## Step 3: Save the Signing Secret
Copy the signing secret (starts with `whsec_`) and add it to your environment:

```bash
# For local development (.env.local)
echo "STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE" >> .env.local

# For Vercel deployment
vercel env add STRIPE_WEBHOOK_SECRET production
# Paste the webhook secret when prompted
```

## Step 4: Test Locally with Stripe CLI
```bash
# Forward webhooks to your local development server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# In another terminal, trigger test events
stripe trigger checkout.session.completed --add metadata:bookingId=test_booking_123
stripe trigger payment_intent.succeeded --add metadata:bookingId=test_booking_123
stripe trigger payment_intent.payment_failed --add metadata:bookingId=test_booking_123
stripe trigger charge.refunded
```

## Step 5: List and Manage Webhooks
```bash
# List all webhook endpoints
stripe webhooks list

# Get details of a specific endpoint
stripe webhooks retrieve wehook_xxxxx

# Update webhook endpoint (if needed)
stripe webhooks update wehook_xxxxx \
  --enabled-events checkout.session.completed,payment_intent.succeeded,payment_intent.payment_failed,charge.refunded,payment_method.attached

# Delete a webhook (be careful!)
stripe webhooks delete wehook_xxxxx
```

## Step 6: Monitor Webhook Events
```bash
# View recent webhook events
stripe events list --limit 10

# Get details of a specific event
stripe events retrieve evt_xxxxx

# Resend a webhook event (useful for testing)
stripe events resend evt_xxxxx --webhook-endpoint wehook_xxxxx
```

## Troubleshooting Commands
```bash
# Check webhook endpoint status
stripe webhooks retrieve wehook_xxxxx

# Test webhook signature locally
stripe webhook-signatures verify \
  --payload-file payload.json \
  --header "Stripe-Signature: t=1234567890,v1=xxxxx" \
  --secret whsec_xxxxx

# Debug webhook failures
stripe logs tail --filter-webhook-endpoint wehook_xxxxx
```

## Complete Setup Script
Here's a complete script to run all at once:

```bash
#!/bin/bash
# setup-stripe-webhook.sh

# Login to Stripe
echo "🔐 Logging into Stripe..."
stripe login

# Create webhook endpoint
echo "🔗 Creating webhook endpoint..."
WEBHOOK_OUTPUT=$(stripe webhooks create \
  --url "https://houstonmobilenotarypros.com/api/webhooks/stripe" \
  --description "Booking payment and refund handler" \
  --enabled-events checkout.session.completed,payment_intent.succeeded,payment_intent.payment_failed,charge.refunded \
  2>&1)

# Extract webhook ID and secret
WEBHOOK_ID=$(echo "$WEBHOOK_OUTPUT" | grep -o 'wehook_[a-zA-Z0-9]*')
WEBHOOK_SECRET=$(echo "$WEBHOOK_OUTPUT" | grep -o 'whsec_[a-zA-Z0-9]*')

echo "✅ Webhook created!"
echo "   ID: $WEBHOOK_ID"
echo "   Secret: $WEBHOOK_SECRET"

# Save to .env.local
echo "💾 Saving to .env.local..."
echo "STRIPE_WEBHOOK_SECRET=$WEBHOOK_SECRET" >> .env.local

# Add to Vercel
echo "☁️  Adding to Vercel..."
echo "$WEBHOOK_SECRET" | vercel env add STRIPE_WEBHOOK_SECRET production

echo "🎉 Setup complete!"
```

## Notes
- The webhook URL must be HTTPS in production
- Keep your signing secret secure - never commit it to git
- Test thoroughly with the CLI before going live
- Monitor webhook health in the Stripe Dashboard 