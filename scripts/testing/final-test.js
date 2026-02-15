// Final test to check all your Google API keys
require('dotenv').config({path: '.env.local'});

console.log('🎯 FINAL TEST - Checking All Your Google APIs...\n');

let allGood = true;

// Test 1: Maps API
console.log('🗺️ Maps API:');
if (process.env.GOOGLE_MAPS_API_KEY && process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
  console.log('✅ GOOD - Both Maps keys are set!');
} else {
  console.log('❌ BAD - Missing Maps keys');
  allGood = false;
}

// Test 2: Calendar Service Account
console.log('\n📅 Calendar Service Account:');
if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
  try {
    const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    console.log('✅ GOOD - Service account JSON is valid!');
    console.log(`   Project: ${serviceAccount.project_id}`);
    console.log(`   Email: ${serviceAccount.client_email}`);
  } catch (error) {
    console.log('❌ BAD - Service account JSON is invalid');
    allGood = false;
  }
} else {
  console.log('❌ BAD - No service account JSON found');
  allGood = false;
}

// Test 3: Calendar ID
console.log('\n📆 Calendar ID:');
if (process.env.GOOGLE_CALENDAR_ID) {
  console.log('✅ GOOD - Calendar ID is set!');
  console.log(`   ID: ${process.env.GOOGLE_CALENDAR_ID}`);
} else {
  console.log('❌ BAD - No calendar ID found');
  allGood = false;
}

// Test 4: Gemini AI
console.log('\n🤖 Gemini AI:');
if (process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes('YOUR_')) {
  console.log('✅ GOOD - Gemini API key is set!');
} else {
  console.log('❌ BAD - Missing or placeholder Gemini key');
  allGood = false;
}

console.log('\n📋 FINAL SUMMARY:');
console.log('Maps: ' + (process.env.GOOGLE_MAPS_API_KEY ? '✅' : '❌'));
console.log('Calendar Service: ' + (process.env.GOOGLE_SERVICE_ACCOUNT_JSON ? '✅' : '❌'));
console.log('Calendar ID: ' + (process.env.GOOGLE_CALENDAR_ID ? '✅' : '❌'));
console.log('Gemini: ' + (process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes('YOUR_') ? '✅' : '❌'));

if (allGood) {
  console.log('\n🎉 CONGRATULATIONS! All your Google APIs are ready for production!');
  console.log('\n💡 Next steps:');
  console.log('1. Make sure you shared your calendar with the service account');
  console.log('2. Deploy to production');
  console.log('3. Test your booking system!');
} else {
  console.log('\n💡 You still need to fix some things. Check the errors above!');
} 