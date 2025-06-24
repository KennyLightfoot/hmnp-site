// Test Google Calendar API connection
require('dotenv').config({path: '.env.local'});

const { google } = require('googleapis');

async function testGoogleCalendar() {
  console.log('📅 Testing Google Calendar API Connection...\n');

  try {
    // Parse the service account JSON
    const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    console.log('✅ Service account JSON parsed successfully');
    console.log(`   Project: ${serviceAccount.project_id}`);
    console.log(`   Email: ${serviceAccount.client_email}`);

    // Create auth client
    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccount,
      scopes: ['https://www.googleapis.com/auth/calendar']
    });

    console.log('✅ Auth client created successfully');

    // Create calendar client
    const calendar = google.calendar({ version: 'v3', auth });
    console.log('✅ Calendar client created successfully');

    // Test calendar access
    const calendarId = process.env.GOOGLE_CALENDAR_ID;
    console.log(`📆 Testing access to calendar: ${calendarId}`);

    const response = await calendar.calendars.get({
      calendarId: calendarId
    });

    console.log('✅ SUCCESS! Calendar API is working!');
    console.log(`   Calendar Name: ${response.data.summary}`);
    console.log(`   Calendar ID: ${response.data.id}`);
    console.log(`   Time Zone: ${response.data.timeZone}`);

    // Test listing events (next 7 days)
    console.log('\n📅 Testing event listing...');
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const eventsResponse = await calendar.events.list({
      calendarId: calendarId,
      timeMin: now.toISOString(),
      timeMax: nextWeek.toISOString(),
      maxResults: 5,
      singleEvents: true,
      orderBy: 'startTime'
    });

    console.log('✅ SUCCESS! Event listing works!');
    console.log(`   Found ${eventsResponse.data.items.length} events in the next 7 days`);

    console.log('\n🎉 ALL TESTS PASSED! Your Google Calendar integration is ready!');

  } catch (error) {
    console.error('❌ ERROR:', error.message);
    
    if (error.message.includes('Not Found')) {
      console.log('\n💡 This usually means:');
      console.log('1. The calendar ID is wrong, or');
      console.log('2. The service account doesn\'t have permission to access the calendar');
      console.log('\n🔧 To fix:');
      console.log('1. Go to Google Calendar');
      console.log('2. Find your calendar and click the three dots → Settings and sharing');
      console.log('3. Scroll down to "Share with specific people"');
      console.log('4. Add: notary-calendar-service@houston-mobile-notary-calendar.iam.gserviceaccount.com');
      console.log('5. Give it "Make changes to events" permission');
    }
  }
}

testGoogleCalendar(); 