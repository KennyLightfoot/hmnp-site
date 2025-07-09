#!/usr/bin/env node

/**
 * Test GHL API Best Practices - Houston Mobile Notary Pros
 * 
 * Testing our GHL API calls with proper headers, versions, and error handling
 * Based on official GHL API documentation and best practices
 */

require('dotenv').config({ path: '.env.local' });

const GHL_API_BASE_URL = process.env.GHL_API_BASE_URL || "https://services.leadconnectorhq.com";
const GHL_PRIVATE_INTEGRATION_TOKEN = process.env.GHL_PRIVATE_INTEGRATION_TOKEN;
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;

// Calendar IDs
const CALENDARS = {
  'STANDARD_NOTARY': 'w3sjmTzBfuahySgQvKoV',
  'EXTENDED_HOURS': 'OmcFGOLhrR9lil6AQa2z',
  'LOAN_SIGNING': 'yf6tpA7YMn3oyZc6GVZK',
  'RON_SERVICES': 'xFRCVGNlnZASiQnBVHEG'
};

/**
 * BEST PRACTICE GHL API CLIENT
 * Following official GHL documentation and recommendations
 */
class GHLBestPracticeClient {
  constructor() {
    this.baseUrl = GHL_API_BASE_URL;
    this.token = GHL_PRIVATE_INTEGRATION_TOKEN;
    this.locationId = GHL_LOCATION_ID;
    
    // Validate required credentials
    if (!this.token) {
      throw new Error('GHL_PRIVATE_INTEGRATION_TOKEN is required');
    }
    if (!this.locationId) {
      throw new Error('GHL_LOCATION_ID is required');
    }
  }

  /**
   * Create standardized headers following GHL best practices
   */
  createHeaders(contentType = 'application/json') {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Version': '2021-07-28', // Stable API version
      'Content-Type': contentType,
      'User-Agent': 'HMNP-BookingSystem/1.0',
      'Accept': 'application/json'
    };
  }

  /**
   * Enhanced API request with proper error handling and rate limiting
   */
  async makeRequest(endpoint, method = 'GET', body = null, retries = 3) {
    const url = `${this.baseUrl}${endpoint}`;
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`🔗 ${method} ${endpoint} (Attempt ${attempt}/${retries})`);
        
        const options = {
          method,
          headers: this.createHeaders()
        };
        
        if (body && (method === 'POST' || method === 'PUT')) {
          options.body = JSON.stringify(body);
        }
        
        const response = await fetch(url, options);
        
        // Handle rate limiting (429)
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After');
          const delay = retryAfter ? parseInt(retryAfter) * 1000 : 2000;
          
          console.log(`⏱️  Rate limited. Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        // Handle success responses
        if (response.ok) {
          console.log(`✅ ${method} ${endpoint} - ${response.status}`);
          
          // Check for rate limit headers
          const rateLimit = response.headers.get('X-RateLimit-Remaining');
          if (rateLimit && parseInt(rateLimit) < 10) {
            console.log(`⚠️  Rate limit warning: ${rateLimit} requests remaining`);
          }
          
          if (response.status === 204) {
            return null; // No content
          }
          
          return await response.json();
        }
        
        // Handle client errors (4xx)
        if (response.status >= 400 && response.status < 500) {
          let errorMessage;
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || 'Unknown client error';
          } catch {
            errorMessage = await response.text();
          }
          
          console.log(`❌ ${method} ${endpoint} - ${response.status}: ${errorMessage}`);
          
          // Don't retry client errors (except 429 which we handled above)
          throw new Error(`GHL API Client Error (${response.status}): ${errorMessage}`);
        }
        
        // Handle server errors (5xx) - these are retryable
        if (response.status >= 500) {
          console.log(`🔄 Server error ${response.status}. Will retry...`);
          
          if (attempt < retries) {
            const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
        }
        
        throw new Error(`GHL API Error (${response.status}): ${response.statusText}`);
        
      } catch (error) {
        if (attempt === retries) {
          throw error;
        }
        
        console.log(`🔄 Network error on attempt ${attempt}. Retrying...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  /**
   * Get calendar details using best practices
   */
  async getCalendar(calendarId) {
    return await this.makeRequest(`/calendars/${calendarId}`);
  }

  /**
   * Get calendar availability using best practices
   */
  async getCalendarSlots(calendarId, startDate, endDate, timezone = 'America/Chicago') {
    const params = new URLSearchParams({
      startDate: startDate.toString(),
      endDate: endDate.toString(),
      timezone
    });
    
    return await this.makeRequest(`/calendars/${calendarId}/free-slots?${params}`);
  }

  /**
   * List all calendars for location
   */
  async listCalendars() {
    return await this.makeRequest(`/calendars/?locationId=${this.locationId}`);
  }
}

/**
 * Test calendar retrieval with best practices
 */
async function testCalendarRetrieval() {
  console.log('🧪 Testing Calendar Retrieval with Best Practices');
  console.log('═'.repeat(60));
  
  try {
    const ghl = new GHLBestPracticeClient();
    
    // Test 1: List all calendars
    console.log('\n📋 Test 1: List All Calendars');
    console.log('-'.repeat(40));
    
    const calendarList = await ghl.listCalendars();
    console.log(`✅ Found ${calendarList?.calendars?.length || 0} calendars in location`);
    
    if (calendarList?.calendars) {
      calendarList.calendars.forEach(cal => {
        console.log(`   📅 ${cal.name || 'UNNAMED'} (${cal.id}) - ${cal.isActive ? 'Active' : 'Inactive'}`);
      });
    }
    
    // Test 2: Get individual calendar details
    console.log('\n📋 Test 2: Individual Calendar Details');
    console.log('-'.repeat(40));
    
    for (const [serviceName, calendarId] of Object.entries(CALENDARS)) {
      try {
        const calendar = await ghl.getCalendar(calendarId);
        
        console.log(`\n📅 ${serviceName} (${calendarId})`);
        console.log(`   Name: ${calendar.name || 'NOT SET'}`);
        console.log(`   Active: ${calendar.isActive ? 'YES' : 'NO'}`);
        console.log(`   Team Members: ${calendar.teamMembers?.length || 0}`);
        console.log(`   Slot Duration: ${calendar.slotDuration || 'NOT SET'} min`);
        console.log(`   Open Hours: ${calendar.openHours?.filter(day => day && day.length > 0).length || 0} days`);
        console.log(`   Availabilities: ${calendar.availabilities?.length || 0} blocks`);
        
      } catch (error) {
        console.log(`❌ Error getting ${serviceName}: ${error.message}`);
      }
    }
    
    // Test 3: Check availability slots
    console.log('\n📋 Test 3: Availability Slots (Tomorrow)');
    console.log('-'.repeat(40));
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const startOfDay = new Date(tomorrow.toISOString().split('T')[0] + 'T00:00:00-06:00').getTime() / 1000;
    const endOfDay = new Date(tomorrow.toISOString().split('T')[0] + 'T23:59:59-06:00').getTime() / 1000;
    
    for (const [serviceName, calendarId] of Object.entries(CALENDARS)) {
      try {
        const slots = await ghl.getCalendarSlots(calendarId, startOfDay, endOfDay);
        console.log(`📅 ${serviceName}: ${slots?.slots?.length || 0} slots available`);
        
        if (slots?.slots?.length > 0) {
          console.log(`   Sample slot: ${slots.slots[0].startTime}`);
        }
        
      } catch (error) {
        console.log(`❌ ${serviceName}: ${error.message}`);
      }
    }
    
    return true;
    
  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
    return false;
  }
}

/**
 * Test API versioning and compatibility
 */
async function testAPIVersioning() {
  console.log('\n🔧 Testing API Versioning');
  console.log('═'.repeat(60));
  
  const versions = ['2021-07-28', '2024-01-01'];
  
  for (const version of versions) {
    console.log(`\n📋 Testing with API Version: ${version}`);
    console.log('-'.repeat(40));
    
    try {
      const headers = {
        'Authorization': `Bearer ${GHL_PRIVATE_INTEGRATION_TOKEN}`,
        'Version': version,
        'Content-Type': 'application/json',
        'User-Agent': 'HMNP-BookingSystem/1.0'
      };
      
      const response = await fetch(`${GHL_API_BASE_URL}/calendars/?locationId=${GHL_LOCATION_ID}`, {
        method: 'GET',
        headers
      });
      
      console.log(`   Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ Version ${version} works - found ${data?.calendars?.length || 0} calendars`);
      } else {
        const error = await response.text();
        console.log(`   ❌ Version ${version} failed: ${error}`);
      }
      
    } catch (error) {
      console.log(`   ❌ Version ${version} error: ${error.message}`);
    }
  }
}

/**
 * Main test function
 */
async function runBestPracticeTests() {
  console.log('🧪 GHL API BEST PRACTICES TEST');
  console.log('═'.repeat(60));
  console.log('Testing our GHL API implementation against best practices...\n');
  
  // Test 1: API Versioning
  await testAPIVersioning();
  
  // Test 2: Calendar Retrieval
  await testCalendarRetrieval();
  
  console.log('\n🎯 BEST PRACTICES SUMMARY');
  console.log('═'.repeat(60));
  console.log('✅ Using stable API version (2021-07-28)');
  console.log('✅ Proper authentication headers');
  console.log('✅ Rate limiting awareness');
  console.log('✅ Exponential backoff retry strategy');
  console.log('✅ Proper error handling');
  console.log('✅ User-Agent identification');
  
  console.log('\n💡 RECOMMENDATIONS:');
  console.log('- Use the unified GHL client above for all API calls');
  console.log('- Standardize on API version 2021-07-28 (stable)');
  console.log('- Implement rate limit monitoring');
  console.log('- Add proper error categorization');
}

runBestPracticeTests().catch(console.error); 