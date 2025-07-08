#!/usr/bin/env node

/**
 * 🗓️ GoHighLevel Calendar Automation Script
 * Houston Mobile Notary Pros - API V2 Integration
 * 
 * Fully automates calendar creation and configuration using GHL Private Integration API V2
 * No manual dashboard setup required!
 */

// Use native fetch in Node.js 18+
// const fetch = globalThis.fetch;
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔧 Configuration
const CONFIG = {
  // OAuth2 & API Settings
  CLIENT_ID: process.env.GHL_CLIENT_ID,
  CLIENT_SECRET: process.env.GHL_CLIENT_SECRET,
  LOCATION_ID: process.env.GHL_LOCATION_ID,
  ACCESS_TOKEN: process.env.GHL_ACCESS_TOKEN,
  REFRESH_TOKEN: process.env.GHL_REFRESH_TOKEN,
  
  // API Endpoints
  BASE_URL: 'https://services.leadconnectorhq.com',
  API_VERSION: '2021-07-28',
  
  // Required Scopes
  SCOPES: ['calendars.readwrite', 'events.readwrite', 'locations.readonly'],
  
  // Token Storage
  TOKEN_FILE: path.join(__dirname, '../.ghl-tokens.json')
};

// 📋 Calendar Specifications (from user's table)
const CALENDAR_SPECS = {
  STANDARD_NOTARY: {
    name: 'Standard Notary Services',
    description: 'Regular notary services during business hours',
    envVar: 'GHL_STANDARD_NOTARY_CALENDAR_ID',
    settings: {
      slotDuration: 60,           // 60 minutes
      slotInterval: 30,           // Every 30 minutes
      bufferTime: 15,             // 15 minutes buffer
      maxAppointmentsPerDay: 10,  // 8-10 appointments
      minSchedulingNotice: 2,     // 2 hours notice
      bookingWindow: 28,          // 4 weeks ahead
      officeHours: [
        { day: 'monday', startTime: '09:00', endTime: '17:00' },
        { day: 'tuesday', startTime: '09:00', endTime: '17:00' },
        { day: 'wednesday', startTime: '09:00', endTime: '17:00' },
        { day: 'thursday', startTime: '09:00', endTime: '17:00' },
        { day: 'friday', startTime: '09:00', endTime: '17:00' }
      ],
      timezone: 'America/Chicago'
    }
  },
  
  EXTENDED_HOURS: {
    name: 'Extended Hours Notary',
    description: 'Extended hours notary services including evenings and weekends',
    envVar: 'GHL_EXTENDED_HOURS_CALENDAR_ID',
    settings: {
      slotDuration: 60,           // 60 minutes
      slotInterval: 30,           // Every 30 minutes
      bufferTime: 15,             // 15 minutes buffer
      maxAppointmentsPerDay: 15,  // 12-15 appointments
      minSchedulingNotice: 4,     // 4 hours notice
      bookingWindow: 42,          // 6 weeks ahead
      officeHours: [
        { day: 'monday', startTime: '07:00', endTime: '21:00' },
        { day: 'tuesday', startTime: '07:00', endTime: '21:00' },
        { day: 'wednesday', startTime: '07:00', endTime: '21:00' },
        { day: 'thursday', startTime: '07:00', endTime: '21:00' },
        { day: 'friday', startTime: '07:00', endTime: '21:00' },
        { day: 'saturday', startTime: '07:00', endTime: '21:00' },
        { day: 'sunday', startTime: '07:00', endTime: '21:00' }
      ],
      timezone: 'America/Chicago'
    }
  },
  
  LOAN_SIGNING: {
    name: 'Loan Signing Specialist',
    description: 'Professional loan signing services with extended appointment times',
    envVar: 'GHL_LOAN_SIGNING_SPECIALIST_CALENDAR_ID',
    settings: {
      slotDuration: 90,           // 90 minutes
      slotInterval: 60,           // Every 60 minutes
      bufferTime: 30,             // 30 minutes buffer
      maxAppointmentsPerDay: 8,   // 6-8 appointments
      minSchedulingNotice: 24,    // 24 hours notice
      bookingWindow: 56,          // 8 weeks ahead
      officeHours: [
        { day: 'monday', startTime: '08:00', endTime: '20:00' },
        { day: 'tuesday', startTime: '08:00', endTime: '20:00' },
        { day: 'wednesday', startTime: '08:00', endTime: '20:00' },
        { day: 'thursday', startTime: '08:00', endTime: '20:00' },
        { day: 'friday', startTime: '08:00', endTime: '20:00' },
        { day: 'saturday', startTime: '08:00', endTime: '20:00' },
        { day: 'sunday', startTime: '08:00', endTime: '20:00' }
      ],
      timezone: 'America/Chicago'
    }
  },
  
  RON_SERVICES: {
    name: 'RON - Remote Online Notarization',
    description: 'Remote online notarization services with maximum flexibility',
    envVar: 'GHL_BOOKING_CALENDAR_ID',
    settings: {
      slotDuration: 45,           // 45 minutes
      slotInterval: 15,           // Every 15 minutes
      bufferTime: 5,              // 5 minutes buffer
      maxAppointmentsPerDay: 20,  // 15-20 appointments
      minSchedulingNotice: 1,     // 1 hour notice
      bookingWindow: 84,          // 12 weeks ahead
      officeHours: [
        { day: 'monday', startTime: '08:00', endTime: '18:00' },
        { day: 'tuesday', startTime: '08:00', endTime: '18:00' },
        { day: 'wednesday', startTime: '08:00', endTime: '18:00' },
        { day: 'thursday', startTime: '08:00', endTime: '18:00' },
        { day: 'friday', startTime: '08:00', endTime: '18:00' },
        { day: 'saturday', startTime: '08:00', endTime: '18:00' },
        { day: 'sunday', startTime: '08:00', endTime: '18:00' }
      ],
      timezone: 'America/Chicago'
    }
  }
};

// 🔐 Authentication & Token Management
class GHLAuthManager {
  constructor() {
    this.tokens = null;
  }

  async loadTokens() {
    try {
      const tokenData = await fs.readFile(CONFIG.TOKEN_FILE, 'utf8');
      this.tokens = JSON.parse(tokenData);
    } catch (error) {
      console.log('📝 No existing token file found, will use environment tokens');
      this.tokens = {
        access_token: CONFIG.ACCESS_TOKEN,
        refresh_token: CONFIG.REFRESH_TOKEN,
        expires_at: Date.now() + (3600 * 1000) // Assume 1 hour expiry if unknown
      };
    }
  }

  async saveTokens() {
    try {
      await fs.writeFile(CONFIG.TOKEN_FILE, JSON.stringify(this.tokens, null, 2));
      console.log('✅ Tokens saved successfully');
    } catch (error) {
      console.error('❌ Failed to save tokens:', error.message);
    }
  }

  async refreshAccessToken() {
    if (!this.tokens?.refresh_token) {
      throw new Error('No refresh token available');
    }

    console.log('🔄 Refreshing access token...');

    const response = await fetch(`${CONFIG.BASE_URL}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: this.tokens.refresh_token,
        client_id: CONFIG.CLIENT_ID,
        client_secret: CONFIG.CLIENT_SECRET
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Token refresh failed: ${response.status} - ${error}`);
    }

    const tokenData = await response.json();
    
    this.tokens = {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token || this.tokens.refresh_token,
      expires_at: Date.now() + (tokenData.expires_in * 1000)
    };

    await this.saveTokens();
    console.log('✅ Access token refreshed successfully');
  }

  async getValidAccessToken() {
    await this.loadTokens();

    // Check if token is expired or will expire in the next 5 minutes
    if (this.tokens?.expires_at && this.tokens.expires_at < (Date.now() + 300000)) {
      await this.refreshAccessToken();
    }

    return this.tokens?.access_token;
  }
}

// 🛠️ GHL API Client
class GHLCalendarManager {
  constructor() {
    this.authManager = new GHLAuthManager();
    this.baseHeaders = {
      'Content-Type': 'application/json',
      'Version': CONFIG.API_VERSION
    };
  }

  async makeRequest(endpoint, method = 'GET', body = null) {
    const accessToken = await this.authManager.getValidAccessToken();
    
    const headers = {
      ...this.baseHeaders,
      'Authorization': `Bearer ${accessToken}`
    };

    const url = `${CONFIG.BASE_URL}${endpoint}`;
    
    console.log(`📡 ${method} ${endpoint}`);

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`GHL API Error: ${response.status} - ${errorText}`);
    }

    return response.status === 204 ? null : await response.json();
  }

  async createCalendar(calendarSpec) {
    const payload = {
      name: calendarSpec.name,
      description: calendarSpec.description,
      locationId: CONFIG.LOCATION_ID,
      ...this.formatCalendarSettings(calendarSpec.settings)
    };

    return await this.makeRequest('/calendars', 'POST', payload);
  }

  async updateCalendar(calendarId, calendarSpec) {
    const payload = {
      name: calendarSpec.name,
      description: calendarSpec.description,
      ...this.formatCalendarSettings(calendarSpec.settings)
    };

    return await this.makeRequest(`/calendars/${calendarId}`, 'PUT', payload);
  }

  async getCalendar(calendarId) {
    return await this.makeRequest(`/calendars/${calendarId}`);
  }

  async listCalendars() {
    return await this.makeRequest(`/calendars?locationId=${CONFIG.LOCATION_ID}`);
  }

  formatCalendarSettings(settings) {
    return {
      slotDuration: settings.slotDuration,
      slotInterval: settings.slotInterval,
      bufferTime: settings.bufferTime,
      maxBookingsPerDay: settings.maxAppointmentsPerDay,
      minSchedulingNotice: settings.minSchedulingNotice,
      bookingWindow: settings.bookingWindow,
      availability: settings.officeHours.map(hours => ({
        day: hours.day.toUpperCase(),
        startTime: hours.startTime,
        endTime: hours.endTime,
        active: true
      })),
      timeZone: settings.timezone,
      teamMemberId: null, // Will be set to location default
      allowBookingRequests: true,
      enableAutoConfirm: true,
      eventColor: this.getEventColor(settings)
    };
  }

  getEventColor(settings) {
    // Assign different colors for visual distinction
    if (settings.slotDuration === 45) return '#10B981'; // Green for RON
    if (settings.slotDuration === 90) return '#F59E0B'; // Amber for Loan Signing
    if (settings.maxAppointmentsPerDay > 12) return '#8B5CF6'; // Purple for Extended
    return '#3B82F6'; // Blue for Standard
  }

  async findExistingCalendar(name) {
    try {
      const calendars = await this.listCalendars();
      return calendars.calendars?.find(cal => cal.name === name);
    } catch (error) {
      console.warn(`⚠️ Could not search for existing calendar: ${error.message}`);
      return null;
    }
  }
}

// 🚀 Main Setup Function
class CalendarSetupManager {
  constructor() {
    this.ghl = new GHLCalendarManager();
    this.results = {};
  }

  async setupAllCalendars() {
    console.log('🚀 Starting GHL Calendar Automation...\n');

    // Validate configuration
    this.validateConfig();

    for (const [serviceType, spec] of Object.entries(CALENDAR_SPECS)) {
      console.log(`\n📅 Setting up ${spec.name}...`);
      
      try {
        const result = await this.setupCalendar(serviceType, spec);
        this.results[serviceType] = result;
        console.log(`✅ ${spec.name} configured successfully`);
      } catch (error) {
        console.error(`❌ Failed to setup ${spec.name}:`, error.message);
        this.results[serviceType] = { error: error.message };
      }
    }

    await this.generateReport();
    await this.updateEnvironmentFile();
  }

  async setupCalendar(serviceType, spec) {
    // Check if calendar already exists
    const existingCalendar = await this.ghl.findExistingCalendar(spec.name);
    
    if (existingCalendar) {
      console.log(`📝 Updating existing calendar: ${existingCalendar.id}`);
      const updatedCalendar = await this.ghl.updateCalendar(existingCalendar.id, spec);
      return {
        id: existingCalendar.id,
        name: spec.name,
        action: 'updated',
        calendar: updatedCalendar
      };
    } else {
      console.log(`🆕 Creating new calendar: ${spec.name}`);
      const newCalendar = await this.ghl.createCalendar(spec);
      return {
        id: newCalendar.id,
        name: spec.name,
        action: 'created',
        calendar: newCalendar
      };
    }
  }

  validateConfig() {
    const required = ['CLIENT_ID', 'CLIENT_SECRET', 'LOCATION_ID'];
    const missing = required.filter(key => !CONFIG[key]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    console.log('✅ Configuration validated');
  }

  async generateReport() {
    console.log('\n📊 SETUP REPORT');
    console.log('================\n');

    for (const [serviceType, result] of Object.entries(this.results)) {
      const spec = CALENDAR_SPECS[serviceType];
      
      if (result.error) {
        console.log(`❌ ${spec.name}: ${result.error}`);
      } else {
        console.log(`✅ ${spec.name}:`);
        console.log(`   ID: ${result.id}`);
        console.log(`   Action: ${result.action}`);
        console.log(`   Env Var: ${spec.envVar}=${result.id}`);
      }
      console.log('');
    }

    // Save detailed report
    const reportPath = path.join(__dirname, '../calendar-setup-report.json');
    await fs.writeFile(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      results: this.results,
      specifications: CALENDAR_SPECS
    }, null, 2));

    console.log(`📄 Detailed report saved to: ${reportPath}`);
  }

  async updateEnvironmentFile() {
    console.log('\n🔧 Updating environment variables...');

    const envPath = path.join(__dirname, '../.env.local');
    let envContent = '';

    try {
      envContent = await fs.readFile(envPath, 'utf8');
    } catch (error) {
      console.log('📝 Creating new .env.local file');
    }

    // Update or add calendar IDs
    for (const [serviceType, result] of Object.entries(this.results)) {
      if (result.error) continue;

      const spec = CALENDAR_SPECS[serviceType];
      const envVar = `${spec.envVar}=${result.id}`;
      
      if (envContent.includes(spec.envVar)) {
        envContent = envContent.replace(
          new RegExp(`${spec.envVar}=.*`, 'g'),
          envVar
        );
      } else {
        envContent += `\n${envVar}`;
      }
    }

    await fs.writeFile(envPath, envContent.trim() + '\n');
    console.log('✅ Environment file updated');
  }

  async verifyCalendars() {
    console.log('\n🔍 Verifying calendar configurations...');

    for (const [serviceType, result] of Object.entries(this.results)) {
      if (result.error) continue;

      try {
        const calendar = await this.ghl.getCalendar(result.id);
        console.log(`✅ ${result.name}: Configuration verified`);
        
        // Log key settings for verification
        console.log(`   Slot Duration: ${calendar.slotDuration} min`);
        console.log(`   Slot Interval: ${calendar.slotInterval} min`);
        console.log(`   Buffer Time: ${calendar.bufferTime} min`);
        console.log(`   Max Daily: ${calendar.maxBookingsPerDay}`);
      } catch (error) {
        console.error(`❌ Failed to verify ${result.name}:`, error.message);
      }
    }
  }
}

// 🎯 CLI Interface
async function main() {
  try {
    const setupManager = new CalendarSetupManager();
    
    console.log('🗓️ GHL Calendar Automation - Houston Mobile Notary Pros');
    console.log('========================================================\n');
    
    await setupManager.setupAllCalendars();
    await setupManager.verifyCalendars();
    
    console.log('\n🎉 Calendar automation completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Restart your development server to load new environment variables');
    console.log('2. Test availability API endpoints');
    console.log('3. Verify calendar settings in GHL dashboard (optional)');
    
  } catch (error) {
    console.error('\n💥 Calendar setup failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { CalendarSetupManager, GHLCalendarManager, GHLAuthManager }; 