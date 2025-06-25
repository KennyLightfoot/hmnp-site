# 🔧 Stripe Webhook Setup Guide
**Quick Setup for Houston Mobile Notary Pros**

## 📋 Prerequisites
- [ ] Stripe account with API access
- [ ] Production domain configured (e.g., houstonmobilenotarypros.com)
- [ ] API deployed and accessible

## 🚀 Step-by-Step Setup

### 1. Access Stripe Dashboard
1. Go to [https://dashboard.stripe.com](https://dashboard.stripe.com)
2. Sign in to your account
3. Navigate to **Developers** → **Webhooks**

### 2. Add Webhook Endpoint
1. Click **"Add endpoint"**
2. Enter endpoint URL:
   ```
   https://houstonmobilenotarypros.com/api/webhooks/stripe
   ```
3. Add description: "Booking payment and refund handler"

### 3. Select Events to Listen For
Check the following events:
- [x] `checkout.session.completed`
- [x] `payment_intent.succeeded`  
- [x] `payment_intent.payment_failed`
- [x] `charge.refunded`

### 4. Save and Get Signing Secret
1. Click **"Add endpoint"**
2. After creation, click on the webhook
3. Click **"Reveal"** under Signing secret
4. Copy the secret (starts with `whsec_`)

### 5. Add to Environment Variables
Add the webhook secret to your `.env` file:
```env
STRIPE_WEBHOOK_SECRET=whsec_your_actual_secret_here
```

### 6. Deploy Environment Update
If using Vercel:
```bash
vercel env add STRIPE_WEBHOOK_SECRET
# Paste the webhook secret when prompted
# Select Production environment
```

## 🧪 Testing the Webhook

### Option 1: Stripe Dashboard Test
1. In webhook details, click **"Send test webhook"**
2. Select `checkout.session.completed`
3. Click **"Send test webhook"**
4. Check response (should be 200 OK)

### Option 2: Stripe CLI (Local Testing)
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to localhost
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test event
stripe trigger checkout.session.completed
```

## 🔍 Monitoring Webhook Activity

### View Recent Events
1. Go to **Developers** → **Webhooks**
2. Click on your endpoint
3. View **"Recent deliveries"**

### Check for Failures
- ✅ **200 OK** = Success
- ❌ **400** = Signature verification failed
- ❌ **500** = Processing error

### Enable Email Alerts
1. Click **"Edit endpoint"**
2. Under **"Email notifications"**
3. Enable **"Send emails about failed webhook deliveries"**
4. Add notification email

## 🚨 Troubleshooting

### Common Issues:

**1. Signature Verification Failed**
```
Error: Webhook signature verification failed
```
**Solution:** Ensure `STRIPE_WEBHOOK_SECRET` matches exactly

**2. Endpoint Not Accessible**
```
Error: Could not connect to remote host
```
**Solution:** Check domain/SSL configuration

**3. Missing Event Data**
```
Error: No bookingId in metadata
```
**Solution:** Ensure checkout sessions include metadata

## 📊 Production Checklist

- [ ] Webhook endpoint deployed and accessible
- [ ] Signing secret added to production environment
- [ ] All required events selected
- [ ] Email notifications enabled
- [ ] Test webhook successful
- [ ] Monitoring configured
- [ ] Error logging enabled
- [ ] Backup notification system ready

## 🔐 Security Notes

1. **Never expose webhook secret in code**
2. **Always verify signatures**
3. **Use HTTPS only**
4. **Implement idempotency**
5. **Log all events**
6. **Monitor for replay attacks**

## 📱 Quick Reference

**Webhook URL:**
```
https://houstonmobilenotarypros.com/api/webhooks/stripe
```

**Required Events:**
- Payment success → Update booking status
- Payment failed → Tag for follow-up
- Refund processed → Cancel booking

**Response Format:**
```json
{
  "received": true
}
```

---

## Need Help?

- **Stripe Support:** support@stripe.com
- **Documentation:** https://stripe.com/docs/webhooks
- **Status Page:** https://status.stripe.com 