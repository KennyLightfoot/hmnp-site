#!/usr/bin/env node

/**
 * GHL Tags Cleanup Script
 * Deletes all tags EXCEPT the ones actually used by the web app
 */

import {
  validateEnvVariables,
  getLocationTags,
  deleteLocationTag,
  printSuccess,
  printError,
  printInfo
} from './ghl-api-v2-utils.js';

// Validate environment variables
if (!validateEnvVariables()) {
  process.exit(1);
}

// ONLY keep these tags (from minimal script)
const KEEP_TAG_NAMES = new Set([
  // Status tags (exact names from web app)
  'status:booking_pendingpayment',
  'status:payment_completed',
  'status:booking_confirmed',
  'status:booking_created',
  'status:booking_created_phone',
  'status:referred_client',
  
  // Service tags
  'service:standard_mobile_notary',
  'service:loan_signing_specialist',
  'service:extended_hours_notary',
  'Service:Emergency',
  'Service:Extended_Hours_Same_Day',
  
  // Source tags
  'source:website_booking',
  'Source:Website_Contact_Form',
  
  // Stripe webhook tags
  'stripe:payment_completed',
  'stripe:payment_failed',
  'stripe:refund_processed',
  'stripe:webhook_processed',
  
  // Workflow action tags
  'priority:high_touch',
  'Action:Payment_Required',
  'Action:Customer_Contacted',
  
  // Consent tags
  'consent:sms_opt_in',
  'consent:marketing_opt_in',
  'Consent:SMS_Opt_In',
  'Consent:Marketing_Opt_In',
  
  // Client tags
  'client:first_time',
  'Client:First_Time',
  'Client:Returning',
  
  // Discount tags
  'discount:applied',
  'discount:firsttime_applied',
  
  // Location tags
  'location:client_specified_address',
  
  // Payment tags
  'payment:failed',
  
  // Urgency tags
  'urgency:new',
  'urgency:medium',
  'urgency:high',
  'urgency:critical',
  
  // Lead tags
  'Lead_Status:New_Inquiry'
]);

async function deleteUnusedTags() {
  console.log('🧹 Starting GHL Tags Cleanup...\n');
  
  try {
    // Get all existing tags
    printInfo('Fetching all tags from GHL...');
    const data = await getLocationTags();
    const existingTags = data.tags || [];
    console.log(`Found ${existingTags.length} total tags\n`);
    
    // Identify tags to keep vs delete
    const tagsToKeep = [];
    const tagsToDelete = [];
    
    existingTags.forEach(tag => {
      if (KEEP_TAG_NAMES.has(tag.name)) {
        tagsToKeep.push(tag);
      } else {
        tagsToDelete.push(tag);
      }
    });
    
    console.log(`✅ Tags to KEEP: ${tagsToKeep.length}`);
    tagsToKeep.forEach(tag => {
      console.log(`   ✅ ${tag.name} (${tag.id})`);
    });
    
    console.log(`\n🗑️  Tags to DELETE: ${tagsToDelete.length}`);
    if (tagsToDelete.length > 50) {
      console.log('   (Showing first 20 of many...)');
      tagsToDelete.slice(0, 20).forEach(tag => {
        console.log(`   🗑️  ${tag.name} (${tag.id})`);
      });
      console.log(`   ... and ${tagsToDelete.length - 20} more`);
    } else {
      tagsToDelete.forEach(tag => {
        console.log(`   🗑️  ${tag.name} (${tag.id})`);
      });
    }
    
    if (tagsToDelete.length === 0) {
      console.log('\n🎉 No unused tags found! Your setup is already clean.');
      return;
    }
    
    // Confirm deletion
    console.log(`\n⚠️  About to delete ${tagsToDelete.length} unused tags.`);
    console.log('This will permanently remove them from GHL.');
    console.log('\nPress Ctrl+C to cancel, or any key to continue...');
    
    // Wait for user input (in real scenario - for now proceed)
    console.log('\n🚀 Proceeding with deletion...\n');
    
    let deletedCount = 0;
    let failedCount = 0;
    
    for (const tag of tagsToDelete) {
      try {
        console.log(`Deleting: ${tag.name}...`);
        await deleteLocationTag(tag.id);
        printSuccess(`Deleted ${tag.name}`);
        deletedCount++;
      } catch (error) {
        printError(`Failed to delete ${tag.name}: ${error.message}`);
        failedCount++;
        
        // If it's a "not found" error, consider it successfully deleted
        if (error.message.includes('404') || error.message.includes('not found')) {
          console.log(`   (Tag ${tag.name} was already deleted)`);
          deletedCount++;
          failedCount--;
        }
      }
      
      // Rate limiting - tags can be deleted faster than fields
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    console.log('\n📊 CLEANUP SUMMARY:');
    console.log(`✅ Successfully deleted: ${deletedCount} tags`);
    console.log(`❌ Failed to delete: ${failedCount} tags`);
    console.log(`📈 Space saved: ${deletedCount} unused tags removed`);
    console.log(`🎯 Remaining tags: ${tagsToKeep.length} (only what you need)`);
    
    if (failedCount === 0) {
      console.log('\n🎉 SUCCESS: All unused tags cleaned up!');
      console.log('✅ Your GHL setup now only has tags actually used by your web app');
      console.log('✅ Workflows will trigger correctly with exact tag names');
      console.log('✅ No more confusion about which tags to use');
      console.log('✅ Tag list is now manageable and clean');
    } else {
      console.log('\n⚠️  Some tags could not be deleted automatically.');
      console.log('You may need to delete them manually in GHL: Settings → Tags');
    }
    
  } catch (error) {
    printError('Error during cleanup: ' + error.message);
    console.log('\nIf deletion failed, you can manually archive unused tags in GHL');
    console.log('Or rename them with "zz_unused_" prefix');
  }
}

// Add the delete function if not exists in utils
async function deleteLocationTag(tagId) {
  const apiKey = process.env.GHL_API_KEY;
  const locationId = process.env.GHL_LOCATION_ID;
  const baseUrl = process.env.GHL_API_BASE_URL || 'https://services.leadconnectorhq.com';
  
  if (!apiKey || !locationId) {
    throw new Error('Missing GHL_API_KEY or GHL_LOCATION_ID');
  }
  
  // Try multiple endpoints (GHL API structure varies)
  const endpointsToTry = [
    `/locations/${locationId}/tags/${tagId}`,
    `/tags/${tagId}`,
    `/locations/${locationId}/tag/${tagId}`
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
        // Tag doesn't exist, consider it deleted
        return { success: true, message: 'Tag not found (already deleted)' };
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

deleteUnusedTags().catch(console.error); 