#!/usr/bin/env node
/**
 * Test different Account ID possibilities for service-area business
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TOKEN_PATH = path.join(__dirname, 'gmb-token.json');
const LOCATION_ID = '8366963618766894899';

// Test these potential Account ID formats
const ACCOUNT_ID_TESTS = [
  LOCATION_ID, // Theory 1: Same as Location ID
  '424427793005', // Previously provided (might be project number)
  // We'll also try to list all accounts and find the right one
];

function getAccessToken() {
  const tokenData = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
  return tokenData.access_token;
}

function testAccountId(accountId, accessToken) {
  return new Promise((resolve, reject) => {
    const url = `/v1/accounts/${accountId}/locations/${LOCATION_ID}`;
    
    console.log(`\n🔍 Testing Account ID: ${accountId}`);
    console.log(`   Full path: accounts/${accountId}/locations/${LOCATION_ID}`);
    
    const options = {
      hostname: 'mybusinessbusinessinformation.googleapis.com',
      path: url,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log(`   ✅ SUCCESS! This is the correct Account ID!`);
          const location = JSON.parse(data);
          console.log(`   Business: ${location.title || location.name}`);
          resolve({ accountId, success: true, data: location });
        } else {
          console.log(`   ❌ Failed (${res.statusCode}): ${data.substring(0, 100)}`);
          resolve({ accountId, success: false, error: data });
        }
      });
    });

    req.on('error', (e) => {
      console.log(`   ❌ Error: ${e.message}`);
      resolve({ accountId, success: false, error: e.message });
    });

    req.end();
  });
}

async function listAllAccounts(accessToken) {
  return new Promise((resolve, reject) => {
    console.log(`\n🔍 Listing all GMB accounts...`);
    
    const options = {
      hostname: 'mybusinessaccountmanagement.googleapis.com',
      path: '/v1/accounts',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          const result = JSON.parse(data);
          const accounts = result.accounts || [];
          console.log(`   ✅ Found ${accounts.length} account(s)`);
          accounts.forEach(acc => {
            const accountId = acc.name.replace('accounts/', '');
            console.log(`   📋 Account: ${acc.accountName} (ID: ${accountId})`);
          });
          resolve(accounts);
        } else {
          console.log(`   ⚠️  Could not list accounts (${res.statusCode})`);
          if (data.includes('Quota exceeded')) {
            console.log(`   ⏳ API quota limit hit - but that's okay, we'll test directly`);
          }
          resolve([]);
        }
      });
    });

    req.on('error', (e) => {
      console.log(`   ❌ Error: ${e.message}`);
      resolve([]);
    });

    req.end();
  });
}

async function main() {
  console.log('🔍 Testing GBP Account ID Theories...\n');
  console.log(`Location ID: ${LOCATION_ID}`);
  
  try {
    const accessToken = getAccessToken();
    console.log('✅ Loaded access token\n');
    
    // First, try to list accounts (may hit quota, but worth a try)
    const accounts = await listAllAccounts(accessToken);
    
    // Extract Account IDs from listed accounts
    const listedAccountIds = accounts.map(acc => acc.name.replace('accounts/', ''));
    
    // Combine with our test IDs
    const allTestIds = [...new Set([...listedAccountIds, ...ACCOUNT_ID_TESTS])];
    
    console.log(`\n${'═'.repeat(80)}`);
    console.log(`Testing ${allTestIds.length} potential Account ID(s)...`);
    console.log('═'.repeat(80));
    
    // Test each Account ID
    for (const accountId of allTestIds) {
      const result = await testAccountId(accountId, accessToken);
      
      if (result.success) {
        console.log('\n' + '═'.repeat(80));
        console.log('🎉 FOUND THE CORRECT IDs!');
        console.log('═'.repeat(80));
        console.log(`\nAccount ID: ${accountId}`);
        console.log(`Location ID: ${LOCATION_ID}`);
        console.log(`\nAdd these to your .env file:`);
        console.log(`GOOGLE_MY_BUSINESS_ACCOUNT_ID=${accountId}`);
        console.log(`GOOGLE_MY_BUSINESS_LOCATION_ID=${LOCATION_ID}`);
        console.log('\n✅ You can now run: node scripts/update-gbp-complete.js\n');
        process.exit(0);
      }
      
      // Small delay between tests to avoid hitting rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n' + '═'.repeat(80));
    console.log('❌ None of the Account IDs worked');
    console.log('═'.repeat(80));
    console.log('\n📋 Manual Method:');
    console.log('1. Go to: https://business.google.com/');
    console.log('2. Open DevTools (F12) → Network tab');
    console.log('3. Filter: "mybusiness"');
    console.log('4. Click around dashboard (Edit info, etc.)');
    console.log('5. Look for URLs with: accounts/XXXXX/locations/YYYYY');
    console.log('6. The XXXXX is your Account ID\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();

