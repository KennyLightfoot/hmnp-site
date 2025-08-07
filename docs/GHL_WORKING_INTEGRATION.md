# Working GHL Integration - July 2025 Approach

## Overview

This document outlines the **working GHL integration approach** that was successfully used in July 2025 for booking appointments. The key difference is using the **correct authentication method** and **proper API endpoints** that were proven to work.

## Key Differences from Previous Attempts

### 1. **Authentication Method**
**Working Approach:**
```typescript
// ✅ CORRECT: Use Bearer prefix
'Authorization': `Bearer ${process.env.GHL_PRIVATE_INTEGRATION_TOKEN}`
```

**Previous (Broken) Approach:**
```typescript
// ❌ INCORRECT: No Bearer prefix
'Authorization': apiKey
```

### 2. **API Headers**
**Working Headers:**
```typescript
const headers = {
  'Authorization': `Bearer ${process.env.GHL_PRIVATE_INTEGRATION_TOKEN}`,
  'Version': '2021-07-28',
  'Content-Type': 'application/json',
  'LocationId': process.env.GHL_LOCATION_ID ?? ''  // ✅ Include LocationId
};
```

### 3. **Calendar Endpoint**
**Working Endpoint:**
```typescript
// ✅ CORRECT: Use /free-slots endpoint
`/calendars/${calendarId}/free-slots?${queryParams}`
```

**Previous (Broken) Endpoint:**
```typescript
// ❌ INCORRECT: Wrong endpoint
`/calendars/${calendarId}/available-slots?${params}`
```

### 4. **Date Format for API**
**Working Format:**
```typescript
// ✅ CORRECT: Unix timestamps
const startTimestamp = Math.floor(new Date(`${startDate}T00:00:00`).getTime() / 1000);
const endTimestamp = Math.floor(new Date(`${endDate}T23:59:59`).getTime() / 1000);

const queryParams = new URLSearchParams({
  startDate: startTimestamp.toString(),
  endDate: endTimestamp.toString(),
  timezone: 'America/Chicago'
});
```

## Environment Variables Required

```bash
# GHL Private Integration Token (starts with 'pit_')
GHL_PRIVATE_INTEGRATION_TOKEN=pit_your_token_here

# GHL Location ID
GHL_LOCATION_ID=your_location_id

# GHL API Base URL
GHL_API_BASE_URL=https://services.leadconnectorhq.com

# Calendar IDs for each service type
GHL_STANDARD_NOTARY_CALENDAR_ID=calendar_id_1
GHL_EXTENDED_HOURS_CALENDAR_ID=calendar_id_2
GHL_LOAN_SIGNING_SPECIALIST_CALENDAR_ID=calendar_id_3
GHL_BOOKING_CALENDAR_ID=calendar_id_4
```

## Service Type to Calendar Mapping

The system uses specific calendar IDs for each service type:

```typescript
const CALENDAR_MAPPING = {
  'QUICK_STAMP_LOCAL': 'GHL_STANDARD_NOTARY_CALENDAR_ID',
  'STANDARD_NOTARY': 'GHL_STANDARD_NOTARY_CALENDAR_ID',
  'EXTENDED_HOURS': 'GHL_EXTENDED_HOURS_CALENDAR_ID',
  'LOAN_SIGNING': 'GHL_LOAN_SIGNING_SPECIALIST_CALENDAR_ID',
  'RON_SERVICES': 'GHL_BOOKING_CALENDAR_ID',
  'BUSINESS_ESSENTIALS': 'GHL_BOOKING_CALENDAR_ID',
  'BUSINESS_GROWTH': 'GHL_BOOKING_CALENDAR_ID'
};
```

## Working API Flow

### 1. **Get Available Slots**
```typescript
// ✅ Working approach
const slots = await getAvailableSlots(
  calendarId,
  startDate,
  endDate,
  60 // duration in minutes
);
```

### 2. **Create Appointment**
```typescript
// ✅ Working approach
const appointment = await createAppointment({
  calendarId,
  contactId: ghlContactId,
  startTime: cleanStartTime, // Remove seconds/milliseconds
  endTime: endDateTime.toISOString(),
  title: `${service.name} - ${customerName}`,
  appointmentStatus: 'confirmed',
  address: serviceAddress,
  ignoreDateRange: true, // Force create for testing
  toNotify: true
});
```

### 3. **Time Sanitization**
```typescript
// ✅ CRITICAL: Remove seconds/milliseconds for GHL compatibility
const userSelectedTime = new Date(validatedData.scheduledDateTime);
userSelectedTime.setSeconds(0, 0);
const cleanStartTime = userSelectedTime.toISOString();
```

## Error Handling

### 1. **Slot Unavailable Error**
```typescript
if (msg.includes('400') && msg.toLowerCase().includes('no longer available')) {
  return NextResponse.json({
    error: 'TIME_SLOT_TAKEN',
    message: 'The selected time slot is no longer available. Please choose another.',
  }, { status: 409 });
}
```

### 2. **Authentication Errors**
```typescript
if (response.status === 401 || response.status === 403) {
  throw new GHLApiError(
    'Authentication failed - verify GHL_PRIVATE_INTEGRATION_TOKEN is valid and NOT using Bearer prefix',
    response.status,
    responseData
  );
}
```

## Testing the Integration

### 1. **Test Calendar Connection**
```bash
curl https://your-domain.com/api/test-ghl-calendar
```

### 2. **Test Availability**
```bash
curl "https://your-domain.com/api/availability?date=2025-08-08&serviceType=STANDARD_NOTARY"
```

### 3. **Test Appointment Creation**
```bash
curl -X POST https://your-domain.com/api/booking/create \
  -H "Content-Type: application/json" \
  -d '{
    "serviceType": "STANDARD_NOTARY",
    "customerName": "Test User",
    "customerEmail": "test@example.com",
    "scheduledDateTime": "2025-08-08T14:00:00.000Z",
    "timeZone": "America/Chicago"
  }'
```

## Common Issues and Solutions

### 1. **"Authentication failed"**
- ✅ **Solution**: Ensure token starts with `pit_` and use `Bearer` prefix
- ❌ **Wrong**: `Authorization: pit_token_here`
- ✅ **Correct**: `Authorization: Bearer pit_token_here`

### 2. **"No available slots"**
- ✅ **Solution**: Check calendar ID mapping and ensure calendar exists
- ✅ **Solution**: Verify timezone is set to `America/Chicago`

### 3. **"Slot no longer available"**
- ✅ **Solution**: This is expected - slot was taken by another user
- ✅ **Solution**: User should select a different time slot

### 4. **"Calendar not found"**
- ✅ **Solution**: Verify `GHL_LOCATION_ID` and calendar IDs are correct
- ✅ **Solution**: Ensure calendars exist in your GHL account

## Performance Optimizations

### 1. **Caching**
- 5-minute cache for calendar data
- Prevents excessive API calls

### 2. **Timeout Protection**
- 5-second timeout for connection test
- 10-second timeout for availability fetch
- Prevents hanging requests

### 3. **Rate Limiting**
- 50 requests per minute per IP
- Prevents API overload

### 4. **Request Deduplication**
- Prevents multiple simultaneous requests for same data
- Reduces API load

## Success Indicators

When the integration is working correctly, you should see:

1. **Console Logs:**
   ```
   ✅ GHL availability fetched for 2025-08-08 (STANDARD_NOTARY): 12 slots
   ✅ GHL appointment created: appointment_id_here
   ```

2. **API Responses:**
   - Availability API returns real slots from GHL
   - Booking API creates appointments in GHL calendar
   - No authentication errors

3. **User Experience:**
   - Time slots load quickly
   - Bookings are confirmed in GHL
   - No unresponsive behavior

## Migration Checklist

To implement this working approach:

- [ ] Set up GHL Private Integration with correct scopes
- [ ] Configure all environment variables
- [ ] Set up calendar IDs for each service type
- [ ] Test calendar connection
- [ ] Test availability fetching
- [ ] Test appointment creation
- [ ] Monitor logs for success indicators
- [ ] Verify bookings appear in GHL calendar

This approach was **proven to work** in July 2025 and successfully created appointments in GHL calendars. 