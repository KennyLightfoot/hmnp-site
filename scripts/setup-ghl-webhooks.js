#!/usr/bin/env node

/**
 * Script to set up all required webhooks in GoHighLevel using Private Integrations v2 API
 * Configures webhooks for contact events, tag changes, and pipeline updates
 * 
 * REQUIRES: Private Integration token from GHL Settings > Private Integrations
 * 
 * Usage: node scripts/setup-ghl-webhooks.js
 */

import {
  validateEnvVariables,
  makeGhlV2Request,
  getLocationWebhooks,
  createLocationWebhook,
  printSuccess,
  printError,
  printInfo
} from './ghl-api-v2-utils.js';

const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;
const SITE_DOMAIN = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL || 'https://houstonmobilenotarypros.com';

// Validate environment variables
if (!validateEnvVariables()) {
  printInfo('\n📝 To get Private Integration token:');
  printInfo('   1. Go to Settings > Private Integrations');
  printInfo('   2. Create new integration with webhook permissions');
  printInfo('   3. Copy the token to your .env file');
  process.exit(1);
}

// Webhook configurations
const webhookConfigs = [
  {
    name: 'Contact Created Webhook',
    url: `${SITE_DOMAIN}/api/webhooks/ghl`,
    events: ['ContactCreate'],
    description: 'Triggered when a new contact is created'
  },
  {
    name: 'Contact Updated Webhook', 
    url: `${SITE_DOMAIN}/api/webhooks/ghl`,
    events: ['ContactUpdate'],
    description: 'Triggered when contact information is updated'
  },
  {
    name: 'Contact Tag Added Webhook',
    url: `${SITE_DOMAIN}/api/webhooks/ghl`,
    events: ['ContactTagUpdate'],
    description: 'Triggered when tags are added or removed from contacts'
  },
  {
    name: 'Opportunity Stage Change Webhook',
    url: `${SITE_DOMAIN}/api/webhooks/ghl`,
    events: ['OpportunityStatusUpdate'],
    description: 'Triggered when opportunity moves through pipeline stages'
  },
  {
    name: 'Appointment Booking Webhook',
    url: `${SITE_DOMAIN}/api/webhooks/ghl`,
    events: ['AppointmentCreate'],
    description: 'Triggered when new appointment is booked'
  },
  {
    name: 'Custom Field Update Webhook',
    url: `${SITE_DOMAIN}/api/webhooks/ghl`,
    events: ['ContactCustomFieldUpdate'],
    description: 'Triggered when custom fields are updated'
  }
];

async function getExistingWebhooks() {
  try {
    const data = await getLocationWebhooks();
    return data.webhooks || [];
  } catch (error) {
    printError('Error fetching existing webhooks: ' + error.message);
    printInfo('Note: Webhook API endpoints not accessible via current API version');
    printInfo('Webhooks may need to be configured manually in GHL dashboard');
    printInfo('Go to: Settings > Integrations > Webhooks');
    return [];
  }
}

async function createWebhook(webhookData) {
  try {
    console.log(`Creating webhook: ${webhookData.name}...`);
    
    const webhookPayload = {
      name: webhookData.name,
      url: webhookData.url,
      events: webhookData.events,
      locationId: GHL_LOCATION_ID
    };
    
    const result = await createLocationWebhook(webhookPayload);
    printSuccess(`Created webhook: ${webhookData.name}`);
    console.log(`   ID: ${result.id || result.webhook?.id}`);
    console.log(`   URL: ${webhookData.url}`);
    console.log(`   Events: ${webhookData.events.join(', ')}`);
    return true;
  } catch (error) {
    printError(`Failed to create ${webhookData.name}: ${error.message}`);
    printInfo('Note: This webhook may need to be created manually in GHL dashboard');
    return false;
  }
}

async function deleteWebhook(webhookId, webhookName) {
  try {
    await makeGhlV2Request(`/locations/${GHL_LOCATION_ID}/webhooks/${webhookId}`, 'DELETE');
    printSuccess(`Deleted old webhook: ${webhookName}`);
    return true;
  } catch (error) {
    printError(`Error deleting webhook ${webhookName}: ${error.message}`);
    return false;
  }
}

async function setupAllWebhooks() {
  console.log('\ud83aa\udf0a Starting GHL webhook setup with v2 API...\n');
  console.log(`\ud83d\udccd Target domain: ${SITE_DOMAIN}\n`);
  
  // Get existing webhooks
  printInfo('Checking existing webhooks...');
  const existingWebhooks = await getExistingWebhooks();
  printInfo(`Found ${existingWebhooks.length} existing webhooks\n`);

  // Check for webhooks that point to our domain
  const ourExistingWebhooks = existingWebhooks.filter(webhook => 
    webhook.url?.includes('/api/webhooks/ghl')
  );

  if (ourExistingWebhooks.length > 0) {
    console.log(`🔄 Found ${ourExistingWebhooks.length} existing webhooks pointing to our API:`);
    ourExistingWebhooks.forEach(webhook => {
      console.log(`   • ${webhook.name} (${webhook.url})`);
    });
    
    console.log('\n🤔 Would you like to replace existing webhooks? (y/N)');
    console.log('   This will delete old webhooks and create new ones with updated configuration.');
    console.log('   For now, proceeding with replacement...\n');
    
    // Delete existing webhooks
    console.log('🗑️  Removing old webhooks...');
    for (const webhook of ourExistingWebhooks) {
      await deleteWebhook(webhook.id, webhook.name);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    console.log('');
  }

  // Create all webhooks
  console.log('🚀 Creating new webhooks:');
  let successCount = 0;
  let failureCount = 0;

  for (const webhookConfig of webhookConfigs) {
    const success = await createWebhook(webhookConfig);
    if (success) {
      successCount++;
    } else {
      failureCount++;
    }
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n📊 Webhook Setup Summary:');
  console.log(`✅ Successfully created: ${successCount} webhooks`);
  console.log(`❌ Failed to create: ${failureCount} webhooks`);
  console.log(`📋 Total configured: ${webhookConfigs.length} webhooks`);
  
  if (failureCount === 0) {
    console.log('\n🎉 All webhooks are now configured!');
    console.log('\nNext steps:');
    console.log('1. Verify webhooks in GHL: Settings > Integrations > Webhooks');
    console.log('2. Test webhook endpoints with sample data');
    console.log('3. Monitor webhook logs for proper functionality');
    console.log('4. Set up authentication/validation in your webhook handlers');
  } else {
    console.log('\n🔧 Some webhooks failed to create. Check the errors above.');
    console.log('You may need to create them manually in GHL.');
  }

  // Show webhook configuration guide
  console.log('\n📋 Webhook Configuration Guide:');
  webhookConfigs.forEach((config, index) => {
    console.log(`\n${index + 1}. ${config.name}`);
    console.log(`   URL: ${config.url}`);
    console.log(`   Events: ${config.events.join(', ')}`);
    console.log(`   Purpose: ${config.description}`);
  });

  // Security reminder
  console.log('\n🔒 Security Reminder:');
  console.log('• Implement webhook signature validation in your API endpoints');
  console.log('• Use HTTPS for all webhook URLs (already configured)');
  console.log('• Log webhook events for monitoring and debugging');
  console.log('• Consider rate limiting in your webhook handlers');
}

// Run the script
setupAllWebhooks().catch(console.error); 