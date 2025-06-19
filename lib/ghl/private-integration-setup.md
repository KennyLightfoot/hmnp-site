# GHL Private Integrations Migration Guide

## Step 1: Create Private Integration

1. **Go to GHL Settings:**
   - Navigate to Settings → Integrations → Private Integrations
   - Click "Create New Integration"

2. **Configure Integration:**
   - **Name:** Houston Mobile Notary API Integration
   - **Description:** Integration for booking system, payments, and workflow automation

3. **Select Required Scopes:**
   ```
   ✅ contacts.read
   ✅ contacts.write
   ✅ opportunities.read
   ✅ opportunities.write
   ✅ calendars.readonly
   ✅ calendars.write
   ✅ workflows.readonly
   ✅ conversations.readonly
   ✅ conversations.write
   ✅ customFields.readonly
   ✅ customFields.write
   ✅ locations.readonly
   ```

4. **Generate Token:**
   - Copy the generated Private Integration token
   - **⚠️ Save it immediately - you can't view it again**

## Step 2: Update Environment Variables

Replace your current GHL configuration:

```env
# OLD - Remove these
GHL_API_KEY=pit-f7f2fad9-fe5a-4c19-86ff-cb3a4177784a

# NEW - Add these
GHL_PRIVATE_INTEGRATION_TOKEN=your_private_integration_token_here
GHL_API_VERSION=2021-07-28
GHL_API_BASE_URL=https://services.leadconnectorhq.com
```

## Step 3: Update API Configuration

Update `lib/ghl/api.ts`:

```typescript
// Replace these lines
const GHL_API_KEY = process.env.GHL_API_KEY;

// With
const GHL_PRIVATE_INTEGRATION_TOKEN = process.env.GHL_PRIVATE_INTEGRATION_TOKEN;

// Update all Authorization headers from:
Authorization: `Bearer ${GHL_API_KEY}`

// To:
Authorization: `Bearer ${GHL_PRIVATE_INTEGRATION_TOKEN}`
```

## Step 4: Test the Migration

1. **Test Contact Creation:**
```bash
curl -X POST https://services.leadconnectorhq.com/contacts/ \
  -H "Authorization: Bearer YOUR_PRIVATE_INTEGRATION_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Version: 2021-07-28" \
  -d '{
    "firstName": "Test",
    "lastName": "Contact", 
    "email": "test@example.com",
    "locationId": "YOUR_LOCATION_ID"
  }'
```

2. **Verify Webhook Still Works:**
   - Create a test booking
   - Check logs for successful GHL API calls

## Benefits After Migration:

✅ **Enhanced Security** - Scoped permissions instead of full account access
✅ **Better Audit Trail** - Track exactly what the integration is doing
✅ **Future-Proof** - Latest API version with all features
✅ **Webhook Support** - Full webhook event support
✅ **Better Error Handling** - More detailed error responses 