#!/usr/bin/env node

/**
 * MINIMAL GHL Custom Fields Script - Only fields actually used by the web app
 * Based on analysis of actual usage in the codebase
 */

import {
  validateEnvVariables,
  getLocationCustomFields,
  createLocationCustomField,
  printSuccess,
  printError,
  printInfo
} from './ghl-api-v2-utils.js';

// Validate environment variables
if (!validateEnvVariables()) {
  process.exit(1);
}

// ONLY the custom fields actually used in the web app
const customFields = [
  // ===== CORE BOOKING FIELDS (EXACT NAMES USED IN WEB APP) =====
  {
    name: 'booking_id',
    dataType: 'TEXT',
    position: 1,
    placeholder: 'HMNP-XXX format booking ID'
  },
  {
    name: 'service_address',
    dataType: 'LARGE_TEXT',
    position: 2,
    placeholder: 'Full service address'
  },
  {
    name: 'service_name',
    dataType: 'TEXT',
    position: 3,
    placeholder: 'Name of service requested'
  },
  {
    name: 'service_price',
    dataType: 'MONETORY',
    position: 4,
    placeholder: '0.00'
  },
  {
    name: 'payment_amount',
    dataType: 'MONETORY',
    position: 5,
    placeholder: '0.00'
  },
  {
    name: 'appointment_date',
    dataType: 'DATE',
    position: 6,
    placeholder: 'Confirmed appointment date'
  },
  {
    name: 'appointment_time',
    dataType: 'TEXT',
    position: 7,
    placeholder: 'Confirmed appointment time'
  },
  {
    name: 'appointment_datetime',
    dataType: 'TEXT',
    position: 8,
    placeholder: 'YYYY-MM-DD HH:MM combined format'
  },

  // ===== WORKFLOW SPECIFIC FIELDS (STRIPE WEBHOOK PROCESSOR) =====
  {
    name: 'stripe_payment_intent_id',
    dataType: 'TEXT',
    position: 9,
    placeholder: 'Stripe payment intent ID'
  },
  {
    name: 'refund_amount',
    dataType: 'MONETORY',
    position: 10,
    placeholder: '0.00'
  },
  {
    name: 'last_stripe_webhook_date',
    dataType: 'TEXT',
    position: 11,
    placeholder: 'Timestamp of last webhook processing'
  },

  // ===== ADDITIONAL BOOKING FIELDS USED IN WEB APP =====
  {
    name: 'service_date',
    dataType: 'DATE',
    position: 12,
    placeholder: 'Legacy service date field'
  },
  {
    name: 'service_time',
    dataType: 'TEXT',
    position: 13,
    placeholder: 'Legacy service time field'
  },
  {
    name: 'number_of_signatures',
    dataType: 'NUMERICAL',
    position: 14,
    placeholder: 'Number of signers/signatures'
  },
  {
    name: 'document_type',
    dataType: 'TEXT',
    position: 15,
    placeholder: 'Type of document to notarize'
  },

  // ===== CONTACT FORM FIELDS (ACTUALLY USED) =====
  {
    name: 'cf_preferred_call_time',
    dataType: 'TEXT',
    position: 16,
    placeholder: 'Preferred call time'
  },
  {
    name: 'cf_call_request_notes',
    dataType: 'LARGE_TEXT',
    position: 17,
    placeholder: 'Notes about call request'
  },
  {
    name: 'cf_lead_source_detail',
    dataType: 'TEXT',
    position: 18,
    placeholder: 'Detailed lead source information'
  },
  {
    name: 'cf_consent_sms_communications',
    dataType: 'TEXT',
    position: 19,
    placeholder: 'Yes/No'
  },
  {
    name: 'cf_consent_terms_conditions',
    dataType: 'TEXT',
    position: 20,
    placeholder: 'Yes/No'
  },

  // ===== MARKETING/UTM FIELDS =====
  {
    name: 'cf_utm_source',
    dataType: 'TEXT',
    position: 21,
    placeholder: 'UTM source parameter'
  },
  {
    name: 'cf_utm_medium',
    dataType: 'TEXT',
    position: 22,
    placeholder: 'UTM medium parameter'
  },
  {
    name: 'cf_utm_campaign',
    dataType: 'TEXT',
    position: 23,
    placeholder: 'UTM campaign parameter'
  },

  // ===== PAYMENT TRACKING =====
  {
    name: 'cf_payment_status',
    dataType: 'TEXT',
    position: 24,
    placeholder: 'PENDING, COMPLETED, FAILED'
  },
  {
    name: 'cf_refund_amount',
    dataType: 'MONETORY',
    position: 25,
    placeholder: '0.00'
  }
];

async function getExistingCustomFields() {
  try {
    const data = await getLocationCustomFields();
    return data.customFields || [];
  } catch (error) {
    console.error('Error fetching existing custom fields:', error);
    return [];
  }
}

async function createCustomField(fieldData) {
  try {
    console.log(`Creating custom field: ${fieldData.name}...`);
    
    const result = await createLocationCustomField(fieldData);
    printSuccess(`Created ${fieldData.name} successfully`);
    console.log(`   ID: ${result.id}`);
    console.log(`   Key: ${result.key || fieldData.name}`);
    return true;
    
  } catch (error) {
    printError(`Error creating ${fieldData.name}: ${error.message}`);
    return false;
  }
}

async function createAllCustomFields() {
  console.log('🎯 Creating MINIMAL GHL Custom Fields (only used fields)...\n');
  
  // First, get existing fields
  printInfo('Checking existing custom fields...');
  const existingFields = await getExistingCustomFields();
  printInfo(`Found ${existingFields.length} existing custom fields\n`);

  // Filter out fields that already exist
  const fieldsToCreate = customFields.filter(field => {
    const exists = existingFields.some(existing => 
      existing.name === field.name || existing.key === field.name
    );
    
    if (exists) {
      console.log(`⏭️  Skipping ${field.name} - already exists`);
      return false;
    }
    return true;
  });

  if (fieldsToCreate.length === 0) {
    console.log('\n🎉 All required custom fields already exist!');
    console.log(`📊 Total minimal fields: ${customFields.length} (vs 1200+ in old script)`);
    console.log('\n✅ Fields configured:');
    console.log('   - Core booking fields: 8 fields');
    console.log('   - Workflow fields: 3 fields');  
    console.log('   - Contact form fields: 5 fields');
    console.log('   - Marketing fields: 3 fields');
    console.log('   - Payment tracking: 2 fields');
    return;
  }

  console.log(`\n📝 Need to create ${fieldsToCreate.length} missing fields:\n`);
  
  let successCount = 0;
  let failureCount = 0;

  for (const field of fieldsToCreate) {
    const success = await createCustomField(field);
    if (success) {
      successCount++;
    } else {
      failureCount++;
    }
    
    // Add delay between requests to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n📊 Summary:');
  console.log(`✅ Successfully created: ${successCount} fields`);
  console.log(`❌ Failed to create: ${failureCount} fields`);
  console.log(`⏭️  Already existed: ${customFields.length - fieldsToCreate.length} fields`);
  console.log(`🎯 Total configured: ${customFields.length} fields (MINIMAL SET)`);
  
  if (failureCount === 0) {
    console.log('\n🎉 All minimal custom fields are now set up!');
    console.log('\n⚠️  IMPORTANT: This replaces the bloated 1200+ field script');
    console.log('✅ Only fields actually used by your web app are created');
    console.log('✅ Matches exact naming conventions used in code');
    console.log('✅ Compatible with your Stripe webhook workflows');
  }
}

// Run the script
createAllCustomFields().catch(console.error); 