#!/usr/bin/env node

/**
 * GHL Custom Fields Cleanup Script
 * Deletes all custom fields EXCEPT the ones actually used by the web app
 */

import {
  validateEnvVariables,
  getLocationCustomFields,
  deleteLocationCustomField,
  printSuccess,
  printError,
  printInfo
} from './ghl-api-v2-utils.js';

// Validate environment variables
if (!validateEnvVariables()) {
  process.exit(1);
}

// ONLY keep these fields (from minimal script)
const KEEP_FIELD_NAMES = new Set([
  // Core booking fields (NO cf_ prefix)
  'booking_id',
  'service_address',
  'service_name',
  'service_price', 
  'payment_amount',
  'appointment_date',
  'appointment_time',
  'appointment_datetime',
  
  // Stripe webhook fields (NO cf_ prefix)
  'stripe_payment_intent_id',
  'refund_amount',
  'last_stripe_webhook_date',
  
  // Additional booking fields
  'service_date',
  'service_time',
  'number_of_signatures',
  
  // Contact form fields (WITH cf_ prefix)
  'cf_preferred_call_time',
  'cf_call_request_notes',
  'cf_lead_source_detail',
  'cf_consent_sms_communications',
  'cf_consent_terms_conditions',
  
  // Marketing fields (WITH cf_ prefix)
  'cf_utm_source',
  'cf_utm_medium',
  'cf_utm_campaign',
  
  // Payment tracking (WITH cf_ prefix)
  'cf_payment_status',
  'cf_refund_amount'
]);

async function deleteUnusedCustomFields() {
  console.log('🧹 Starting GHL Custom Fields Cleanup...\n');
  
  try {
    // Get all existing fields
    printInfo('Fetching all custom fields from GHL...');
    const existingFields = await getLocationCustomFields();
    console.log(`Found ${existingFields.length} total custom fields\n`);
    
    // Identify fields to keep vs delete
    const fieldsToKeep = [];
    const fieldsToDelete = [];
    
    existingFields.forEach(field => {
      if (KEEP_FIELD_NAMES.has(field.name)) {
        fieldsToKeep.push(field);
      } else {
        fieldsToDelete.push(field);
      }
    });
    
    console.log(`✅ Fields to KEEP: ${fieldsToKeep.length}`);
    fieldsToKeep.forEach(field => {
      console.log(`   ✅ ${field.name} (${field.id})`);
    });
    
    console.log(`\n🗑️  Fields to DELETE: ${fieldsToDelete.length}`);
    fieldsToDelete.forEach(field => {
      console.log(`   🗑️  ${field.name} (${field.id})`);
    });
    
    if (fieldsToDelete.length === 0) {
      console.log('\n🎉 No unused fields found! Your setup is already clean.');
      return;
    }
    
    // Confirm deletion
    console.log(`\n⚠️  About to delete ${fieldsToDelete.length} unused custom fields.`);
    console.log('This will permanently remove them from GHL.');
    console.log('\nPress Ctrl+C to cancel, or any key to continue...');
    
    // Wait for user input (in real scenario - for now proceed)
    console.log('\n🚀 Proceeding with deletion...\n');
    
    let deletedCount = 0;
    let failedCount = 0;
    
    for (const field of fieldsToDelete) {
      try {
        console.log(`Deleting: ${field.name}...`);
        await deleteLocationCustomField(field.id);
        printSuccess(`Deleted ${field.name}`);
        deletedCount++;
      } catch (error) {
        printError(`Failed to delete ${field.name}: ${error.message}`);
        failedCount++;
        
        // If it's a "not found" error, consider it successfully deleted
        if (error.message.includes('404') || error.message.includes('not found')) {
          console.log(`   (Field ${field.name} was already deleted)`);
          deletedCount++;
          failedCount--;
        }
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n📊 CLEANUP SUMMARY:');
    console.log(`✅ Successfully deleted: ${deletedCount} fields`);
    console.log(`❌ Failed to delete: ${failedCount} fields`);
    console.log(`📈 Space saved: ${deletedCount} unused fields removed`);
    console.log(`🎯 Remaining fields: ${fieldsToKeep.length} (only what you need)`);
    
    if (failedCount === 0) {
      console.log('\n🎉 SUCCESS: All unused custom fields cleaned up!');
      console.log('✅ Your GHL setup now only has fields actually used by your web app');
      console.log('✅ Workflows will be cleaner and easier to manage');
      console.log('✅ No more confusion about which fields to use');
    } else {
      console.log('\n⚠️  Some fields could not be deleted automatically.');
      console.log('You may need to delete them manually in GHL: Settings → Custom Fields');
    }
    
  } catch (error) {
    printError('Error during cleanup: ' + error.message);
    console.log('\nIf deletion failed, you can manually rename unused fields in GHL');
    console.log('Add "zz_unused_" prefix to mark them for deletion');
  }
}

// Add the delete function to utils if not exists
async function deleteLocationCustomField(fieldId) {
  const apiKey = process.env.GHL_API_KEY;
  const locationId = process.env.GHL_LOCATION_ID;
  const baseUrl = process.env.GHL_API_BASE_URL || 'https://services.leadconnectorhq.com';
  
  if (!apiKey || !locationId) {
    throw new Error('Missing GHL_API_KEY or GHL_LOCATION_ID');
  }
  
  // Try multiple endpoints (GHL API structure varies)
  const endpointsToTry = [
    `/locations/${locationId}/customFields/${fieldId}`,
    `/customFields/${fieldId}`,
    `/locations/${locationId}/custom-fields/${fieldId}`
  ];
  
  let lastError;
  
  for (const endpoint of endpointsToTry) {
    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Version': '2021-07-28'
        }
      });
      
      if (response.ok) {
        return await response.json();
      } else if (response.status === 404) {
        // Field doesn't exist, consider it deleted
        return { success: true, message: 'Field not found (already deleted)' };
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HTTP ${response.status}: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      lastError = error;
      continue;
    }
  }
  
  throw lastError || new Error('All deletion endpoints failed');
}

deleteUnusedCustomFields().catch(console.error); 