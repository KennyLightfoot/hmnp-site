# 🗓️ GoHighLevel Calendar Automation
## Houston Mobile Notary Pros - API V2 Integration

This system fully automates the creation and configuration of GoHighLevel calendars using the Private Integration API V2. No manual dashboard setup required!

## 📋 Overview

Our automation creates **4 separate calendars** with distinct configurations:

| Service Type | Slot Duration | Slot Interval | Buffer | Office Hours | Max Daily | Min Notice | Booking Horizon |
|-------------|---------------|---------------|--------|--------------|-----------|------------|-----------------|
| **Standard Notary** | 60 min | 30 min | 15 min | Mon–Fri, 09:00–17:00 | 10 | 2 hrs | 4 weeks |
| **Extended Hours** | 60 min | 30 min | 15 min | Daily, 07:00–21:00 | 15 | 4 hrs | 6 weeks |
| **Loan Signing** | 90 min | 60 min | 30 min | Daily, 08:00–20:00 | 8 | 24 hrs | 8 weeks |
| **RON Services** | 45 min | 15 min | 5 min | Daily, 08:00–18:00 | 20 | 1 hr | 12 weeks |

## 🚀 Quick Start

### 1. Prerequisites

#### GHL Private Integration App
You need a **Private Integration** app in GoHighLevel with these scopes:
- `calendars.readwrite`
- `events.readwrite` 
- `locations.readonly`

#### Environment Variables
Add to your `.env.local`:
```env
# GHL Private Integration Credentials
GHL_CLIENT_ID=your_ghl_client_id
GHL_CLIENT_SECRET=your_ghl_client_secret
GHL_REDIRECT_URI=http://localhost:8080/callback

# These will be auto-populated by the setup scripts
GHL_ACCESS_TOKEN=
GHL_REFRESH_TOKEN=
GHL_LOCATION_ID=
```

### 2. OAuth Authentication

First, authenticate with GoHighLevel:

```bash
pnpm setup-ghl-oauth
```

This will:
1. Open your browser to the GHL authorization page
2. Start a local callback server
3. Exchange the authorization code for tokens
4. Save tokens to your `.env.local` file

### 3. Create Calendars

Run the calendar automation:

```bash
pnpm setup-ghl-calendars
```

This will:
1. Create or update all 4 calendars
2. Configure each with specific settings
3. Update environment variables with calendar IDs
4. Generate a detailed setup report

### 4. Verify Setup

Check that everything works:

```bash
pnpm verify-ghl-calendars
```

## 🔧 Detailed Configuration

### Calendar Specifications

Each calendar is configured with specific settings optimized for different service types:

#### Standard Notary Services
```javascript
{
  slotDuration: 60,           // 1-hour appointments
  slotInterval: 30,           // Available every 30 minutes
  bufferTime: 15,             // 15-minute buffer between appointments
  maxAppointmentsPerDay: 10,  // Maximum daily bookings
  minSchedulingNotice: 2,     // 2-hour minimum notice
  bookingWindow: 28,          // 4 weeks booking horizon
  officeHours: [              // Monday-Friday, 9 AM - 5 PM
    { day: 'monday', startTime: '09:00', endTime: '17:00' },
    // ... other weekdays
  ]
}
```

#### Extended Hours
- **Extended availability**: 7 AM - 9 PM daily
- **Higher capacity**: Up to 15 appointments per day
- **4-hour notice** required for quality service

#### Loan Signing Specialist
- **Longer appointments**: 90-minute slots
- **Travel buffer**: 30-minute buffer for location changes
- **24-hour notice** for preparation time
- **Premium availability**: 8 AM - 8 PM daily

#### RON Services (Remote Online Notarization)
- **Flexible scheduling**: 15-minute intervals
- **Minimal buffer**: 5 minutes (online service)
- **High volume**: Up to 20 appointments daily
- **Quick booking**: 1-hour minimum notice

### Authentication & Security

#### OAuth2 Flow
1. **Authorization Request**: User grants permissions
2. **Token Exchange**: Authorization code → Access/Refresh tokens
3. **Token Storage**: Securely stored in `.env.local`
4. **Auto-Refresh**: Tokens refreshed before expiry

#### Token Management
```javascript
// Automatic token refresh before API calls
async getValidAccessToken() {
  if (this.tokens?.expires_at < (Date.now() + 300000)) {
    await this.refreshAccessToken();
  }
  return this.tokens?.access_token;
}
```

## 📊 API Integration Details

### Endpoints Used

#### Create Calendar
```http
POST /calendars
Content-Type: application/json
Authorization: Bearer {access_token}

{
  "name": "Standard Notary Services",
  "description": "Regular notary services during business hours",
  "locationId": "{location_id}",
  "slotDuration": 60,
  "slotInterval": 30,
  // ... other settings
}
```

#### Update Calendar
```http
PUT /calendars/{calendarId}
Content-Type: application/json
Authorization: Bearer {access_token}

{
  "slotDuration": 60,
  "bufferTime": 15,
  // ... updated settings
}
```

#### Get Calendar Details
```http
GET /calendars/{calendarId}
Authorization: Bearer {access_token}
```

### Error Handling

The system includes comprehensive error handling:

- **Token Refresh**: Automatic refresh on expiry
- **Rate Limiting**: Respects GHL API limits
- **Retry Logic**: Failed requests are retried
- **Validation**: Configuration validation before API calls

## 🧪 Testing Your Setup

### 1. API Availability Test
```bash
curl -s "http://localhost:3000/api/booking/availability?serviceType=STANDARD_NOTARY&date=2025-01-10" | jq
```

Expected response:
```json
{
  "success": true,
  "serviceType": "STANDARD_NOTARY", 
  "totalSlots": 8,
  "availableSlots": [
    {
      "startTime": "2025-01-10T09:00:00Z",
      "endTime": "2025-01-10T10:00:00Z",
      "available": true,
      "duration": 60,
      "displayTime": "9:00 AM"
    }
    // ... more slots
  ]
}
```

### 2. Booking Form Test
Visit: `http://localhost:3000/test-booking`

1. Select "Standard Notary" service
2. Navigate to scheduling step
3. Verify real time slots appear
4. Select date and time
5. Complete booking flow

### 3. Calendar Verification
In your GHL dashboard:
1. Go to **Calendars**
2. Verify all 4 calendars exist
3. Check settings match specifications
4. Test preview functionality

## 🛠️ Troubleshooting

### Common Issues

#### "No available slots" Error
```bash
# Check calendar configuration
pnpm verify-ghl-calendars

# Verify environment variables
grep GHL_ .env.local

# Test specific calendar
curl "https://services.leadconnectorhq.com/calendars/{calendarId}/free-slots?startDate=2025-01-10&endDate=2025-01-10" \
  -H "Authorization: Bearer {access_token}"
```

#### Token Errors
```bash
# Re-authenticate
pnpm setup-ghl-oauth

# Check token expiry
node -e "console.log(new Date(JSON.parse(require('fs').readFileSync('.ghl-tokens.json')).expires_at))"
```

#### Calendar Creation Fails
1. **Check scopes**: Ensure `calendars.readwrite` is granted
2. **Verify location**: Confirm `GHL_LOCATION_ID` is correct
3. **API limits**: Wait and retry if rate limited

### Debug Mode
Enable detailed logging:
```bash
DEBUG=1 pnpm setup-ghl-calendars
```

### Reset Everything
```bash
# Delete all calendars and start fresh
rm .ghl-tokens.json
rm calendar-setup-report.json
pnpm setup-ghl-oauth
pnpm setup-ghl-calendars
```

## 📁 File Structure

```
scripts/
├── setup-ghl-oauth.js          # OAuth2 authentication
├── setup-ghl-calendars.js      # Main calendar automation
└── verify-ghl-calendars.js     # Verification utilities

docs/
└── GHL_CALENDAR_AUTOMATION.md  # This documentation

Generated Files:
├── .ghl-tokens.json             # OAuth tokens (gitignored)
├── calendar-setup-report.json  # Setup results
└── .env.local                   # Updated with calendar IDs
```

## 🔄 Maintenance

### Regular Tasks

#### Token Refresh (Automatic)
Tokens are automatically refreshed, but you can manually refresh:
```bash
node -e "
const { GHLAuthManager } = require('./scripts/setup-ghl-calendars.js');
new GHLAuthManager().refreshAccessToken();
"
```

#### Calendar Updates
To update calendar settings:
1. Modify `CALENDAR_SPECS` in `setup-ghl-calendars.js`
2. Run: `pnpm setup-ghl-calendars`
3. Existing calendars will be updated, not recreated

#### Health Check
```bash
# Check all calendars
pnpm verify-ghl-calendars

# Test availability for all services
for service in STANDARD_NOTARY EXTENDED_HOURS LOAN_SIGNING RON_SERVICES; do
  curl -s "http://localhost:3000/api/booking/availability?serviceType=$service&date=$(date -d '+1 day' +%Y-%m-%d)" | jq '.totalSlots'
done
```

## 🚀 Deployment Considerations

### Environment Variables
Ensure these are set in production:
```env
GHL_CLIENT_ID=your_production_client_id
GHL_CLIENT_SECRET=your_production_client_secret
GHL_ACCESS_TOKEN=your_production_access_token
GHL_REFRESH_TOKEN=your_production_refresh_token
GHL_LOCATION_ID=your_production_location_id

# Auto-generated calendar IDs
GHL_STANDARD_NOTARY_CALENDAR_ID=cal_abc123
GHL_EXTENDED_HOURS_CALENDAR_ID=cal_def456
GHL_LOAN_SIGNING_SPECIALIST_CALENDAR_ID=cal_ghi789
GHL_BOOKING_CALENDAR_ID=cal_jkl012
```

### CI/CD Integration
```yaml
# Example GitHub Actions step
- name: Setup GHL Calendars
  run: |
    pnpm setup-ghl-calendars
  env:
    GHL_CLIENT_ID: ${{ secrets.GHL_CLIENT_ID }}
    GHL_CLIENT_SECRET: ${{ secrets.GHL_CLIENT_SECRET }}
    GHL_ACCESS_TOKEN: ${{ secrets.GHL_ACCESS_TOKEN }}
    GHL_REFRESH_TOKEN: ${{ secrets.GHL_REFRESH_TOKEN }}
    GHL_LOCATION_ID: ${{ secrets.GHL_LOCATION_ID }}
```

## 📞 Support

If you encounter issues:

1. **Check logs**: Setup generates detailed logs
2. **Verify environment**: Ensure all variables are set
3. **Test authentication**: Re-run OAuth setup
4. **GHL API docs**: https://highlevel.stoplight.io/docs/integrations/
5. **API status**: Check GHL status page

## 🎯 Next Steps

After successful setup:

1. **Test booking flow**: Use `/test-booking` page
2. **Configure notifications**: Set up appointment confirmations
3. **Add integrations**: Connect to other systems (Zapier, etc.)
4. **Monitor usage**: Set up analytics and monitoring
5. **Backup config**: Save calendar configurations

---

**✅ System Status**: Fully automated, production-ready calendar integration with real-time availability and professional booking experience! 