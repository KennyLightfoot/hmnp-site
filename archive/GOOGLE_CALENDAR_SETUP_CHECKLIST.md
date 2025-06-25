# 🗓️ Google Calendar Setup Checklist for Houston Mobile Notary

Follow this checklist to set up Google Calendar integration with your booking system.

## ✅ Phase 1: Google Cloud Setup

### 1.1 Create Google Cloud Project
- [ ] Go to [Google Cloud Console](https://console.cloud.google.com/)
- [ ] Click "New Project"
- [ ] Name: `Houston Mobile Notary Calendar`
- [ ] Click "Create"
- [ ] Wait for project creation to complete

### 1.2 Enable Google Calendar API
- [ ] Navigate to "APIs & Services" > "Library"
- [ ] Search for "Google Calendar API"
- [ ] Click on the API result
- [ ] Click "ENABLE"
- [ ] Wait for API to be enabled

### 1.3 Create Service Account
- [ ] Go to "APIs & Services" > "Credentials"
- [ ] Click "Create Credentials" > "Service Account"
- [ ] Service Account Name: `notary-calendar-service`
- [ ] Service Account ID: (auto-filled)
- [ ] Description: `Service account for Houston Mobile Notary booking calendar integration`
- [ ] Click "Create and Continue"
- [ ] Skip role assignment (click "Continue")
- [ ] Skip granting users access (click "Done")

### 1.4 Generate Service Account Key
- [ ] Find your service account in the credentials list
- [ ] Click on the service account email
- [ ] Go to "Keys" tab
- [ ] Click "Add Key" > "Create New Key"
- [ ] Select "JSON" format
- [ ] Click "Create"
- [ ] **SAVE THE DOWNLOADED JSON FILE** - you'll need it!

## ✅ Phase 2: Google Calendar Setup

### 2.1 Create/Configure Calendar
- [ ] Open [Google Calendar](https://calendar.google.com/)
- [ ] Create a new calendar OR use existing one:
  - **New Calendar**: Click "+" next to "Other calendars" > "Create new calendar"
  - **Name**: `Houston Mobile Notary Appointments`
  - **Description**: `Automated booking calendar for notary appointments`
  - **Time zone**: `America/Chicago` (Central Time)
  - **Click "Create calendar"**

### 2.2 Share Calendar with Service Account
- [ ] Find your calendar in the left sidebar
- [ ] Click the three dots next to the calendar name
- [ ] Select "Settings and sharing"
- [ ] Scroll to "Share with specific people"
- [ ] Click "Add people"
- [ ] **Enter the service account email** (from your JSON file)
  - Example: `notary-calendar-service@houston-mobile-notary-calendar.iam.gserviceaccount.com`
- [ ] Set permission to **"Make changes to events"**
- [ ] Click "Send"

### 2.3 Get Calendar ID
- [ ] In calendar settings, scroll to "Integrate calendar"
- [ ] **Copy the "Calendar ID"** (looks like: `abc123def456@group.calendar.google.com`)
- [ ] Save this - you'll need it for environment variables

## ✅ Phase 3: Local Development Setup

### 3.1 Prepare Service Account Key
- [ ] Rename the downloaded JSON file to: `google-calendar-key.json`
- [ ] Place it in your project root directory (same level as `package.json`)
- [ ] Verify the file is in `.gitignore` (it should be already)

### 3.2 Set Environment Variables
- [ ] Create/update your `.env` file with:
```bash
# Google Calendar Integration
GOOGLE_CALENDAR_ID=95d2603ca4bd2614772c7485d63d996455482481629895495d87894dd8147610@group.calendar.google.com
GOOGLE_SERVICE_ACCOUNT_KEY=./google-calendar-key.json
```

### 3.3 Test the Integration
- [ ] Run the test script: `node test-google-calendar.mjs`
- [ ] Verify all checks pass ✅
- [ ] Check your Google Calendar for the test event (it should be created and deleted)

## ✅ Phase 4: Production Setup (Vercel)

### 4.1 Upload Environment Variables
- [ ] Go to Vercel Dashboard > Your Project > Settings > Environment Variables
- [ ] Add `GOOGLE_CALENDAR_ID`:
  - **Name**: `GOOGLE_CALENDAR_ID`
  - **Value**: Your calendar ID from step 2.3
  - **Environment**: All (Production, Preview, Development)
- [ ] Add `GOOGLE_SERVICE_ACCOUNT_JSON`:
  - **Name**: `GOOGLE_SERVICE_ACCOUNT_JSON`
  - **Value**: Copy the ENTIRE content of your `google-calendar-key.json` file
  - **Environment**: All (Production, Preview, Development)

### 4.2 Deploy and Test
- [ ] Deploy your application to Vercel
- [ ] Test a booking to ensure calendar events are created
- [ ] Check your Google Calendar for the real booking event

## ✅ Phase 5: Verification

### 5.1 Test All Booking Flows
- [ ] Create a booking through your website
- [ ] Verify calendar event is created with correct details
- [ ] Update the booking (change time/status)
- [ ] Verify calendar event is updated
- [ ] Cancel the booking
- [ ] Verify calendar event is deleted

### 5.2 Check Event Details
- [ ] Event title shows service name and customer
- [ ] Event location shows customer address
- [ ] Event description includes all booking details
- [ ] Event is color-coded by status
- [ ] Event has proper reminders set

## 🚨 Troubleshooting

### Common Issues:
1. **"Service account not found"** - Check that the service account email is correctly shared with your calendar
2. **"Calendar not found"** - Verify the Calendar ID is correct
3. **"Insufficient permissions"** - Ensure service account has "Make changes to events" permission
4. **"API not enabled"** - Make sure Google Calendar API is enabled in Google Cloud Console
5. **"Invalid credentials"** - Check that your JSON file is valid and properly formatted

### Debug Steps:
1. Run `node test-google-calendar.mjs` to test credentials
2. Check the console logs in your application
3. Verify environment variables are set correctly
4. Ensure calendar is shared with the service account

## 🎉 Success!

Once all checkboxes are complete, your Google Calendar integration is ready! Your booking system will now:

- ✅ Automatically create calendar events for new bookings
- ✅ Update events when bookings are modified
- ✅ Delete events when bookings are cancelled
- ✅ Color-code events by booking status
- ✅ Include all relevant booking details in event descriptions
- ✅ Set automatic reminders for appointments

Your calendar will become your central command center for managing all notary appointments! 