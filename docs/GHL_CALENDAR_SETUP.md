# GoHighLevel Calendar Integration Setup

## Overview

This document explains how to set up and use the GoHighLevel (GHL) Calendar Integration with API v2 Private Integrations for real-time availability management.

## Prerequisites

1. **GHL Private Integration Token**: Follow the [GHL Private Integrations documentation](https://help.gohighlevel.com/support/solutions/articles/155000003054-private-integrations-everything-you-need-to-know) to create a Private Integration.

2. **Required Environment Variables**:
   ```bash
   GHL_PRIVATE_INTEGRATION_TOKEN=pit_your_token_here
   GHL_LOCATION_ID=your_location_id
   GHL_API_BASE_URL=https://services.leadconnectorhq.com
   ```

## Setup Steps

### 1. Create GHL Private Integration

1. Go to your GHL account settings
2. Navigate to "Private Integrations"
3. Click "Create new Integration"
4. Give it a name (e.g., "HMNP Calendar Integration")
5. Select the required scopes:
   - `calendars.read`
   - `calendars.write`
   - `appointments.read`
   - `appointments.write`
6. Copy the generated token

### 2. Configure Environment Variables

Add the following to your `.env.local` file:

```bash
# GHL Private Integration
GHL_PRIVATE_INTEGRATION_TOKEN=pit_your_token_here
GHL_LOCATION_ID=your_location_id
GHL_API_BASE_URL=https://services.leadconnectorhq.com
```

### 3. Test the Integration

Visit `/api/test-ghl-calendar` to test the integration:

```bash
curl https://your-domain.com/api/test-ghl-calendar
```

Expected response:
```json
{
  "success": true,
  "data": {
    "connectionTest": {
      "success": true,
      "message": "GHL Calendar connection successful"
    },
    "calendars": {
      "count": 1,
      "data": [...]
    }
  }
}
```

## Features

### Real-Time Availability

The system now fetches real availability from your GHL calendars instead of using mock data:

- **Automatic Fallback**: If GHL is unavailable, falls back to mock data
- **Caching**: 5-minute cache to reduce API calls
- **Timeout Protection**: 5-10 second timeouts to prevent hanging
- **Error Handling**: Graceful degradation if GHL API fails

### API Endpoints

#### `/api/availability`
- **GET**: Fetch available time slots for a specific date
- **Parameters**: `date` (YYYY-MM-DD format)
- **Response**: Real GHL availability or fallback mock data

#### `/api/test-ghl-calendar`
- **GET**: Test GHL calendar connection and configuration
- **POST**: Clear calendar cache (send `{"action": "clear-cache"}`)

## Best Practices

### 1. Token Security
- **Never commit tokens to version control**
- **Rotate tokens every 90 days** as recommended by GHL
- **Use environment variables** for all sensitive data

### 2. Rate Limiting
- The system includes built-in rate limiting (50 requests/minute)
- Client-side deduplication prevents duplicate requests
- Server-side caching reduces API calls

### 3. Error Handling
- **Graceful degradation**: Falls back to mock data if GHL fails
- **Timeout protection**: Prevents hanging requests
- **Comprehensive logging**: All errors are logged for debugging

### 4. Performance
- **5-minute cache TTL** for calendar data
- **Automatic cache cleanup** to prevent memory leaks
- **Request deduplication** to prevent redundant API calls

## Troubleshooting

### Common Issues

1. **"GHL Calendar connection failed"**
   - Check your `GHL_PRIVATE_INTEGRATION_TOKEN` is correct
   - Verify your `GHL_LOCATION_ID` is valid
   - Ensure the token has the required scopes

2. **"No GHL calendars found"**
   - Verify you have calendars set up in your GHL account
   - Check that the location ID matches your calendar's location

3. **"GHL availability fetch failed"**
   - Check GHL API status
   - Verify network connectivity
   - Check API rate limits

### Debug Commands

```bash
# Test GHL connection
curl https://your-domain.com/api/test-ghl-calendar

# Clear cache
curl -X POST https://your-domain.com/api/test-ghl-calendar \
  -H "Content-Type: application/json" \
  -d '{"action": "clear-cache"}'
```

## API v2 Compliance

This integration follows GHL API v2 best practices:

- **Proper Authentication**: Uses Private Integration tokens
- **Correct Headers**: Includes `Version: 2021-07-28`
- **Error Handling**: Comprehensive error responses
- **Rate Limiting**: Respects GHL API limits
- **Caching**: Reduces API load

## Monitoring

Monitor the integration using:

1. **Console Logs**: Check for GHL-related messages
2. **API Responses**: Monitor `/api/test-ghl-calendar` endpoint
3. **Error Tracking**: Watch for GHL API errors in logs
4. **Performance**: Monitor response times and cache hit rates

## Support

For issues with:
- **GHL API**: Contact GoHighLevel support
- **Integration Code**: Check the logs and test endpoints
- **Configuration**: Verify environment variables and permissions 