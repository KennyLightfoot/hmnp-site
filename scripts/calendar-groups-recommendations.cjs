#!/usr/bin/env node

/**
 * GHL Calendar Groups Recommendations
 * Houston Mobile Notary Pros - 2025
 * 
 * Shows recommended calendar grouping strategies for better organization
 */

// Your current calendar configuration
const CALENDAR_IDS = {
  'STANDARD_NOTARY': 'w3sjmTzBfuahySgQvKoV',
  'EXTENDED_HOURS': 'OmcFGOLhrR9lil6AQa2z',
  'LOAN_SIGNING': 'yf6tpA7YMn3oyZc6GVZK',
  'RON_SERVICES': 'xFRCVGNlnZASiQnBVHEG'
};

// Service details
const SERVICE_DETAILS = {
  'STANDARD_NOTARY': {
    name: 'Standard Notary Services',
    description: 'Professional notary services during regular business hours',
    hours: 'Mon-Fri 9am-5pm',
    duration: '30 minutes',
    features: ['Up to 2 documents', '1-2 signers', '15-mile travel included']
  },
  'EXTENDED_HOURS': {
    name: 'Extended Hours Notary',
    description: 'Extended hours notary services for busy schedules',
    hours: '7am-9pm Daily',
    duration: '30-45 minutes',
    features: ['Up to 5 documents', '2 signers', '20-mile travel included']
  },
  'LOAN_SIGNING': {
    name: 'Loan Signing Specialist',
    description: 'Professional loan document signing services',
    hours: 'Flexible scheduling',
    duration: '90 minutes',
    features: ['Unlimited documents', 'Up to 4 signers', 'Specialized expertise']
  },
  'RON_SERVICES': {
    name: 'RON Services - Remote Online Notarization',
    description: '24/7 Remote Online Notarization services',
    hours: '24/7 availability',
    duration: '15-30 minutes',
    features: ['No travel required', 'Digital documents', 'Instant service']
  }
};

// Recommended calendar groups
const CALENDAR_GROUPS = {
  'STANDARD_BUSINESS': {
    name: 'Standard Business Services',
    description: 'Professional notary services during regular business hours (Mon-Fri 9am-5pm)',
    calendars: ['STANDARD_NOTARY'],
    priority: 1,
    color: '#2E7D32', // Green
    clientType: 'Standard business clients, routine document needs',
    pricing: 'Base pricing tier',
    bookingPattern: 'Predictable weekday scheduling'
  },
  
  'EXTENDED_FLEXIBLE': {
    name: 'Extended & Flexible Services',
    description: 'Extended hours and remote services for maximum flexibility',
    calendars: ['EXTENDED_HOURS', 'RON_SERVICES'],
    priority: 2,
    color: '#1976D2', // Blue
    clientType: 'Busy professionals, after-hours needs',
    pricing: 'Premium pricing for convenience',
    bookingPattern: 'Evenings, weekends, immediate needs'
  },
  
  'SPECIALTY_SERVICES': {
    name: 'Specialty Services',
    description: 'Specialized loan signing and document services',
    calendars: ['LOAN_SIGNING'],
    priority: 3,
    color: '#F57C00', // Orange
    clientType: 'Real estate professionals, mortgage clients',
    pricing: 'Flat fee specialist pricing',
    bookingPattern: 'Scheduled around closing dates'
  }
};

// Alternative organization by service tier
const ALTERNATIVE_GROUPS = {
  'ESSENTIAL_SERVICES': {
    name: 'Essential Services',
    description: 'Core notary services for everyday business needs',
    calendars: ['STANDARD_NOTARY'],
    priority: 1,
    color: '#4CAF50', // Green
    clientType: 'Price-conscious clients, basic needs'
  },
  
  'PREMIUM_SERVICES': {
    name: 'Premium Services',
    description: 'Higher-tier services with extended hours and specialization',
    calendars: ['EXTENDED_HOURS', 'LOAN_SIGNING'],
    priority: 2,
    color: '#FF9800', // Orange
    clientType: 'Convenience-focused clients, specialized needs'
  },
  
  'DIGITAL_SERVICES': {
    name: 'Digital Services',
    description: 'Modern remote online notarization services',
    calendars: ['RON_SERVICES'],
    priority: 3,
    color: '#2196F3', // Blue
    clientType: 'Tech-savvy clients, remote workers'
  }
};

function displayGroupingRecommendations() {
  console.log('🗂️  GHL Calendar Groups Recommendations');
  console.log('=' .repeat(50));
  console.log('');
  
  // Display current calendar overview
  console.log('📋 Current Calendar Overview');
  console.log('-' .repeat(30));
  
  Object.entries(CALENDAR_IDS).forEach(([serviceType, calendarId]) => {
    const service = SERVICE_DETAILS[serviceType];
    console.log(`\n📅 ${service.name}`);
    console.log(`   ID: ${calendarId}`);
    console.log(`   Hours: ${service.hours}`);
    console.log(`   Duration: ${service.duration}`);
    console.log(`   Features: ${service.features.join(', ')}`);
  });
  
  console.log('\n\n🎯 RECOMMENDED GROUPING STRATEGY');
  console.log('=' .repeat(50));
  
  console.log('\n📋 OPTION 1: Business Function Groups (RECOMMENDED)');
  console.log('═'.repeat(45));
  
  Object.entries(CALENDAR_GROUPS).forEach(([groupId, group]) => {
    console.log(`\n📁 ${group.name}`);
    console.log(`   Priority: ${group.priority} (Display Order)`);
    console.log(`   Color: ${group.color}`);
    console.log(`   Description: ${group.description}`);
    console.log(`   Client Type: ${group.clientType}`);
    console.log(`   Pricing: ${group.pricing}`);
    console.log(`   Booking Pattern: ${group.bookingPattern}`);
    console.log(`   Calendars in Group:`);
    
    group.calendars.forEach(calendarType => {
      const service = SERVICE_DETAILS[calendarType];
      const calendarId = CALENDAR_IDS[calendarType];
      console.log(`     • ${service.name} (${calendarId})`);
      console.log(`       - ${service.hours} | ${service.duration}`);
    });
  });
  
  console.log('\n📋 OPTION 2: Service Tier Groups (ALTERNATIVE)');
  console.log('═'.repeat(45));
  
  Object.entries(ALTERNATIVE_GROUPS).forEach(([groupId, group]) => {
    console.log(`\n📁 ${group.name}`);
    console.log(`   Priority: ${group.priority}`);
    console.log(`   Color: ${group.color}`);
    console.log(`   Description: ${group.description}`);
    console.log(`   Client Type: ${group.clientType}`);
    console.log(`   Calendars in Group:`);
    
    group.calendars.forEach(calendarType => {
      const service = SERVICE_DETAILS[calendarType];
      const calendarId = CALENDAR_IDS[calendarType];
      console.log(`     • ${service.name} (${calendarId})`);
    });
  });
  
  console.log('\n\n🛠️  IMPLEMENTATION STEPS');
  console.log('=' .repeat(50));
  
  console.log('\n1. 🔗 Login to GHL Dashboard');
  console.log('   → Go to Settings → Calendars → Groups');
  console.log('   → Click "Create Group"');
  console.log('');
  
  console.log('2. 📁 Create Groups (Option 1 - Recommended)');
  console.log('   → Group 1: "Standard Business Services"');
      console.log('     • Add calendar: w3sjmTzBfuahySgQvKoV (Standard Notary)');
  console.log('     • Set color: Green (#2E7D32)');
  console.log('     • Display order: 1');
  console.log('');
  console.log('   → Group 2: "Extended & Flexible Services"');
      console.log('     • Add calendar: OmcFGOLhrR9lil6AQa2z (Extended Hours)');
    console.log('     • Add calendar: xFRCVGNlnZASiQnBVHEG (RON Services)');
  console.log('     • Set color: Blue (#1976D2)');
  console.log('     • Display order: 2');
  console.log('');
  console.log('   → Group 3: "Specialty Services"');
      console.log('     • Add calendar: yf6tpA7YMn3oyZc6GVZK (Loan Signing)');
  console.log('     • Set color: Orange (#F57C00)');
  console.log('     • Display order: 3');
  console.log('');
  
  console.log('3. 🎨 Configure Group Settings');
  console.log('   → Enable group scheduling widget');
  console.log('   → Set appropriate booking window for each group');
  console.log('   → Configure group-specific confirmation messages');
  console.log('');
  
  console.log('4. 📱 Update Website Integration');
  console.log('   → Standard Business: Main "Book Now" buttons');
  console.log('   → Extended/Flexible: "Need flexible hours?" CTAs');
  console.log('   → Specialty Services: Loan/mortgage service pages');
  console.log('');
  
  console.log('5. 🧪 Test & Optimize');
  console.log('   → Test booking flow for each group');
  console.log('   → Monitor group performance analytics');
  console.log('   → Adjust group assignments based on booking patterns');
  console.log('');
  
  console.log('💡 PRO TIPS');
  console.log('=' .repeat(50));
  console.log('• Use descriptive group names that clients understand');
  console.log('• Set display order based on booking volume (most popular first)');
  console.log('• Use colors that match your brand and service tiers');
  console.log('• Consider creating separate landing pages for each group');
  console.log('• Monitor which groups perform best and adjust accordingly');
  console.log('• Keep group descriptions client-focused, not internal');
  console.log('');
  
  console.log('🔧 NEXT STEPS');
  console.log('=' .repeat(50));
  console.log('1. Choose your preferred grouping strategy (Option 1 recommended)');
  console.log('2. Create the groups in your GHL dashboard');
  console.log('3. Update your website booking links');
  console.log('4. Test the booking flow for each group');
  console.log('5. Run the availability diagnostic again to ensure groups work');
  console.log('6. Monitor group performance and adjust as needed');
}

// Run the display function
displayGroupingRecommendations(); 