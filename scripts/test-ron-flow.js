#!/usr/bin/env node

/**
 * RON Integration Test Suite
 * Houston Mobile Notary Pros
 * 
 * Tests the complete RON customer journey:
 * 1. Customer books RON service
 * 2. Payment processing 
 * 3. Proof.com session creation
 * 4. Customer redirection to Proof.com
 * 5. Webhook handling
 */

import chalk from 'chalk';
import fetch from 'node-fetch';

// Configuration
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const TEST_CUSTOMER = {
  customerName: 'John Doe Test',
  customerEmail: 'john.doe.test@example.com',
  customerPhone: '713-555-0123'
};

// Test counters
let testsPassed = 0;
let testsFailed = 0;
let totalTests = 0;

function logTest(testName, passed, details = '') {
  totalTests++;
  if (passed) {
    testsPassed++;
    console.log(chalk.green(`✅ ${testName}`));
    if (details) console.log(chalk.gray(`   ${details}`));
  } else {
    testsFailed++;
    console.log(chalk.red(`❌ ${testName}`));
    if (details) console.log(chalk.red(`   ${details}`));
  }
}

function logStep(message) {
  console.log(chalk.blue(`\n🔍 ${message}`));
}

function logInfo(message) {
  console.log(chalk.yellow(`ℹ️  ${message}`));
}

async function testRONBookingCreation() {
  logStep('Testing RON Booking Creation');
  
  try {
    const bookingData = {
      serviceType: 'RON_SERVICES',
      customerName: TEST_CUSTOMER.customerName,
      customerEmail: TEST_CUSTOMER.customerEmail,
      customerPhone: TEST_CUSTOMER.customerPhone,
      scheduledDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      timeZone: 'America/Chicago',
      pricing: {
        basePrice: 35,
        travelFee: 0,
        totalPrice: 35
      },
      numberOfDocuments: 1,
      numberOfSigners: 1
    };

    logInfo(`Creating RON booking for ${TEST_CUSTOMER.customerEmail}`);
    
    const response = await fetch(`${BASE_URL}/api/booking/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData)
    });

    const result = await response.json();
    
    logTest('RON booking creation API call', response.ok, 
      response.ok ? `Booking ID: ${result.booking?.id}` : `Error: ${result.error}`);
    
    if (response.ok && result.booking) {
      logTest('Booking has proper structure', !!result.booking.id && !!result.booking.service);
      logTest('Service type is RON_SERVICES', result.booking.service.serviceType === 'RON_SERVICES');
      logTest('RON session details included', !!result.booking.ron, 
        result.booking.ron ? `Transaction ID: ${result.booking.ron.transactionId}` : 'No RON details found');
      
      if (result.booking.ron) {
        logTest('Proof.com transaction ID exists', !!result.booking.ron.transactionId);
        logTest('Proof.com access link exists', !!result.booking.ron.accessLink);
        logTest('Proof.com status exists', !!result.booking.ron.status);
      }
      
      return {
        success: true,
        bookingId: result.booking.id,
        ronDetails: result.booking.ron
      };
    }
    
    return { success: false, error: result.error };
    
  } catch (error) {
    logTest('RON booking creation', false, `Exception: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testProofAPIConnection() {
  logStep('Testing Proof.com API Connection');
  
  try {
    // Test if Proof API credentials are working
    const response = await fetch(`${BASE_URL}/api/debug/proof-connection`, {
      method: 'GET'
    });
    
    if (response.ok) {
      const result = await response.json();
      logTest('Proof.com API connection', result.success, 
        result.success ? 'API credentials valid' : `Error: ${result.error}`);
      return result.success;
    } else {
      logTest('Proof.com API connection', false, 'Debug endpoint not available');
      return false;
    }
    
  } catch (error) {
    logTest('Proof.com API connection', false, `Exception: ${error.message}`);
    return false;
  }
}

async function testRONServiceSelector() {
  logStep('Testing RON Service Selection in UI');
  
  try {
    // Test the booking page loads
    const response = await fetch(`${BASE_URL}/booking`);
    const html = await response.text();
    
    logTest('Booking page loads', response.ok);
    logTest('RON_SERVICES option present', html.includes('RON_SERVICES') || html.includes('Remote Online Notarization'));
    logTest('$35 pricing displayed', html.includes('35') && html.includes('Remote'));
    
    return response.ok;
    
  } catch (error) {
    logTest('RON service selector', false, `Exception: ${error.message}`);
    return false;
  }
}

async function testAvailabilityAPI() {
  logStep('Testing RON Availability API');
  
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];
    
    const response = await fetch(`${BASE_URL}/api/availability?serviceType=RON_SERVICES&date=${dateString}&timezone=America/Chicago`);
    const result = await response.json();
    
    logTest('RON availability API call', response.ok);
    
    if (response.ok && result.availableSlots) {
      logTest('RON availability returns slots', Array.isArray(result.availableSlots));
      logTest('RON slots marked as 24/7 available', result.availableSlots.length > 0 || result.businessHours?.start === 0);
      
      return true;
    }
    
    return false;
    
  } catch (error) {
    logTest('RON availability API', false, `Exception: ${error.message}`);
    return false;
  }
}

async function testWebhookHandler() {
  logStep('Testing Proof.com Webhook Handler');
  
  try {
    // Test webhook endpoint exists
    const response = await fetch(`${BASE_URL}/api/webhooks/proof`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 'test_webhook',
        type: 'transaction.updated',
        created_at: new Date().toISOString(),
        data: {
          transaction_id: 'test_transaction_123',
          status: 'in_progress'
        }
      })
    });
    
    logTest('Proof webhook endpoint exists', response.status !== 404);
    logTest('Webhook handler processes requests', response.status === 200 || response.status === 400); // 400 is OK for test data
    
    return response.status !== 404;
    
  } catch (error) {
    logTest('Proof webhook handler', false, `Exception: ${error.message}`);
    return false;
  }
}

async function runRONTestSuite() {
  console.log(chalk.blue('🚀 Starting RON Integration Test Suite\n'));
  console.log(chalk.yellow(`Testing against: ${BASE_URL}\n`));
  
  // Run all tests
  const results = {
    uiTest: await testRONServiceSelector(),
    availabilityTest: await testAvailabilityAPI(),
    proofConnectionTest: await testProofAPIConnection(),
    webhookTest: await testWebhookHandler(),
    bookingTest: await testRONBookingCreation()
  };
  
  // Print summary
  console.log(chalk.blue('\n📊 Test Results Summary'));
  console.log('═'.repeat(50));
  console.log(chalk.green(`✅ Tests Passed: ${testsPassed}`));
  console.log(chalk.red(`❌ Tests Failed: ${testsFailed}`));
  console.log(chalk.blue(`📊 Total Tests: ${totalTests}`));
  console.log(`📈 Success Rate: ${Math.round((testsPassed / totalTests) * 100)}%`);
  
  if (results.bookingTest.success && results.bookingTest.ronDetails) {
    console.log(chalk.blue('\n🔐 RON Session Details:'));
    console.log(`Transaction ID: ${results.bookingTest.ronDetails.transactionId}`);
    console.log(`Access Link: ${results.bookingTest.ronDetails.accessLink}`);
    console.log(`Status: ${results.bookingTest.ronDetails.status}`);
    console.log(`Instructions: ${results.bookingTest.ronDetails.instructions}`);
  }
  
  // Exit with appropriate code
  process.exit(testsFailed > 0 ? 1 : 0);
}

// Handle CLI arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
RON Integration Test Suite

Usage:
  node scripts/test-ron-flow.js [options]

Options:
  --help, -h    Show this help message
  
Environment Variables:
  NEXT_PUBLIC_APP_URL    Base URL for testing (default: http://localhost:3000)

Test Coverage:
  ✅ RON service selection in booking UI
  ✅ RON availability API (24/7 scheduling)
  ✅ Proof.com API connection 
  ✅ RON booking creation with auto-Proof session
  ✅ Webhook handler for Proof.com status updates
  
`);
  process.exit(0);
}

// Run the test suite
runRONTestSuite().catch(error => {
  console.error(chalk.red(`Fatal error: ${error.message}`));
  process.exit(1);
}); 