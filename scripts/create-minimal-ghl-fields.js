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
  printError
} from './ghl-api-v2-utils.js';

// Validate environment variables
if (!validateEnvVariables()) {
  process.exit(1);
}

// ONLY the custom fields actually used in the web app
const customFields = [
  // ===== CORE BOOKING FIELDS (EXACT NAMES FROM WEB APP) =====
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

  // ===== WORKFLOW FIELDS (STRIPE WEBHOOK) =====
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

  // ===== ADDITIONAL BOOKING FIELDS =====
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
    placeholder: 'Number of signers'
  },

  // ===== CONTACT FORM FIELDS =====
  {
    name: 'cf_preferred_call_time',
    dataType: 'TEXT',
    position: 15,
    placeholder: 'Preferred call time'
  },
  {
    name: 'cf_call_request_notes',
    dataType: 'LARGE_TEXT',
    position: 16,
    placeholder: 'Call request notes'
  },
  {
    name: 'cf_lead_source_detail',
    dataType: 'TEXT',
    position: 17,
    placeholder: 'Lead source details'
  },
  {
    name: 'cf_consent_sms_communications',
    dataType: 'TEXT',
    position: 18,
    placeholder: 'Yes/No'
  },
  {
    name: 'cf_consent_terms_conditions',
    dataType: 'TEXT',
    position: 19,
    placeholder: 'Yes/No'
  },

  // ===== MARKETING FIELDS =====
  {
    name: 'cf_utm_source',
    dataType: 'TEXT',
    position: 20,
    placeholder: 'UTM source'
  },
  {
    name: 'cf_utm_medium',
    dataType: 'TEXT',
    position: 21,
    placeholder: 'UTM medium'
  },
  {
    name: 'cf_utm_campaign',
    dataType: 'TEXT',
    position: 22,
    placeholder: 'UTM campaign'
  },

  // ===== PAYMENT TRACKING =====
  {
    name: 'cf_payment_status',
    dataType: 'TEXT',
    position: 23,
    placeholder: 'PENDING, COMPLETED, FAILED'
  },
  {
    name: 'cf_refund_amount',
    dataType: 'MONETORY',
    position: 24,
    placeholder: '0.00'
  },

  // ===== REFUND WORKFLOW FIELDS (FOR EMAIL TEMPLATES) =====
  {
    name: 'original_payment_date',
    dataType: 'DATE',
    position: 25,
    placeholder: 'Date of original payment'
  },
  {
    name: 'refund_processed_date',
    dataType: 'DATE',
    position: 26,
    placeholder: 'Date refund was processed'
  },
  {
    name: 'payment_method',
    dataType: 'TEXT',
    position: 27,
    placeholder: 'Credit Card, Debit Card, etc.'
  },
  {
    name: 'last_four_digits',
    dataType: 'TEXT',
    position: 28,
    placeholder: 'Last 4 digits of payment method'
  },
  {
    name: 'transaction_id',
    dataType: 'TEXT',
    position: 29,
    placeholder: 'Unique transaction identifier'
  },
  {
    name: 'refund_reason',
    dataType: 'TEXT',
    position: 30,
    placeholder: 'Reason for refund'
  },
  {
    name: 'service_type',
    dataType: 'TEXT',
    position: 31,
    placeholder: 'Type of service (maps to service_name for templates)'
  },

  // ===== FAILED PAYMENT WORKFLOW FIELDS =====
  {
    name: 'failure_reason',
    dataType: 'TEXT',
    position: 32,
    placeholder: 'Payment failure reason'
  },
  {
    name: 'payment_update_link',
    dataType: 'TEXT',
    position: 33,
    placeholder: 'URL to update payment method'
  },
  {
    name: 'appointment_location',
    dataType: 'LARGE_TEXT',
    position: 34,
    placeholder: 'Full appointment location details'
  }
];

async function createAllCustomFields() {
  console.log('🎯 Creating MINIMAL GHL Custom Fields (only used fields)...\n');
  
  let fieldsToCreate = [];
  
  try {
    const response = await getLocationCustomFields();
    const existingFields = response?.customFields || response || [];
    console.log(`Found ${Array.isArray(existingFields) ? existingFields.length : 0} existing fields\n`);

    fieldsToCreate = customFields.filter(field => {
      if (!Array.isArray(existingFields)) {
        console.log(`⚠️  Warning: Could not check existing fields, will attempt to create ${field.name}`);
        return true;
      }
      
      const exists = existingFields.some(existing => 
        existing.name === field.name || existing.key === field.name
      );
      
      if (exists) {
        console.log(`⏭️  Skipping ${field.name} - already exists`);
        return false;
      }
      return true;
    });
  } catch (error) {
    console.log(`⚠️  Warning: Could not fetch existing fields (${error.message}), will attempt to create all fields\n`);
    fieldsToCreate = customFields;
  }

  console.log(`\n📝 Creating ${fieldsToCreate.length} new fields:\n`);
  
  let successCount = 0;
  let failureCount = 0;

  for (const field of fieldsToCreate) {
    try {
      console.log(`Creating: ${field.name}...`);
      await createLocationCustomField(field);
      printSuccess(`Created ${field.name}`);
      successCount++;
    } catch (error) {
      printError(`Failed to create ${field.name}: ${error.message}`);
      failureCount++;
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n📊 SUMMARY:');
  console.log(`✅ Created: ${successCount} fields`);
  console.log(`❌ Failed: ${failureCount} fields`);
  console.log(`🎯 Total: ${customFields.length} fields (vs 1200+ in old script)`);
  
  if (failureCount === 0) {
    console.log('\n🎉 SUCCESS: All minimal fields created!');
    console.log('✅ Only fields actually used by your web app');
    console.log('✅ Compatible with Stripe webhook workflows');
    console.log('✅ Matches exact naming from your codebase');
  }
}

createAllCustomFields().catch(console.error); 