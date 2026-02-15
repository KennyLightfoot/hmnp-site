// Test Contact Form API Locally
// This script tests the contact form API endpoint to verify it's working correctly

const testContactForm = async () => {
  const testData = {
    firstName: "John",
    lastName: "Doe", 
    email: "test@example.com",
    phone: "7135551234",
    subject: "Test Contact Form",
    message: "This is a test message from the contact form API to verify everything is working correctly. This should be long enough to pass validation.",
    preferredCallTime: "anytime_flexible",
    callRequestReason: "Testing the contact form functionality",
    smsConsent: true,
    termsAccepted: true
  };

  console.log("🧪 Testing Contact Form API...");
  console.log("📨 Expected email recipient: houstonmobilenotarypros@gmail.com");
  console.log("📧 Test data:", testData);
  console.log("");

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
    console.log("📦 Response Data:", result);
    
    if (response.ok && result.success) {
      console.log("✅ Contact form test PASSED!");
      console.log("📧 Check your Gmail (houstonmobilenotarypros@gmail.com) for the test email!");
      console.log("🔗 GHL Contact ID:", result.contactId);
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
};

// Run the test
testContactForm(); 