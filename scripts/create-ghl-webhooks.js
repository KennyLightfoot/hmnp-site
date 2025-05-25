#!/usr/bin/env node

/**
 * Script to set up all required webhooks in GoHighLevel using Private Integrations v2 API
 * Configures webhooks for contact events, tag changes, and pipeline updates
 * 
 * REQUIRES: Private Integration token from GHL Settings > Private Integrations
 * with the following permissions:
 * - View/Edit Contacts
 * - View/Edit Custom Fields
 * - View/Edit Tags
 * - View/Edit Opportunities
 * - View Conversations
 * 
 * Usage: node scripts/create-ghl-webhooks.js
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
const WEBHOOK_ENDPOINT = `${SITE_DOMAIN}/api/webhooks/ghl`;

// Validate environment variables
if (!validateEnvVariables()) {
  printInfo('\n📝 To get Private Integration token:');
  printInfo('   1. Go to Settings > Private Integrations');
  printInfo('   2. Create new integration with webhook permissions');
  printInfo('   3. Copy the token to your .env file');
  process.exit(1);
}

// Comprehensive webhook configurations
const webhookConfigs = [
  // Contact Management Webhooks
  {
    name: 'Contact Created',
    url: WEBHOOK_ENDPOINT,
    events: ['ContactCreate'],
    description: 'Triggered when a new contact is created',
    category: 'Contact Management'
  },
  {
    name: 'Contact Updated', 
    url: WEBHOOK_ENDPOINT,
    events: ['ContactUpdate'],
    description: 'Triggered when contact information is updated',
    category: 'Contact Management'
  },
  {
    name: 'Contact Deleted',
    url: WEBHOOK_ENDPOINT,
    events: ['ContactDelete'],
    description: 'Triggered when a contact is deleted',
    category: 'Contact Management'
  },
  {
    name: 'Contact Merged',
    url: WEBHOOK_ENDPOINT,
    events: ['ContactMerge'],
    description: 'Triggered when contacts are merged',
    category: 'Contact Management'
  },
  
  // Tag Management Webhooks
  {
    name: 'Contact Tag Added/Removed',
    url: WEBHOOK_ENDPOINT,
    events: ['ContactTagUpdate'],
    description: 'Triggered when tags are added or removed from contacts',
    category: 'Tag Management'
  },
  {
    name: 'Tag Created',
    url: WEBHOOK_ENDPOINT,
    events: ['TagCreate'],
    description: 'Triggered when a new tag is created',
    category: 'Tag Management'
  },
  
  // Pipeline & Opportunity Webhooks
  {
    name: 'Opportunity Created',
    url: WEBHOOK_ENDPOINT,
    events: ['OpportunityCreate'],
    description: 'Triggered when a new opportunity is created',
    category: 'Pipeline Management'
  },
  {
    name: 'Opportunity Status Changed',
    url: WEBHOOK_ENDPOINT,
    events: ['OpportunityStatusUpdate'],
    description: 'Triggered when opportunity moves through pipeline stages',
    category: 'Pipeline Management'
  },
  {
    name: 'Opportunity Updated',
    url: WEBHOOK_ENDPOINT,
    events: ['OpportunityUpdate'],
    description: 'Triggered when opportunity details are updated',
    category: 'Pipeline Management'
  },
  {
    name: 'Opportunity Deleted',
    url: WEBHOOK_ENDPOINT,
    events: ['OpportunityDelete'],
    description: 'Triggered when an opportunity is deleted',
    category: 'Pipeline Management'
  },
  
  // Appointment & Calendar Webhooks
  {
    name: 'Appointment Created',
    url: WEBHOOK_ENDPOINT,
    events: ['AppointmentCreate'],
    description: 'Triggered when new appointment is booked',
    category: 'Appointment Management'
  },
  {
    name: 'Appointment Updated',
    url: WEBHOOK_ENDPOINT,
    events: ['AppointmentUpdate'],
    description: 'Triggered when appointment details are changed',
    category: 'Appointment Management'
  },
  {
    name: 'Appointment Deleted',
    url: WEBHOOK_ENDPOINT,
    events: ['AppointmentDelete'],
    description: 'Triggered when appointment is cancelled/deleted',
    category: 'Appointment Management'
  },
  {
    name: 'Appointment Status Changed',
    url: WEBHOOK_ENDPOINT,
    events: ['AppointmentStatusUpdate'],
    description: 'Triggered when appointment status changes (confirmed, cancelled, etc.)',
    category: 'Appointment Management'
  },
  
  // Custom Field Webhooks
  {
    name: 'Custom Field Updated',
    url: WEBHOOK_ENDPOINT,
    events: ['ContactCustomFieldUpdate'],
    description: 'Triggered when custom fields are updated',
    category: 'Custom Field Management'
  },
  {
    name: 'Custom Field Created',
    url: WEBHOOK_ENDPOINT,
    events: ['CustomFieldCreate'],
    description: 'Triggered when a new custom field is created',
    category: 'Custom Field Management'
  },
  
  // Form & Submission Webhooks
  {
    name: 'Form Submitted',
    url: WEBHOOK_ENDPOINT,
    events: ['FormSubmit'],
    description: 'Triggered when a form is submitted',
    category: 'Form Management'
  },
  
  // Task Management Webhooks
  {
    name: 'Task Created',
    url: WEBHOOK_ENDPOINT,
    events: ['TaskCreate'],
    description: 'Triggered when a new task is created',
    category: 'Task Management'
  },
  {
    name: 'Task Updated',
    url: WEBHOOK_ENDPOINT,
    events: ['TaskUpdate'],
    description: 'Triggered when a task is updated',
    category: 'Task Management'
  },
  {
    name: 'Task Completed',
    url: WEBHOOK_ENDPOINT,
    events: ['TaskComplete'],
    description: 'Triggered when a task is marked as completed',
    category: 'Task Management'
  },
  
  // Conversation Webhooks
  {
    name: 'Conversation Message Created',
    url: WEBHOOK_ENDPOINT,
    events: ['ConversationMessageCreate'],
    description: 'Triggered when a new message is sent/received',
    category: 'Conversation Management'
  },
  {
    name: 'Conversation Status Changed',
    url: WEBHOOK_ENDPOINT,
    events: ['ConversationStatusUpdate'],
    description: 'Triggered when conversation status changes',
    category: 'Conversation Management'
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
      locationId: GHL_LOCATION_ID,
      // Include any additional metadata that might be useful
      meta: {
        category: webhookData.category,
        description: webhookData.description
      }
    };
    
    const result = await createLocationWebhook(webhookPayload);
    printSuccess(`Created webhook: ${webhookData.name}`);
    console.log(`   ID: ${result.id || result.webhook?.id}`);
    console.log(`   URL: ${webhookData.url}`);
    console.log(`   Events: ${webhookData.events.join(', ')}`);
    return {
      success: true,
      webhookId: result.id || result.webhook?.id,
      category: webhookData.category
    };
  } catch (error) {
    printError(`Failed to create ${webhookData.name}: ${error.message}`);
    printInfo('Note: This webhook may need to be created manually in GHL dashboard');
    return {
      success: false,
      category: webhookData.category
    };
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
  console.log('\n🪝 Starting GHL webhook setup with v2 API...\n');
  console.log(`🔗 Target domain: ${SITE_DOMAIN}`);
  console.log(`🔗 Webhook endpoint: ${WEBHOOK_ENDPOINT}\n`);
  
  // Get existing webhooks
  printInfo('Checking existing webhooks...');
  const existingWebhooks = await getExistingWebhooks();
  printInfo(`Found ${existingWebhooks.length} existing webhooks\n`);

  // Check for webhooks that point to our endpoint
  const ourExistingWebhooks = existingWebhooks.filter(webhook => 
    webhook.url?.includes('/api/webhooks/ghl')
  );

  if (ourExistingWebhooks.length > 0) {
    console.log(`🔄 Found ${ourExistingWebhooks.length} existing webhooks pointing to our API:`);
    ourExistingWebhooks.forEach(webhook => {
      console.log(`   • ${webhook.name} (${webhook.url})`);
    });
    
    console.log('\n🤔 Existing webhooks will be replaced with updated configuration.');
    
    // Delete existing webhooks
    console.log('🗑️  Removing old webhooks...');
    for (const webhook of ourExistingWebhooks) {
      await deleteWebhook(webhook.id, webhook.name);
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    console.log('');
  }

  // Create all webhooks
  console.log('🚀 Creating new webhooks:');
  
  const results = {
    total: webhookConfigs.length,
    success: 0,
    failure: 0,
    byCategory: {}
  };

  // Initialize category counters
  for (const webhook of webhookConfigs) {
    if (!results.byCategory[webhook.category]) {
      results.byCategory[webhook.category] = { total: 0, success: 0, failure: 0 };
    }
    results.byCategory[webhook.category].total++;
  }

  // Create webhooks by category
  for (const category of Object.keys(results.byCategory)) {
    console.log(`\n📋 Creating ${category} webhooks:`);
    
    for (const webhookConfig of webhookConfigs.filter(w => w.category === category)) {
      const result = await createWebhook(webhookConfig);
      
      if (result.success) {
        results.success++;
        results.byCategory[category].success++;
      } else {
        results.failure++;
        results.byCategory[category].failure++;
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Print summary
  printWebhookSummary(results);
  
  return results;
}

function printWebhookSummary(results) {
  console.log('\n📊 Webhook Setup Summary:');
  console.log(`✅ Successfully created: ${results.success} webhooks`);
  console.log(`❌ Failed to create: ${results.failure} webhooks`);
  console.log(`📋 Total configured: ${results.total} webhooks`);
  
  console.log('\n📊 Results by Category:');
  for (const [category, counts] of Object.entries(results.byCategory)) {
    const successIcon = counts.failure === 0 ? '✅' : counts.success === 0 ? '❌' : '⚠️';
    console.log(`${successIcon} ${category}: ${counts.success}/${counts.total} created`);
  }
  
  if (results.failure === 0) {
    console.log('\n🎉 All webhooks are now configured!');
    console.log('\nNext steps:');
    console.log('1. Verify webhooks in GHL: Settings > Integrations > Webhooks');
    console.log('2. Check your API implementation at: ' + WEBHOOK_ENDPOINT);
    console.log('3. Test webhook endpoints with sample data');
    console.log('4. Monitor webhook logs for proper functionality');
  } else {
    console.log('\n⚠️ Some webhooks failed to create. Check the errors above.');
    console.log('You may need to create them manually in GHL. Go to:');
    console.log('Settings > Integrations > Webhooks > Create Webhook');
  }

  // Show webhook details
  console.log('\n📋 Webhook Configuration Guide:');
  
  const categories = [...new Set(webhookConfigs.map(w => w.category))];
  
  for (const category of categories) {
    console.log(`\n${category}:`);
    const categoryWebhooks = webhookConfigs.filter(w => w.category === category);
    
    for (const webhook of categoryWebhooks) {
      console.log(`   • ${webhook.name}`);
      console.log(`     Events: ${webhook.events.join(', ')}`);
      console.log(`     Purpose: ${webhook.description}`);
    }
  }
  
  // Implementation guide
  console.log('\n📘 Webhook Implementation Guide:');
  console.log('1. Create webhook handler endpoint in your Next.js API:');
  console.log('   Create file: /pages/api/webhooks/ghl.js');
  
  console.log('\n2. Sample webhook handler implementation:');
  console.log(`
    // /pages/api/webhooks/ghl.js
    import { validateWebhook } from '../../../lib/ghl-webhook-utils';
    
    export default async function handler(req, res) {
      // Only allow POST method
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
      }
      
      try {
        // Optional: Validate webhook signature
        // const isValid = validateWebhook(req);
        // if (!isValid) return res.status(401).json({ error: 'Invalid webhook signature' });
        
        const data = req.body;
        const eventType = data.event || 'unknown';
        
        console.log(\`Received GHL webhook: \${eventType}\`);
        
        // Handle different event types
        switch (eventType) {
          case 'ContactCreate':
            // Handle new contact
            break;
          case 'ContactTagUpdate':
            // Handle tag update
            break;
          case 'OpportunityStatusUpdate':
            // Handle pipeline stage update
            break;
          // Add cases for other event types
          default:
            console.log(\`Unhandled event type: \${eventType}\`);
        }
        
        // Always return 200 success to GHL to acknowledge receipt
        return res.status(200).json({ success: true });
      } catch (error) {
        console.error('Webhook processing error:', error);
        // Still return 200 to GHL, handle errors internally
        return res.status(200).json({ success: true });
      }
    }
  `);
  
  // Security reminder
  console.log('\n🔒 Security Best Practices:');
  console.log('• Implement webhook signature validation in your API endpoints');
  console.log('• Always use HTTPS for all webhook URLs');
  console.log('• Log webhook events for monitoring and debugging');
  console.log('• Set up rate limiting in your webhook handlers');
  console.log('• Create a dedicated database table to track webhook events');
  console.log('• Process webhook events asynchronously for high-volume events');
}

// Run the script
setupAllWebhooks().catch(console.error);
