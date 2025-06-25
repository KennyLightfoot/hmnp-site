require('dotenv').config({path: '.env.local'});

console.log('🔍 Checking for missing environment variables...\n');

// Critical missing variables
const criticalMissing = [];
const placeholderVariables = [];

// Check for critical missing variables
const criticalVars = [
  'GEMINI_API_KEY',
  'GOOGLE_SERVICE_ACCOUNT_JSON',
  'LAUNCHDARKLY_SERVER_SDK_KEY',
  'NEXT_PUBLIC_LAUNCHDARKLY_CLIENT_SDK_KEY'
];

criticalVars.forEach(key => {
  if (!process.env[key]) {
    criticalMissing.push(key);
  } else if (process.env[key].includes('YOUR_') || process.env[key].includes('placeholder')) {
    placeholderVariables.push(key);
  }
});

// Check for other placeholder variables
Object.keys(process.env).forEach(key => {
  if (process.env[key] && (process.env[key].includes('YOUR_') || process.env[key].includes('placeholder'))) {
    if (!placeholderVariables.includes(key)) {
      placeholderVariables.push(key);
    }
  }
});

console.log('🚨 CRITICAL MISSING VARIABLES:');
if (criticalMissing.length === 0) {
  console.log('✅ All critical variables are set');
} else {
  criticalMissing.forEach(key => console.log(`❌ ${key}`));
}

console.log('\n⚠️ PLACEHOLDER VARIABLES (need real values):');
if (placeholderVariables.length === 0) {
  console.log('✅ No placeholder variables found');
} else {
  placeholderVariables.forEach(key => console.log(`⚠️ ${key} = ${process.env[key]}`));
}

console.log('\n📋 SUMMARY:');
console.log(`- Critical missing: ${criticalMissing.length}`);
console.log(`- Placeholder variables: ${placeholderVariables.length}`);

if (criticalMissing.length === 0 && placeholderVariables.length === 0) {
  console.log('\n🎉 All environment variables are properly configured!');
} else {
  console.log('\n💡 Next steps:');
  if (criticalMissing.length > 0) {
    console.log('1. Get the missing API keys and add them to .env.local');
  }
  if (placeholderVariables.length > 0) {
    console.log('2. Replace placeholder values with actual configuration');
  }
} 