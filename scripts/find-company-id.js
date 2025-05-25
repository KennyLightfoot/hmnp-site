#!/usr/bin/env node

/**
 * Script to find the GHL company ID using the location ID
 */

import 'dotenv/config';
import https from 'https';
import { URL } from 'url';

const GHL_API_KEY = process.env.GHL_API_KEY;
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;
const GHL_API_BASE_URL = process.env.GHL_API_BASE_URL || 'https://services.leadconnectorhq.com';

if (!GHL_API_KEY || !GHL_LOCATION_ID) {
  console.error('Missing required environment variables:');
  if (!GHL_API_KEY) console.error('- GHL_API_KEY');
  if (!GHL_LOCATION_ID) console.error('- GHL_LOCATION_ID');
  process.exit(1);
}

function makeGhlRequest(endpoint) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${GHL_API_BASE_URL}${endpoint}`);
    
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'GET',
      headers: {
        'Authorization': GHL_API_KEY,
        'Version': '2021-07-28',
        'Content-Type': 'application/json'
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const parsedData = JSON.parse(data);
            resolve(parsedData);
          } catch (error) {
            console.error('Error parsing JSON:', error.message);
            resolve(null);
          }
        } else {
          console.error(`API Error: ${res.statusCode} ${res.statusMessage}`);
          resolve(null);
        }
      });
    });
    
    req.on('error', (error) => {
      console.error(`Request Error: ${error.message}`);
      resolve(null);
    });
    
    req.end();
  });
}

async function findCompanyId() {
  console.log('🔍 Attempting to find your GHL company ID...');
  console.log(`Using location ID: ${GHL_LOCATION_ID}`);
  
  try {
    // First, try to get location details to see if company ID is included
    console.log('\n1. Checking location details...');
    const locationData = await makeGhlRequest(`/locations/${GHL_LOCATION_ID}`);
    
    if (locationData) {
      console.log('Location data found:');
      console.log('- Name:', locationData.name || 'Not available');
      
      if (locationData.companyId) {
        console.log('\n✅ SUCCESS: Found company ID in location data');
        console.log(`Company ID: ${locationData.companyId}`);
        return locationData.companyId;
      } else {
        console.log('- Company ID not found in location data');
      }
    }
    
    // Try another approach - get user info
    console.log('\n2. Checking user info...');
    const userData = await makeGhlRequest('/users/self');
    
    if (userData) {
      console.log('User data found:');
      
      if (userData.companyId) {
        console.log('\n✅ SUCCESS: Found company ID in user data');
        console.log(`Company ID: ${userData.companyId}`);
        return userData.companyId;
      } else if (userData.locationId && userData.locationId.companyId) {
        console.log('\n✅ SUCCESS: Found company ID in location reference');
        console.log(`Company ID: ${userData.locationId.companyId}`);
        return userData.locationId.companyId;
      } else {
        console.log('- Company ID not found in user data');
      }
    }
    
    // Try getting company locations to see if there's useful info
    console.log('\n3. Checking all available endpoints for clues...');
    const endpoints = [
      '/locations/self',
      '/companies/self',
      '/companies',
      '/locations'
    ];
    
    for (const endpoint of endpoints) {
      console.log(`Trying endpoint: ${endpoint}`);
      const data = await makeGhlRequest(endpoint);
      
      if (data) {
        console.log('- Data retrieved, looking for company ID...');
        console.log(JSON.stringify(data, null, 2));
      } else {
        console.log('- No data or access denied');
      }
    }
    
    console.log('\n❌ Could not automatically find your company ID.');
    console.log('Please check your GHL account dashboard or contact support.');
    
  } catch (error) {
    console.error('Error while searching for company ID:', error);
  }
}

findCompanyId();
