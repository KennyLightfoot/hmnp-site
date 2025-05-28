#!/usr/bin/env node

/**
 * Script to test GoHighLevel API v2 connection and credentials
 * Verifies that the Private Integrations v2 API setup is working correctly
 * 
 * Updated with latest API v2 endpoints and comprehensive testing
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
  getLocationDetails,
  getLocationWorkflows,
  getLocationConversations,
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
    
    if (result) {
      printSuccess(`${name}: Success`);
      
      // Log relevant details based on endpoint type
      if (name === 'Location Details' && result.name) {
        console.log(`   Location Name: ${result.name}`);
        console.log(`   Location ID: ${result.id || GHL_LOCATION_ID}`);
      } else if (Array.isArray(result)) {
        console.log(`   Found: ${result.length} items`);
      } else if (result.customFields) {
        console.log(`   Found: ${result.customFields.length} custom fields`);
      } else if (result.tags) {
        console.log(`   Found: ${result.tags.length} tags`);
      } else if (result.pipelines) {
        console.log(`   Found: ${result.pipelines.length} pipelines`);
      } else if (result.webhooks) {
        console.log(`   Found: ${result.webhooks.length} webhooks`);
      } else if (result.contacts) {
        console.log(`   Found: ${result.contacts.length} contacts`);
      } else if (result.workflows) {
        console.log(`   Found: ${result.workflows.length} workflows`);
      } else if (result.conversations) {
        console.log(`   Found: ${result.conversations.length} conversations`);
      }
      
      return true;
    } else {
      printError(`${name}: No data returned`);
      return false;
    }
  } catch (error) {
    printError(`${name}: ${error.message}`);
    
    // Provide specific guidance based on error type
    if (error.message.includes('401')) {
      console.log('   💡 Check your Private Integration token in .env file');
    } else if (error.message.includes('403')) {
      console.log('   💡 Ensure your Private Integration has the required permissions');
    } else if (error.message.includes('404')) {
      console.log('   💡 This endpoint may require manual setup in GHL');
    }
    
    return false;
  }
}

async function testConnection() {
  console.log('🔌 Testing GoHighLevel API v2 Connection...\n');
  console.log('Configuration:');
  console.log(`- API Key: ${GHL_API_KEY ? GHL_API_KEY.substring(0, 20) + '...' : 'Missing'}`);
  console.log(`- Location ID: ${GHL_LOCATION_ID || 'Missing'}`);
  console.log(`- Company ID: ${GHL_COMPANY_ID || 'Not set (optional)'}`);
  console.log('\n' + '='.repeat(50) + '\n');

  const results = [];
  
  // Test location details first (most basic test)
  results.push(await testEndpoint(
    'Location Details', 
    '/locations/{locationId}',
    getLocationDetails
  ));
  
  // Test custom fields
  results.push(await testEndpoint(
    'Custom Fields', 
    '/locations/{locationId}/customFields',
    getLocationCustomFields
  ));
  
  // Test tags
  results.push(await testEndpoint(
    'Tags', 
    '/locations/{locationId}/tags',
    getLocationTags
  ));
  
  // Test pipelines
  results.push(await testEndpoint(
    'Pipelines/Opportunities', 
    '/opportunities/pipelines',
    getLocationPipelines
  ));
  
  // Test webhooks
  results.push(await testEndpoint(
    'Webhooks', 
    '/locations/{locationId}/webhooks',
    getLocationWebhooks
  ));
  
  // Test contacts
  results.push(await testEndpoint(
    'Contacts', 
    '/contacts',
    () => getLocationContacts({ limit: 1 })
  ));
  
  // Test workflows (may require additional permissions)
  results.push(await testEndpoint(
    'Workflows', 
    '/workflows',
    getLocationWorkflows
  ));
  
  // Test conversations (may require additional permissions)
  results.push(await testEndpoint(
    'Conversations', 
    '/conversations',
    () => getLocationConversations({ limit: 1 })
  ));

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Connection Test Summary:');
  console.log('='.repeat(50) + '\n');
  
  const successCount = results.filter(r => r).length;
  const totalTests = results.length;
  
  if (successCount === totalTests) {
    printSuccess(`All ${totalTests} API endpoints tested successfully! 🎉`);
    console.log('\nYour GHL v2 API integration is fully configured and ready.');
  } else if (successCount > 0) {
    console.log(`✅ ${successCount}/${totalTests} endpoints working`);
    console.log(`❌ ${totalTests - successCount}/${totalTests} endpoints failed`);
    console.log('\nYour GHL v2 API integration is partially working.');
    console.log('Some endpoints may require:');
    console.log('- Additional permissions in your Private Integration');
    console.log('- Manual setup in the GHL dashboard');
    console.log('- Higher account plan level');
  } else {
    console.log('\n❌ No API v2 connections working');
    console.log('\nPlease check:');
    console.log('1. Your Private Integration token is correct');
    console.log('2. Your Location ID is correct');
    console.log('3. Your Private Integration has the required permissions');
  }

  console.log('\n📚 Next Steps:');
  if (successCount < totalTests) {
    console.log('1. Review failed endpoints and their error messages');
    console.log('2. Check your Private Integration permissions');
    console.log('3. Manually create resources (pipelines, webhooks) if needed');
  }
  console.log('4. Run the complete setup script: node scripts/setup-ghl-complete.js');
  console.log('5. Check the setup status report: scripts/ghl-setup-status.md');
}

// Run the test
testConnection().catch(error => {
  printError('Unexpected error:', error.message);
  process.exit(1);
}); 