# Booking Availability Troubleshooting Guide - FINAL DIAGNOSIS

## 🚨 Issue: No Available Time Slots Showing in Booking System

### ✅ **CONFIRMED WORKING COMPONENTS**
- GHL API connection: ✅ Working (HTTP 200, valid traceId)
- Calendar ID mapping: ✅ Correct (`XhHkzwNbT1MSWcGsfBjl`)
- Endpoint and format: ✅ Correct (`/calendars/{id}/free-slots`)
- Calendar configuration: ✅ Properly set (Mon-Fri 9AM-5PM)

### 🔍 **ROOT CAUSE IDENTIFIED**

The GHL Calendar **is configured correctly** but there's a disconnect between:
1. **GHL Troubleshooting View**: Shows available slots ✅
2. **GHL API Response**: Returns no slots ❌

### 📋 **Calendar Configuration Found**
```json
{
  "calendarType": "personal",
  "openHours": [
    {"daysOfTheWeek": [1-5], "hours": [{"openHour": 9, "closeHour": 17}]}
  ],
  "allowBookingFor": 30,      // Can only book 30 days in advance
  "allowBookingAfter": 2,     // Need 2 hours advance notice
  "slotDuration": 30,         // 30-minute appointments
  "slotInterval": 30,         // Every 30 minutes
  "slotBuffer": 15,           // 15-minute buffer between
  "appoinmentPerDay": 12,     // Max 12 appointments per day
  "teamMembers": [{
    "userId": "dYOQIx02wwBVjY4ihxoY",
    "selected": true,
    "isPrimary": true
  }]
}
```

## 🛠️ **SOLUTION STEPS**

### Step 1: Check Team Member Availability
The issue is likely that the **team member** (`dYOQIx02wwBVjY4ihxoY`) doesn't have **personal availability** set in GHL.

1. **Login to GoHighLevel**
2. **Go to Settings → Team Members**  
3. **Find the user: `dYOQIx02wwBVjY4ihxoY`**
4. **Click on their profile**
5. **Set their Personal Availability:**
   - Monday-Friday: 9:00 AM - 5:00 PM
   - Timezone: America/Chicago
6. **Save Changes**

### Step 2: Enable API Calendar Access
1. **Go to Settings → Calendars → Standard Notary Services**
2. **Check "Advanced Settings"**
3. **Ensure "API Access" is enabled**
4. **Verify "Allow External Bookings" is ON**

### Step 3: Check Calendar Permissions
1. **Settings → Calendars → Standard Notary Services**
2. **Team Members tab**
3. **Verify the user has "Can Book" permissions**
4. **Check "Calendar Owner" settings**

### Step 4: Test Date Range Settings
Your calendar only allows booking:
- **Maximum 30 days in advance**
- **Minimum 2 hours advance notice**

Test with dates that fit these constraints.

## 🧪 **Testing After Fix**

### Test API Endpoint
```bash
# Test within booking window (next Monday)
curl "http://localhost:3000/api/booking/availability?serviceType=STANDARD_NOTARY&date=2025-01-13"
```

### Expected Success Response
```json
{
  "success": true,
  "totalSlots": 16,
  "availableSlots": [
    {
      "startTime": "2025-01-13T15:00:00.000Z",
      "endTime": "2025-01-13T15:30:00.000Z", 
      "displayTime": "9:00 AM",
      "duration": 30,
      "available": true
    }
    // ... more slots every 30 minutes from 9 AM to 5 PM
  ]
}
```

## 🔧 **Alternative Solutions**

### If Team Member Availability Doesn't Work

#### Option A: Switch to Class Calendar
Class calendars might have different API behavior:
1. Create new Class Calendar
2. Set same availability hours
3. Test API response

#### Option B: Use Different API Pattern
Some calendars might need different API calls:
```javascript
// Try appointment booking endpoint instead
const endpoint = `/calendars/${calendarId}/appointments/available-slots`;
```

#### Option C: Check Calendar Widget Type
Your calendar uses `"widgetType": "default"`. Try:
1. Change to `"widgetType": "neo"` 
2. Test if API response improves

## 📊 **Verification Checklist**

- [ ] Team member has personal availability set
- [ ] Calendar API access is enabled
- [ ] Team member has booking permissions
- [ ] Testing within 30-day booking window
- [ ] Testing with 2+ hours advance notice
- [ ] Testing Monday-Friday dates only
- [ ] API returns `totalSlots > 0`
- [ ] Frontend booking form shows time slots

## 🎯 **Most Likely Fix**

Based on the configuration, the **#1 most likely issue** is:

**Team Member Personal Availability Not Set**

The calendar has availability configured, but the specific team member assigned to it (`dYOQIx02wwBVjY4ihxoY`) doesn't have their personal calendar availability configured for those hours.

## 📞 **Next Steps**

1. **Set team member availability** (Step 1 above)
2. **Test immediately** with a Monday date
3. **If still no slots**: Check API access settings
4. **If still no slots**: Contact GHL support with calendar ID

---

**Status**: 🔍 **DIAGNOSED** - Team member availability configuration needed 