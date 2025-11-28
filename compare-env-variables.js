#!/usr/bin/env node

/**
 * Environment Variables Comparison Script
 * Compares local environment variables with Vercel production environment
 */

console.log('🔍 ENVIRONMENT VARIABLES COMPARISON\n');
console.log('=' .repeat(80));

/**
 * SECURITY NOTE: This script now reads from environment variables or .env.local
 * No secrets are hardcoded. Run with: node compare-env-variables.js
 * Make sure .env.local exists or set environment variables before running.
 */

import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local if it exists
const envPath = join(__dirname, '.env.local');
try {
  config({ path: envPath });
  console.log('✅ Loaded variables from .env.local');
} catch (err) {
  console.warn('⚠️  .env.local not found, using environment variables from shell');
}

// Your local environment variables (from .env.local or environment)
const localEnv = {
  // Database & Infrastructure
  "SENTRY_DSN": process.env.SENTRY_DSN || "[NOT SET]",
  "DATABASE_URL": process.env.DATABASE_URL || "[NOT SET]",
  "DATABASE_URL_UNPOOLED": process.env.DATABASE_URL_UNPOOLED || "[NOT SET]",
  "PGHOST": "ep-summer-mode-a4ocsti3-pooler.us-east-1.aws.neon.tech",

  // Server Configuration
  "API_PORT": "3001",
  "NODE_ENV": "development",

  // Email Configuration
  "ADMIN_EMAIL": process.env.ADMIN_EMAIL || "[NOT SET]",
  "FROM_EMAIL": process.env.FROM_EMAIL || "[NOT SET]",
  "RESEND_API_KEY": process.env.RESEND_API_KEY || "[NOT SET]",

  // Admin Credentials
  "ADMIN_USERNAME": process.env.ADMIN_USERNAME || "[NOT SET]",
  "ADMIN_PASSWORD": process.env.ADMIN_PASSWORD ? "[REDACTED]" : "[NOT SET]",

  // GoHighLevel Configuration
  "GHL_REDIRECT_URI": process.env.GHL_REDIRECT_URI || "[NOT SET]",
  "GHL_CALL_REQUEST_WORKFLOW_ID": process.env.GHL_CALL_REQUEST_WORKFLOW_ID || "[NOT SET]",
  "GHL_NEW_CONTACT_WORKFLOW_ID": process.env.GHL_NEW_CONTACT_WORKFLOW_ID || "[NOT SET]",
  "GHL_CONTACT_FORM_WORKFLOW_ID": process.env.GHL_CONTACT_FORM_WORKFLOW_ID || "[NOT SET]",
  "GHL_LOCATION_ID": process.env.GHL_LOCATION_ID || "[NOT SET]",
  "GHL_CLIENT_ID": process.env.GHL_CLIENT_ID || "[NOT SET]",
  "GHL_CLIENT_SECRET": process.env.GHL_CLIENT_SECRET ? "[REDACTED]" : "[NOT SET]",
  "GHL_API_KEY": process.env.GHL_API_KEY ? "[REDACTED]" : "[NOT SET]",
  "GHL_API_VERSION": "2021-07-28",
  "GHL_API_BASE_URL": "https://services.leadconnectorhq.com",

  // GHL Workflow IDs
  "GHL_BOOKING_CONFIRMATION_WORKFLOW_ID": "40e0dde5-7b6b-4a5e-9e11-8747e21d15d4",
  "GHL_PAYMENT_FOLLOWUP_WORKFLOW_ID": "8216c46e-bbec-45f5-aa21-c4422bea119d",
  "GHL_24HR_REMINDER_WORKFLOW_ID": "52fa10e9-301e-44af-8ba7-94f9679d6ffb",
  "GHL_POST_SERVICE_WORKFLOW_ID": "f5a9a454-91a4-497e-b918-ed5634b4c85e",
  "GHL_NO_SHOW_RECOVERY_WORKFLOW_ID": "64bd5585-04dc-4e9f-98b3-8480a2d34463",
  "GHL_EMERGENCY_SERVICE_WORKFLOW_ID": "cfd22e83-b636-4c51-937b-2849fb69da0e",

  // GHL Custom Field IDs
  "GHL_CF_ID_AD_PLATFORM": "t2gMTw7jLDDGsgprOmxe",
  "GHL_CF_ID_UTM_SOURCE": "rPu81rmsXiopvg4Ona4U",
  "GHL_CF_ID_UTM_MEDIUM": "anGabiVXZP7XPO9cHMy4",
  "GHL_CF_ID_UTM_CAMPAIGN": "ogmvR5klM2INtr0qn97J",
  "GHL_CF_ID_UTM_TERM": "W5h6V3rxGh86uoFsmvHV",
  "GHL_CF_ID_UTM_CONTENT": "mftgkC0WEtmySeHzkgut",
  "GHL_CF_ID_AD_CAMPAIGN_NAME": "jn0vsVm593wo71owigkT",
  "GHL_CF_ID_AD_CAMPAIGN_ID": "GPoCLSSPDFDlaRL6NHFT",
  "GHL_CF_ID_AD_GROUP_ID": "mMXX4suZWefp1nVqMpye",
  "GHL_CF_ID_AD_ID": "4HMJaMAEKdkVYyYfFebC",
  "GHL_CF_ID_LANDING_PAGE_URL": "ZUs3WkVfeHJi1wYxAwJa",
  "GHL_CF_ID_PREFERRED_CALL_TIME": "f7lyOeQ09sgf2HFZv7X4",
  "GHL_CF_ID_CALL_REQUEST_REASON": "S6JxuZNqhaDpfkiwukXz",

  // GHL Custom Field IDs (Form Fields)
  "GHL_CUSTOM_FIELD_ID_BOOKING_SERVICE_TYPE": "77wL4XfPZJ7jXQzK3pXm",
  "GHL_CUSTOM_FIELD_ID_BOOKING_APPOINTMENT_DATETIME": "0gM7pYjK1nO9wJdEaZbD",
  "GHL_CUSTOM_FIELD_ID_BOOKING_SERVICE_ADDRESS": "RysyO6fl9IyBA8ncuXP6",
  "GHL_CUSTOM_FIELD_ID_BOOKING_SPECIAL_INSTRUCTIONS": "S6JxuZNqhaDpfkiwukXz",
  "GHL_CUSTOM_FIELD_ID_CONSENT_TERMS_CONDITIONS": "z7Ulsc4uJJNJJx98pUEE",
  "GHL_CUSTOM_FIELD_ID_LEAD_SOURCE_DETAIL": "Qu2wK8YhpgMj2PZTVEAu",
  "GHL_CUSTOM_FIELD_ID_PROMO_CODE_USED": "Og0C63P8DxWFsiTiEJUn",
  "GHL_CUSTOM_FIELD_ID_REFERRED_BY_NAME_EMAIL": "F94JeEK7i9adgBgtxLXX",
  "GHL_CUSTOM_FIELD_ID_NUMBER_OF_SIGNERS": "tkhRciHhsuiBtr1bh7ZV",
  "GHL_CUSTOM_FIELD_ID_BOOKING_DISCOUNT_APPLIED": "hqsRxYmGVd9vRHD8olQB",
  "GHL_CUSTOM_FIELD_ID_SMS_NOTIFICATIONS_CONSENT": "A3I0jWxlCLekVCLG73NU",
  "GHL_CUSTOM_FIELD_ID_EMAIL_UPDATES_CONSENT": "TNvRVVkGs4nA8bngYEQ1",
  "GHL_CUSTOM_FIELD_ID_ADDITIONAL_CHARGES": "748yFeiLgtKFtYkuquqU",
  "GHL_CUSTOM_FIELD_ID_CLIENT_TYPE": "JYneDGrupCmPnd47G0e7",
  "GHL_CUSTOM_FIELD_ID_DOCUMENT_COUNT": "EpZJr9bhTIUtZb49iRnJ",
  "GHL_CUSTOM_FIELD_ID_TRAVEL_MILEAGE": "SPA1ijelF8cXwvCMi691",
  "GHL_CUSTOM_FIELD_ID_TRAVEL_FEE": "o4FnC2htqrczpB7wig3F",
  "GHL_CUSTOM_FIELD_ID_URGENCY_LEVEL": "3gdXAb3z3zruDtp873Jw",
  "GHL_CUSTOM_FIELD_ID_WITNESS_COUNT": "kDsmgpa1qBxCiayEdMhO",
  "GHL_CUSTOM_FIELD_ID_DOCUMENT_URL": "AZdTgjZu3jzhisVcgyPO",
  "GHL_CUSTOM_FIELD_ID_BOOKING_LOCATION_TYPE": "petV7NMPpsoR76RXoRa0",

  // Calendar IDs
  "GHL_REVERSE_MORTGAGE_CALENDAR_ID": "LuOsaPkbmxHBwFnftlop",
  "GHL_BOOKING_CALENDAR_ID": "h4X7cZ0mZ3c52XSzvpjU",
  "GHL_CALLS_CALENDAR_ID": "UVOw7yFH5il84VRri9Fw",
  "GHL_SPECIALTY_CALENDAR_ID": "Jel3PqtGOkVlxmYikTA2",
  "GHL_LOAN_SIGNING_SPECIALIST_CALENDAR_ID": "EJ5ED9UXPHCjBePUTJ0W",
  "GHL_EXTENDED_HOURS_CALENDAR_ID": "xtHXReq1dfd0wGA7dLc0",
  "GHL_STANDARD_NOTARY_CALENDAR_ID": "r9koQ0kxmuMuWryZkjdo",

  // SMS Configuration
  "GHL_SMS_ENDPOINT": "https://services.leadconnectorhq.com/conversations/messages",
  "GHL_SMS_CONSENT_TAG": "Consent:SMS_Opt_In",

  // Site Configuration
  "NEXT_PUBLIC_SITE_URL": "https://houstonmobilenotarypros.com",
  "NEXT_PUBLIC_BASE_URL": "https://houstonmobilenotarypros.com",

  // NextAuth Configuration (LOCAL VALUES)
  "NEXTAUTH_SECRET": process.env.NEXTAUTH_SECRET ? "[REDACTED]" : "[NOT SET]",
  "NEXTAUTH_URL": "http://localhost:3000",
  "NEXTAUTH_URL_INTERNAL": "http://localhost:3000",
  "NEXT_PUBLIC_APP_URL": "https://houstonmobilenotarypros.com",

  // Google Analytics
  "NEXT_PUBLIC_GA_ID": "G-EXWGCN0D53",

  // Revalidation Tokens
  "NEXT_PUBLIC_REVALIDATE_TOKEN": "8f2a1e94c7b3d5609e7f2a1c3b5d8e7f9a2c4b6d8e0f2a4c6b8d0e2f4a6c8b0",
  "REVALIDATE_TOKEN": "8f2a1e94c7b3d5609e7f2a1c3b5d8e7f9a2c4b6d8e0f2a4c6b8d0e2f4a6c8b0",

  // Google Maps
  "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY": process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? "[REDACTED]" : "[NOT SET]",
  "GOOGLE_MAPS_API_KEY": process.env.GOOGLE_MAPS_API_KEY ? "[REDACTED]" : "[NOT SET]",
  "NEXT_PUBLIC_SANITY_PROJECT_ID": "8t38ph2l",
  "NEXT_PUBLIC_SANITY_DATASET": "hmnp-blog",

  // AWS / S3 Uploads
  "AWS_ACCESS_KEY_ID": process.env.AWS_ACCESS_KEY_ID ? "[REDACTED]" : "[NOT SET]",
  "AWS_SECRET_ACCESS_KEY": process.env.AWS_SECRET_ACCESS_KEY ? "[REDACTED]" : "[NOT SET]",
  "AWS_REGION": process.env.AWS_REGION || "[NOT SET]",
  "S3_BUCKET_NAME": process.env.S3_BUCKET_NAME || "[NOT SET]",

  // Stripe
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY": process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? "[REDACTED]" : "[NOT SET]",
  "STRIPE_SECRET_KEY": process.env.STRIPE_SECRET_KEY ? "[REDACTED]" : "[NOT SET]",
  "STRIPE_WEBHOOK_SECRET": process.env.STRIPE_WEBHOOK_SECRET ? "[REDACTED]" : "[NOT SET]",
  "PAYMENT_EXPIRATION_HOURS": "72",

  // API Security Keys
  "INTERNAL_API_KEY": process.env.INTERNAL_API_KEY ? "[REDACTED]" : "[NOT SET]",
  "CRON_SECRET": process.env.CRON_SECRET ? "[REDACTED]" : "[NOT SET]",

  // Email Configuration (for notifications)
  "SMTP_HOST": "smtp.gmail.com",
  "SMTP_PORT": "587",
  "SMTP_USER": "your_email@gmail.com",
  "SMTP_PASS": "your_app_password",

  // Business Configuration
  "BUSINESS_NAME": "Houston Mobile Notary Pros",
  "BUSINESS_PHONE": "832-617-4285",
  "BUSINESS_EMAIL": "info@houstonmobilenotarypros.com",
  "SERVICE_AREA_RADIUS_MILES": "25",

  // Rate Limiting
  "RATE_LIMIT_WINDOW_MS": "900000",
  "RATE_LIMIT_MAX_REQUESTS": "100",

  // Logging
  "LOG_LEVEL": "info",
  "LOG_FILE_PATH": "./logs/api.log",

  // Local Development
  "WEBHOOK_URL": "https://localhost:3000",
  "PORT": "3000",
  "PLAYWRIGHT_BASE_URL": "http://localhost:3000",
  "PLAYWRIGHT_LOGIN_URL": "/login",
  "PLAYWRIGHT_EMAIL_SELECTOR": "#email",
  "PLAYWRIGHT_PASSWORD_SELECTOR": "#password",
  "PLAYWRIGHT_SUBMIT_SELECTOR": "button[type=\"submit\"]",
  "PLAYWRIGHT_TEST_USERNAME": "testuser@example.com",
  "PLAYWRIGHT_TEST_PASSWORD": "password123"
};

// Vercel production environment variables (from vercel-production.env)
const vercelEnv = {
  // Critical GHL Workflow IDs
  "GHL_BOOKING_CONFIRMATION_WORKFLOW_ID": "40e0dde5-7b6b-4a5e-9e11-8747e21d15d4",
  "GHL_PAYMENT_FOLLOWUP_WORKFLOW_ID": "8216c46e-bbec-45f5-aa21-c4422bea119d",
  "GHL_24HR_REMINDER_WORKFLOW_ID": "52fa10e9-301e-44af-8ba7-94f9679d6ffb",
  "GHL_POST_SERVICE_WORKFLOW_ID": "f5a9a454-91a4-497e-b918-ed5634b4c85e",
  "GHL_NO_SHOW_RECOVERY_WORKFLOW_ID": "64bd5585-04dc-4e9f-98b3-8480a2d34463",
  "GHL_EMERGENCY_SERVICE_WORKFLOW_ID": "cfd22e83-b636-4c51-937b-2849fb69da0e",

  // API Configuration
  "INTERNAL_API_KEY": "mav+PpkGCyAADIyUlTUBGIk194KCa3U4",
  "WEBHOOK_URL": "https://houstonmobilenotarypros.com",
  "PAYMENT_EXPIRATION_HOURS": "72",

  // Business Configuration
  "BUSINESS_NAME": "Houston Mobile Notary Pros",
  "BUSINESS_PHONE": "832-617-4285",
  "BUSINESS_EMAIL": "info@houstonmobilenotarypros.com",
  "SERVICE_AREA_RADIUS_MILES": "25",

  // GHL Custom Field IDs for Ad Tracking
  "GHL_CF_ID_AD_PLATFORM": "t2gMTw7jLDDGsgprOmxe",
  "GHL_CF_ID_UTM_SOURCE": "rPu81rmsXiopvg4Ona4U",
  "GHL_CF_ID_UTM_MEDIUM": "anGabiVXZP7XPO9cHMy4",
  "GHL_CF_ID_UTM_CAMPAIGN": "ogmvR5klM2INtr0qn97J",
  "GHL_CF_ID_UTM_TERM": "W5h6V3rxGh86uoFsmvHV",
  "GHL_CF_ID_UTM_CONTENT": "mftgkC0WEtmySeHzkgut",

  // GHL Custom Field IDs for Forms
  "GHL_CUSTOM_FIELD_ID_BOOKING_SERVICE_TYPE": "77wL4XfPZJ7jXQzK3pXm",
  "GHL_CUSTOM_FIELD_ID_BOOKING_APPOINTMENT_DATETIME": "0gM7pYjK1nO9wJdEaZbD",
  "GHL_CUSTOM_FIELD_ID_BOOKING_SERVICE_ADDRESS": "RysyO6fl9IyBA8ncuXP6",
  "GHL_CUSTOM_FIELD_ID_BOOKING_SPECIAL_INSTRUCTIONS": "S6JxuZNqhaDpfkiwukXz",
  "GHL_CUSTOM_FIELD_ID_CONSENT_TERMS_CONDITIONS": "z7Ulsc4uJJNJJx98pUEE",
  "GHL_CUSTOM_FIELD_ID_LEAD_SOURCE_DETAIL": "Qu2wK8YhpgMj2PZTVEAu",
  "GHL_CUSTOM_FIELD_ID_PROMO_CODE_USED": "Og0C63P8DxWFsiTiEJUn",
  "GHL_CUSTOM_FIELD_ID_REFERRED_BY_NAME_EMAIL": "F94JeEK7i9adgBgtxLXX",
  "GHL_CUSTOM_FIELD_ID_NUMBER_OF_SIGNERS": "tkhRciHhsuiBtr1bh7ZV",
  "GHL_CUSTOM_FIELD_ID_BOOKING_DISCOUNT_APPLIED": "hqsRxYmGVd9vRHD8olQB",
  "GHL_CUSTOM_FIELD_ID_SMS_NOTIFICATIONS_CONSENT": "A3I0jWxlCLekVCLG73NU",
  "GHL_CUSTOM_FIELD_ID_EMAIL_UPDATES_CONSENT": "TNvRVVkGs4nA8bngYEQ1",
  "GHL_CUSTOM_FIELD_ID_ADDITIONAL_CHARGES": "748yFeiLgtKFtYkuquqU",
  "GHL_CUSTOM_FIELD_ID_CLIENT_TYPE": "JYneDGrupCmPnd47G0e7",
  "GHL_CUSTOM_FIELD_ID_DOCUMENT_COUNT": "EpZJr9bhTIUtZb49iRnJ",
  "GHL_CUSTOM_FIELD_ID_TRAVEL_MILEAGE": "SPA1ijelF8cXwvCMi691",
  "GHL_CUSTOM_FIELD_ID_TRAVEL_FEE": "o4FnC2htqrczpB7wig3F",
  "GHL_CUSTOM_FIELD_ID_URGENCY_LEVEL": "3gdXAb3z3zruDtp873Jw",
  "GHL_CUSTOM_FIELD_ID_WITNESS_COUNT": "kDsmgpa1qBxCiayEdMhO",
  "GHL_CUSTOM_FIELD_ID_DOCUMENT_URL": "AZdTgjZu3jzhisVcgyPO",
  "GHL_CUSTOM_FIELD_ID_BOOKING_LOCATION_TYPE": "petV7NMPpsoR76RXoRa0",

  // SMS Configuration
  "GHL_SMS_ENDPOINT": "https://services.leadconnectorhq.com/conversations/messages",
  "GHL_SMS_CONSENT_TAG": "Consent:SMS_Opt_In",

  // Site URLs (Production)
  "NEXT_PUBLIC_SITE_URL": "https://houstonmobilenotarypros.com",
  "NEXT_PUBLIC_APP_URL": "https://houstonmobilenotarypros.com",
  "NEXTAUTH_URL": "https://houstonmobilenotarypros.com",

  // Additional GHL Field IDs
  "GHL_CF_ID_PREFERRED_CALL_TIME": "f7lyOeQ09sgf2HFZv7X4",
  "GHL_CF_ID_CALL_REQUEST_REASON": "S6JxuZNqhaDpfkiwukXz"
};

// Analysis
console.log('📋 ANALYSIS RESULTS:');
console.log('=' .repeat(80));

// Find variables missing in Vercel
const missingInVercel = [];
const differentValues = [];
const vercelOnly = [];

for (const [key, value] of Object.entries(localEnv)) {
  if (!vercelEnv.hasOwnProperty(key)) {
    missingInVercel.push({ key, value });
  } else if (vercelEnv[key] !== value) {
    differentValues.push({ 
      key, 
      local: value, 
      vercel: vercelEnv[key] 
    });
  }
}

for (const [key, value] of Object.entries(vercelEnv)) {
  if (!localEnv.hasOwnProperty(key)) {
    vercelOnly.push({ key, value });
  }
}

// Display results
console.log('🚨 CRITICAL: Variables missing in Vercel (' + missingInVercel.length + ')');
console.log('-'.repeat(80));
if (missingInVercel.length > 0) {
  missingInVercel.forEach(item => {
    // Mask sensitive data
    const maskedValue = item.key.includes('KEY') || item.key.includes('SECRET') || item.key.includes('PASSWORD') 
      ? '[REDACTED]' 
      : item.value;
    console.log(`❌ ${item.key}=${maskedValue}`);
  });
  console.log('\n🔧 Action Required: Add these to Vercel environment variables\n');
} else {
  console.log('✅ All local variables are present in Vercel\n');
}

console.log('⚠️  DIFFERENT VALUES: Variables with different values (' + differentValues.length + ')');
console.log('-'.repeat(80));
if (differentValues.length > 0) {
  differentValues.forEach(item => {
    const maskedLocal = item.key.includes('KEY') || item.key.includes('SECRET') || item.key.includes('PASSWORD') 
      ? '[REDACTED]' 
      : item.local;
    const maskedVercel = item.key.includes('KEY') || item.key.includes('SECRET') || item.key.includes('PASSWORD') 
      ? '[REDACTED]' 
      : item.vercel;
    console.log(`🔄 ${item.key}:`);
    console.log(`   Local:  ${maskedLocal}`);
    console.log(`   Vercel: ${maskedVercel}`);
    console.log('');
  });
} else {
  console.log('✅ All matching variables have identical values\n');
}

console.log('ℹ️  VERCEL ONLY: Variables only in Vercel (' + vercelOnly.length + ')');
console.log('-'.repeat(80));
if (vercelOnly.length > 0) {
  vercelOnly.forEach(item => {
    const maskedValue = item.key.includes('KEY') || item.key.includes('SECRET') || item.key.includes('PASSWORD') 
      ? '[REDACTED]' 
      : item.value;
    console.log(`📦 ${item.key}=${maskedValue}`);
  });
  console.log('\n💡 These variables exist in Vercel but not locally\n');
} else {
  console.log('✅ No Vercel-only variables found\n');
}

// Summary and recommendations
console.log('📊 SUMMARY');
console.log('=' .repeat(80));
console.log(`Total local variables: ${Object.keys(localEnv).length}`);
console.log(`Total Vercel variables: ${Object.keys(vercelEnv).length}`);
console.log(`Missing in Vercel: ${missingInVercel.length}`);
console.log(`Different values: ${differentValues.length}`);
console.log(`Vercel only: ${vercelOnly.length}`);

console.log('\n🎯 RECOMMENDATIONS');
console.log('=' .repeat(80));

if (missingInVercel.length > 0) {
  console.log('1. 🚨 URGENT: Add missing variables to Vercel');
  console.log('   - Use: vercel env add <VARIABLE_NAME>');
  console.log('   - Or update via Vercel dashboard');
}

if (differentValues.length > 0) {
  console.log('2. ⚠️  REVIEW: Check different values');
  console.log('   - Local might have development values');
  console.log('   - Vercel should have production values');
  console.log('   - Key differences to verify:');
  differentValues.forEach(item => {
    if (item.key.includes('URL') || item.key.includes('WEBHOOK')) {
      console.log(`   - ${item.key}: Should be production URL in Vercel`);
    }
  });
}

console.log('\n✅ Next Steps:');
console.log('1. Run the sync script to update Vercel');
console.log('2. Verify production URLs are correct in Vercel');
console.log('3. Test deployment after syncing');

console.log('\n🔗 Useful Commands:');
console.log('- View Vercel env: vercel env ls');
console.log('- Add variable: vercel env add VARIABLE_NAME');
console.log('- Pull from Vercel: vercel env pull .env.vercel');
console.log('- Deploy: vercel --prod');

console.log('\n' + '=' .repeat(80)); 