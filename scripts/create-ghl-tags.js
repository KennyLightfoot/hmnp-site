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
    { name: 'status:new_lead' },
    { name: 'status:contact_form_submitted' }, // Added for General Contact Workflow
    { name: 'status:call_requested' }, // Added for Request a Call Workflow
    { name: 'status:contacted' }, // Implied, used in workflow logic
    { name: 'status:hot_prospect' },
    { name: 'status:cold_lead' }, // Kept from original script
    { name: 'status:follow_up_needed' }, // Kept from original script, consider if covered by specific workflow tags
    { name: 'status:qualified_lead' }, // Kept from original script
    { name: 'status:not_interested' }, // Kept from original script
    { name: 'status:quote_sent' },
    { name: 'status:booking_requested' },
    { name: 'status:booking_confirmed' }, // EXACT match for booking system
    { name: 'status:booking_pendingpayment' }, // EXACT match for booking system
    { name: 'status:payment_expired' }, // For workflows - when payment times out
    { name: 'status:referred_client' }, // EXACT match for booking system
    { name: 'status:booking_needs_info' }, // Kept from original script
    { name: 'status:booking_rescheduled' },
    { name: 'status:booking_cancelled' },
    { name: 'status:no_show' },
    { name: 'status:payment_pending' },
    { name: 'status:payment_received' }, // Equivalent to payment_completed
    { name: 'status:payment_failed' },
    { name: 'status:payment_partial' }, // Kept from original script (payment_partial)
    { name: 'status:payment_overdue' }, // Kept from original script
    { name: 'status:payment_refunded' }, // Kept from original script
    { name: 'status:service_in_progress' }, // Kept from original script
    { name: 'status:service_completed' },
    { name: 'status:ready_for_service' }, // From GHL Guide
    { name: 'status:refund_requested' }, // From GHL Guide
    { name: 'status:booking_abandoned' },
    { name: 'status:testimonial_requested' },
    { name: 'status:testimonial_received' },
    { name: 'status:nurture' },
    { name: 'status:re_engagement' },
    { name: 'status:unsubscribed' },
    { name: 'status:escalated' },
    { name: 'status:manual_review' },
    { name: 'status:internal_followup' },
    // NEW WORKFLOW TAGS
    { name: 'status:quote_requested' },
    { name: 'status:payment_failed' },
    { name: 'status:payment_completed' },
    { name: 'status:service_scheduled' },
    { name: 'status:nurture_general' },
    { name: 'status:no_action_taken' },
    { name: 'status:reschedule_requested' },
    { name: 'status:rescheduled_confirmed' },
    { name: 'status:reschedule_abandoned' },
    { name: 'status:lost_customer' },
    // WORKFLOW-SPECIFIC STATUS TAGS
    { name: 'status:booking_created_phone' },
    { name: 'status:booking_created' }, // Missing from workflows
    { name: 'no_pending_payment' }  // Special tag used in workflows
  ],

  // Source Tags
  source: [
    { name: 'source:website_contact_form' },
    { name: 'source:website_request_call_form' }, // Added for Request a Call Workflow
    { name: 'source:website_service_booking_form' },
    { name: 'source:website_booking' }, // EXACT match for booking system
    { name: 'source:website_newsletter_signup' },
    { name: 'source:gmb_listing' }, // Google My Business
    { name: 'source:google' }, // General Google
    { name: 'source:facebook' },
    { name: 'source:instagram' },
    { name: 'source:email_campaign' }, // More specific than 'source_email'
    { name: 'source:referral' }, // General referral
    // For source:referral_[name], manual creation or a different mechanism might be needed if names are dynamic
    { name: 'source:affiliate' },
    { name: 'source:yelp' },
    { name: 'source:direct_traffic' }, // More specific than 'source_direct'
    { name: 'source:returning_customer' }, // More specific than 'source_returning'
    // NEW WORKFLOW SOURCE TAGS
    { name: 'source:facebook_ads' },
    { name: 'source:google_ads' },
    { name: 'source:instagram_ads' },
    { name: 'source:lead_magnet' },
    { name: 'source:website_visitor' },
    { name: 'source:contact_form' }, // EXACT match from workflows
    // GHL Workflow Format (with capital letters and colons)
    { name: 'Source:Website_Booking' } // EXACT match from workflows
  ],
  
  // Service Type Tags
  service: [
    { name: 'service:standard_mobile_notary' }, // EXACT match for booking system
    { name: 'service:loan_signing_specialist' }, // EXACT match for booking system
    { name: 'service:extended_hours_notary' }, // EXACT match for booking system
    { name: 'service:completed' }, // For workflows - manually added after appointments
    { name: 'service:real_estate' }, // Kept from original script (service_real_estate)
    { name: 'service:ron' }, // Remote Online Notarization, kept from original script
    { name: 'service:apostille' }, // Kept from original script (service_apostille)
    { name: 'service:multiple_signers' }, // Kept from original script
    { name: 'service:rush_service' }, // Kept from original script (service_rush)
    { name: 'service:after_hours' }, // Kept from original script
    { name: 'service:weekend_service' }, // Kept from original script
    { name: 'service:business_client' }, // Kept from original script (service_business)
    { name: 'service:wedding_officiant' }, // Kept from original script (service_wedding)
    // NEW WORKFLOW SERVICE TAGS
    { name: 'service:emergency' },
    { name: 'priority:same_day' },
    // GHL Workflow Format (with capital letters and colons)
    { name: 'Service:Standard_Mobile_Notary' }, // EXACT match from workflows
    { name: 'Service:Loan_Signing_Specialist' }, // EXACT match from workflows
    { name: 'Service:Extended_Hours_Notary' }, // EXACT match from workflows
    { name: 'Service:Emergency' }, // EXACT match from workflows
    { name: 'Priority:Same_Day' } // EXACT match from workflows
  ],

  // Workflow & Process Tags
  workflow: [
    { name: 'workflow:welcome_sequence_started' },
    { name: 'workflow:booking_confirmation_sent' },
    { name: 'workflow:confirmation_sent' }, // For workflows - booking confirmation tracking
    { name: 'workflow:payment_reminder_sent' }, // EXACT match from workflows
    { name: 'workflow:24hr_reminder_scheduled' }, // Missing from workflows
    { name: 'workflow:2hr_reminder_scheduled' }, // Missing from workflows
    { name: 'workflow:complete_booking_system_finished' }, // Missing from workflows
    { name: 'reminder:24hr_needed' }, // For workflows - manually added 24hrs before appointment
    { name: 'reminder:2hr_needed' }, // For workflows - manually added 2hrs before appointment
    { name: 'reminder:24hr_sent' },
    { name: 'reminder:2hr_sent' },
    { name: 'reminder:1hr_sent' },
    // GHL Workflow Format (with capital letters and colons)
    { name: 'Reminder:24hr_Needed' }, // EXACT match from workflows
    { name: 'Reminder:24hr_Sent' }, // EXACT match from workflows
    { name: 'Reminder:2hr_Needed' }, // EXACT match from workflows
    { name: 'Reminder:2hr_Sent' }, // EXACT match from workflows
    { name: 'marketing:quote_follow_up_complete' },
    { name: 'marketing:testimonial_approved' },
    // NEW WORKFLOW TRACKING TAGS
    { name: 'workflow:ad_nurture_started' },
    { name: 'workflow:quote_sent' },
    { name: 'workflow:payment_followup_sent' }
  ],
  
  // Customer & Client Management (Kept distinct category from original script)
  customer: [
    { name: 'client:first_time' }, // EXACT match for booking system
    { name: 'client:returning' }, // For workflows - manually added for repeat customers
    { name: 'customer:new' },
    { name: 'customer:repeat' },
    { name: 'customer:vip' },
    { name: 'customer:business' }, // Can overlap with service:business_client, consider consolidation if needed
    { name: 'customer:individual' },
    { name: 'customer:has_special_needs' },
    { name: 'customer:with_feedback' }, // General feedback tag
    { name: 'customer:testimonial_provided' }, // If different from marketing:testimonial_approved
    { name: 'customer:referral_source' }, // If different from source:referral
    { name: 'customer:affiliate_partner' }, // If different from source:affiliate
    // GHL Workflow Format (with capital letters and colons)
    { name: 'Client:First_Time' }, // EXACT match from workflows
    { name: 'Client:Returning' } // EXACT match from workflows
  ],
  
  // Payment & Billing Modifiers (Kept distinct category)
  payment: [
    { name: 'payment:method_card' },
    { name: 'payment:method_cash' },
    { name: 'payment:method_check' },
    { name: 'payment:method_transfer' },
    { name: 'payment:discount_applied' },
    { name: 'payment:promo_used' },
    // --- Added for full workflow coverage ---
    { name: 'payment:deposit' },
    { name: 'payment:full' },
    { name: 'payment:rescheduling_fee_due' }, // Missing from workflows
    { name: 'payment:second_reminder_sent' }, // Missing from workflows
    { name: 'payment:requires_manual_intervention' }, // Missing from workflows
    { name: 'payment:failed_attempt' }, // Missing from workflows
    { name: 'payment_failed:urgent' }, // Missing from workflows
    { name: 'payment_failed:high' }, // Missing from workflows
    { name: 'payment_failed:standard' } // Missing from workflows
  ],

  // Location & Geography Tags (For booking system)
  location: [
    { name: 'location:client_specified_address' }, // EXACT match for booking system
    { name: 'location:our_office' },
    { name: 'location:remote_online_notarization' },
    { name: 'location:public_place' }
  ],

  // Discount & Promo Tags (For booking system)
  discount: [
    { name: 'discount:applied' }, // EXACT match for booking system
    { name: 'promo:first25' }, // EXACT match for booking system
    { name: 'promo:generic' } // Generic promo tag
  ],
  
  // Feedback & Reviews (Kept distinct category)
  feedback: [
    { name: 'feedback:requested' },
    { name: 'feedback:provided' }, // General, can be positive or negative
    { name: 'feedback:positive' },
    { name: 'feedback:negative' },
    { name: 'review:request_sent' },
    { name: 'review:completed' }, // Implied, used in workflow logic
    { name: 'review:google_completed' },
    { name: 'review:yelp_completed' },
    // --- Added for full workflow coverage ---
    { name: 'feedback:display_consent' }
    // testimonial_approved is now under 'workflow' as marketing:testimonial_approved
  ],

  // Risk Tags
  risk: [
    { name: 'risk:frequent_no_show' },
    { name: 'risk:payment_overdue' } // Note: status:payment_overdue also exists. This could be for escalation.
  ],
  
  // Consent Tags (From GHL Guide and original script)
  consent: [
    { name: 'consent:sms_opt_in' }, // EXACT match for booking system
    { name: 'consent:marketing_opt_in' }, // EXACT match for booking system
    { name: 'consent:marketing' }, // General marketing consent
    { name: 'consent:testimonial' }, // If testimonial can be used
    { name: 'consent:data_sharing' },
    // GHL Workflow Format (with capital letters and colons)
    { name: 'Consent:SMS_Opt_In' }, // EXACT match from workflows
    { name: 'Consent:Marketing_Opt_In' } // EXACT match from workflows
  ],

  // Support & Tickets (Kept from original script, may not be in GHL guide but good to have)
  supportTickets: [
    { name: 'ticket:new' },
    { name: 'ticket:pending' },
    { name: 'ticket:in_progress' },
    { name: 'ticket:resolved' },
    { name: 'ticket:billing_issue' },
    { name: 'ticket:service_issue' },
    { name: 'ticket:technical_issue' },
    { name: 'ticket:feedback' }, // Can overlap with feedback:provided
    { name: 'ticket:high_priority' }
  ],
  
  // Automated Communications (Kept from original script, may not be in GHL guide)
  communications: [
    { name: 'comm:email_sent' },
    { name: 'comm:email_opened' },
    { name: 'comm:email_clicked' },
    { name: 'comm:email_bounced' },
    { name: 'comm:email_unsubscribed' },
    { name: 'comm:sms_sent' },
    { name: 'comm:sms_delivered' },
    { name: 'comm:sms_failed' },
    { name: 'comm:voicemail_sent' },
    { name: 'comm:two_way_conversation' }
  ],
  
  // Compliance & Documents (Kept from original script, may not be in GHL guide)
  complianceDocuments: [
    { name: 'doc:received' },
    { name: 'doc:pending' },
    { name: 'doc:rejected' },
    { name: 'doc:verified' },
    { name: 'contract:sent' },
    { name: 'contract:signed' }
  ],
  
  // Referral & Affiliate Program (Kept from original script)
  referralProgram: [
    { name: 'referral:partner' },
    { name: 'referral:submitted' },
    { name: 'referral:converted' },
    { name: 'referral:rewarded' },
    // --- Added for full workflow coverage ---
    { name: 'referral:requested' },
    { name: 'referral:received' },
    { name: 'referral:made_referral' },
    { name: 'referral:received_reward' },
    { name: 'referral:reward_earned' },
    { name: 'loyalty:rewarded' },
    { name: 'affiliate:signup' },
    { name: 'affiliate:active' },
    { name: 'affiliate:pending' },
    { name: 'affiliate:commission_paid' },
    { name: 'affiliate:top_performer' }
  ],
  
  // RON Platform (Kept from original script)
  ronPlatform: [
    { name: 'ron:session_scheduled' },
    { name: 'ron:session_completed' },
    { name: 'ron:session_cancelled' },
    { name: 'ron:kba_passed' },
    { name: 'ron:kba_failed' },
    { name: 'ron:idv_passed' },
    { name: 'ron:idv_failed' }
  ],

  // Review Management Tags (NEW for Workflow 20)
  reviewManagement: [
    { name: 'review:positive_given' },
    { name: 'review:negative_damage_control' },
    { name: 'review:rating_1' },
    { name: 'review:rating_2' },
    { name: 'review:rating_3' },
    { name: 'review:rating_4' },
    { name: 'review:rating_5' },
    { name: 'review:platform_google' },
    { name: 'review:platform_yelp' },
    { name: 'review:platform_facebook' }
  ],

  // Calendar Integration Tags (NEW for Workflow 23)
  calendarIntegration: [
    { name: 'calendar:customer_accepted' },
    { name: 'calendar:auto_created' },
    { name: 'calendar:manual_entry_needed' },
    { name: 'calendar:buffer_added' },
    { name: 'calendar:travel_time_extended' }
  ],

  // Campaign and Interest Tags (NEW for enhanced workflows)
  campaignInterest: [
    { name: 'campaign:holiday_promo' },
    { name: 'campaign:back_to_school' },
    { name: 'campaign:tax_season' },
    { name: 'campaign:summer_special' },
    { name: 'interest:price_shopping' },
    { name: 'interest:same_day_service' },
    { name: 'interest:evening_hours' }
  ],

  // Download/Lead Magnet Tags (NEW for Workflow 10)
  downloadTracking: [
    { name: 'downloaded:pricing_guide' },
    { name: 'downloaded:faq_guide' }
  ],

  // ===== WORKFLOW-SPECIFIC CATEGORIES (FROM WORKFLOW ANALYSIS) =====

  // Urgency Tags (EXACT format from workflows)
  urgency: [
    { name: 'urgency:new' },
    { name: 'urgency:medium' },
    { name: 'urgency:high' },
    { name: 'urgency:critical' }
  ],

  // Lead Tags (EXACT format from workflows)
  lead: [
    { name: 'lead:phone_qualified' },
    { name: 'lead:new' },
    { name: 'lead:offered_discount' }, // Missing from workflows
    { name: 'lead:move_to_newsletter' } // Missing from workflows
  ],

  // Priority Tags (from workflows)
  priority: [
    { name: 'priority:high_touch' },
    { name: 'Priority:High_Touch' } // GHL format
  ],

  // Action Tags (from workflows)
  action: [
    { name: 'action:manual_review_required' },
    { name: 'action:cancel_booking' }, // Missing from workflows
    { name: 'action:reschedule_booking' } // Missing from workflows
  ],

  // Booking Operation Tags (from workflows)
  booking: [
    { name: 'booking:creation_failed' },
    { name: 'booking:rescheduled' }, // Missing from workflows
    { name: 'booking:missing_information' } // Missing from workflows
  ],

  // Error Handling Tags (from workflows)
  errorHandling: [
    { name: 'webhook_parse_error' },
    { name: 'booking_response_parse_error' },
    { name: 'booking_api_call_failed' }, // Missing from workflows
    { name: 'api_call_failed' }, // Missing from workflows
    { name: 'cancellation_api_failed' }, // Missing from workflows
    { name: 'reschedule_api_failed' } // Missing from workflows
  ],

  // Cancellation Tags (NEW - from workflows)
  cancellation: [
    { name: 'cancelled:by_customer' },
    { name: 'cancelled:by_provider' },
    { name: 'cancellation:invalid_request' },
    { name: 'cancellation:failed' },
    { name: 'cancellation:requires_manual_processing' }
  ],

  // Rescheduling Tags (NEW - from workflows)
  rescheduling: [
    { name: 'reschedule:successful' },
    { name: 'reschedule:failed' },
    { name: 'reschedule:invalid_request' },
    { name: 'reschedule:requires_manual_processing' },
    { name: 'reschedule:reminders_reset' }
  ],

  // Stripe Webhook Tags (NEW - from workflows)
  stripe: [
    { name: 'stripe:payment_completed' },
    { name: 'stripe:payment_failed' },
    { name: 'stripe:refund_processed' },
    { name: 'stripe:webhook_processed' }
  ],

  // Emergency Tags (NEW - from workflows)
  emergency: [
    { name: 'emergency:contacted' },
    { name: 'emergency:needs_second_attempt' }
  ],

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