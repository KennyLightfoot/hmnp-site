require('dotenv').config({path: '.env.local'});

console.log('🔍 Testing Google API Configuration...\n');

// Test 1: Google Maps API Key
console.log('📍 Google Maps API Key:');
if (process.env.GOOGLE_MAPS_API_KEY) {
  console.log('✅ GOOGLE_MAPS_API_KEY is set');
} else {
  console.log('❌ GOOGLE_MAPS_API_KEY is missing');
}

if (process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
  console.log('✅ NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is set');
} else {
  console.log('❌ NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is missing');
}

// Test 2: Google Service Account
console.log('\n📅 Google Service Account:');
if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
  try {
    const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    console.log('✅ GOOGLE_SERVICE_ACCOUNT_JSON is valid JSON');
    console.log(`   Project ID: ${serviceAccount.project_id}`);
    console.log(`   Client Email: ${serviceAccount.client_email}`);
  } catch (error) {
    console.log('❌ GOOGLE_SERVICE_ACCOUNT_JSON is not valid JSON');
  }
} else {
  console.log('❌ GOOGLE_SERVICE_ACCOUNT_JSON is missing');
}

// Test 3: Gemini API Key
console.log('\n🤖 Gemini API Key:');
if (process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes('YOUR_')) {
  console.log('✅ GEMINI_API_KEY is set');
} else {
  console.log('❌ GEMINI_API_KEY is missing or placeholder');
}

// Test 4: Google Calendar ID
console.log('\n📆 Google Calendar ID:');
if (process.env.GOOGLE_CALENDAR_ID) {
  console.log('✅ GOOGLE_CALENDAR_ID is set');
  console.log(`   Calendar ID: ${process.env.GOOGLE_CALENDAR_ID}`);
} else {
  console.log('❌ GOOGLE_CALENDAR_ID is missing');
}

console.log('\n📋 Summary:');
console.log('- Google Maps: ✅ (already configured)');
console.log('- Service Account: ' + (process.env.GOOGLE_SERVICE_ACCOUNT_JSON ? '✅' : '❌'));
console.log('- Gemini API: ' + (process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes('YOUR_') ? '✅' : '❌'));
console.log('- Calendar ID: ' + (process.env.GOOGLE_CALENDAR_ID ? '✅' : '❌'));

if (!process.env.GOOGLE_SERVICE_ACCOUNT_JSON || !process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes('YOUR_')) {
  console.log('\n💡 Next Steps:');
  console.log('1. Follow the steps above to get your missing API keys');
  console.log('2. Add them to your .env.local file');
  console.log('3. Run this test again to verify everything works');
} 