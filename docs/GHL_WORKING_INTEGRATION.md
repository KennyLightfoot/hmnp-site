# GoHighLevel Working Integration (July 2025)

## Overview
This document captures the working GHL integration approach from July 2025 that successfully fetched availability slots.

## Key Issues Found

### 1. **Empty Calendar Response**
- The GHL API connection is successful
- But `GET /calendars` returns empty array
- This causes availability to always return 0 slots

### 2. **Authentication Issues**
The current token doesn't start with `pit_` which indicates it's not a Private Integration Token v2.

### 3. **Webhook Signature Verification**
The webhook signature verification is failing with "Input buffers must have the same byte length" because GHL sends base64-encoded signatures.

## Working Configuration (July 2025)

### Authentication Headers
```typescript
headers: {
  'Authorization': `Bearer ${GHL_PRIVATE_INTEGRATION_TOKEN}`, // Must start with pit_
  'Version': '2021-07-28',
  'Content-Type': 'application/json',
  'LocationId': process.env.GHL_LOCATION_ID // Required for calendar endpoints
}
```

### Calendar Endpoints
```typescript
// Get calendars
GET /calendars

// Get available slots - uses Unix timestamps
GET /calendars/{calendarId}/free-slots?startDate={unix}&endDate={unix}&timezone=America/Chicago
```

### Date Format for Availability
GHL API v2 expects Unix timestamps (seconds since epoch):
```typescript
const startTimestamp = Math.floor(new Date(startDate).getTime() / 1000);
const endTimestamp = Math.floor(new Date(endDate).getTime() / 1000);
```

## Required Environment Variables

1. **GHL_PRIVATE_INTEGRATION_TOKEN**
   - Must be a Private Integration Token (starts with `pit_`)
   - NOT a regular API key or OAuth token
   - Get from: GHL Agency Settings > Developer > Private Integrations

2. **GHL_LOCATION_ID**
   - The location/sub-account ID
   - Required for all calendar operations

3. **Calendar Mapping Variables**
   ```
   GHL_STANDARD_NOTARY_CALENDAR_ID=
   GHL_EXTENDED_HOURS_CALENDAR_ID=
   GHL_LOAN_SIGNING_SPECIALIST_CALENDAR_ID=
   GHL_BOOKING_CALENDAR_ID=
   ```

## Fix Steps

### 1. Get Private Integration Token
1. Log into GHL Agency account
2. Go to Settings > Developer > Private Integrations
3. Create new integration with Calendar permissions
4. Copy the token (starts with `pit_`)

### 2. Update Environment Variables
```bash
GHL_PRIVATE_INTEGRATION_TOKEN=pit_xxxxxxxxxxxxx
GHL_LOCATION_ID=oUvYNTw2Wvul7JSJplqQ
```

### 3. Get Calendar IDs
Once authenticated properly, run:
```bash
curl -X GET "https://services.leadconnectorhq.com/calendars" \
  -H "Authorization: Bearer pit_xxxxxxxxxxxxx" \
  -H "Version: 2021-07-28" \
  -H "LocationId: oUvYNTw2Wvul7JSJplqQ"
```

### 4. Fix Webhook Signature
The webhook signature should compare base64 strings directly:
```typescript
const expectedSignature = crypto
  .createHmac('sha256', secret)
  .update(payload, 'utf8')
  .digest('base64');

return signature === expectedSignature;
```

## Testing

### Test Connection
```bash
curl https://houstonmobilenotarypros.com/api/test-ghl-setup
curl https://houstonmobilenotarypros.com/api/test-ghl-calendar
```

### Test Availability
```bash
curl "https://houstonmobilenotarypros.com/api/availability?date=2025-08-08&serviceType=STANDARD_NOTARY"
```

## Common Errors

1. **401 Unauthorized**: Token is invalid or wrong format
2. **Empty calendars array**: Token doesn't have calendar permissions or wrong location ID
3. **No slots returned**: Calendar ID is wrong or calendar has no availability
4. **Webhook signature fails**: Using wrong encoding (hex vs base64)