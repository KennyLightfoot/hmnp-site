#!/usr/bin/env node

/**
 * Script to list all custom fields and their IDs from GoHighLevel
 * This will show all existing custom fields with their IDs for reference
 * 
 * Usage: node scripts/list-ghl-custom-fields.js
 */

import 'dotenv/config';
import { getLocationCustomFields } from './ghl-api-v2-utils.js';

// Validate environment variables
if (!process.env.GHL_API_BASE_URL || !process.env.GHL_API_KEY || !process.env.GHL_LOCATION_ID) {
  console.error('Missing required environment variables:');
  console.error('- GHL_API_BASE_URL');
  console.error('- GHL_API_KEY'); 
  console.error('- GHL_LOCATION_ID');
  process.exit(1);
}

async function listAllCustomFields() {
  try {
    console.log('🔍 Fetching all custom fields from GHL...\n');
    
    const data = await getLocationCustomFields();
    const fields = data.customFields || [];

    if (fields.length === 0) {
      console.log('No custom fields found in your GHL account.');
      return;
    }

    // Group fields by category based on their names
    const categories = {
      'Booking & Status': [],
      'Contact & Inquiry': [],
      'Booking & Appointment': [],
      'Payment & Billing': [],
      'Referral': [],
      'Service & Feedback': [],
      'No-Show & Refund': [],
      'Other Important': [],
      'Referral & Testimonial': [],
      'Refund': []
    };

    // Sort fields into categories
    fields.forEach(field => {
      const name = field.name || field.key;
      if (name.startsWith('cf_last_booking_status') || 
          name.startsWith('cf_last_cancellation_date') || 
          name.startsWith('cf_last_reschedule_date') || 
          name.startsWith('cf_quote_sent_date')) {
        categories['Booking & Status'].push(field);
      } else if (name.startsWith('cf_contact_inquiry')) {
        categories['Contact & Inquiry'].push(field);
      } else if (name.startsWith('cf_booking_')) {
        categories['Booking & Appointment'].push(field);
      } else if (name.startsWith('cf_payment_') || name.startsWith('cf_invoice_')) {
        categories['Payment & Billing'].push(field);
      } else if (name.startsWith('cf_unique_referral') || 
                 name.startsWith('cf_referred_by') || 
                 name.startsWith('cf_referral_code')) {
        categories['Referral'].push(field);
      } else if (name.startsWith('cf_satisfaction_score') || 
                 name.startsWith('cf_last_service_type') || 
                 name.startsWith('cf_lifetime_value')) {
        categories['Service & Feedback'].push(field);
      } else if (name.startsWith('cf_no_show_')) {
        categories['No-Show & Refund'].push(field);
      } else if (name.startsWith('cf_ad_') || 
                 name.startsWith('cf_landing_page') || 
                 name.startsWith('cf_onboarding_') || 
                 name.startsWith('cf_reengagement_')) {
        categories['Other Important'].push(field);
      } else if (name.startsWith('cf_testimonial_') || 
                 name.startsWith('cf_consent_display_testimonial')) {
        categories['Referral & Testimonial'].push(field);
      } else if (name.startsWith('cf_refund_')) {
        categories['Refund'].push(field);
      } else {
        categories['Other Important'].push(field);
      }
    });

    // Print fields by category
    console.log(`📊 Found ${fields.length} total custom fields in your GHL account\n`);

    for (const [category, categoryFields] of Object.entries(categories)) {
      if (categoryFields.length > 0) {
        console.log(`${category} Fields:`);
        categoryFields.forEach(field => {
          console.log(`${field.name}: ${field.id}`);
        });
        console.log(''); // Add blank line between categories
      }
    }

  } catch (error) {
    console.error('❌ Error fetching custom fields:', error.message);
    process.exit(1);
  }
}

// Run the script
listAllCustomFields(); 