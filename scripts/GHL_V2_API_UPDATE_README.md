# GoHighLevel API v2 Integration Update

This document describes the updates made to the GHL integration scripts to use the latest Private Integrations API v2.

## 🚀 What's Updated

### 1. **API Configuration**
- Updated to use the stable API version `2021-07-28`
- Base URL confirmed as `https://services.leadconnectorhq.com`
- Added proper error handling with helpful messages
- Implemented rate limit monitoring

### 2. **Authentication**
- Uses Private Integration tokens (not old API keys)
- Bearer token authentication in headers
- No longer requires Company ID for most operations

### 3. **Enhanced Error Handling**
- Specific error messages for common issues (401, 403, 404, 429)
- Helpful troubleshooting tips for each error type
- Rate limit warnings when approaching daily limits

### 4. **New Helper Functions**
- `getLocationDetails()` - Get location information
- `createContact()` - Create new contacts
- `getLocationWorkflows()` - Get workflows
- `getLocationConversations()` - Get conversations

### 5. **Updated Endpoints**
- Pipelines: `/opportunities/pipelines?locationId={id}`
- All endpoints now properly include locationId parameter

## 📋 Setup Instructions

### 1. Create Private Integration

1. Log into your GoHighLevel account
2. Navigate to **Settings → Private Integrations**
3. Click **Create New Integration**
4. Name it: `Houston Mobile Notary Automation`
5. Select these permissions:
   - Contacts (read/write)
   - Opportunities (read/write)
   - Calendars (read/write)
   - Webhooks (read/write)
   - Workflows (read/write)
   - Conversations (write)
   - Custom Fields (read/write)
   - Tags (read/write)
6. Copy the generated token

### 2. Update Environment Variables

Create or update your `.env` file:

```env
# Required
GHL_API_KEY=your_private_integration_token_here
GHL_LOCATION_ID=your_location_id_here

# Optional (defaults shown)
GHL_API_BASE_URL=https://services.leadconnectorhq.com
GHL_API_VERSION=2021-07-28

# Your site URL
NEXT_PUBLIC_SITE_URL=https://houstonmobilenotarypros.com
```

### 3. Test Your Connection

Run the updated connection test:

```bash
node scripts/test-ghl-connection.js
```

This will test all available endpoints and show you what's working.

### 4. Run Complete Setup

Once your connection is verified:

```bash
node scripts/setup-ghl-complete.js
```

## 🔍 What Each Script Does

### `ghl-api-v2-utils.js`
Core utilities for API v2 communication:
- Authentication handling
- Request/response processing
- Rate limit monitoring
- Error handling
- Helper functions for all endpoints

### `test-ghl-connection.js`
Comprehensive connection tester:
- Tests 8 different API endpoints
- Shows detailed error messages
- Provides troubleshooting guidance
- Verifies permissions

### `setup-ghl-complete.js`
Master setup script that runs:
1. Connection testing
2. Custom fields creation
3. Tags creation
4. Pipeline creation
5. Webhook setup
6. Setup verification

### Individual Setup Scripts
- `create-ghl-custom-fields.js` - Creates 100+ custom fields
- `create-ghl-tags.js` - Creates 50+ automation tags
- `create-ghl-pipelines.js` - Creates 4 service pipelines
- `create-ghl-webhooks.js` - Sets up webhook endpoints

## ⚠️ Common Issues & Solutions

### 401 Authentication Error
- **Cause**: Invalid or expired token
- **Solution**: Generate a new Private Integration token

### 403 Permission Error
- **Cause**: Missing required permissions
- **Solution**: Edit your Private Integration and add missing scopes

### 404 Not Found Error
- **Cause**: Endpoint not available or incorrect
- **Solution**: Some features may require manual setup in GHL

### 429 Rate Limit Error
- **Cause**: Too many requests
- **Solution**: Wait and retry, monitor rate limit headers

## 📊 API Limits

**Rate Limits (per Private Integration):**
- Burst: 100 requests per 10 seconds
- Daily: 200,000 requests per day

**Monitoring Headers:**
- `X-RateLimit-Limit-Daily`: Your daily limit
- `X-RateLimit-Daily-Remaining`: Requests remaining today
- `X-RateLimit-Max`: Burst limit
- `X-RateLimit-Remaining`: Burst requests remaining

## 🆘 Need Help?

1. **Check Connection**: Run `node scripts/test-ghl-connection.js`
2. **Review Logs**: Look for specific error messages
3. **Verify Permissions**: Check your Private Integration scopes
4. **Manual Setup**: Some features may need dashboard configuration

## 📚 Resources

- [GHL API v2 Documentation](https://highlevel.stoplight.io/docs/integrations/)
- [Private Integrations Guide](https://help.gohighlevel.com/support/solutions/articles/155000003054)
- [Developer Community](https://www.gohighlevel.com/dev-slack) 