import { config } from 'dotenv';
import { google } from 'googleapis';

// Load environment variables
config();

async function testGoogleCalendar() {
  console.log('🗓️ Testing Google Calendar Integration...\n');

  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log('- GOOGLE_CALENDAR_ID:', process.env.GOOGLE_CALENDAR_ID ? '✅ Set' : '❌ Missing');
  console.log('- GOOGLE_SERVICE_ACCOUNT_KEY:', process.env.GOOGLE_SERVICE_ACCOUNT_KEY ? '✅ Set' : '❌ Missing');
  console.log('- GOOGLE_SERVICE_ACCOUNT_JSON:', process.env.GOOGLE_SERVICE_ACCOUNT_JSON ? '✅ Set' : '❌ Missing');
  console.log('');

  if (!process.env.GOOGLE_CALENDAR_ID) {
    console.log('❌ GOOGLE_CALENDAR_ID is required. Please set it in your .env file.');
    return;
  }

  if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY && !process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    console.log('❌ Either GOOGLE_SERVICE_ACCOUNT_KEY or GOOGLE_SERVICE_ACCOUNT_JSON is required.');
    return;
  }

  try {
    // Initialize the service
    console.log('🔧 Initializing Google Calendar Service...');
    
    // Create auth based on environment
    let auth;
    if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
      const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
      auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/calendar'],
      });
    } else if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
      auth = new google.auth.GoogleAuth({
        keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
        scopes: ['https://www.googleapis.com/auth/calendar'],
      });
    } else {
      throw new Error('No credentials found');
    }
    
    const calendar = google.calendar({ version: 'v3', auth });
    console.log('✅ Service initialized successfully\n');

    // Create a test event
    console.log('📅 Creating test event...');

    // Create test event
    const testEvent = {
      summary: 'Test Notary Service - Test Customer',
      location: '123 Test Street, Houston, TX 77001',
      description: 'Test booking for calendar integration',
      start: {
        dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        timeZone: 'America/Chicago',
      },
      end: {
        dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
        timeZone: 'America/Chicago',
      },
      colorId: '10', // Green
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 120 },
          { method: 'email', minutes: 1440 },
        ],
      },
    };

    const response = await calendar.events.insert({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      requestBody: testEvent,
    });

    console.log('✅ Test event created successfully!');
    console.log('📍 Event ID:', response.data.id);
    console.log('🔗 Event Link:', response.data.htmlLink);
    console.log('');

    // Clean up - delete the test event
    console.log('🧹 Cleaning up test event...');
    await calendar.events.delete({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      eventId: response.data.id,
    });
    console.log('✅ Test event deleted successfully\n');

    console.log('🎉 Google Calendar integration is working perfectly!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Make sure your calendar is shared with the service account');
    console.log('2. Your booking system will now automatically create calendar events');
    console.log('3. Events will be color-coded by booking status');

  } catch (error) {
    console.error('❌ Error testing Google Calendar:', error.message);
    console.log('');
    console.log('Common issues:');
    console.log('- Service account email not added to calendar sharing');
    console.log('- Calendar ID incorrect');
    console.log('- Service account key file missing or invalid');
    console.log('- Google Calendar API not enabled');
  }
}

// Run the test
testGoogleCalendar(); 