#!/usr/bin/env node
/**
 * Simple script to get GBP Account and Location IDs
 * Uses existing access token to avoid quota issues
 */

import https from 'https';
import fs from 'fs';

console.log('🔍 Finding your GBP Account & Location IDs...\n');

// Load the access token from temp file
let accessToken;
try {
  const tokenFile = JSON.parse(fs.readFileSync('/tmp/gmb-tokens.json', 'utf8'));
  accessToken = tokenFile.access_token;
  console.log('✅ Loaded access token from previous authentication\n');
} catch (error) {
  console.log('❌ No access token found. Please run get-gmb-refresh-token.js first.');
  process.exit(1);
}

// Function to make API calls
function makeAPICall(hostname, path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: hostname,
      port: 443,
      path: path,
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
        try {
          const response = JSON.parse(data);
          
          if (response.error) {
            reject(new Error(response.error.message || response.error));
            return;
          }

          resolve(response);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

// Main execution
async function main() {
  try {
    // Get accounts
    console.log('🔄 Fetching GMB accounts...');
    const accountsResponse = await makeAPICall(
      'mybusinessaccountmanagement.googleapis.com',
      '/v1/accounts'
    );
    
    if (!accountsResponse.accounts || accountsResponse.accounts.length === 0) {
      console.log('❌ No GMB accounts found!');
      return;
    }

    console.log('✅ Found GMB Accounts:\n');
    
    for (let i = 0; i < accountsResponse.accounts.length; i++) {
      const account = accountsResponse.accounts[i];
      const accountId = account.name.replace('accounts/', '');
      console.log(`${i + 1}. ${account.accountName || 'Unnamed Account'}`);
      console.log(`   Account ID: ${accountId}\n`);
    }

    // Get locations for first account
    const firstAccount = accountsResponse.accounts[0];
    const accountId = firstAccount.name.replace('accounts/', '');
    
    console.log('🔄 Fetching locations...');
    
    // Add delay to avoid quota issues
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const locationsResponse = await makeAPICall(
      'mybusinessbusinessinformation.googleapis.com',
      `/v1/accounts/${accountId}/locations`
    );
    
    if (!locationsResponse.locations || locationsResponse.locations.length === 0) {
      console.log('❌ No locations found in this account');
      return;
    }

    console.log('✅ Found Locations:\n');
    
    for (let i = 0; i < locationsResponse.locations.length; i++) {
      const location = locationsResponse.locations[i];
      const locationId = location.name.replace(/accounts\/.*\/locations\//, '');
      
      console.log(`${i + 1}. ${location.title || 'Unnamed Location'}`);
      console.log(`   Location ID: ${locationId}`);
      console.log(`   Category: ${location.primaryCategory?.displayName || 'Unknown'}\n`);
    }

    // Show environment variables
    if (locationsResponse.locations.length > 0) {
      const firstLocation = locationsResponse.locations[0];
      const locationId = firstLocation.name.replace(/accounts\/.*\/locations\//, '');
      
      console.log('\n✅ Environment Variables to Add:\n');
      console.log('────────────────────────────────────────────────────────────');
      console.log(`GOOGLE_MY_BUSINESS_CLIENT_ID="424427793005-7snj282ds9umcctijn5vg7ubsg033elk.apps.googleusercontent.com"`);
      console.log(`GOOGLE_MY_BUSINESS_CLIENT_SECRET="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"`);
      console.log(`GOOGLE_MY_BUSINESS_REFRESH_TOKEN="1//01WaBTQewOIuzCgYIARAAGAESNwF-L9IrOV0Y5wV-LdUGr506E99ceAmpFSfV505BzKQ7wnutjtfNWizyvjtm_iMkrEyedbCs1fc"`);
      console.log(`GOOGLE_MY_BUSINESS_ACCOUNT_ID="${accountId}"`);
      console.log(`GOOGLE_MY_BUSINESS_LOCATION_ID="${locationId}"`);
      console.log('────────────────────────────────────────────────────────────\n');
      
      // Save to a file for easy copying
      const envVars = `
# Google My Business API Credentials
GOOGLE_MY_BUSINESS_CLIENT_ID="424427793005-7snj282ds9umcctijn5vg7ubsg033elk.apps.googleusercontent.com"
GOOGLE_MY_BUSINESS_CLIENT_SECRET="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"
GOOGLE_MY_BUSINESS_REFRESH_TOKEN="1//01WaBTQewOIuzCgYIARAAGAESNwF-L9IrOV0Y5wV-LdUGr506E99ceAmpFSfV505BzKQ7wnutjtfNWizyvjtm_iMkrEyedbCs1fc"
GOOGLE_MY_BUSINESS_ACCOUNT_ID="${accountId}"
GOOGLE_MY_BUSINESS_LOCATION_ID="${locationId}"
`;
      
      fs.writeFileSync('/tmp/gmb-env-vars.txt', envVars.trim());
      console.log('💾 Saved to: /tmp/gmb-env-vars.txt');
      console.log('   (You can copy/paste these into your .env.local file)\n');
    }

  } catch (error) {
    if (error.message.includes('Quota exceeded')) {
      console.log('\n❌ API Quota Exceeded\n');
      console.log('Please wait 5-10 minutes and try again, or:');
      console.log('1. Go to: https://business.google.com/');
      console.log('2. Open Developer Tools (F12)');
      console.log('3. Go to Network tab');
      console.log('4. Click any button in your dashboard');
      console.log('5. Look for API calls with pattern: accounts/XXXXX/locations/YYYYY');
      console.log('6. Copy those IDs\n');
    } else {
      console.log('❌ Error:', error.message);
    }
    process.exit(1);
  }
}

main();






