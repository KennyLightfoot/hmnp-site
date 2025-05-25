#!/usr/bin/env node

/**
 * Script to create all required tags in GoHighLevel using Private Integrations v2 API
 * Creates lead nurturing and booking process tags automatically
 * 
 * Usage: node scripts/create-ghl-tags.js
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

// All required tags organized by category, using Category:Detail format
const requiredTags = {
  // Status Tags (Lead/Booking/Payment/Service)
  status: [
    { name: 'Status:New_Lead' },
    { name: 'Status:Contacted' }, // Implied, used in workflow logic
    { name: 'Status:Hot_Prospect' },
    { name: 'Status:Cold_Lead' }, // Kept from original script
    { name: 'Status:Follow_Up_Needed' }, // Kept from original script, consider if covered by specific workflow tags
    { name: 'Status:Qualified_Lead' }, // Kept from original script
    { name: 'Status:Not_Interested' }, // Kept from original script
    { name: 'Status:Quote_Sent' },
    { name: 'Status:Booking_Requested' },
    { name: 'Status:Booking_Confirmed' },
    { name: 'Status:Booking_Needs_Info' }, // Kept from original script
    { name: 'Status:Booking_Rescheduled' },
    { name: 'Status:Booking_Cancelled' },
    { name: 'Status:No_Show' },
    { name: 'Status:Payment_Pending' },
    { name: 'Status:Payment_Received' }, // Equivalent to payment_completed
    { name: 'Status:Payment_Failed' },
    { name: 'Status:Payment_Partial' }, // Kept from original script (payment_partial)
    { name: 'Status:Payment_Overdue' }, // Kept from original script
    { name: 'Status:Payment_Refunded' }, // Kept from original script
    { name: 'Status:Service_In_Progress' }, // Kept from original script
    { name: 'Status:Service_Completed' },
    { name: 'Status:Ready_For_Service' }, // From GHL Guide
    { name: 'Status:Refund_Requested' } // From GHL Guide
  ],

  // Source Tags
  source: [
    { name: 'Source:Website_Contact_Form' },
    { name: 'Source:Website_Service_Booking_Form' },
    { name: 'Source:Website_Newsletter_Signup' },
    { name: 'Source:GMB_Listing' }, // Google My Business
    { name: 'Source:Google' }, // General Google
    { name: 'Source:Facebook' },
    { name: 'Source:Instagram' },
    { name: 'Source:Email_Campaign' }, // More specific than 'source_email'
    { name: 'Source:Referral' }, // General referral
    // For Source:Referral_[Name], manual creation or a different mechanism might be needed if names are dynamic
    { name: 'Source:Affiliate' },
    { name: 'Source:Yelp' },
    { name: 'Source:Direct_Traffic' }, // More specific than 'source_direct'
    { name: 'Source:Returning_Customer' } // More specific than 'source_returning'
  ],
  
  // Service Type Tags
  service: [
    { name: 'Service:STANDARD_NOTARY' },
    { name: 'Service:LOAN_SIGNING_SPECIALIST' },
    { name: 'Service:EXTENDED_HOURS_NOTARY' },
    { name: 'Service:REAL_ESTATE' }, // Kept from original script (service_real_estate)
    { name: 'Service:RON' }, // Remote Online Notarization, kept from original script
    { name: 'Service:Apostille' }, // Kept from original script (service_apostille)
    { name: 'Service:Multiple_Signers' }, // Kept from original script
    { name: 'Service:Rush_Service' }, // Kept from original script (service_rush)
    { name: 'Service:After_Hours' }, // Kept from original script
    { name: 'Service:Weekend_Service' }, // Kept from original script
    { name: 'Service:Business_Client' }, // Kept from original script (service_business)
    { name: 'Service:Wedding_Officiant' } // Kept from original script (service_wedding)
  ],

  // Workflow & Process Tags
  workflow: [
    { name: 'Workflow:Welcome_Sequence_Started' },
    { name: 'Workflow:Booking_Confirmation_Sent' },
    { name: 'Reminder:24hr_Sent' },
    { name: 'Reminder:2hr_Sent' },
    { name: 'Reminder:1hr_Sent' },
    { name: 'Marketing:Quote_Follow_Up_Complete' },
    { name: 'Marketing:Testimonial_Approved' }
  ],
  
  // Customer & Client Management (Kept distinct category from original script)
  customer: [
    { name: 'Customer:New' },
    { name: 'Customer:Repeat' },
    { name: 'Customer:VIP' },
    { name: 'Customer:Business' }, // Can overlap with Service:Business_Client, consider consolidation if needed
    { name: 'Customer:Individual' },
    { name: 'Customer:Has_Special_Needs' },
    { name: 'Customer:With_Feedback' }, // General feedback tag
    { name: 'Customer:Testimonial_Provided' }, // If different from Marketing:Testimonial_Approved
    { name: 'Customer:Referral_Source' }, // If different from Source:Referral
    { name: 'Customer:Affiliate_Partner' } // If different from Source:Affiliate
  ],
  
  // Payment & Billing Modifiers (Kept distinct category)
  payment: [
    { name: 'Payment:Method_Card' },
    { name: 'Payment:Method_Cash' },
    { name: 'Payment:Method_Check' },
    { name: 'Payment:Method_Transfer' },
    { name: 'Payment:Discount_Applied' },
    { name: 'Payment:Promo_Used' }
  ],
  
  // Feedback & Reviews (Kept distinct category)
  feedback: [
    { name: 'Feedback:Requested' },
    { name: 'Feedback:Provided' }, // General, can be positive or negative
    { name: 'Feedback:Positive' },
    { name: 'Feedback:Negative' },
    { name: 'Review:Request_Sent' },
    { name: 'Review:Completed' }, // Implied, used in workflow logic
    { name: 'Review:Google_Completed' },
    { name: 'Review:Yelp_Completed' }
    // Testimonial_Approved is now under 'workflow' as Marketing:Testimonial_Approved
  ],

  // Risk Tags
  risk: [
    { name: 'Risk:Frequent_No_Show' },
    { name: 'Risk:Payment_Overdue' } // Note: Status:Payment_Overdue also exists. This could be for escalation.
  ],
  
  // Consent Tags (From GHL Guide and original script)
  consent: [
    { name: 'Consent:SMS_Opt_In' }, // From GHL_MASTER_SETUP_GUIDE.md (environment variables)
    { name: 'Consent:Marketing' }, // General marketing consent
    { name: 'Consent:Testimonial' }, // If testimonial can be used
    { name: 'Consent:Data_Sharing' }
  ],

  // Support & Tickets (Kept from original script, may not be in GHL guide but good to have)
  supportTickets: [
    { name: 'Ticket:New' },
    { name: 'Ticket:Pending' },
    { name: 'Ticket:In_Progress' },
    { name: 'Ticket:Resolved' },
    { name: 'Ticket:Billing_Issue' },
    { name: 'Ticket:Service_Issue' },
    { name: 'Ticket:Technical_Issue' },
    { name: 'Ticket:Feedback' }, // Can overlap with Feedback:Provided
    { name: 'Ticket:High_Priority' }
  ],
  
  // Automated Communications (Kept from original script, may not be in GHL guide)
  communications: [
    { name: 'Comm:Email_Sent' },
    { name: 'Comm:Email_Opened' },
    { name: 'Comm:Email_Clicked' },
    { name: 'Comm:Email_Bounced' },
    { name: 'Comm:Email_Unsubscribed' },
    { name: 'Comm:SMS_Sent' },
    { name: 'Comm:SMS_Delivered' },
    { name: 'Comm:SMS_Failed' },
    { name: 'Comm:Voicemail_Sent' },
    { name: 'Comm:Two_Way_Conversation' }
  ],
  
  // Compliance & Documents (Kept from original script, may not be in GHL guide)
  complianceDocuments: [
    { name: 'Doc:Received' },
    { name: 'Doc:Pending' },
    { name: 'Doc:Rejected' },
    { name: 'Doc:Verified' },
    { name: 'Contract:Sent' },
    { name: 'Contract:Signed' }
  ],
  
  // Referral & Affiliate Program (Kept from original script)
  referralProgram: [
    { name: 'Referral:Partner' },
    { name: 'Referral:Submitted' },
    { name: 'Referral:Converted' },
    { name: 'Referral:Rewarded' },
    { name: 'Affiliate:Active' },
    { name: 'Affiliate:Pending' },
    { name: 'Affiliate:Commission_Paid' },
    { name: 'Affiliate:Top_Performer' }
  ],
  
  // RON Platform (Kept from original script)
  ronPlatform: [
    { name: 'RON:Session_Scheduled' },
    { name: 'RON:Session_Completed' },
    { name: 'RON:Session_Cancelled' },
    { name: 'RON:KBA_Passed' },
    { name: 'RON:KBA_Failed' },
    { name: 'RON:IDV_Passed' },
    { name: 'RON:IDV_Failed' }
  ]
  // NOTE: Tags like "Lead Reactivated", "Lead First Contact", "Lead Multiple Inquiries", "Lead Dormant", "Lead Priority"
  // from the original "leadNurturing" category have been integrated into "Status" or might be too granular/workflow-specific.
  // Review if these distinct tags are still needed or if their intent is covered by other Status or Workflow tags.
};

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
    if (result && (result.id || (result.tag && result.tag.id))) {
        console.log(`   ID: ${result.id || result.tag.id}`);
    } else {
        printInfo(`   Tag ${tagData.name} might have been created, but ID not returned in expected format. Verify in GHL.`);
    }
    return true;
    
  } catch (error) {
    // Check if the error is because the tag already exists (often a 400 or 422 with specific message)
    if (error.message && (error.message.includes('already exists') || error.message.includes('Duplicate'))) {
      printInfo(`Tag ${tagData.name} likely already exists or was created in a parallel process: ${error.message}`);
      return true; // Treat as success if it already exists
    }
    printError(`Error creating ${tagData.name}: ${error.message}`);
    return false;
  }
}

async function createAllTags() {
  console.log('\ud83c\udff7\ufe0f  Starting GHL tags creation with Private Integrations v2 API...\n');
  
  printInfo('Checking existing tags...');
  const existingTags = await getExistingTags();
  printInfo(`Found ${existingTags.length} existing tags\n`);

  // Flatten all required tags from the new structure
  const allRequiredTagObjects = Object.values(requiredTags).flat();
  const allRequiredTagNames = allRequiredTagObjects.map(tag => tag.name);

  // Filter out tags that already exist
  const tagsToCreateObjects = allRequiredTagObjects.filter(tagObj => {
    const exists = existingTags.some(existing => 
      existing.name.toLowerCase() === tagObj.name.toLowerCase()
    );
    
    if (exists) {
      console.log(`⏭️  Skipping ${tagObj.name} - already exists`);
      return false;
    }
    return true;
  });

  if (tagsToCreateObjects.length === 0) {
    console.log('\n🎉 All required tags (as per the script and GHL Master Guide review) already exist or are covered!');
    console.log('Your automation workflows should work correctly with these tags.');
    console.log(`\n🏷️ Total tags configured in script: ${allRequiredTagNames.length}`);
    Object.entries(requiredTags).forEach(([categoryKey, tagsArray]) => {
        console.log(`   - ${categoryKey.replace(/([A-Z])/g, ' $1').trim()}: ${tagsArray.length} tags`);
    });
    return;
  }

  console.log(`\n🏷️  Need to create ${tagsToCreateObjects.length} missing tags (or tags with corrected naming convention):\n`);
  
  let successCount = 0;
  let failureCount = 0;

  // Create tags for each category with proper labeling
  const createTagsForCategory = async (tagsArray, displayName) => {
    console.log(`\n${displayName}:`);
    for (const tag of tagsArray) {
      // Check if this specific tag object is in our list of tags to create
      if (tagsToCreateObjects.some(t => t.name === tag.name)) {
        const success = await createTag(tag); // createTag expects an object like { name: 'Tag Name' }
        if (success) successCount++;
        else failureCount++;
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 300)); // 300ms delay
      }
    }
  };

  // Create all tag categories based on the new structure
  for (const [categoryKey, tagsArray] of Object.entries(requiredTags)) {
    // Create a display name from the category key, e.g., "status" -> "📈 Creating Status Tags"
    // This is a simple example; you might want more descriptive names.
    let emoji = '🏷️'; // Default emoji
    if (categoryKey.toLowerCase().includes('status')) emoji = '📊';
    if (categoryKey.toLowerCase().includes('source')) emoji = '📢';
    if (categoryKey.toLowerCase().includes('service')) emoji = '🔧';
    if (categoryKey.toLowerCase().includes('workflow')) emoji = '⚙️';
    if (categoryKey.toLowerCase().includes('customer')) emoji = '👥';
    if (categoryKey.toLowerCase().includes('payment')) emoji = '💲';
    if (categoryKey.toLowerCase().includes('feedback')) emoji = '⭐';
    if (categoryKey.toLowerCase().includes('risk')) emoji = '⚠️';
    if (categoryKey.toLowerCase().includes('consent')) emoji = '📝';


    const displayName = `${emoji} Creating ${categoryKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} Tags`;
    await createTagsForCategory(tagsArray, displayName);
  }


  console.log('\n📊 Summary:');
  console.log(`✅ Successfully created/verified: ${successCount} tags`);
  console.log(`❌ Failed to create: ${failureCount} tags`);
  console.log(`⏭️  Already existed or skipped: ${existingTags.length} (initial) + ${allRequiredTagObjects.length - tagsToCreateObjects.length - successCount} (newly skipped) tags`);
  console.log(`📊 Total tags configured in script: ${allRequiredTagObjects.length}`);
  
  if (failureCount === 0) {
    console.log('\n🎉 All required tags are now set up!');
    console.log('\nNext steps:');
    console.log('1. Verify tags in GHL: Settings > Tags');
    console.log('2. Ensure your workflows in GHL use these exact tag names.');
  } else {
    console.log('\n🔧 Some tags failed to create. Check the errors above.');
    console.log('You may need to create them manually in GHL or re-run the script after addressing issues.');
  }

  // Show tag usage guide
  console.log('\n📋 Tag Usage Guide (based on updated script categories):');
  
  const printTagsForCategory = (categoryName, tagsArray, description) => {
    console.log(`\n${categoryName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} Tags - ${description}:`);
    tagsArray.forEach(tag => {
      console.log(`   🏷️  ${tag.name}`);
    });
  };
  
  printTagsForCategory('status', requiredTags.status, 'For lead, booking, payment, and service status');
  printTagsForCategory('source', requiredTags.source, 'For tracking lead origins');
  printTagsForCategory('service', requiredTags.service, 'For categorizing service offerings');
  printTagsForCategory('workflow', requiredTags.workflow, 'For tracking workflow progress and marketing efforts');
  printTagsForCategory('customer', requiredTags.customer, 'For client segmentation and management');
  printTagsForCategory('payment', requiredTags.payment, 'For billing modifiers and methods');
  printTagsForCategory('feedback', requiredTags.feedback, 'For testimonial and review management');
  printTagsForCategory('risk', requiredTags.risk, 'For identifying at-risk clients or situations');
  printTagsForCategory('consent', requiredTags.consent, 'For managing client consents');
  // Optionally print other categories if desired (supportTickets, communications, etc.)
  
  console.log('\n📝 Tag Usage Best Practices:');
  console.log('1. Apply tags automatically through GHL workflows using these exact names.');
  console.log('2. Use tags as triggers and conditions in GHL workflows.');
  console.log('3. Create saved contact filters in GHL based on these tags for segmentation.');
}

// Run the script
createAllTags().catch(console.error);