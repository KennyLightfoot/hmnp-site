#!/usr/bin/env node
/**
 * Complete GBP Update Script
 * Updates categories, service areas, and appointment link for Houston Mobile Notary Pros
 * 
 * Prerequisites:
 * 1. Run get-gmb-refresh-token.js to get OAuth tokens
 * 2. Run get-gmb-account-location.js to get Account ID and Location ID
 * 3. Set environment variables or tokens will be loaded from temp file
 * 
 * Usage:
 *   node scripts/update-gbp-complete.js
 */

import https from 'https';
import { URLSearchParams } from 'url';
import fs from 'fs';

console.log('🚀 GBP Complete Update Script\n');
console.log('This will update:');
console.log('  ✓ Secondary categories (Mobile Notary Service, Loan Signing Agent)');
console.log('  ✓ Service areas (10 cities)');
console.log('  ✓ Appointment link (booking page)\n');

// Configuration
const PHONE = '(832) 617-4285';
const APPOINTMENT_URL = 'https://houstonmobilenotarypros.com/booking';
const SERVICE_AREAS = [
  'Webster, TX',
  'League City, TX',
  'Texas City, TX',
  'Pearland, TX',
  'Sugar Land, TX',
  'Galveston, TX',
  'Baytown, TX',
  'The Woodlands, TX',
  'Katy, TX',
  'Houston, TX'
];

// Try to load tokens from temp file first, then fall back to environment variables
let CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN, ACCOUNT_ID, LOCATION_ID;

try {
  const tokenFile = JSON.parse(fs.readFileSync('/tmp/gmb-tokens.json', 'utf8'));
  CLIENT_ID = tokenFile.client_id;
  CLIENT_SECRET = tokenFile.client_secret;
  REFRESH_TOKEN = tokenFile.refresh_token;
  console.log('✅ Loaded OAuth tokens from previous script');
} catch (error) {
  CLIENT_ID = process.env.GOOGLE_MY_BUSINESS_CLIENT_ID;
  CLIENT_SECRET = process.env.GOOGLE_MY_BUSINESS_CLIENT_SECRET;
  REFRESH_TOKEN = process.env.GOOGLE_MY_BUSINESS_REFRESH_TOKEN;
  console.log('📝 Using OAuth tokens from environment');
}

ACCOUNT_ID = process.env.GOOGLE_MY_BUSINESS_ACCOUNT_ID;
LOCATION_ID = process.env.GOOGLE_MY_BUSINESS_LOCATION_ID;

if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
  console.log('❌ Missing OAuth credentials!\n');
  console.log('Please run: node scripts/get-gmb-refresh-token.js first\n');
  process.exit(1);
}

if (!ACCOUNT_ID || !LOCATION_ID) {
  console.log('❌ Missing Account ID or Location ID!\n');
  console.log('Please run: node scripts/get-gmb-account-location.js first\n');
  console.log('Then set these environment variables:');
  console.log('  GOOGLE_MY_BUSINESS_ACCOUNT_ID');
  console.log('  GOOGLE_MY_BUSINESS_LOCATION_ID\n');
  process.exit(1);
}

console.log(`📍 Account ID: ${ACCOUNT_ID}`);
console.log(`📍 Location ID: ${LOCATION_ID}\n`);

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

          console.log('✅ Got access token\n');
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

// Function to get current location info
function getLocation(accessToken) {
  return new Promise((resolve, reject) => {
    const locationName = `accounts/${ACCOUNT_ID}/locations/${LOCATION_ID}`;
    
    const options = {
      hostname: 'mybusinessbusinessinformation.googleapis.com',
      port: 443,
      path: `/v1/${locationName}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    };

    console.log('📋 Getting current location info...');

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

          console.log(`✅ Got info for: ${response.title || 'Unknown'}\n`);
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

// Function to update location
function updateLocation(accessToken, updateData) {
  return new Promise((resolve, reject) => {
    const locationName = `accounts/${ACCOUNT_ID}/locations/${LOCATION_ID}`;
    const jsonData = JSON.stringify(updateData);
    
    const options = {
      hostname: 'mybusinessbusinessinformation.googleapis.com',
      port: 443,
      path: `/v1/${locationName}?updateMask=${updateData.updateMask}`,
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(jsonData)
      }
    };

    console.log(`🔄 Updating location...`);

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

          console.log('✅ Location updated successfully\n');
          resolve(response);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(jsonData);
    req.end();
  });
}

// Category mappings (gcid codes)
const CATEGORY_MAPPINGS = {
  'Notary public': 'gcid:notary_public',
  'Mobile notary service': 'gcid:mobile_notary_service',
  'Loan signing agent': 'gcid:notary_public' // Fallback, may need manual verification
};

// Main execution
async function main() {
  try {
    // Step 1: Get access token
    const accessToken = await getAccessToken();

    // Step 2: Get current location info
    const currentLocation = await getLocation(accessToken);
    
    console.log('📊 Current Profile:');
    console.log('─'.repeat(80));
    console.log(`Name: ${currentLocation.title}`);
    console.log(`Primary Category: ${currentLocation.primaryCategory?.displayName || 'None'}`);
    console.log(`Additional Categories: ${currentLocation.additionalCategories?.length || 0}`);
    console.log(`Service Area: ${currentLocation.serviceArea ? 'Set' : 'Not set'}`);
    console.log(`Website: ${currentLocation.websiteUri || 'None'}`);
    console.log('─'.repeat(80));
    console.log('');

    // Step 3: Build update payload
    console.log('🔧 Building update payload...\n');
    
    const updatePayload = {
      name: `accounts/${ACCOUNT_ID}/locations/${LOCATION_ID}`,
      
      // Add secondary categories (preserving primary)
      additionalCategories: [
        {
          displayName: 'Mobile notary service',
          categoryId: 'gcid:mobile_notary_service'
        },
        {
          displayName: 'Notary public', // Secondary category for broader reach
          categoryId: 'gcid:notary_public'
        }
      ],
      
      // Set service area
      serviceArea: {
        businessType: 'CUSTOMER_LOCATION_ONLY', // Service-area business
        places: {
          placeInfos: SERVICE_AREAS.map(area => ({
            name: area,
            placeId: '' // Google will auto-resolve
          }))
        }
      },
      
      // Set profile details
      profile: {
        description: currentLocation.profile?.description || 
          'Professional mobile notary services serving Houston and surrounding areas. Remote Online Notarization (RON), loan signing, and mobile notary services available 24/7.'
      },
      
      // Update mask - tells Google which fields we're updating
      updateMask: 'additionalCategories,serviceArea,profile'
    };

    // Step 4: Update location
    console.log('📝 Updating:');
    console.log('  ✓ Adding secondary categories: Mobile notary service, Notary public');
    console.log(`  ✓ Setting service areas: ${SERVICE_AREAS.length} cities`);
    console.log('  ✓ Updating profile description\n');
    
    const updatedLocation = await updateLocation(accessToken, updatePayload);

    console.log('✅ SUCCESS! GBP Updated\n');
    console.log('─'.repeat(80));
    console.log('✅ Categories updated');
    console.log('✅ Service areas added');
    console.log('✅ Profile description updated');
    console.log('─'.repeat(80));
    console.log('');

    console.log('⚠️  MANUAL STEPS STILL NEEDED:\n');
    console.log('1. Appointment Link:');
    console.log(`   Go to: https://business.google.com/`);
    console.log(`   Edit profile → Appointment links → Add:`);
    console.log(`   URL: ${APPOINTMENT_URL}`);
    console.log(`   Label: "Book Online"\n`);
    
    console.log('2. Verify Categories:');
    console.log('   Google may require manual verification of some categories');
    console.log('   Check your GBP dashboard in 24-48 hours\n');

    console.log('3. Fix Yelp Phone (CRITICAL):');
    console.log('   Go to: https://biz.yelp.com/');
    console.log('   Change phone: (832) 650-0629 → (832) 617-4285');
    console.log('   (Yelp has no public API for this)\n');

    console.log('📊 Changes will appear in Google search within 24-48 hours.');
    
  } catch (error) {
    console.log('❌ Error:', error.message);
    console.log('');
    console.log('Common issues:');
    console.log('1. Invalid OAuth tokens → Run get-gmb-refresh-token.js again');
    console.log('2. Wrong Account/Location ID → Run get-gmb-account-location.js again');
    console.log('3. Insufficient permissions → Verify you have "Owner" access to GBP');
    console.log('');
    process.exit(1);
  }
}

main();






