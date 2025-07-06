#!/usr/bin/env node
/**
 * Simple Booking System Test Script
 * Houston Mobile Notary Pros
 * Using only Node.js built-in modules
 */

const http = require('http');
const https = require('https');
const { URL } = require('url');

const BASE_URL = 'http://localhost:3000';

// Simple HTTP client
function httpRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ data: jsonData, status: res.statusCode });
        } catch (err) {
          resolve({ data: data, status: res.statusCode });
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

// Helper functions
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

// Test functions
async function testHealth() {
  console.log('\n🔍 Testing Health Endpoint...');
  try {
    const response = await httpRequest(`${BASE_URL}/api/health`);
    if (response.data.status === 'healthy') {
      console.log('✅ Health endpoint is working');
      console.log(`   Database: ${response.data.services.database.status}`);
      console.log(`   Redis: ${response.data.services.redis.status}`);
      return true;
    }
    return false;
  } catch (err) {
    console.log(`❌ Health check failed: ${err.message}`);
    return false;
  }
}

async function testPricing() {
  console.log('\n💰 Testing Pricing Calculation...');
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
      console.log('✅ Pricing calculation is working');
      console.log(`   Base Price: $${response.data.data.basePrice}`);
      console.log(`   Travel Fee: $${response.data.data.travelFee}`);
      console.log(`   Total Price: $${response.data.data.total}`);
      return response.data.data;
    }
    return null;
  } catch (err) {
    console.log(`❌ Pricing calculation failed: ${err.message}`);
    return null;
  }
}

async function testSlotReservation() {
  console.log('\n🕐 Testing Slot Reservation...');
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
      console.log('✅ Slot reservation is working');
      console.log(`   Reservation ID: ${response.data.reservation.id}`);
      return response.data.reservation;
    } else {
      console.log(`⚠️  Slot reservation failed: ${response.data.message}`);
      return null;
    }
  } catch (err) {
    console.log(`❌ Slot reservation failed: ${err.message}`);
    return null;
  }
}

async function testBookingCreation(reservationId = null) {
  console.log('\n📝 Testing Booking Creation...');
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
      console.log('✅ Booking creation is working');
      console.log(`   Booking ID: ${response.data.booking.id}`);
      console.log(`   Booking Number: ${response.data.booking.bookingNumber}`);
      console.log(`   Status: ${response.data.booking.status}`);
      console.log(`   Total Price: $${response.data.booking.totalPrice}`);
      return response.data.booking;
    } else {
      console.log(`⚠️  Booking creation failed: ${response.data.error}`);
      if (response.data.details && response.data.details.errors) {
        response.data.details.errors.forEach(err => {
          console.log(`     - ${err.field}: ${err.message}`);
        });
      }
      return null;
    }
  } catch (err) {
    console.log(`❌ Booking creation failed: ${err.message}`);
    return null;
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Booking System Tests');
  console.log('=====================================');
  
  const results = {};
  
  // Run tests
  results.health = await testHealth();
  results.pricing = !!(await testPricing());
  results.reservation = !!(await testSlotReservation());
  results.booking = !!(await testBookingCreation());
  
  // Summary
  console.log('\n📊 Test Results Summary');
  console.log('=====================================');
  
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(Boolean).length;
  
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test.toUpperCase()}: ${passed ? 'PASSED' : 'FAILED'}`);
  });
  
  console.log(`\n🎯 Overall Result: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All booking system tests PASSED! The system is ready for production.');
  } else {
    console.log('❌ Some tests failed. Please review the issues above.');
  }
  
  return passedTests === totalTests;
}

// Run if called directly
if (require.main === module) {
  runTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(err => {
    console.error(`❌ Test runner failed: ${err.message}`);
    process.exit(1);
  });
} 