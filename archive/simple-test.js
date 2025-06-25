// Simple test to check your Google API keys
require('dotenv').config({path: '.env.local'});

console.log('🎯 Testing Your Google API Keys...\n');

// Test 1: Maps (should be working)
console.log('🗺️ Maps API Key:');
if (process.env.GOOGLE_MAPS_API_KEY) {
  console.log('✅ GOOD - You have a Maps key!');
} else {
  console.log('❌ BAD - No Maps key found');
}

// Test 2: Calendar (what you need to get)
console.log('\n📅 Calendar Service Account:');
if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON && !process.env.GOOGLE_SERVICE_ACCOUNT_JSON.includes('YOUR_')) {
  console.log('✅ GOOD - You have a Calendar service account!');
} else {
  console.log('❌ BAD - You need to get a Calendar service account');
  console.log('   → Follow Step 2 above to get this');
}

// Test 3: Gemini AI (what you need to get)
console.log('\n🤖 Gemini AI Key:');
if (process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes('YOUR_')) {
  console.log('✅ GOOD - You have a Gemini AI key!');
} else {
  console.log('❌ BAD - You need to get a Gemini AI key');
  console.log('   → Go to https://makersuite.google.com/app/apikey');
}

console.log('\n📋 Summary:');
console.log('Maps: ' + (process.env.GOOGLE_MAPS_API_KEY ? '✅' : '❌'));
console.log('Calendar: ' + (process.env.GOOGLE_SERVICE_ACCOUNT_JSON && !process.env.GOOGLE_SERVICE_ACCOUNT_JSON.includes('YOUR_') ? '✅' : '❌'));
console.log('Gemini: ' + (process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes('YOUR_') ? '✅' : '❌'));

if (process.env.GOOGLE_MAPS_API_KEY && 
    process.env.GOOGLE_SERVICE_ACCOUNT_JSON && !process.env.GOOGLE_SERVICE_ACCOUNT_JSON.includes('YOUR_') &&
    process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes('YOUR_')) {
  console.log('\n🎉 CONGRATULATIONS! All your Google APIs are ready!');
} else {
  console.log('\n💡 You still need to get some API keys. Follow the steps above!');
} 