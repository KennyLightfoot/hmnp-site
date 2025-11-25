#!/usr/bin/env node
/**
 * Complete GBP Update Script
 * Updates categories, service areas, and business description for Houston Mobile Notary Pros
 * 
 * Prerequisites:
 * 1. Run get-gmb-refresh-token.js to get OAuth tokens
 * 2. Run get-gmb-account-location.js to get Account ID and Location ID
 * 3. Set environment variables in .env.local or .env files
 * 
 * Usage:
 *   node scripts/update-gbp-complete.js
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

// Import local SEO data
let LOCAL_SEO_ZIP_CODES = [];
try {
  // Try to import from lib/local-seo-data.ts (if using TypeScript loader)
  // Otherwise, we'll use a fallback list
  const localSeoPath = join(__dirname, '../lib/local-seo-data.ts');
  // For now, we'll use a comprehensive list based on the data structure
  LOCAL_SEO_ZIP_CODES = [
    { city: 'Texas City', zipCode: '77591' },
    { city: 'Texas City', zipCode: '77590' },
    { city: 'League City', zipCode: '77573' },
    { city: 'League City', zipCode: '77574' },
    { city: 'Friendswood', zipCode: '77546' },
    { city: 'Pearland', zipCode: '77581' },
    { city: 'Pearland', zipCode: '77584' },
    { city: 'Clear Lake', zipCode: '77058' },
    { city: 'Clear Lake', zipCode: '77059' },
    { city: 'Webster', zipCode: '77598' },
    { city: 'Pasadena', zipCode: '77502' },
    { city: 'Galveston', zipCode: '77550' },
    { city: 'Sugar Land', zipCode: '77479' },
    { city: 'Baytown', zipCode: '77520' },
    { city: 'Baytown', zipCode: '77521' },
    { city: 'The Woodlands', zipCode: '77380' },
    { city: 'The Woodlands', zipCode: '77381' },
    { city: 'Katy', zipCode: '77449' },
    { city: 'Katy', zipCode: '77450' },
    { city: 'Houston', zipCode: '77058' },
  ];
} catch (error) {
  console.log('⚠️  Could not load local SEO data, using fallback list');
}

console.log('🚀 GBP Complete Update Script\n');
console.log('This will update:');
console.log('  ✓ Secondary categories (Mobile Notary Service, Loan Signing Agent)');
console.log('  ✓ Service areas (all cities from local SEO data)');
console.log('  ✓ Business description (optimized)\n');

// Configuration
const PHONE = '(832) 617-4285';
const APPOINTMENT_URL = 'https://houstonmobilenotarypros.com/booking';

// Generate service areas from local SEO data (unique cities with TX suffix)
const uniqueCities = [...new Set(LOCAL_SEO_ZIP_CODES.map(loc => loc.city))];
const SERVICE_AREAS = uniqueCities.map(city => `${city}, TX`);

// Enhanced business description (750 chars max, keyword-optimized)
const BUSINESS_DESCRIPTION = `Houston Mobile Notary Pros provides fast, professional mobile notary services across Greater Houston. We come to you—home, office, hospital, anywhere. Same-day available. Licensed, bonded, and insured.

Services: Mobile Notary ($75+), RON/Online Notary ($25/act), Loan Signing Agent ($175+), After-Hours & Emergency.

Serving: ${uniqueCities.slice(0, 10).join(', ')}, and all of Houston within 25-30 miles.

Transparent pricing. Book online 24/7 or call (832) 617-4285.`;

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

LOCATION_ID = process.env.GOOGLE_MY_BUSINESS_LOCATION_ID;

if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
  console.log('❌ Missing OAuth credentials!\n');
  console.log('Please run: node scripts/get-gmb-refresh-token.js first\n');
  process.exit(1);
}

if (!LOCATION_ID) {
  console.log('❌ Missing Location ID!\n');
  console.log('Please set GOOGLE_MY_BUSINESS_LOCATION_ID in your .env.local file.\n');
  process.exit(1);
}

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
    const locationName = `locations/${LOCATION_ID}`;
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
          displayName: 'Loan signing agent',
          categoryId: 'gcid:notary_public' // Loan signing uses notary category
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
      
      // Set profile details with optimized description
      profile: {
        description: BUSINESS_DESCRIPTION
      },
      
      // Update mask - tells Google which fields we're updating
      updateMask: 'additionalCategories,serviceArea,profile'
    };

    // Step 4: Update location
    console.log('📝 Updating:');
    console.log('  ✓ Adding secondary categories: Mobile notary service, Loan signing agent');
    console.log(`  ✓ Setting service areas: ${SERVICE_AREAS.length} cities`);
    console.log(`    Cities: ${SERVICE_AREAS.slice(0, 10).join(', ')}${SERVICE_AREAS.length > 10 ? '...' : ''}`);
    console.log('  ✓ Updating profile description (optimized)\n');
    
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








