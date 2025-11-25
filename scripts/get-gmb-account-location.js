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

console.log('🚀 GMB Account & Location ID Finder\n');

// Try to load tokens from temp file first, then fall back to environment variables
let CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN;

try {
  const tokenFile = JSON.parse(fs.readFileSync('/tmp/gmb-tokens.json', 'utf8'));
  CLIENT_ID = tokenFile.client_id;
  CLIENT_SECRET = tokenFile.client_secret;
  REFRESH_TOKEN = tokenFile.refresh_token;
  console.log('✅ Loaded tokens from previous script');
} catch (error) {
  // Fall back to environment variables
  CLIENT_ID = process.env.GOOGLE_MY_BUSINESS_CLIENT_ID;
  CLIENT_SECRET = process.env.GOOGLE_MY_BUSINESS_CLIENT_SECRET;
  REFRESH_TOKEN = process.env.GOOGLE_MY_BUSINESS_REFRESH_TOKEN;
  console.log('📝 Using environment variables');
}

if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
  console.log('❌ Missing required credentials!');
  console.log('\nPlease either:');
  console.log('1. Run the get-gmb-refresh-token.js script first, OR');
  console.log('2. Set these environment variables:');
  console.log('   - GOOGLE_MY_BUSINESS_CLIENT_ID');
  console.log('   - GOOGLE_MY_BUSINESS_CLIENT_SECRET');
  console.log('   - GOOGLE_MY_BUSINESS_REFRESH_TOKEN');
  process.exit(1);
}

// Function to get fresh access token
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

    console.log('🔄 Getting fresh access token...');

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          
          if (response.error) {
            reject(new Error(response.error_description || response.error));
            return;
          }

          console.log('✅ Got access token');
          resolve(response.access_token);
        } catch (error) {
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

// Function to make API calls with retry logic
function makeAPICall(path, accessToken, retries = 3, delay = 60000) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'mybusinessaccountmanagement.googleapis.com',
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
            const errorMessage = response.error.message || response.error;
            
            // Check if it's a quota/rate limit error
            if (errorMessage.includes('Quota exceeded') || errorMessage.includes('quota') || errorMessage.includes('rate limit')) {
              if (retries > 0) {
                const waitTime = delay / 1000;
                console.log(`\n⚠️  Rate limit hit. Waiting ${waitTime} seconds before retry (${retries} retries left)...`);
                setTimeout(() => {
                  makeAPICall(path, accessToken, retries - 1, delay * 2)
                    .then(resolve)
                    .catch(reject);
                }, delay);
                return;
              } else {
                reject(new Error(`${errorMessage}\n\n💡 Tip: Wait 2-3 minutes and try again. Google limits API requests per minute.`));
                return;
              }
            }
            
            reject(new Error(errorMessage));
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

// Function to get locations with retry logic
function getLocations(accountId, accessToken, retries = 3, delay = 60000) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'mybusinessbusinessinformation.googleapis.com',
      port: 443,
      path: `/v1/accounts/${accountId}/locations`,
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
            const errorMessage = response.error.message || response.error;
            
            // Check if it's a quota/rate limit error
            if (errorMessage.includes('Quota exceeded') || errorMessage.includes('quota') || errorMessage.includes('rate limit')) {
              if (retries > 0) {
                const waitTime = delay / 1000;
                console.log(`\n⚠️  Rate limit hit. Waiting ${waitTime} seconds before retry (${retries} retries left)...`);
                setTimeout(() => {
                  getLocations(accountId, accessToken, retries - 1, delay * 2)
                    .then(resolve)
                    .catch(reject);
                }, delay);
                return;
              } else {
                reject(new Error(`${errorMessage}\n\n💡 Tip: Wait 2-3 minutes and try again. Google limits API requests per minute.`));
                return;
              }
            }
            
            reject(new Error(errorMessage));
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
    // Step 1: Get access token
    const accessToken = await getAccessToken();

    // Step 2: Get accounts
    console.log('\n🔍 Finding your GMB accounts...');
    const accountsResponse = await makeAPICall('/v1/accounts', accessToken);
    
    if (!accountsResponse.accounts || accountsResponse.accounts.length === 0) {
      console.log('❌ No GMB accounts found!');
      console.log('Make sure you have a Google My Business account set up.');
      return;
    }

    console.log('\n📋 Found GMB Accounts:');
    console.log('─'.repeat(80));
    
    for (let i = 0; i < accountsResponse.accounts.length; i++) {
      const account = accountsResponse.accounts[i];
      console.log(`${i + 1}. ${account.accountName || 'Unnamed Account'}`);
      console.log(`   Account ID: ${account.name.replace('accounts/', '')}`);
      console.log(`   Type: ${account.type || 'Unknown'}`);
      console.log('');
    }

    // For each account, get locations
    for (const account of accountsResponse.accounts) {
      const accountId = account.name.replace('accounts/', '');
      console.log(`\n🏢 Getting locations for account: ${account.accountName || accountId}`);
      
      try {
        const locationsResponse = await getLocations(accountId, accessToken);
        
        if (!locationsResponse.locations || locationsResponse.locations.length === 0) {
          console.log('   No locations found in this account');
          continue;
        }

        console.log('\n📍 Found Locations:');
        console.log('─'.repeat(80));
        
        for (let i = 0; i < locationsResponse.locations.length; i++) {
          const location = locationsResponse.locations[i];
          const locationId = location.name.replace(/accounts\/.*\/locations\//, '');
          
          console.log(`${i + 1}. ${location.title || 'Unnamed Location'}`);
          console.log(`   Location ID: ${locationId}`);
          console.log(`   Address: ${location.storefrontAddress?.addressLines?.[0] || 'No address'}`);
          console.log(`   Primary Category: ${location.primaryCategory?.displayName || 'Unknown'}`);
          console.log('');
        }

        // Show the environment variables for the first location
        if (locationsResponse.locations.length > 0) {
          const firstLocation = locationsResponse.locations[0];
          const locationId = firstLocation.name.replace(/accounts\/.*\/locations\//, '');
          
          console.log('\n✅ Environment Variables for your first location:');
          console.log('─'.repeat(80));
          console.log(`GOOGLE_MY_BUSINESS_ACCOUNT_ID="${accountId}"`);
          console.log(`GOOGLE_MY_BUSINESS_LOCATION_ID="${locationId}"`);
          console.log('─'.repeat(80));
        }
        
      } catch (error) {
        console.log(`   ❌ Error getting locations: ${error.message}`);
      }
    }

    // Clean up temp file
    try {
      fs.unlinkSync('/tmp/gmb-tokens.json');
      console.log('\n🧹 Cleaned up temporary token file');
    } catch (error) {
      // Ignore cleanup errors
    }

  } catch (error) {
    console.log('❌ Error:', error.message);
    process.exit(1);
  }
}

main(); 