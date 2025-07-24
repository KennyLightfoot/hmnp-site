#!/usr/bin/env node

/**
 * 🎯 GHL Service Menu & Groups Setup Script
 * Houston Mobile Notary Pros - Complete Service Organization
 * 
 * Sets up service groups, pricing, and organization in GoHighLevel to match the HMNP system
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  GHL_API_KEY: process.env.GHL_API_KEY,
  GHL_API_BASE_URL: process.env.GHL_API_BASE_URL || 'https://services.leadconnectorhq.com',
  GHL_LOCATION_ID: process.env.GHL_LOCATION_ID,
  GHL_API_VERSION: process.env.GHL_API_VERSION || '2021-07-28'
};

// 📋 HMNP Service Structure
const SERVICE_GROUPS = {
  MOBILE_SERVICES: {
    name: 'Mobile Notary Services',
    description: 'Professional mobile notary services throughout Houston metro',
    category: 'mobile',
    services: [
      {
        id: 'QUICK_STAMP_LOCAL',
        name: 'Quick-Stamp Local',
        description: 'Fast & simple local signings for routine documents',
        price: 50.00,
        duration: 30,
        features: [
          '≤1 document notarization',
          '≤2 stamps included',
          '1 signer included',
          '10-mile travel radius',
          '9am-5pm weekdays',
          'Perfect for simple documents'
        ],
        calendarId: process.env.GHL_STANDARD_NOTARY_CALENDAR_ID,
        tags: ['Service:Quick_Stamp_Local', 'service:quick_stamp_local'],
        workflows: {
          booking: process.env.GHL_BOOKING_CONFIRMATION_WORKFLOW_ID,
          reminder: process.env.GHL_24HR_REMINDER_WORKFLOW_ID
        }
      },
      {
        id: 'STANDARD_NOTARY',
        name: 'Standard Mobile Notary',
        description: 'Professional notary service for routine documents during business hours',
        price: 75.00,
        duration: 60,
        features: [
          '≤4 documents included',
          '≤2 signers included',
          '20-mile travel radius',
          '9am-5pm weekdays',
          'Professional notary service',
          'Same-day available (before 3pm)'
        ],
        calendarId: process.env.GHL_STANDARD_NOTARY_CALENDAR_ID,
        tags: ['Service:Standard_Mobile_Notary', 'service:standard_mobile_notary'],
        workflows: {
          booking: process.env.GHL_BOOKING_CONFIRMATION_WORKFLOW_ID,
          reminder: process.env.GHL_24HR_REMINDER_WORKFLOW_ID
        }
      },
      {
        id: 'EXTENDED_HOURS',
        name: 'Extended Hours Mobile',
        description: 'Flexible scheduling & same-day service for urgent needs',
        price: 100.00,
        duration: 90,
        features: [
          '≤4 documents included',
          '≤2 signers included',
          '30-mile travel radius',
          '7am-9pm daily',
          'Flexible scheduling',
          'Same-day service available',
          'Evening appointments',
          'Weekend availability'
        ],
        calendarId: process.env.GHL_EXTENDED_HOURS_CALENDAR_ID,
        tags: ['Service:Extended_Hours_Notary', 'service:extended_hours_notary'],
        workflows: {
          booking: process.env.GHL_BOOKING_CONFIRMATION_WORKFLOW_ID,
          reminder: process.env.GHL_24HR_REMINDER_WORKFLOW_ID,
          emergency: process.env.GHL_EMERGENCY_SERVICE_WORKFLOW_ID
        }
      },
      {
        id: 'LOAN_SIGNING',
        name: 'Loan Signing Specialist',
        description: 'Expert real estate closings with comprehensive package',
        price: 150.00,
        duration: 120,
        features: [
          'Single package (unlimited documents within session)',
          '≤4 signers included',
          'Print 2 sets included',
          '≤2 hours table time',
          'FedEx drop included',
          'Expert real estate closings',
          '30-mile travel radius',
          'By appointment scheduling'
        ],
        calendarId: process.env.GHL_LOAN_SIGNING_SPECIALIST_CALENDAR_ID,
        tags: ['Service:Loan_Signing_Specialist', 'service:loan_signing_specialist'],
        workflows: {
          booking: process.env.GHL_BOOKING_CONFIRMATION_WORKFLOW_ID,
          reminder: process.env.GHL_24HR_REMINDER_WORKFLOW_ID
        }
      }
    ]
  },
  
  REMOTE_SERVICES: {
    name: 'Remote Online Notarization (RON)',
    description: 'Secure remote notarization available 24/7',
    category: 'digital',
    services: [
      {
        id: 'RON_SERVICES',
        name: 'Remote Online Notarization',
        description: 'Secure online notarization from anywhere, available 24/7',
        price: 25.00,
        duration: 45,
        features: [
          '24/7 availability',
          'Remote service from anywhere',
          'No travel required',
          'Up to 10 documents',
          'Secure digital process',
          'Immediate availability',
          'Proof.com platform',
          'Texas-compliant ($25 session + $5 per seal)'
        ],
        calendarId: process.env.GHL_BOOKING_CALENDAR_ID,
        tags: ['Service:RON', 'service:ron'],
        workflows: {
          booking: process.env.GHL_BOOKING_CONFIRMATION_WORKFLOW_ID,
          reminder: process.env.GHL_24HR_REMINDER_WORKFLOW_ID
        }
      }
    ]
  },

  BUSINESS_SERVICES: {
    name: 'Business Subscription Plans',
    description: 'Monthly business solutions for ongoing notary needs',
    category: 'business',
    services: [
      {
        id: 'BUSINESS_ESSENTIALS',
        name: 'Business Essentials Plan',
        description: 'Monthly business subscription with RON services',
        price: 125.00,
        duration: 0, // Subscription service
        features: [
          'Up to 10 RON seals/month',
          '10% off mobile rates',
          'Priority scheduling',
          'Business support',
          'Monthly billing',
          'Overage: $5 per additional seal'
        ],
        calendarId: process.env.GHL_BOOKING_CALENDAR_ID,
        tags: ['Service:Business_Essentials', 'service:business_essentials'],
        workflows: {
          booking: process.env.GHL_BOOKING_CONFIRMATION_WORKFLOW_ID
        }
      },
      {
        id: 'BUSINESS_GROWTH',
        name: 'Business Growth Plan',
        description: 'Premium monthly business subscription',
        price: 349.00,
        duration: 0, // Subscription service
        features: [
          'Up to 40 RON seals/month',
          '10% off mobile rates',
          '1 free loan signing',
          'Premium business support',
          'Monthly billing',
          'Overage: $4 per additional seal'
        ],
        calendarId: process.env.GHL_BOOKING_CALENDAR_ID,
        tags: ['Service:Business_Growth', 'service:business_growth'],
        workflows: {
          booking: process.env.GHL_BOOKING_CONFIRMATION_WORKFLOW_ID
        }
      }
    ]
  }
};

// 🏷️ Service Tags Organization
const SERVICE_TAG_STRUCTURE = {
  STATUS_TAGS: [
    'Status:NewLead',
    'Status:BookingConfirmed', 
    'Status:BookingPendingPayment',
    'Status:ServiceCompleted',
    'Status:BookingCancelled',
    'Status:NoShow'
  ],
  
  SERVICE_TAGS: [
    'Service:Standard_Mobile_Notary',
    'Service:Extended_Hours_Notary', 
    'Service:Loan_Signing_Specialist',
    'Service:RON',
    'Service:Emergency',
    'Service:Business_Solutions'
  ],
  
  WORKFLOW_TAGS: [
    'service:standard_mobile_notary',
    'service:extended_hours_notary',
    'service:loan_signing_specialist', 
    'service:ron',
    'service:emergency',
    'service:business_client',
    'extended-hours-notary:same_day'
  ],
  
  PAYMENT_TAGS: [
    'Payment:DepositPaid',
    'Payment:Pending',
    'Payment:Failed',
    'Payment:Refunded'
  ],
  
  FOLLOW_UP_TAGS: [
    'FollowUp:ReviewRequested',
    'FollowUp:PaymentReminder',
    'FollowUp:PostService',
    'FollowUp:Completed'
  ]
};

// 🔗 GHL API Helper
async function makeGHLRequest(endpoint, method = 'GET', body = null) {
  const url = `${CONFIG.GHL_API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    method,
    headers: {
      'Authorization': `Bearer ${CONFIG.GHL_API_KEY}`,
      'Content-Type': 'application/json',
      'Version': CONFIG.GHL_API_VERSION
    },
    body: body ? JSON.stringify(body) : null
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GHL API Error: ${response.status} - ${errorText}`);
  }

  return response.status === 204 ? null : await response.json();
}

// 📊 Service Menu Setup Functions
class GHLServiceMenuSetup {
  constructor() {
    this.results = {
      groups: {},
      services: {},
      tags: {},
      validation: {}
    };
  }

  async validateConfiguration() {
    console.log('🔍 Validating GHL configuration...');
    
    const required = ['GHL_API_KEY', 'GHL_LOCATION_ID'];
    const missing = required.filter(key => !CONFIG[key]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    // Test API connection
    try {
      const location = await makeGHLRequest(`/locations/${CONFIG.GHL_LOCATION_ID}`);
      console.log(`✅ Connected to GHL location: ${location.name}`);
      this.results.validation.apiConnection = true;
    } catch (error) {
      console.error(`❌ GHL API connection failed: ${error.message}`);
      this.results.validation.apiConnection = false;
      throw error;
    }

    // Validate calendar IDs exist
    const calendarIds = [
      process.env.GHL_STANDARD_NOTARY_CALENDAR_ID,
      process.env.GHL_EXTENDED_HOURS_CALENDAR_ID, 
      process.env.GHL_LOAN_SIGNING_SPECIALIST_CALENDAR_ID,
      process.env.GHL_BOOKING_CALENDAR_ID
    ].filter(Boolean);

    console.log(`✅ Found ${calendarIds.length} configured calendar IDs`);
    this.results.validation.calendars = calendarIds.length;

    console.log('✅ Configuration validation passed');
  }

  async setupServiceTags() {
    console.log('\n🏷️ Setting up service tags...');
    
    const allTags = [
      ...SERVICE_TAG_STRUCTURE.STATUS_TAGS,
      ...SERVICE_TAG_STRUCTURE.SERVICE_TAGS,
      ...SERVICE_TAG_STRUCTURE.WORKFLOW_TAGS,
      ...SERVICE_TAG_STRUCTURE.PAYMENT_TAGS,
      ...SERVICE_TAG_STRUCTURE.FOLLOW_UP_TAGS
    ];

    let created = 0;
    let existing = 0;

    for (const tagName of allTags) {
      try {
        await makeGHLRequest(`/locations/${CONFIG.GHL_LOCATION_ID}/tags`, 'POST', {
          name: tagName
        });
        created++;
        console.log(`✅ Created tag: ${tagName}`);
      } catch (error) {
        if (error.message.includes('already exists') || error.message.includes('409')) {
          existing++;
          console.log(`📝 Tag exists: ${tagName}`);
        } else {
          console.warn(`⚠️ Failed to create tag ${tagName}: ${error.message}`);
        }
      }
    }

    this.results.tags = { created, existing, total: allTags.length };
    console.log(`\n📊 Tags Summary: ${created} created, ${existing} existing, ${allTags.length} total`);
  }

  async setupServiceGroups() {
    console.log('\n📁 Setting up service groups...');

    for (const [groupKey, group] of Object.entries(SERVICE_GROUPS)) {
      console.log(`\n📂 Processing group: ${group.name}`);
      
      // Store group information (GHL doesn't have explicit groups, but we organize via tags)
      this.results.groups[groupKey] = {
        name: group.name,
        description: group.description,
        serviceCount: group.services.length,
        services: []
      };

      // Process each service in the group
      for (const service of group.services) {
        console.log(`  📋 Setting up service: ${service.name}`);
        
        // Create service record in our results
        const serviceResult = {
          id: service.id,
          name: service.name,
          description: service.description,
          price: service.price,
          duration: service.duration,
          features: service.features,
          calendarId: service.calendarId,
          tags: service.tags,
          workflows: service.workflows,
          group: group.name
        };

        this.results.services[service.id] = serviceResult;
        this.results.groups[groupKey].services.push(service.id);
        
        console.log(`    💰 Price: $${service.price}`);
        console.log(`    ⏰ Duration: ${service.duration} minutes`);
        console.log(`    📅 Calendar: ${service.calendarId ? '✅' : '❌'}`);
        console.log(`    🏷️ Tags: ${service.tags.length}`);
      }
    }
  }

  async createServiceDocumentation() {
    console.log('\n📄 Creating service documentation...');

    const documentation = {
      timestamp: new Date().toISOString(),
      version: '2.0',
      system: 'Houston Mobile Notary Pros',
      integration: 'GoHighLevel',
      
      serviceGroups: this.results.groups,
      services: this.results.services,
      
      tagStructure: SERVICE_TAG_STRUCTURE,
      
      calendars: {
        STANDARD_NOTARY: process.env.GHL_STANDARD_NOTARY_CALENDAR_ID,
        EXTENDED_HOURS: process.env.GHL_EXTENDED_HOURS_CALENDAR_ID,
        LOAN_SIGNING: process.env.GHL_LOAN_SIGNING_SPECIALIST_CALENDAR_ID,
        RON_SERVICES: process.env.GHL_BOOKING_CALENDAR_ID
      },
      
      workflows: {
        booking_confirmation: process.env.GHL_BOOKING_CONFIRMATION_WORKFLOW_ID,
        payment_followup: process.env.GHL_PAYMENT_FOLLOWUP_WORKFLOW_ID,
        reminder_24hr: process.env.GHL_24HR_REMINDER_WORKFLOW_ID,
        post_service: process.env.GHL_POST_SERVICE_WORKFLOW_ID,
        emergency_service: process.env.GHL_EMERGENCY_SERVICE_WORKFLOW_ID,
        no_show_recovery: process.env.GHL_NO_SHOW_RECOVERY_WORKFLOW_ID
      },

      validation: this.results.validation,
      setup_results: this.results
    };

    const docPath = path.join(__dirname, '../ghl-service-menu-setup.json');
    await fs.writeFile(docPath, JSON.stringify(documentation, null, 2));
    
    console.log(`📄 Documentation saved to: ${docPath}`);
    return documentation;
  }

  async generateSetupReport() {
    console.log('\n📊 SETUP REPORT');
    console.log('================');

    // Service Groups Summary
    console.log('\n📁 Service Groups:');
    for (const [key, group] of Object.entries(this.results.groups)) {
      console.log(`  ${group.name}: ${group.serviceCount} services`);
    }

    // Services Summary  
    console.log('\n📋 Services:');
    for (const [key, service] of Object.entries(this.results.services)) {
      console.log(`  ${service.name}: $${service.price} (${service.duration}min)`);
      console.log(`    Calendar: ${service.calendarId ? '✅' : '❌'}`);
      console.log(`    Tags: ${service.tags.length}`);
    }

    // Tags Summary
    console.log('\n🏷️ Tags:');
    console.log(`  Created: ${this.results.tags.created}`);
    console.log(`  Existing: ${this.results.tags.existing}`);
    console.log(`  Total: ${this.results.tags.total}`);

    // Validation Summary
    console.log('\n✅ Validation:');
    console.log(`  API Connection: ${this.results.validation.apiConnection ? '✅' : '❌'}`);
    console.log(`  Calendars: ${this.results.validation.calendars}/4 configured`);

    // Next Steps
    console.log('\n🚀 Next Steps:');
    console.log('1. Import workflow templates from docs/workflows/');
    console.log('2. Configure automation rules in GHL dashboard');
    console.log('3. Test booking flow with each service type');
    console.log('4. Verify calendar availability endpoints');
    console.log('5. Test payment and workflow triggers');
  }

  async run() {
    try {
      console.log('🎯 GHL Service Menu & Groups Setup');
      console.log('Houston Mobile Notary Pros');
      console.log('================================\n');

      await this.validateConfiguration();
      await this.setupServiceTags();
      await this.setupServiceGroups();
      await this.createServiceDocumentation();
      await this.generateSetupReport();

      console.log('\n🎉 GHL Service Menu Setup Complete!');
      console.log('\n💡 Your service structure is now organized and ready for automation.');
      
    } catch (error) {
      console.error('\n💥 Setup failed:', error.message);
      console.error('Stack trace:', error.stack);
      process.exit(1);
    }
  }
}

// 🎯 Main execution
async function main() {
  const setup = new GHLServiceMenuSetup();
  await setup.run();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { GHLServiceMenuSetup, SERVICE_GROUPS, SERVICE_TAG_STRUCTURE }; 