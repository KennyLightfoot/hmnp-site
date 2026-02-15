// Test Contact Form API with Comprehensive Diagnostics
// This script tests all the issues identified and their fixes

const testContactFormFix = async () => {
  console.log('🔧 Testing Contact Form API - Comprehensive Diagnostics');
  console.log('======================================================');
  
  // Test 1: Environment Variables Check
  console.log('\n📋 1. ENVIRONMENT VARIABLES VALIDATION');
  console.log('----------------------------------------');
  
  const envVars = [
    'GHL_LOCATION_ID',
    'GHL_PRIVATE_INTEGRATION_TOKEN',
    'GHL_API_KEY',
    'CONTACT_FORM_RECEIVER_EMAIL',
    'CONTACT_FORM_SENDER_EMAIL',
    'RESEND_API_KEY'
  ];
  
  envVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      // Check for newline issues
      const hasNewline = value.includes('\n') || value.includes('\r');
      const trimmedValue = value.trim();
      const needsTrimming = value !== trimmedValue;
      
      console.log(`✅ ${varName}: ${trimmedValue.substring(0, 20)}...`);
      if (hasNewline) {
        console.log(`⚠️  ${varName} contains newline characters!`);
      }
      if (needsTrimming) {
        console.log(`⚠️  ${varName} has leading/trailing whitespace!`);
      }
    } else {
      console.log(`❌ ${varName}: NOT SET`);
    }
  });
  
  // Test 2: Email Format Validation
  console.log('\n📧 2. EMAIL FORMAT VALIDATION');
  console.log('------------------------------');
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const receiverEmail = process.env.CONTACT_FORM_RECEIVER_EMAIL?.trim();
  const senderEmail = process.env.CONTACT_FORM_SENDER_EMAIL?.trim();
  
  if (receiverEmail) {
    const isValid = emailRegex.test(receiverEmail);
    console.log(`${isValid ? '✅' : '❌'} Receiver Email: ${receiverEmail} - ${isValid ? 'Valid' : 'Invalid'}`);
  } else {
    console.log('❌ Receiver Email: NOT SET');
  }
  
  if (senderEmail) {
    const isValid = emailRegex.test(senderEmail);
    console.log(`${isValid ? '✅' : '❌'} Sender Email: ${senderEmail} - ${isValid ? 'Valid' : 'Invalid'}`);
  } else {
    console.log('❌ Sender Email: NOT SET');
  }
  
  // Test 3: GHL API Token Test
  console.log('\n🔐 3. GHL API TOKEN VALIDATION');
  console.log('-------------------------------');
  
  const privateToken = process.env.GHL_PRIVATE_INTEGRATION_TOKEN;
  const apiKey = process.env.GHL_API_KEY;
  const locationId = process.env.GHL_LOCATION_ID?.trim();
  
  const tokenToUse = privateToken || apiKey;
  
  if (tokenToUse) {
    console.log(`✅ Using token: ${tokenToUse.substring(0, 20)}...`);
    
    if (locationId) {
      try {
        console.log(`🔍 Testing GHL API connection with location: ${locationId}`);
        
        const response = await fetch(`https://services.leadconnectorhq.com/locations/${locationId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${tokenToUse}`,
            'Version': '2021-07-28',
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log(`✅ GHL API Connection Success! Location: ${data.name}`);
        } else {
          const errorText = await response.text();
          console.log(`❌ GHL API Connection Failed: ${response.status} - ${errorText}`);
        }
      } catch (error) {
        console.log(`❌ GHL API Connection Error: ${error.message}`);
      }
    } else {
      console.log('❌ Location ID not set - cannot test GHL API');
    }
  } else {
    console.log('❌ No GHL API token found');
  }
  
  // Test 4: Contact Form API Test
  console.log('\n🧪 4. CONTACT FORM API TEST');
  console.log('----------------------------');
  
  const testData = {
    firstName: "Test",
    lastName: "User", 
    email: "test@example.com",
    phone: "7135551234",
    subject: "Test Contact Form - Diagnostic",
    message: "This is a comprehensive test of the contact form API after applying fixes for JWT token, location ID newlines, and email validation issues.",
    preferredCallTime: "anytime_flexible",
    callRequestReason: "Testing the contact form functionality after applying fixes",
    smsConsent: true,
    termsAccepted: true
  };

  console.log("📨 Testing contact form submission...");
  console.log("📧 Test data:", JSON.stringify(testData, null, 2));
  
  try {
    const response = await fetch('http://localhost:3000/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    
    console.log("📊 Response Status:", response.status);
    console.log("📦 Response Data:", JSON.stringify(result, null, 2));
    
    if (response.ok && result.success) {
      console.log("✅ Contact form test PASSED!");
      console.log("🔗 GHL Contact ID:", result.contactId);
      
      if (result.contactId) {
        console.log("✅ GHL integration working - contact created successfully");
      } else {
        console.log("⚠️ Contact form succeeded but no GHL contact ID returned");
      }
    } else {
      console.log("❌ Contact form test FAILED!");
      console.log("🚨 Error:", result.message);
      if (result.errors) {
        console.log("🔍 Validation errors:", result.errors);
      }
    }
  } catch (error) {
    console.error("💥 Network/Parse Error:", error.message);
  }
  
  console.log('\n🎯 DIAGNOSTIC COMPLETE');
  console.log('=======================');
  console.log('Check the logs above for any remaining issues.');
  console.log('If the contact form test passed, the fixes are working correctly!');
};

// Run the comprehensive test
testContactFormFix(); 