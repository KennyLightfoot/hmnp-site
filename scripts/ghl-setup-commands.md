# GoHighLevel Setup Commands

This document outlines all available commands for setting up your GoHighLevel integration automatically.

## 🚀 Quick Setup (Recommended)

Run everything automatically in the correct order:

```bash
node scripts/setup-ghl-complete.js
```

This master script will:
1. Test your API connection
2. Create all custom fields
3. Create all required tags
4. Set up the sales pipeline
5. Configure webhooks
6. Verify the complete setup

## 🔧 Individual Setup Commands

If you prefer to run components individually or need to re-run specific parts:

### 1. Test API Connection
```bash
node scripts/test-ghl-connection.js
```
Verifies your GHL API credentials and tests connectivity to all required endpoints.

### 2. Create Custom Fields
```bash
node scripts/create-ghl-custom-fields.js
```
Creates the 7 required custom fields:
- `cf_last_booking_status`
- `cf_last_cancellation_date`
- `cf_refund_amount`
- `cf_last_reschedule_date`
- `cf_payment_reminders_sent`
- `cf_last_payment_reminder`
- `cf_quote_sent_date`

### 3. Create Tags
```bash
node scripts/create-ghl-tags.js
```
Creates all lead nurturing and booking process tags:

**Lead Nurturing Tags:**
- `new_lead`
- `hot_prospect`
- `cold_lead`
- `follow_up_needed`
- `qualified_lead`
- `not_interested`

**Booking Process Tags:**
- `booking_confirmed`
- `payment_pending`
- `service_completed`
- `follow_up_sent`

### 4. Create Sales Pipeline
```bash
node scripts/create-ghl-pipeline.js
```
Creates the complete sales pipeline with stages:
1. New Lead
2. Contacted
3. Quote Sent
4. Booked
5. Service Complete
6. Follow-up

### 5. Setup Webhooks
```bash
node scripts/setup-ghl-webhooks.js
```
Configures webhooks for automation triggers:
- Contact creation/updates
- Tag changes
- Pipeline stage changes
- Custom field updates
- Appointment bookings

### 6. Verify Setup
```bash
node scripts/check-ghl-custom-fields.js
```
Checks which custom fields exist and which need to be created.

## 📋 Prerequisites

Before running any commands, ensure you have these environment variables set in your `.env` file:

```env
GHL_API_BASE_URL=https://rest.gohighlevel.com
GHL_API_KEY=your_api_key_here
GHL_LOCATION_ID=your_location_id_here
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

## 🔍 Troubleshooting Commands

### Check Environment Variables
```bash
node -e "require('dotenv').config(); console.log({GHL_API_BASE_URL: process.env.GHL_API_BASE_URL, GHL_LOCATION_ID: process.env.GHL_LOCATION_ID, GHL_API_KEY: process.env.GHL_API_KEY ? 'Set' : 'Missing'})"
```

### Test Individual API Endpoints
Use the connection test script to diagnose specific issues:
```bash
node scripts/test-ghl-connection.js
```

## ⚡ Usage Examples

### First-time Setup
```bash
# 1. Complete automated setup
node scripts/setup-ghl-complete.js

# 2. Verify everything worked
node scripts/check-ghl-custom-fields.js
node scripts/test-ghl-connection.js
```

### Re-run Specific Components
```bash
# If tags failed to create
node scripts/create-ghl-tags.js

# If webhooks need updating
node scripts/setup-ghl-webhooks.js

# If pipeline needs rebuilding
node scripts/create-ghl-pipeline.js
```

### Development Testing
```bash
# Test API connectivity
node scripts/test-ghl-connection.js

# Check current field status
node scripts/check-ghl-custom-fields.js
```

## 🎯 What Gets Automated

✅ **Fully Automated via API:**
- Custom field creation
- Contact tags creation
- Sales pipeline setup
- Webhook configuration
- API connection testing

❌ **Manual Setup Required in GHL Dashboard:**
- Workflow creation and configuration
- SMS/Email template creation
- Automation rule setup
- Form builder configuration
- Calendar integration setup

## 🔐 Security Notes

- All API calls use secure HTTPS endpoints
- API keys are masked in console output
- Webhook URLs use HTTPS for security
- Rate limiting is implemented to respect GHL API limits

## 📞 Support

If you encounter issues:
1. Check your environment variables
2. Verify API key permissions in GHL
3. Run the connection test script
4. Check the error messages for specific guidance

All scripts include detailed error reporting and troubleshooting guidance. 