#!/usr/bin/env node

/**
 * Setup Proof.com Webhook
 * Creates webhook subscription for Houston Mobile Notary Pros
 */

import https from 'https';

const PROOF_API_KEY = 'wVc8ni3bWaEvZNQBBM215h1v';
const WEBHOOK_URL = 'https://houstonmobilenotarypros.com/api/webhooks/proof';

// Events we want to receive webhooks for
const WEBHOOK_EVENTS = [
  'transaction.created',
  'transaction.status.updated', 
  'transaction.completed',
  'transaction.cancelled',
  'meeting.started',
  'meeting.ended',
  'document.uploaded',
  'document.signed',
  'signer.invited',
  'signer.authenticated'
];

async function createWebhook() {
  console.log('🔗 Setting up Proof.com Webhook...\n');
  console.log(`📡 Webhook URL: ${WEBHOOK_URL}`);
  console.log(`📋 Events: ${WEBHOOK_EVENTS.join(', ')}\n`);

  const postData = JSON.stringify({
    url: WEBHOOK_URL,
    subscriptions: WEBHOOK_EVENTS
  });

  const options = {
    hostname: 'api.proof.com',
    port: 443,
    path: '/v2/webhooks',
    method: 'POST',
    headers: {
      'ApiKey': PROOF_API_KEY,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
      'User-Agent': 'HMNP-Webhook-Setup/1.0'
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`📊 Response Status: ${res.statusCode}`);
        
        try {
          const response = JSON.parse(data);
          
          if (res.statusCode === 200 || res.statusCode === 201) {
            console.log('✅ Webhook created successfully!');
            console.log('📝 Response:', JSON.stringify(response, null, 2));
            
            if (response.secret) {
              console.log('\n🔐 IMPORTANT: Your webhook secret is:');
              console.log(`PROOF_WEBHOOK_SECRET=${response.secret}`);
              console.log('\n📋 Add this to your .env.local file!');
            }
            
            resolve(response);
          } else {
            console.log('❌ Failed to create webhook');
            console.log('📝 Response:', JSON.stringify(response, null, 2));
            reject(new Error(`HTTP ${res.statusCode}: ${JSON.stringify(response)}`));
          }
        } catch (error) {
          console.log('❌ Failed to parse response');
          console.log('📝 Raw response:', data);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.log('❌ Request failed:', error.message);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Run the setup
createWebhook()
  .then(() => {
    console.log('\n🎉 Webhook setup complete!');
    console.log('🔄 Next steps:');
    console.log('1. Update your .env.local with the webhook secret');
    console.log('2. Deploy your changes to production');
    console.log('3. Test a RON transaction!');
  })
  .catch((error) => {
    console.log('\n💥 Setup failed:', error.message);
    console.log('\n🛠️  Manual setup instructions:');
    console.log('1. Go to your Proof dashboard');
    console.log('2. Navigate to Developers → Webhooks');
    console.log(`3. Create webhook with URL: ${WEBHOOK_URL}`);
    console.log(`4. Subscribe to events: ${WEBHOOK_EVENTS.join(', ')}`);
  }); 