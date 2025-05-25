#!/usr/bin/env node

/**
 * Script to check existing custom fields in GoHighLevel
 * This will show what fields already exist so we don't create duplicates
 * 
 * Usage: node scripts/check-ghl-custom-fields.js
 */

import 'dotenv/config';

const GHL_API_BASE_URL = process.env.GHL_API_BASE_URL;
const GHL_API_KEY = process.env.GHL_API_KEY;
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;

if (!GHL_API_BASE_URL || !GHL_API_KEY || !GHL_LOCATION_ID) {
  console.error('Missing required environment variables:');
  console.error('- GHL_API_BASE_URL');
  console.error('- GHL_API_KEY'); 
  console.error('- GHL_LOCATION_ID');
  process.exit(1);
}

// The 6 custom fields we need
const requiredFields = [
  'cf_last_booking_status',
  'cf_last_cancellation_date',
  'cf_refund_amount',
  'cf_last_reschedule_date',
  'cf_payment_reminders_sent',
  'cf_last_payment_reminder',
  'cf_quote_sent_date'
];

async function checkExistingCustomFields() {
  const url = `${GHL_API_BASE_URL}/locations/${GHL_LOCATION_ID}/customFields`;
  
  try {
    console.log('🔍 Checking existing custom fields in GHL...\n');
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${GHL_API_KEY}`,
        'Content-Type': 'application/json',
        'Version': '2021-07-28'
      }
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`❌ Failed to fetch custom fields:`, errorData);
      return;
    }

    const data = await response.json();
    const existingFields = data.customFields || [];

    console.log(`📊 Found ${existingFields.length} total custom fields in your GHL account\n`);

    // Check which of our required fields exist
    const foundFields = [];
    const missingFields = [];

    for (const requiredField of requiredFields) {
      const existing = existingFields.find(field => 
        field.name === requiredField || field.key === requiredField
      );
      
      if (existing) {
        foundFields.push({
          name: requiredField,
          id: existing.id,
          type: existing.dataType,
          existing: existing
        });
      } else {
        missingFields.push(requiredField);
      }
    }

    // Display results
    console.log('✅ EXISTING REQUIRED FIELDS:');
    if (foundFields.length === 0) {
      console.log('   None of the required fields exist yet.\n');
    } else {
      foundFields.forEach(field => {
        console.log(`   ✓ ${field.name} (ID: ${field.id}, Type: ${field.type})`);
      });
      console.log('');
    }

    console.log('❌ MISSING REQUIRED FIELDS:');
    if (missingFields.length === 0) {
      console.log('   All required fields already exist! 🎉\n');
    } else {
      missingFields.forEach(field => {
        console.log(`   ✗ ${field}`);
      });
      console.log('');
    }

    // Show summary
    console.log('📋 SUMMARY:');
    console.log(`   Required fields: ${requiredFields.length}`);
    console.log(`   Already exist: ${foundFields.length}`);
    console.log(`   Need to create: ${missingFields.length}`);

    if (missingFields.length > 0) {
      console.log('\n💡 To create missing fields, run:');
      console.log('   node scripts/create-ghl-custom-fields.js');
    } else {
      console.log('\n🎉 All required custom fields are already set up!');
      console.log('   Your automation workflows should work correctly.');
    }

    // Show sample of other fields for reference
    console.log('\n📚 Sample of other custom fields in your account:');
    const otherFields = existingFields
      .filter(field => !requiredFields.includes(field.name) && !requiredFields.includes(field.key))
      .slice(0, 5);
    
    if (otherFields.length === 0) {
      console.log('   No other custom fields found.');
    } else {
      otherFields.forEach(field => {
        console.log(`   • ${field.name || field.key} (${field.dataType})`);
      });
      if (existingFields.length > otherFields.length + foundFields.length) {
        console.log(`   ... and ${existingFields.length - otherFields.length - foundFields.length} more`);
      }
    }

  } catch (error) {
    console.error('❌ Error checking custom fields:', error.message);
  }
}

// Run the check
checkExistingCustomFields().catch(console.error); 