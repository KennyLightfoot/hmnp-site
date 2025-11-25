#!/usr/bin/env node
/**
 * GMB Credentials Verification Script
 * Verifies that all required GMB API credentials are set and working
 * 
 * Usage:
 *   node scripts/verify-gmb-credentials.js
 */

import https from 'https';
import { URLSearchParams } from 'url';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env.local and .env files
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Load .env.local first (higher priority), then .env
dotenv.config({ path: join(projectRoot, '.env.local') });
dotenv.config({ path: join(projectRoot, '.env') });

console.log('🔍 GMB Credentials Verification\n');

// Try to load tokens from temp file first, then fall back to environment variables
let CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN, ACCOUNT_ID, LOCATION_ID;

try {
  const tokenFile = JSON.parse(fs.readFileSync('/tmp/gmb-tokens.json', 'utf8'));
  CLIENT_ID = tokenFile.client_id;
  CLIENT_SECRET = tokenFile.client_secret;
  REFRESH_TOKEN = tokenFile.refresh_token;
  console.log('✅ Loaded OAuth tokens from /tmp/gmb-tokens.json');
} catch (error) {
  CLIENT_ID = process.env.GOOGLE_MY_BUSINESS_CLIENT_ID;
  CLIENT_SECRET = process.env.GOOGLE_MY_BUSINESS_CLIENT_SECRET;
  REFRESH_TOKEN = process.env.GOOGLE_MY_BUSINESS_REFRESH_TOKEN;
  console.log('📝 Using OAuth tokens from environment variables');
}

ACCOUNT_ID = process.env.GOOGLE_MY_BUSINESS_ACCOUNT_ID;
LOCATION_ID = process.env.GOOGLE_MY_BUSINESS_LOCATION_ID;

// Check each required credential (Account ID is now optional for verification)
const credentials = {
  'GOOGLE_MY_BUSINESS_CLIENT_ID': CLIENT_ID,
  'GOOGLE_MY_BUSINESS_CLIENT_SECRET': CLIENT_SECRET,
  'GOOGLE_MY_BUSINESS_REFRESH_TOKEN': REFRESH_TOKEN,
  'GOOGLE_MY_BUSINESS_LOCATION_ID': LOCATION_ID,
};

console.log('\n📋 Credential Status:');
console.log('─'.repeat(80));

let allPresent = true;
for (const [name, value] of Object.entries(credentials)) {
  const status = value ? '✅' : '❌';
  const displayValue = value ? (name.includes('SECRET') || name.includes('TOKEN') ? value.substring(0, 20) + '...' : value) : 'NOT SET';
  console.log(`${status} ${name}: ${displayValue}`);
  if (!value) allPresent = false;
}

console.log('─'.repeat(80));

if (!allPresent) {
  console.log('\n❌ Missing required credentials!\n');
  console.log('To set up credentials:');
  console.log('1. Run: node scripts/get-gmb-refresh-token.js (for OAuth tokens)');
  console.log('2. Ensure GOOGLE_MY_BUSINESS_LOCATION_ID is set (from your GBP URL)');
  console.log('3. Set environment variables or ensure /tmp/gmb-tokens.json exists\n');
  process.exit(1);
}

// Account ID is optional for basic verification, but we still warn if it looks like a project number
if (ACCOUNT_ID && ACCOUNT_ID.length < 15) {
  console.log('\n⚠️  WARNING: GOOGLE_MY_BUSINESS_ACCOUNT_ID looks suspiciously short.');
  console.log(`   Current: ${ACCOUNT_ID}`);
  console.log('   Account IDs are usually 15-20 digits long.');
  console.log('   This value is not used for verification, but verify it before using it elsewhere.\n');
}

// Test access token refresh
console.log('\n🔄 Testing access token refresh...');

function getAccessToken() {
  return new Promise((resolve, reject) => {
    const tokenParams = new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: REFRESH_TOKEN,
      grant_type: 'refresh_token'
    });

    const tokenData = tokenParams.toString();

    const options = {
      hostname: 'oauth2.googleapis.com',
      port: 443,
      path: '/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(tokenData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          
          if (response.error) {
            const errorMsg = `Token refresh failed: ${response.error} - ${response.error_description || 'No description'}`;
            console.error(`\n❌ Error details:`, JSON.stringify(response, null, 2));
            reject(new Error(errorMsg));
            return;
          }

          if (!response.access_token) {
            reject(new Error('No access token in response'));
            return;
          }

          resolve(response.access_token);
        } catch (error) {
          console.error(`\n❌ Failed to parse response:`, data);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(tokenData);
    req.end();
  });
}

// Test location access (using location ID only) with simple rate-limit retry
function testLocationAccess(accessToken, retries = 2, delay = 60000) {
  return new Promise((resolve, reject) => {
    const locationName = `locations/${LOCATION_ID}`;
    
    const options = {
      hostname: 'mybusinessbusinessinformation.googleapis.com',
      port: 443,
      path: `/v1/${locationName}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        // Check if response is HTML (error page)
        if (data.trim().startsWith('<!DOCTYPE') || data.trim().startsWith('<html')) {
          const errorMsg = `API returned HTML instead of JSON. This usually means:\n` +
            `1. The API endpoint is incorrect\n` +
            `2. The Google My Business API is not enabled\n` +
            `3. The Account ID or Location ID format is wrong\n\n` +
            `Response status: ${res.statusCode}\n` +
            `Response preview: ${data.substring(0, 200)}...`;
          reject(new Error(errorMsg));
          return;
        }

        try {
          const response = JSON.parse(data);
          
          if (response.error) {
            const msg = response.error.message || JSON.stringify(response.error);
            // Handle quota/rate-limit gracefully
            if ((msg.includes('Quota exceeded') || msg.includes('rate limit')) && retries > 0) {
              const waitSec = delay / 1000;
              console.log(`\n⚠️  Rate limit hit when checking location. Waiting ${waitSec} seconds then retrying (${retries} retries left)...`);
              setTimeout(() => {
                testLocationAccess(accessToken, retries - 1, delay * 2)
                  .then(resolve)
                  .catch(reject);
              }, delay);
              return;
            }
            reject(new Error(msg));
            return;
          }

          resolve(response);
        } catch (error) {
          // Show more details about the parse error
          const preview = data.substring(0, 500);
          reject(new Error(`Failed to parse JSON response. Status: ${res.statusCode}\n` +
            `Response preview: ${preview}\n` +
            `Original error: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

async function main() {
  try {
    console.log('🔄 Attempting to refresh access token...');
    console.log(`   Client ID: ${CLIENT_ID?.substring(0, 20)}...`);
    console.log(`   Refresh Token: ${REFRESH_TOKEN ? REFRESH_TOKEN.substring(0, 20) + '...' : 'NOT SET'}\n`);
    
    const accessToken = await getAccessToken();
    console.log('✅ Access token retrieved successfully\n');

    console.log('🔍 Testing location access...');
    const location = await testLocationAccess(accessToken);
    
    console.log('✅ Location access successful!\n');
    console.log('📊 Current GBP Profile:');
    console.log('─'.repeat(80));
    console.log(`Name: ${location.title || 'N/A'}`);
    console.log(`Primary Category: ${location.primaryCategory?.displayName || 'Not set'}`);
    console.log(`Additional Categories: ${location.additionalCategories?.length || 0}`);
    console.log(`Service Area: ${location.serviceArea ? 'Set' : 'Not set'}`);
    console.log(`Website: ${location.websiteUri || 'Not set'}`);
    console.log(`Phone: ${location.phoneNumbers?.[0]?.phoneNumber || 'Not set'}`);
    console.log('─'.repeat(80));
    console.log('\n✅ All credentials verified and working!\n');
    
  } catch (error) {
    console.log(`\n❌ Verification failed: ${error.message}\n`);
    console.log('Common issues:');
    console.log('1. Invalid refresh token → Run get-gmb-refresh-token.js again');
    console.log('2. Wrong Account/Location ID → Run get-gmb-account-location.js again');
    console.log('3. Insufficient permissions → Verify you have "Owner" access to GBP');
    console.log('4. API not enabled → Enable Google My Business API in Google Cloud Console\n');
    process.exit(1);
  }
}

main();

