#!/usr/bin/env node

/**
 * Script to test GoHighLevel API v2 connection and credentials
 * Verifies that the Private Integrations v2 API setup is working correctly
 * 
 * Usage: node scripts/test-ghl-connection.js
 */

import {
  validateEnvVariables,
  makeGhlV2Request,
  getCompanyLocations,
  getLocationCustomFields,
  getLocationTags,
  getLocationPipelines,
  getLocationWebhooks,
  getLocationContacts,
  printSuccess,
  printError,
  printInfo
} from './ghl-api-v2-utils.js';

const GHL_API_KEY = process.env.GHL_API_KEY;
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;
const GHL_COMPANY_ID = process.env.GHL_COMPANY_ID;

// Validate environment variables
if (!validateEnvVariables()) {
  process.exit(1);
}

async function testEndpoint(name, endpoint, requestFn) {
  try {
    console.log(`Testing ${name}...`);
    
    const result = await requestFn();
    printSuccess(`${name}: Success`);
    
    // Show relevant info based on endpoint
    if (name.includes('Location Info')) {
      console.log(`   Location: ${result.name || 'Unknown'}`);
      console.log(`   Address: ${result.address || 'Not set'}`);
    } else if (name.includes('Company Locations')) {
      console.log(`   Found: ${result.locations?.length || 0} locations`);
      if (result.locations?.length > 0) {
        console.log(`   Current Location ID: ${GHL_LOCATION_ID}`);
        const currentLocation = result.locations.find(loc => loc.id === GHL_LOCATION_ID);
        if (currentLocation) {
          console.log(`   Current Location Name: ${currentLocation.name || 'Unknown'}`);
        }
      }
    } else if (name.includes('Custom Fields')) {
      console.log(`   Found: ${result.customFields?.length || 0} custom fields`);
    } else if (name.includes('Tags')) {
      console.log(`   Found: ${result.tags?.length || 0} tags`);
    } else if (name.includes('Pipelines')) {
      console.log(`   Found: ${result.pipelines?.length || 0} pipelines`);
    } else if (name.includes('Webhooks')) {
      console.log(`   Found: ${result.webhooks?.length || 0} webhooks`);
    } else if (name.includes('Contacts')) {
      console.log(`   Found: ${result.contacts?.length || 0} contacts`);
    }

    return true;
    
  } catch (error) {
    printError(`${name}: Connection Error`);
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

async function runConnectionTests() {
  console.log('🔌 Testing GoHighLevel API v2 Connection...\n');
  console.log(`📍 Company ID: ${GHL_COMPANY_ID}`);
  console.log(`📍 Location ID: ${GHL_LOCATION_ID}`);
  console.log(`🔑 API Key: ${GHL_API_KEY.substring(0, 8)}...${GHL_API_KEY.substring(GHL_API_KEY.length - 4)}\n`);

  const tests = [
    {
      name: 'Company Locations',
      requestFn: getCompanyLocations
    },
    {
      name: 'Location Info',
      requestFn: () => makeGhlV2Request(`/locations/${GHL_LOCATION_ID}`)
    },
    {
      name: 'Custom Fields',
      requestFn: getLocationCustomFields
    },
    {
      name: 'Tags',
      requestFn: getLocationTags
    },
    {
      name: 'Pipelines',
      requestFn: getLocationPipelines
    },
    {
      name: 'Webhooks',
      requestFn: getLocationWebhooks
    },
    {
      name: 'Contacts (limited)',
      requestFn: () => getLocationContacts({ limit: 1 })
    }
  ];

  let successCount = 0;
  let totalTests = tests.length;

  for (const test of tests) {
    const success = await testEndpoint(test.name, null, test.requestFn);
    if (success) successCount++;
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n📊 Connection Test Results:');
  console.log(`✅ Successful: ${successCount}/${totalTests} tests`);
  console.log(`❌ Failed: ${totalTests - successCount}/${totalTests} tests`);

  if (successCount === totalTests) {
    console.log('\n🎉 All API connections are working correctly!');
    console.log('\nYour GHL v2 API integration is ready for:');
    console.log('• Creating custom fields');
    console.log('• Managing contact tags');
    console.log('• Setting up pipelines');
    console.log('• Configuring webhooks');
    console.log('• Processing contact data');
    console.log('\nPrivate Integrations v2 has been successfully configured.');
  } else if (successCount > 0) {
    console.log('\n⚠️  Partial connectivity - some endpoints are working');
    console.log('Check the failed tests above and verify your API permissions.');
  } else {
    console.log('\n❌ No API v2 connections working');
    console.log('\nTroubleshooting checklist:');
    console.log('1. Verify your API key is correct and active');
    console.log('2. Check that your company ID and location ID are accurate');
    console.log('3. Ensure your Private Integration has the required permissions');
    console.log('4. Confirm your GHL account is active and in good standing');
    console.log('5. Check if there are any rate limits or IP restrictions');
  }

  // Additional diagnostic info
  console.log('\n🔍 Diagnostic Information:');
  console.log(`Node.js version: ${process.version}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
}

// Run the tests
runConnectionTests().catch(console.error); 