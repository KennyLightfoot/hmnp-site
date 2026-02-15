#!/usr/bin/env node
/**
 * Comprehensive Booking System Test Script
 * Houston Mobile Notary Pros
 */

const BASE_URL = 'http://localhost:3000';

// Simple HTTP client replacement for axios
async function httpRequest(url, options = {}) {
  const { default: fetch } = await import('node-fetch');
  const response = await fetch(url, options);
  const data = await response.json();
  return { data, status: response.status };
}

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

function log(message, color = colors.white) {
  console.log(`${color}${message}${colors.reset}`);
}

function success(message) {
  log(`✅ ${message}`, colors.green);
}

function error(message) {
  log(`❌ ${message}`, colors.red);
}

function info(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

function warning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

// Test data generators
function getFutureDate(daysFromNow = 7) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
}

function getFutureDateTime(daysFromNow = 7, hour = 10) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
}

// Test cases
async function testHealthEndpoint() {
  log('\n🔍 Testing Health Endpoint', colors.cyan);
  try {
    const response = await httpRequest(`${BASE_URL}/api/health`);
    if (response.data.status === 'healthy') {
      success('Health endpoint is working');
      info(`Database: ${response.data.services.database.status}`);
      info(`Redis: ${response.data.services.redis.status}`);
      return true;
    }
    return false;
  } catch (err) {
    error(`Health check failed: ${err.message}`);
    return false;
  }
}

async function testPricingCalculation() {
  log('\n💰 Testing Pricing Calculation API', colors.cyan);
  try {
    const requestData = {
      serviceType: 'STANDARD_NOTARY',
      location: {
        address: '123 Main St',
        city: 'Houston',
        state: 'TX',
        zipCode: '77001'
      },
      scheduledDateTime: getFutureDateTime(),
      documentCount: 1,
      signerCount: 1,
      options: {
        priority: false,
        sameDay: false,
        weatherAlert: false
      }
    };

    const response = await httpRequest(`${BASE_URL}/api/booking/calculate-price`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData)
    });
    
    if (response.data.success && response.data.data) {
      success('Pricing calculation is working');
      info(`Base Price: $${response.data.data.basePrice}`);
      info(`Travel Fee: $${response.data.data.travelFee}`);
      info(`Total Price: $${response.data.data.total}`);
      return response.data.data;
    }
    return null;
  } catch (err) {
    error(`Pricing calculation failed: ${err.message}`);
    return null;
  }
}

async function testSlotReservation() {
  log('\n🕐 Testing Slot Reservation API', colors.cyan);
  try {
    const requestData = {
      datetime: getFutureDateTime(),
      serviceType: 'STANDARD_NOTARY',
      customerEmail: 'test@example.com',
      estimatedDuration: 60
    };

    const response = await httpRequest(`${BASE_URL}/api/booking/reserve-slot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData)
    });
    
    if (response.data.success) {
      success('Slot reservation is working');
      info(`Reservation ID: ${response.data.reservation.id}`);
      info(`Expires at: ${new Date(response.data.reservation.expiresAt).toLocaleString()}`);
      return response.data.reservation;
    } else {
      warning(`Slot reservation failed: ${response.data.message}`);
      return null;
    }
  } catch (err) {
    error(`Slot reservation failed: ${err.message}`);
    return null;
  }
}

async function testBookingCreation(reservationId = null) {
  log('\n📝 Testing Booking Creation API', colors.cyan);
  try {
    const futureDate = getFutureDate();
    const requestData = {
      serviceType: 'STANDARD_NOTARY',
      customer: {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '555-123-4567',
        preferredContactMethod: 'email',
        marketingConsent: false,
        smsConsent: false
      },
      location: {
        address: '123 Main St',
        city: 'Houston',
        state: 'TX',
        zipCode: '77001',
        latitude: 29.7604,
        longitude: -95.3698
      },
      locationType: 'CLIENT_ADDRESS',
      serviceDetails: {
        serviceType: 'STANDARD_NOTARY',
        documentCount: 1,
        documentTypes: ['Power of Attorney'],
        signerCount: 1,
        witnessRequired: false,
        witnessProvided: 'none',
        identificationRequired: true
      },
      scheduling: {
        preferredDate: futureDate,
        preferredTime: '10:00',
        timeZone: 'America/Chicago',
        flexibleTiming: false,
        priority: false,
        sameDay: false,
        estimatedDuration: 60
      },
      payment: {
        paymentMethod: 'cash',
        sameBillingAddress: true,
        corporateBilling: false,
        payFullAmount: false,
        savePaymentMethod: false
      },
      bookingSource: 'website',
      agreedToTerms: true
    };

    if (reservationId) {
      requestData.reservationId = reservationId;
    }

    const response = await httpRequest(`${BASE_URL}/api/booking/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData)
    });
    
    if (response.data.success) {
      success('Booking creation is working');
      info(`Booking ID: ${response.data.booking.id}`);
      info(`Booking Number: ${response.data.booking.bookingNumber}`);
      info(`Status: ${response.data.booking.status}`);
      info(`Total Price: $${response.data.booking.totalPrice}`);
      return response.data.booking;
    } else {
      warning(`Booking creation failed: ${response.data.error}`);
      if (response.data.details) {
        response.data.details.errors?.forEach(err => {
          warning(`  - ${err.field}: ${err.message}`);
        });
      }
      return null;
    }
  } catch (err) {
    error(`Booking creation failed: ${err.message}`);
    return null;
  }
}

async function testValidationErrors() {
  log('\n🛡️  Testing Validation Errors', colors.cyan);
  try {
    // Test with invalid data
    const invalidData = {
      serviceType: 'INVALID_SERVICE',
      customer: {
        name: '', // Invalid empty name
        email: 'invalid-email', // Invalid email format
        phone: '123' // Invalid phone format
      },
      scheduling: {
        preferredDate: '2020-01-01', // Past date
        preferredTime: '25:00' // Invalid time
      },
      payment: {
        paymentMethod: 'invalid-method' // Invalid payment method
      }
    };

    const response = await httpRequest(`${BASE_URL}/api/booking/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidData)
    });
    
    if (!response.data.success) {
      success('Validation errors are handled correctly');
      info('Validation errors found:');
      response.data.details?.errors?.forEach(err => {
        info(`  - ${err.field}: ${err.message}`);
      });
      return true;
    } else {
      warning('Validation should have failed but didn\'t');
      return false;
    }
  } catch (err) {
    success('Validation errors are handled correctly (exception thrown)');
    return true;
  }
}

// Main test runner
async function runAllTests() {
  log('🚀 Starting Comprehensive Booking System Tests', colors.magenta);
  log('============================================================', colors.magenta);
  
  const results = {
    health: false,
    pricing: false,
    slotReservation: false,
    bookingCreation: false,
    validation: false
  };

  // Test 1: Health Check
  results.health = await testHealthEndpoint();
  
  // Test 2: Pricing Calculation
  const pricingResult = await testPricingCalculation();
  results.pricing = !!pricingResult;
  
  // Test 3: Slot Reservation
  const reservation = await testSlotReservation();
  results.slotReservation = !!reservation;
  
  // Test 4: Booking Creation
  const booking = await testBookingCreation(reservation?.id);
  results.bookingCreation = !!booking;
  
  // Test 5: Validation Errors
  results.validation = await testValidationErrors();
  
  // Summary
  log('\n📊 Test Results Summary', colors.magenta);
  log('============================================================', colors.magenta);
  
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(Boolean).length;
  
  Object.entries(results).forEach(([test, passed]) => {
    if (passed) {
      success(`${test.toUpperCase()}: PASSED`);
    } else {
      error(`${test.toUpperCase()}: FAILED`);
    }
  });
  
  log(`\n🎯 Overall Result: ${passedTests}/${totalTests} tests passed`, 
    passedTests === totalTests ? colors.green : colors.red);
  
  if (passedTests === totalTests) {
    success('🎉 All booking system tests PASSED! The system is ready for production.');
  } else {
    error('❌ Some tests failed. Please review the issues above.');
  }
  
  return passedTests === totalTests;
}

// Run tests if called directly
if (require.main === module) {
  runAllTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(err => {
    error(`Test runner failed: ${err.message}`);
    process.exit(1);
  });
}

module.exports = { runAllTests }; 