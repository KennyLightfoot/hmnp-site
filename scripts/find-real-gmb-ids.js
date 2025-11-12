#!/usr/bin/env node
/**
 * Diagnostic script to find real GBP Account and Location IDs
 * Handles API quota issues gracefully
 */

import https from 'https';
import fs from 'fs';

console.log('🔍 Finding Real GBP Account & Location IDs...\n');

// Get refresh token from temp file
let CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN;

try {
  const tokenFile = JSON.parse(fs.readFileSync('/tmp/gmb-tokens.json', 'utf8'));
  CLIENT_ID = tokenFile.client_id;
  CLIENT_SECRET = tokenFile.client_secret;
  REFRESH_TOKEN = tokenFile.refresh_token;
  console.log('✅ Loaded OAuth credentials\n');
} catch (error) {
  console.log('❌ No OAuth tokens found. Run get-gmb-refresh-token.js first.');
  process.exit(1);
}

// Function to get fresh access token
function getAccessToken() {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: REFRESH_TOKEN,
      grant_type: 'refresh_token'
    });

    const data = params.toString();

    const options = {
      hostname: 'oauth2.googleapis.com',
      port: 443,
      path: '/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', () => {
        try {
          const response = JSON.parse(responseData);
          if (response.error) {
            reject(new Error(response.error_description || response.error));
          } else {
            resolve(response.access_token);
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Main execution
async function main() {
  try {
    console.log('🔄 Getting fresh access token...');
    const accessToken = await getAccessToken();
    console.log('✅ Got access token\n');

    // Wait to avoid quota issues
    console.log('⏳ Waiting 3 seconds to avoid quota limits...\n');
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('🔄 Fetching GMB accounts...');
    
    const accountsResponse = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'mybusinessaccountmanagement.googleapis.com',
        port: 443,
        path: '/v1/accounts',
        method: 'GET',
        headers: { 'Authorization': `Bearer ${accessToken}` }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            if (response.error) {
              reject(new Error(response.error.message || JSON.stringify(response.error)));
            } else {
              resolve(response);
            }
          } catch (error) {
            reject(new Error(`Failed to parse response: ${data.substring(0, 200)}`));
          }
        });
      });

      req.on('error', reject);
      req.end();
    });

    if (!accountsResponse.accounts || accountsResponse.accounts.length === 0) {
      console.log('❌ No GMB accounts found!');
      console.log('\nPossible reasons:');
      console.log('1. You need to claim a Google Business Profile first');
      console.log('2. The OAuth account doesn\'t have access to any GBP listings');
      console.log('\nVisit: https://business.google.com/ to set up your profile');
      return;
    }

    console.log('✅ Found GMB Accounts:\n');
    console.log('─'.repeat(80));
    
    for (const account of accountsResponse.accounts) {
      const accountId = account.name.replace('accounts/', '');
      console.log(`📋 Account: ${account.accountName || 'Unnamed'}`);
      console.log(`   Account ID: ${accountId}`);
      console.log(`   Type: ${account.type || 'Unknown'}`);
      console.log(`   Resource Name: ${account.name}`);
      console.log('');
    }

    // Get locations for each account
    for (const account of accountsResponse.accounts) {
      const accountId = account.name.replace('accounts/', '');
      
      console.log(`\n🔄 Fetching locations for account: ${accountId}...`);
      
      // Wait to avoid quota
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      try {
        const locationsResponse = await new Promise((resolve, reject) => {
          const options = {
            hostname: 'mybusinessbusinessinformation.googleapis.com',
            port: 443,
            path: `/v1/accounts/${accountId}/locations`,
            method: 'GET',
            headers: { 'Authorization': `Bearer ${accessToken}` }
          };

          const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
              try {
                const response = JSON.parse(data);
                if (response.error) {
                  reject(new Error(response.error.message || JSON.stringify(response.error)));
                } else {
                  resolve(response);
                }
              } catch (error) {
                reject(new Error(`Failed to parse response: ${data.substring(0, 200)}`));
              }
            });
          });

          req.on('error', reject);
          req.end();
        });

        if (!locationsResponse.locations || locationsResponse.locations.length === 0) {
          console.log('   ⚠️  No locations found in this account');
          continue;
        }

        console.log('✅ Found Locations:\n');
        console.log('─'.repeat(80));
        
        for (const location of locationsResponse.locations) {
          const locationId = location.name.split('/').pop();
          
          console.log(`📍 Location: ${location.title || 'Unnamed'}`);
          console.log(`   Location ID: ${locationId}`);
          console.log(`   Resource Name: ${location.name}`);
          console.log(`   Category: ${location.primaryCategory?.displayName || 'Unknown'}`);
          console.log('');
        }

        // Show environment variables for first location
        if (locationsResponse.locations.length > 0) {
          const firstLocation = locationsResponse.locations[0];
          const locationId = firstLocation.name.split('/').pop();
          
          console.log('\n✅ COPY THESE TO YOUR .env.local:\n');
          console.log('─'.repeat(80));
          console.log(`GOOGLE_MY_BUSINESS_CLIENT_ID="${CLIENT_ID}"`);
          console.log(`GOOGLE_MY_BUSINESS_CLIENT_SECRET="${CLIENT_SECRET}"`);
          console.log(`GOOGLE_MY_BUSINESS_REFRESH_TOKEN="${REFRESH_TOKEN}"`);
          console.log(`GOOGLE_MY_BUSINESS_ACCOUNT_ID="${accountId}"`);
          console.log(`GOOGLE_MY_BUSINESS_LOCATION_ID="${locationId}"`);
          console.log('─'.repeat(80));
          
          // Save for next script
          const envData = {
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            refresh_token: REFRESH_TOKEN,
            account_id: accountId,
            location_id: locationId
          };
          
          fs.writeFileSync('/tmp/gmb-full-config.json', JSON.stringify(envData, null, 2));
          console.log('💾 Saved to /tmp/gmb-full-config.json\n');
        }

      } catch (error) {
        console.log(`   ❌ Error fetching locations: ${error.message}`);
      }
    }

  } catch (error) {
    console.log('\n❌ Error:', error.message);
    
    if (error.message.includes('Quota exceeded')) {
      console.log('\n⏳ Google API quota exceeded. Please wait 10 minutes and try again.');
      console.log('\nOr find IDs manually:');
      console.log('1. Go to: https://business.google.com/');
      console.log('2. Open DevTools (F12) → Network tab');
      console.log('3. Click around in your dashboard');
      console.log('4. Look for API calls with: accounts/XXXXX/locations/YYYYY');
    }
    
    process.exit(1);
  }
}

main();

