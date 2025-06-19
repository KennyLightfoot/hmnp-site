#!/usr/bin/env node

/**
 * MINIMAL GHL Tags Script - Only tags actually used by the web app
 * Based on analysis of actual usage in the codebase
 */

import {
  validateEnvVariables,
  getLocationTags,
  createLocationTag,
  printSuccess,
  printError,
  printInfo
} from './ghl-api-v2-utils.js';

// Validate environment variables
if (!validateEnvVariables()) {
  process.exit(1);
}

// ONLY the tags actually used in the web app
const requiredTags = [
  // ===== STATUS TAGS (EXACT NAMES FROM WEB APP) =====
  { name: 'status:booking_pendingpayment' },  // Core workflow tag
  { name: 'status:payment_completed' },       // Core workflow tag
  { name: 'status:booking_confirmed' },       // Core workflow tag
  { name: 'status:booking_created' },         // Notification tag
  { name: 'status:booking_created_phone' },   // Phone booking specific
  { name: 'status:referred_client' },         // Referral tracking

  // ===== SERVICE TAGS =====
  { name: 'service:standard_mobile_notary' },
  { name: 'service:loan_signing_specialist' },
  { name: 'service:extended_hours_notary' },
  { name: 'Service:Emergency' },              // Workflow format
  { name: 'Priority:Same_Day' },              // Workflow format

  // ===== SOURCE TAGS =====
  { name: 'source:website_booking' },         // Primary source
  { name: 'Source:Website_Contact_Form' },    // Workflow format

  // ===== STRIPE WEBHOOK TAGS =====
  { name: 'stripe:payment_completed' },       // Stripe webhook processor
  { name: 'stripe:payment_failed' },          // Stripe webhook processor
  { name: 'stripe:refund_processed' },        // Stripe webhook processor
  { name: 'stripe:webhook_processed' },       // Cleanup tag

  // ===== WORKFLOW ACTION TAGS =====
  { name: 'priority:high_touch' },            // Phone bookings
  { name: 'Action:Payment_Required' },        // Workflow format
  { name: 'Action:Customer_Contacted' },      // Workflow format

  // ===== CONSENT TAGS =====
  { name: 'consent:sms_opt_in' },
  { name: 'consent:marketing_opt_in' },
  { name: 'Consent:SMS_Opt_In' },             // Workflow format
  { name: 'Consent:Marketing_Opt_In' },       // Workflow format

  // ===== CLIENT TAGS =====
  { name: 'client:first_time' },
  { name: 'Client:First_Time' },              // Workflow format
  { name: 'Client:Returning' },               // Workflow format

  // ===== DISCOUNT TAGS =====
  { name: 'discount:applied' },
  { name: 'discount:firsttime_applied' },

  // ===== LOCATION TAGS =====
  { name: 'location:client_specified_address' },

  // ===== PAYMENT TAGS =====
  { name: 'payment:failed' },                // Payment failure tracking

  // ===== URGENCY TAGS =====
  { name: 'urgency:new' },
  { name: 'urgency:medium' },
  { name: 'urgency:high' },
  { name: 'urgency:critical' },

  // ===== LEAD TAGS =====
  { name: 'Lead_Status:New_Inquiry' }         // Contact form workflow
];

async function getExistingTags() {  
  try {
    const data = await getLocationTags();
    return data.tags || [];
  } catch (error) {
    console.error('Error fetching existing tags:', error);
    return [];
  }
}

async function createTag(tagData) {
  try {
    console.log(`Creating tag: ${tagData.name}...`);
    
    const result = await createLocationTag(tagData.name);
    printSuccess(`Created tag: ${tagData.name}`);
    return true;
    
  } catch (error) {
    if (error.message && error.message.includes('already exists')) {
      printInfo(`Tag ${tagData.name} already exists`);
      return true;
    }
    printError(`Error creating ${tagData.name}: ${error.message}`);
    return false;
  }
}

async function createAllTags() {
  console.log('🎯 Creating MINIMAL GHL Tags (only used tags)...\n');
  
  const existingTags = await getExistingTags();
  console.log(`Found ${existingTags.length} existing tags\n`);

  const tagsToCreate = requiredTags.filter(tagObj => {
    const exists = existingTags.some(existing => 
      existing.name.toLowerCase() === tagObj.name.toLowerCase()
    );
    
    if (exists) {
      console.log(`⏭️  Skipping ${tagObj.name} - already exists`);
      return false;
    }
    return true;
  });

  console.log(`\n📝 Creating ${tagsToCreate.length} new tags:\n`);
  
  let successCount = 0;
  let failureCount = 0;

  for (const tag of tagsToCreate) {
    const success = await createTag(tag);
    if (success) successCount++;
    else failureCount++;
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  console.log('\n📊 SUMMARY:');
  console.log(`✅ Created: ${successCount} tags`);
  console.log(`❌ Failed: ${failureCount} tags`);
  console.log(`🎯 Total: ${requiredTags.length} tags (vs 599 in old script)`);
  
  if (failureCount === 0) {
    console.log('\n🎉 SUCCESS: All minimal tags created!');
    console.log('✅ Only tags actually used by your web app');
    console.log('✅ Compatible with Stripe webhook workflows');
    console.log('✅ Includes both lowercase and workflow format variants');
    console.log('\n🔧 Tag Categories:');
    console.log('   - Status tags: Core booking status tracking');
    console.log('   - Service tags: Service type identification');
    console.log('   - Source tags: Lead source tracking');
    console.log('   - Stripe tags: Payment webhook processing');
    console.log('   - Workflow tags: GHL automation triggers');
    console.log('   - Consent tags: Compliance tracking');
  }
}

createAllTags().catch(console.error); 