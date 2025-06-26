#!/usr/bin/env node

/**
 * Comprehensive Booking System Test Suite
 * Tests all major booking functionality end-to-end
 */

// ES Module setup for main execution check

const baseUrl = 'http://localhost:3000';

// ANSI color codes for better output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, description) {
  log(`\n📋 ${step}: ${description}`, 'bold');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

async function makeRequest(endpoint, options = {}) {
  const url = `${baseUrl}${endpoint}`;
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'BookingSystemTest/1.0'
    }
  };
  
  const finalOptions = { ...defaultOptions, ...options };
  
  try {
    logInfo(`Making ${finalOptions.method || 'GET'} request to ${endpoint}`);
    const response = await fetch(url, finalOptions);
    const data = await response.json().catch(() => ({}));
    
    return {
      success: response.ok,
      status: response.status,
      data,
      response
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      status: 0
    };
  }
}

async function testHealthCheck() {
  logStep('1', 'Testing Health Check Endpoint');
  
  const result = await makeRequest('/api/health');
  
  if (result.success) {
    logSuccess('Health check passed');
    logInfo(`Database status: ${result.data.services?.database?.status || 'unknown'}`);
    logInfo(`Response time: ${result.data.responseTime || 'unknown'}ms`);
    return true;
  } else {
    logError(`Health check failed: ${result.error || result.status}`);
    return false;
  }
}

async function testServicesEndpoint() {
  logStep('2', 'Testing Services Endpoint');
  
  const result = await makeRequest('/api/services');
  
  if (result.success && result.data.services) {
    logSuccess(`Found ${result.data.services.all.length} services`);
    result.data.services.all.forEach(service => {
      logInfo(`- ${service.name}: $${service.price} (${service.hasCalendarIntegration ? 'Calendar' : 'No Calendar'})`);
    });
    return result.data.services.all;
  } else {
    logError(`Services endpoint failed: ${result.data?.error || result.error || result.status}`);
    return null;
  }
}

async function testBookingCreation(services) {
  logStep('3', 'Testing Booking Creation');
  
  if (!services || services.length === 0) {
    logError('No services available for booking test');
    return null;
  }
  
  const testService = services[0];
  logInfo(`Using service: ${testService.name} (ID: ${testService.id})`);
  
  const bookingData = {
    customerName: 'Test Customer',
    customerEmail: 'test@example.com',
    customerPhone: '555-123-4567',
    serviceId: testService.id,
    scheduledDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    locationType: 'CLIENT_SPECIFIED_ADDRESS',
    addressStreet: '123 Test Street',
    addressCity: 'Houston',
    addressState: 'TX',
    addressZip: '77001',
    notes: 'Test booking created by automated test suite',
    leadSource: 'Test Suite'
  };
  
  const result = await makeRequest('/api/bookings', {
    method: 'POST',
    body: JSON.stringify(bookingData)
  });
  
  if (result.success && result.data.booking) {
    logSuccess(`Booking created successfully: ${result.data.booking.id}`);
    logInfo(`Status: ${result.data.booking.status}`);
    logInfo(`Price: $${result.data.booking.finalPrice || result.data.booking.priceAtBooking}`);
    return result.data.booking;
  } else {
    logError(`Booking creation failed: ${result.data?.error || result.error || result.status}`);
    if (result.data?.details) {
      result.data.details.forEach(detail => logError(`- ${detail.msg || detail.message}`));
    }
    return null;
  }
}

async function testBookingRetrieval(bookingId) {
  logStep('4', 'Testing Booking Retrieval');
  
  if (!bookingId) {
    logWarning('Skipping booking retrieval test - no booking ID');
    return false;
  }
  
  const result = await makeRequest(`/api/bookings/${bookingId}`);
  
  if (result.success && result.data) {
    logSuccess('Booking retrieved successfully');
    logInfo(`Customer: ${result.data.signerName || result.data.customerName || 'Unknown'}`);
    logInfo(`Service: ${result.data.service?.name || 'Unknown'}`);
    logInfo(`Scheduled: ${result.data.scheduledDateTime ? new Date(result.data.scheduledDateTime).toLocaleString() : 'Not set'}`);
    return true;
  } else {
    logError(`Booking retrieval failed: ${result.data?.error || result.error || result.status}`);
    return false;
  }
}

async function testPendingPayments() {
  logStep('5', 'Testing Pending Payments Endpoint');
  
  const result = await makeRequest('/api/bookings/pending-payments', {
    headers: {
      'x-api-key': process.env.INTERNAL_API_KEY || 'test-key'
    }
  });
  
  if (result.success && result.data) {
    logSuccess('Pending payments endpoint working');
    logInfo(`Found ${result.data.data?.bookings?.length || 0} pending payments`);
    return true;
  } else {
    logError(`Pending payments test failed: ${result.data?.error || result.error || result.status}`);
    return false;
  }
}

async function testGHLSync() {
  logStep('6', 'Testing GHL Sync Endpoint');
  
  const ghlData = {
    contactId: 'test-contact-123',
    customerName: 'GHL Test Customer',
    customerEmail: 'ghl-test@example.com',
    customerPhone: '555-987-6543',
    serviceName: 'Standard Mobile Notary',
    scheduledDateTime: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // Day after tomorrow
    locationType: 'CLIENT_SPECIFIED_ADDRESS',
    addressStreet: '456 GHL Test Avenue',
    addressCity: 'Houston',
    addressState: 'TX',
    leadSource: 'GHL_Test_Suite'
  };
  
  const result = await makeRequest('/api/bookings/sync', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.INTERNAL_API_KEY || 'test-key'
    },
    body: JSON.stringify(ghlData)
  });
  
  if (result.success && result.data) {
    logSuccess('GHL sync endpoint working');
    logInfo(`Booking ID: ${result.data.bookingId || 'Unknown'}`);
    return true;
  } else {
    logError(`GHL sync test failed: ${result.data?.error || result.error || result.status}`);
    return false;
  }
}

async function cleanupTestData() {
  logStep('7', 'Cleanup (Note: Test data may remain in database)');
  logWarning('Test bookings created during this test may remain in the database');
  logWarning('In production, you should implement a cleanup mechanism');
}

async function runFullTest() {
  log('🚀 Starting Comprehensive Booking System Test', 'bold');
  log('='.repeat(60), 'blue');
  
  const results = {
    healthCheck: false,
    services: false,
    bookingCreation: false,
    bookingRetrieval: false,
    pendingPayments: false,
    ghlSync: false
  };
  
  try {
    // Test 1: Health Check
    results.healthCheck = await testHealthCheck();
    
    // Test 2: Services
    const services = await testServicesEndpoint();
    results.services = !!services;
    
    // Test 3: Booking Creation
    const booking = await testBookingCreation(services);
    results.bookingCreation = !!booking;
    
    // Test 4: Booking Retrieval
    results.bookingRetrieval = await testBookingRetrieval(booking?.id);
    
    // Test 5: Pending Payments
    results.pendingPayments = await testPendingPayments();
    
    // Test 6: GHL Sync
    results.ghlSync = await testGHLSync();
    
    // Test 7: Cleanup
    await cleanupTestData();
    
  } catch (error) {
    logError(`Test suite error: ${error.message}`);
  }
  
  // Final Results
  log('\n' + '='.repeat(60), 'blue');
  log('📊 TEST RESULTS SUMMARY', 'bold');
  log('='.repeat(60), 'blue');
  
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    const color = passed ? 'green' : 'red';
    log(`${status} ${test.replace(/([A-Z])/g, ' $1').toLowerCase()}`, color);
  });
  
  log('\n' + '='.repeat(60), 'blue');
  const overallStatus = passed === total ? 'ALL TESTS PASSED' : `${passed}/${total} TESTS PASSED`;
  const overallColor = passed === total ? 'green' : 'yellow';
  log(`🎯 OVERALL: ${overallStatus}`, overallColor);
  
  if (passed === total) {
    log('🎉 Your booking system is working perfectly!', 'green');
  } else {
    log('🔧 Some issues found. Check the logs above for details.', 'yellow');
  }
  
  return passed === total;
}

// Run the test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runFullTest()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      logError(`Fatal error: ${error.message}`);
      process.exit(1);
    });
}

export { runFullTest, makeRequest }; 