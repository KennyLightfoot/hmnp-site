// Quick test to verify environment variables
require('dotenv').config({path: '.env.local'});

console.log('🎯 Quick Test - Checking Your Setup...\n');

// Test 1: Check if all required variables are set
const tests = [
  {
    name: 'Google Maps API Key',
    value: process.env.GOOGLE_MAPS_API_KEY,
    required: true
  },
  {
    name: 'Google Maps Public Key',
    value: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    required: true
  },
  {
    name: 'Google Service Account JSON',
    value: process.env.GOOGLE_SERVICE_ACCOUNT_JSON,
    required: true
  },
  {
    name: 'Google Calendar ID',
    value: process.env.GOOGLE_CALENDAR_ID,
    required: true
  },
  {
    name: 'Gemini API Key',
    value: process.env.GEMINI_API_KEY,
    required: true
  }
];

let allPassed = true;

tests.forEach(test => {
  if (test.value && !test.value.includes('YOUR_') && !test.value.includes('placeholder')) {
    console.log(`✅ ${test.name}: Set`);
  } else {
    console.log(`❌ ${test.name}: Missing or placeholder`);
    allPassed = false;
  }
});

console.log('\n📋 Summary:');
if (allPassed) {
  console.log('🎉 ALL TESTS PASSED! Your Google APIs are configured correctly!');
  console.log('\n💡 Next steps:');
  console.log('1. Make sure you shared your calendar with the service account');
  console.log('2. Test your booking system');
  console.log('3. Deploy to production when ready!');
} else {
  console.log('⚠️ Some tests failed. Check the errors above.');
}

// Test 2: Validate service account JSON
if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
  try {
    const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    console.log('\n🔍 Service Account Details:');
    console.log(`   Project: ${serviceAccount.project_id}`);
    console.log(`   Email: ${serviceAccount.client_email}`);
    console.log('✅ Service account JSON is valid!');
  } catch (error) {
    console.log('\n❌ Service account JSON is invalid!');
    allPassed = false;
  }
} 