#!/usr/bin/env node

/**
 * Test Proof.com API Connection
 * Verifies API key and organization ID are working
 */

import https from 'https';

const PROOF_API_KEY = 'wVc8ni3bWaEvZNQBBM215h1v';
const PROOF_ORGANIZATION_ID = 'ord7g866b';

async function testProofConnection() {
  console.log('🔍 Testing Proof.com API Connection...\n');
  
  // Test 1: Check API key validity by getting organization info
  console.log('📋 Test 1: Fetching organization information...');
  
  const options = {
    hostname: 'api.proof.com',
    port: 443,
    path: `/v2/organizations/${PROOF_ORGANIZATION_ID}`,
    method: 'GET',
    headers: {
      'ApiKey': PROOF_API_KEY,
      'Content-Type': 'application/json',
      'User-Agent': 'HMNP-Production-Test/1.0'
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      
      console.log(`   Status Code: ${res.statusCode}`);
      console.log(`   Headers:`, res.headers);
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            const orgData = JSON.parse(data);
            console.log('✅ Organization found!');
            console.log(`   Organization Name: ${orgData.name || 'Not provided'}`);
            console.log(`   Organization ID: ${orgData.id || PROOF_ORGANIZATION_ID}`);
            console.log(`   Environment: ${orgData.environment || 'Unknown'}`);
            
            // Test 2: List recent transactions (if any)
            console.log('\n📄 Test 2: Checking recent transactions...');
            testTransactions();
          } else if (res.statusCode === 401) {
            console.log('❌ Authentication failed!');
            console.log('   Check your API key - it might be sandbox instead of production');
            console.log('   Current API key:', PROOF_API_KEY);
          } else if (res.statusCode === 404) {
            console.log('❌ Organization not found!');
            console.log('   Check your organization ID:', PROOF_ORGANIZATION_ID);
          } else {
            console.log(`❌ Unexpected response: ${res.statusCode}`);
            console.log('   Response:', data);
          }
        } catch (error) {
          console.log('❌ Error parsing response:', error.message);
          console.log('   Raw response:', data);
        }
        resolve();
      });
    });

    req.on('error', (error) => {
      console.log('❌ Request failed:', error.message);
      reject(error);
    });

    req.end();
  });
}

function testTransactions() {
  const options = {
    hostname: 'api.proof.com',
    port: 443,
    path: '/v2/transactions?limit=5',
    method: 'GET',
    headers: {
      'ApiKey': PROOF_API_KEY,
      'Content-Type': 'application/json',
      'User-Agent': 'HMNP-Production-Test/1.0'
    }
  };

  const req = https.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        if (res.statusCode === 200) {
          const transactions = JSON.parse(data);
          console.log(`✅ API access confirmed! Found ${transactions.length || 0} recent transactions`);
          
          if (transactions.length > 0) {
            console.log('   Recent transaction example:');
            console.log(`   - ID: ${transactions[0].id}`);
            console.log(`   - Status: ${transactions[0].status}`);
            console.log(`   - Created: ${transactions[0].date_created}`);
          }
        } else {
          console.log(`⚠️  Transactions endpoint returned: ${res.statusCode}`);
        }
      } catch (error) {
        console.log('⚠️  Error checking transactions:', error.message);
      }
      
      console.log('\n🎯 Next Steps:');
      console.log('1. Set up webhooks in your Proof dashboard');
      console.log('2. Get your webhook secret');
      console.log('3. Update PROOF_WEBHOOK_SECRET in .env.local');
      console.log('4. Test a complete RON workflow');
      console.log('\n📞 If you need help finding webhooks:');
      console.log('   - Login to app.proof.com');
      console.log('   - Look for "Developers" or "API" section');
      console.log('   - Create webhook: https://houstonmobilenotarypros.com/api/webhooks/proof');
    });
  });

  req.on('error', (error) => {
    console.log('⚠️  Error testing transactions:', error.message);
  });

  req.end();
}

// Run the test
testProofConnection().catch(console.error); 