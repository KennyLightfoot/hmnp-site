// Comprehensive Booking Flow Diagnostic Script
// Copy and paste this into browser console on /booking page

console.log('🧪 BOOKING FLOW DIAGNOSTIC STARTING...');
console.log('==================================================');

// Step 1: Check for JavaScript errors
console.log('1️⃣ Previous JavaScript Errors:');
console.log('- Check above this message for TypeError or other JavaScript errors');
console.log('- Common errors to look for:');
console.log('  • TypeError: Cannot read properties of undefined (reading \'map\')');
console.log('  • TypeError: Cannot read properties of undefined (reading \'find\')');
console.log('  • Error: Invalid service type selected');

// Step 2: Test services loading
console.log('\n2️⃣ Services Loading Test:');
const serviceOptions = document.querySelectorAll('[data-testid="service-option"]');
console.log(`- Found ${serviceOptions.length} service options`);

if (serviceOptions.length === 0) {
  console.error('❌ NO SERVICES RENDERED');
  console.log('  This indicates services.map() failure or loading issue');
  console.log('  Expected: 3+ service options should be visible');
} else {
  console.log('✅ Services rendered successfully');
  serviceOptions.forEach((option, index) => {
    const serviceName = option.querySelector('.font-semibold')?.textContent || 'Unknown';
    console.log(`  Service ${index + 1}: ${serviceName}`);
  });
}

// Step 3: Check form elements
console.log('\n3️⃣ Form Elements Check:');
const formElements = {
  serviceRadios: document.querySelectorAll('input[name="serviceType"]').length,
  numberInput: document.querySelector('input[type="number"]') ? 'Found' : 'Missing',
  submitButton: document.querySelector('button[type="submit"]') ? 'Found' : 'Missing',
  nextButton: document.querySelector('button:contains("Next")') ? 'Found' : 'Missing'
};
console.log('- Form elements:', formElements);

// Step 4: Test service selection functionality
if (serviceOptions.length > 0) {
  console.log('\n4️⃣ Testing Service Selection...');
  console.log('- Attempting to select first service...');
  
  setTimeout(() => {
    const firstRadio = serviceOptions[0].querySelector('input[type="radio"]');
    if (firstRadio) {
      firstRadio.click();
      console.log('✅ Service selected successfully');
      
      // Check if calendar loads
      setTimeout(() => {
        const calendarElement = document.querySelector('[data-testid*="calendar"]') || 
                               document.querySelector('[class*="calendar"]') || 
                               document.querySelector('[id*="calendar"]');
        
        if (calendarElement) {
          console.log('✅ Calendar component loaded successfully');
        } else {
          console.error('❌ CALENDAR FAILED TO LOAD');
          console.log('  This indicates serviceId mapping issue or calendar component failure');
          
          // Check for debug info
          const debugInfo = document.querySelector('[class*="bg-gray-100"]');
          if (debugInfo) {
            console.log('  Debug info found:', debugInfo.textContent);
          }
        }
      }, 1500);
    } else {
      console.error('❌ Could not find radio button in service option');
    }
  }, 500);
} else {
  console.log('\n4️⃣ Skipping service selection test - no services available');
}

// Step 5: Check React component state
console.log('\n5️⃣ React Component State Check:');
console.log('- Checking for React DevTools...');
if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
  console.log('✅ React DevTools available - you can inspect component state');
} else {
  console.log('ℹ️ React DevTools not installed - consider installing for better debugging');
}

// Step 6: Network requests test
console.log('\n6️⃣ Network Requests Test:');
console.log('- Testing services API endpoints...');

const testEndpoints = [
  '/api/services-production',
  '/api/services',
  '/api/services-compatible'
];

Promise.all(
  testEndpoints.map(endpoint => 
    fetch(endpoint)
      .then(response => ({ endpoint, status: response.status, ok: response.ok }))
      .catch(error => ({ endpoint, status: 'ERROR', error: error.message }))
  )
).then(results => {
  console.log('- API endpoint results:');
  results.forEach(result => {
    const status = result.ok ? '✅' : '❌';
    console.log(`  ${status} ${result.endpoint}: ${result.status} ${result.error || ''}`);
  });
}).catch(error => {
  console.error('❌ Network test failed:', error);
});

// Step 7: Performance check
console.log('\n7️⃣ Performance Check:');
const performanceEntries = performance.getEntriesByType('navigation');
if (performanceEntries.length > 0) {
  const loadTime = performanceEntries[0].loadEventEnd - performanceEntries[0].loadEventStart;
  console.log(`- Page load time: ${loadTime.toFixed(2)}ms`);
  
  if (loadTime > 3000) {
    console.warn('⚠️ Slow page load detected - may impact user experience');
  } else {
    console.log('✅ Page load performance acceptable');
  }
}

// Step 8: Console error monitor
console.log('\n8️⃣ Setting up error monitor...');
let errorCount = 0;
const originalError = console.error;
console.error = function(...args) {
  errorCount++;
  console.log(`🚨 NEW ERROR DETECTED (#${errorCount}):`, ...args);
  originalError.apply(console, args);
};

console.log('✅ Error monitor active - will log any new errors');

// Final summary
setTimeout(() => {
  console.log('\n📋 DIAGNOSTIC SUMMARY');
  console.log('====================================');
  console.log(`Services rendered: ${serviceOptions.length > 0 ? '✅ YES' : '❌ NO'}`);
  console.log(`Form elements: ${formElements.submitButton === 'Found' ? '✅ YES' : '❌ NO'}`);
  console.log(`Error count: ${errorCount === 0 ? '✅ NONE' : `❌ ${errorCount} errors`}`);
  
  console.log('\n🎯 NEXT STEPS:');
  if (serviceOptions.length === 0) {
    console.log('1. Fix services loading issue');
    console.log('2. Check browser console for TypeError messages');
    console.log('3. Verify API endpoints are working');
  } else {
    console.log('1. Test complete booking flow manually');
    console.log('2. Select service → choose time → fill details → submit');
    console.log('3. Monitor console for any errors during flow');
  }
  
  console.log('\n🧪 DIAGNOSTIC COMPLETE');
}, 3000);

// Return diagnostic object for programmatic access
window.bookingDiagnostic = {
  serviceCount: serviceOptions.length,
  formElementsFound: formElements,
  timestamp: new Date().toISOString(),
  runTests: () => {
    console.log('Re-running diagnostic tests...');
    // Re-run key tests
  }
};