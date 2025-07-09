#!/usr/bin/env node

/**
 * GHL Calendar Group URLs Setup Guide
 * Houston Mobile Notary Pros - 2025
 * 
 * Detailed instructions for setting up group URLs and booking links
 */

// Your recommended calendar groups
const CALENDAR_GROUPS = {
  'STANDARD_BUSINESS': {
    name: 'Standard Business Services',
    calendars: ['w3sjmTzBfuahySgQvKoV'], // Standard Notary
    suggestedUrl: 'standard-business-services',
    displayName: 'Standard Business Services',
    description: 'Professional notary services during regular business hours'
  },
  
  'EXTENDED_FLEXIBLE': {
    name: 'Extended & Flexible Services',
    calendars: ['OmcFGOLhrR9lil6AQa2z', 'xFRCVGNlnZASiQnBVHEG'], // Extended Hours + RON
    suggestedUrl: 'extended-flexible-services',
    displayName: 'Extended & Flexible Services',
    description: 'Extended hours and remote services for maximum flexibility'
  },
  
  'SPECIALTY_SERVICES': {
    name: 'Specialty Services',
    calendars: ['yf6tpA7YMn3oyZc6GVZK'], // Loan Signing
    suggestedUrl: 'specialty-services',
    displayName: 'Specialty Services',
    description: 'Specialized loan signing and document services'
  }
};

// Website integration examples
const WEBSITE_INTEGRATION = {
  'STANDARD_BUSINESS': {
    pageLocations: [
      'Main homepage "Book Now" button',
      '/services/standard-notary page',
      'Footer booking links',
      'Contact page primary CTA'
    ],
    ctaText: [
      'Book Standard Service',
      'Schedule Now',
      'Book Appointment',
      'Get Notarized Today'
    ]
  },
  
  'EXTENDED_FLEXIBLE': {
    pageLocations: [
      '/services/extended-hours page',
      '/services/ron-services page',
      'After-hours service sections',
      '"Need flexible hours?" CTAs'
    ],
    ctaText: [
      'Book Flexible Hours',
      'Schedule Extended Hours',
      'Book RON Service',
      'Get 24/7 Service'
    ]
  },
  
  'SPECIALTY_SERVICES': {
    pageLocations: [
      '/services/loan-signing page',
      'Real estate partner pages',
      'Mortgage service sections',
      'Loan closing information pages'
    ],
    ctaText: [
      'Schedule Loan Signing',
      'Book Specialist Service',
      'Reserve Signing Session',
      'Get Expert Help'
    ]
  }
};

function displayGroupUrlSetup() {
  console.log('🔗 GHL Calendar Group URLs Setup Guide');
  console.log('=' .repeat(50));
  console.log('');
  
  console.log('📋 STEP 1: Create Groups in GHL Dashboard');
  console.log('-' .repeat(40));
  console.log('1. Login to GHL Dashboard');
  console.log('2. Go to Settings → Calendars → Groups');
  console.log('3. Click "Create Group" for each group below:');
  console.log('');
  
  Object.entries(CALENDAR_GROUPS).forEach(([groupId, group], index) => {
    console.log(`📁 Group ${index + 1}: ${group.name}`);
    console.log(`   Display Name: ${group.displayName}`);
    console.log(`   Description: ${group.description}`);
    console.log(`   Calendar IDs to add: ${group.calendars.join(', ')}`);
    console.log(`   Suggested URL Slug: ${group.suggestedUrl}`);
    console.log('');
  });
  
  console.log('🔗 STEP 2: Set Up Group URLs');
  console.log('-' .repeat(40));
  console.log('After creating each group in GHL:');
  console.log('');
  
  console.log('1. 📝 Configure Group Settings:');
  console.log('   → Click on each group you created');
  console.log('   → Go to "Group Settings" or "Share Group"');
  console.log('   → Look for "Scheduling Link" or "Permanent Link"');
  console.log('   → Edit the URL slug to match suggestions below');
  console.log('');
  
  console.log('2. 🎯 Recommended URL Slugs:');
  Object.entries(CALENDAR_GROUPS).forEach(([groupId, group]) => {
    console.log(`   → ${group.name}: "${group.suggestedUrl}"`);
  });
  console.log('');
  
  console.log('3. 📋 Your Final Group URLs will be:');
  console.log('   (Replace YOUR_GHL_SUBDOMAIN with your actual GHL subdomain)');
  console.log('');
  
  Object.entries(CALENDAR_GROUPS).forEach(([groupId, group]) => {
    console.log(`📁 ${group.name}:`);
    console.log(`   GHL URL: https://YOUR_GHL_SUBDOMAIN.app.gohighlevel.com/widget/bookings/${group.suggestedUrl}`);
    console.log(`   Widget Code: <iframe src="https://YOUR_GHL_SUBDOMAIN.app.gohighlevel.com/widget/bookings/${group.suggestedUrl}" width="100%" height="800"></iframe>`);
    console.log('');
  });
  
  console.log('🎨 STEP 3: Customize Group Widgets');
  console.log('-' .repeat(40));
  console.log('For each group, configure:');
  console.log('');
  console.log('📋 Widget Appearance:');
  console.log('   → Calendar theme/colors to match your brand');
  console.log('   → Custom header text and descriptions');
  console.log('   → Display timezone preferences');
  console.log('   → Show/hide specific calendar details');
  console.log('');
  
  console.log('⚙️  Booking Settings:');
  console.log('   → Minimum scheduling notice per group');
  console.log('   → Maximum booking window per group');
  console.log('   → Required fields for each service type');
  console.log('   → Confirmation message customization');
  console.log('');
  
  console.log('📱 STEP 4: Website Integration');
  console.log('-' .repeat(40));
  console.log('Here\'s where to use each group URL on your website:');
  console.log('');
  
  Object.entries(CALENDAR_GROUPS).forEach(([groupId, group]) => {
    const integration = WEBSITE_INTEGRATION[groupId];
    console.log(`📁 ${group.name}:`);
    console.log(`   Page Locations:`);
    integration.pageLocations.forEach(location => {
      console.log(`     • ${location}`);
    });
    console.log(`   Suggested CTA Text:`);
    integration.ctaText.forEach(cta => {
      console.log(`     • "${cta}"`);
    });
    console.log('');
  });
  
  console.log('💻 STEP 5: Implementation Examples');
  console.log('-' .repeat(40));
  console.log('');
  
  console.log('🔗 Direct Link Examples:');
  Object.entries(CALENDAR_GROUPS).forEach(([groupId, group]) => {
    console.log(`<a href="https://YOUR_GHL_SUBDOMAIN.app.gohighlevel.com/widget/bookings/${group.suggestedUrl}" 
   target="_blank" 
   class="btn btn-primary">
   Book ${group.displayName}
</a>`);
    console.log('');
  });
  
  console.log('📱 Embedded Widget Examples:');
  Object.entries(CALENDAR_GROUPS).forEach(([groupId, group]) => {
    console.log(`<!-- ${group.name} Widget -->`);
    console.log(`<div class="booking-widget-container">`);
    console.log(`  <h3>${group.displayName}</h3>`);
    console.log(`  <p>${group.description}</p>`);
    console.log(`  <iframe 
    src="https://YOUR_GHL_SUBDOMAIN.app.gohighlevel.com/widget/bookings/${group.suggestedUrl}"
    width="100%" 
    height="800" 
    frameborder="0">
  </iframe>`);
    console.log(`</div>`);
    console.log('');
  });
  
  console.log('⚡ STEP 6: Testing & Optimization');
  console.log('-' .repeat(40));
  console.log('');
  console.log('🧪 Test Each Group:');
  console.log('1. Visit each group URL to ensure it loads correctly');
  console.log('2. Test the booking flow end-to-end');
  console.log('3. Verify calendar availability shows properly');
  console.log('4. Check confirmation emails/SMS work');
  console.log('5. Test on mobile devices');
  console.log('');
  
  console.log('📊 Monitor Performance:');
  console.log('• Track which groups get the most bookings');
  console.log('• Monitor conversion rates by group');
  console.log('• A/B test different CTA text');
  console.log('• Analyze booking patterns by service type');
  console.log('• Adjust group prominence based on performance');
  console.log('');
  
  console.log('🔧 NEXT STEPS CHECKLIST');
  console.log('=' .repeat(50));
  console.log('□ Create 3 calendar groups in GHL dashboard');
  console.log('□ Set custom URL slugs for each group');
  console.log('□ Customize widget appearance and settings');
  console.log('□ Get the final group URLs from GHL');
  console.log('□ Update website booking buttons/links');
  console.log('□ Add embedded widgets where appropriate');
  console.log('□ Test all booking flows');
  console.log('□ Set up analytics tracking for each group');
  console.log('□ Monitor and optimize based on performance');
  console.log('');
  
  console.log('💡 PRO TIPS');
  console.log('=' .repeat(50));
  console.log('• Use descriptive, SEO-friendly URL slugs');
  console.log('• Keep group names consistent between GHL and your website');
  console.log('• Set up UTM parameters to track booking sources');
  console.log('• Consider using different group URLs for different marketing campaigns');
  console.log('• Create dedicated landing pages for each group for better conversion');
  console.log('• Use group-specific confirmation messages to reinforce service benefits');
}

// Run the display function
displayGroupUrlSetup(); 