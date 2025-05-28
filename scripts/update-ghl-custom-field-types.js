#!/usr/bin/env node

import 'dotenv/config';

// Assuming ghl-api-v2-utils.js exists in the same directory and exports these:
// import { validateEnvVariables, getLocationCustomFields } from './ghl-api-v2-utils.js';

// --- Start: Minimal GHL API Utils (define if not available from shared utils) ---
const GHL_API_BASE_URL = process.env.GHL_API_BASE_URL;
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;
const GHL_API_KEY = process.env.GHL_API_KEY;

function validateEnvVariables() {
  const required = ['GHL_API_BASE_URL', 'GHL_API_KEY', 'GHL_LOCATION_ID'];
  const missing = required.filter(v => !process.env[v]);
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(v => console.error(`   - ${v}`));
    return false;
  }
  return true;
}

async function getLocationCustomFields() {
  const url = `${GHL_API_BASE_URL}/locations/${GHL_LOCATION_ID}/customFields`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${GHL_API_KEY}`,
      'Content-Type': 'application/json',
      'Version': '2021-07-28'
    }
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(`Failed to fetch custom fields: ${response.status} - ${errorData.message || response.statusText}`);
  }
  return await response.json();
}

async function updateLocationCustomField(customFieldId, fieldData) {
  const url = `${GHL_API_BASE_URL}/locations/${GHL_LOCATION_ID}/customFields/${customFieldId}`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${GHL_API_KEY}`,
      'Content-Type': 'application/json',
      'Version': '2021-07-28'
    },
    body: JSON.stringify(fieldData)
  });
  if (!response.ok) {
    let errorDetails = await response.text(); // Start with text
    try { errorDetails = JSON.parse(errorDetails); } catch (e) { /* not JSON, keep as text */ }
    console.error(`Raw error response for field ID ${customFieldId}:`, errorDetails);
    throw new Error(`Failed to update custom field ID ${customFieldId}: ${response.status} ${response.statusText}`);
  }
  return await response.json();
}
// --- End: Minimal GHL API Utils ---

if (!validateEnvVariables()) {
  process.exit(1);
}

function generateOptionKey(name) {
  return name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
}

const fieldsToUpdateConfig = [
  {
    name: 'cf_booking_appointment_datetime',
    targetDataType: 'TEXT',
  },
  {
    name: 'cf_payment_status',
    targetDataType: 'SINGLE_OPTIONS',
    options: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED', 'CANCELLED'],
  },
  {
    name: 'cf_consent_display_testimonial',
    targetDataType: 'SINGLE_OPTIONS',
    options: ['Yes', 'No'],
  },
  {
    name: 'cf_last_service_type',
    targetDataType: 'SINGLE_OPTIONS',
    options: ['General Notary', 'Loan Signing', 'Apostille', 'Mobile Notary', 'RON Service', 'Other'],
  },
  {
    name: 'cf_refund_status',
    targetDataType: 'SINGLE_OPTIONS',
    options: ['REQUESTED', 'APPROVED', 'PROCESSING', 'PROCESSED', 'COMPLETED', 'DENIED', 'CANCELLED'],
  },
  {
    name: 'cf_onboarding_documents_received',
    targetDataType: 'SINGLE_OPTIONS',
    options: ['Yes', 'No', 'Pending', 'Not Applicable'],
  },
  {
    name: 'cf_ron_session_status',
    targetDataType: 'SINGLE_OPTIONS',
    options: ['PENDING_SCHEDULE', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'FAILED_KBA_IDV', 'EXPIRED', 'NO_SHOW'],
  },
  {
    name: 'cf_ron_kba_status',
    targetDataType: 'SINGLE_OPTIONS',
    options: ['NOT_STARTED', 'PASSED', 'FAILED', 'PENDING_RETRY', 'SKIPPED', 'UNABLE_TO_COMPLETE'],
  },
  {
    name: 'cf_ron_idv_status',
    targetDataType: 'SINGLE_OPTIONS',
    options: ['NOT_STARTED', 'PASSED', 'FAILED', 'PENDING_MANUAL_REVIEW', 'SKIPPED', 'UNABLE_TO_COMPLETE'],
  }
];

async function main() {
  console.log('🔄 Starting custom field type update process...');
  let existingFields;
  try {
    const data = await getLocationCustomFields();
    existingFields = data.customFields || [];
    console.log(`🔍 Found ${existingFields.length} existing custom fields.`);
  } catch (error) {
    console.error('❌ Error fetching existing custom fields:', error.message);
    process.exit(1);
  }

  for (const config of fieldsToUpdateConfig) {
    const fieldToUpdate = existingFields.find(f => f.name === config.name || f.key === config.name);

    if (!fieldToUpdate) {
      console.warn(`⚠️ Field "${config.name}" not found in GHL. Skipping update.`);
      continue;
    }

    // Basic check to see if update is even needed for dataType
    // More sophisticated check would compare options arrays deeply if targetDataType is already SINGLE_OPTIONS
    if (fieldToUpdate.dataType === config.targetDataType && !config.options) {
        console.log(`🆗 Field "${config.name}" (ID: ${fieldToUpdate.id}) is already dataType "${config.targetDataType}". Skipping options check for non-option type.`);
        continue;
    }
     if (fieldToUpdate.dataType === config.targetDataType && config.options) {
        // If type is the same and options are configured, we might still want to update options
        // For simplicity here, we'll proceed to update if options are in config
        // A better check would compare existing options with new options
        console.log(`ℹ️ Field "${config.name}" (ID: ${fieldToUpdate.id}) is already dataType "${config.targetDataType}". Will check/update options.`);
    }


    console.log(`\n🔧 Processing field "${config.name}" (ID: ${fieldToUpdate.id}):`);
    console.log(`   Current dataType: ${fieldToUpdate.dataType}`);
    console.log(`   Target dataType: ${config.targetDataType}`);

    // Construct a new payload with only specific fields allowed for PUT
    const putPayload = {
      name: fieldToUpdate.name, // Usually required
      dataType: config.targetDataType, // The new data type
      model: fieldToUpdate.model || 'contact', // Default to 'contact' if not present
    };

    // Include placeholder and position if they exist on the original field,
    // as we don't want to accidentally unset them if they are not changing.
    if (fieldToUpdate.placeholder !== undefined && fieldToUpdate.placeholder !== null) {
      putPayload.placeholder = fieldToUpdate.placeholder;
    }
    if (fieldToUpdate.position !== undefined && fieldToUpdate.position !== null) {
      putPayload.position = fieldToUpdate.position;
    }

    if (config.targetDataType === 'SINGLE_OPTIONS' || config.targetDataType === 'RADIO' || config.targetDataType === 'CHECKBOX_MULTIPLE') {
      if (config.options) {
        putPayload.options = config.options;
        console.log(`   Setting options to: ${JSON.stringify(config.options)}`);
      } else {
        putPayload.options = []; // Default to empty options if target is an option type but no options specified
        console.log(`   Target dataType is an option type, but no options provided in config. Setting empty options array.`);
      }
    } else {
      // If target is not an options type, ensure options is not sent or is empty.
      // GHL might require options to be explicitly cleared if changing from an options type.
      if (['SINGLE_OPTIONS', 'RADIO', 'CHECKBOX_MULTIPLE'].includes(fieldToUpdate.dataType)) {
        putPayload.options = [];
        console.log('   Clearing existing options as dataType is changing from an options type to a non-options type.');
      }
      // If both current and target are non-option types, 'options' property should not be added to putPayload here.
    }
    
    // Remove properties that shouldn't be in PUT payload or are read-only
    // delete payload.id; // ID is in URL, not body for GHL PUT - not needed as putPayload is new
    // delete payload.createdAt; - not needed
    // delete payload.updatedAt; - not needed
    // delete payload.deletedAt; // if present - not needed
    
    // payload.model = fieldToUpdate.model || 'contact'; // Ensure model is set - already done for putPayload

    try {
      await updateLocationCustomField(fieldToUpdate.id, putPayload); // Use putPayload
      console.log(`   ✅ Successfully updated "${config.name}" to dataType "${config.targetDataType}".`);
    } catch (error) {
      console.error(`   ❌ Error updating "${config.name}": ${error.message}`);
    }
    await new Promise(resolve => setTimeout(resolve, 1100)); // Rate limit (slightly over 1s)
  }
  console.log('\n🏁 Custom field type update process finished.');
}

main().catch(error => {
  console.error('💥 Unhandled error in main process:', error.message);
  // console.error(error); // For more detailed stack trace if needed
  process.exit(1);
}); 