// Test Contact Form API on Production
// This script tests the live contact form to verify it's working

const testProductionContactForm = async () => {
  const testData = {
    firstName: "Test",
    lastName: "User",
    email: "test@example.com",
    phone: "7135551234",
    subject: "Test Contact Form",
    message: "This is a test message to verify the contact form is working properly after environment variable fixes.",
    preferredCallTime: "anytime_flexible",
    callRequestReason: "Testing the functionality",
    smsConsent: true,
    termsAccepted: true
  };

  console.log("🧪 Testing Production Contact Form API...");
  console.log("🌐 URL: https://houstonmobilenotarypros.com/api/contact");
  console.log("📨 Expected email recipient: houstonmobilenotarypros@gmail.com");
  console.log("");

  try {
    const response = await fetch('https://houstonmobilenotarypros.com/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ContactFormTest/1.0'
      },
      body: JSON.stringify(testData)
    });

    console.log("📊 Response Status:", response.status);
    console.log("📊 Response Headers:", Object.fromEntries(response.headers.entries()));
    
    let result;
    const responseText = await response.text();
    console.log("📄 Raw Response:", responseText);
    
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.log("❌ Failed to parse JSON response:", parseError.message);
      return;
    }
    
    console.log("📦 Parsed Response Data:", result);
    
    if (response.ok && result.success) {
      console.log("✅ Production contact form test PASSED!");
      console.log("📧 Check your Gmail (houstonmobilenotarypros@gmail.com) for the test email!");
      console.log("🔗 GHL Contact ID:", result.contactId);
    } else {
      console.log("❌ Production contact form test FAILED!");
      console.log("🚨 Error:", result.message);
      if (result.errors) {
        console.log("🔍 Validation errors:", result.errors);
      }
    }
  } catch (error) {
    console.error("💥 Network/Fetch Error:", error.message);
    console.error("💥 Error Details:", error);
  }
};

// Run the test
testProductionContactForm(); 