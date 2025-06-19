// import 'dotenv/config';

// Using the API keys from the GHL setup guide
const GHL_API_KEY = 'pit-f7f2fad9-fe5a-4c19-86ff-cb3a4177784a';
const GHL_API_BASE = 'https://rest.gohighlevel.com/v1';

// Helper function to add delay
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function createTestContacts() {
  console.log('🧪 Creating test contacts for GHL workflow testing...\n');

  // Test Contact 1 - For Payment Follow-up Workflow
  const paymentTestContact = {
    firstName: 'Payment',
    lastName: 'Test',
    email: 'payment-test@example.com',
    phone: '555-111-2222',
    tags: ['status:booking_pendingpayment'],
    customFields: {
      booking_id: 'test_booking_123',
      payment_amount: '85',
      urgency_level: 'high',
      hours_old: '36',
      payment_url: 'https://checkout.stripe.com/test-payment-link',
      service_address: '123 Test Street, Houston, TX 77001',
      service_requested: 'Standard Mobile Notary',
      appointment_date: '2024-01-15',
      appointment_time: '2:30 PM'
    }
  };

  // Test Contact 2 - For Phone-to-Booking Workflow
  const phoneTestContact = {
    firstName: 'Phone',
    lastName: 'Test',
    email: 'phone-test@example.com',
    phone: '555-333-4444',
    tags: ['lead:phone_qualified'],
    customFields: {
      service_requested: 'Loan Signing',
      preferred_datetime: '2024-01-16 10:00',
      service_address: '456 Oak Street, Houston, TX',
      customer_city: 'Houston',
      customer_state: 'TX'
    }
  };

  const headers = {
    'Authorization': `Bearer ${GHL_API_KEY}`,
    'Content-Type': 'application/json'
  };

  try {
    // Create Payment Test Contact
    console.log('📝 Creating Payment Test Contact...');
    const paymentResponse = await fetch(`${GHL_API_BASE}/contacts/`, {
      method: 'POST',
      headers,
      body: JSON.stringify(paymentTestContact)
    });

    if (paymentResponse.status === 429) {
      console.log('⏰ Rate limited, waiting 60 seconds before retrying...');
      await delay(60000);
      
      // Retry the request
      const retryResponse = await fetch(`${GHL_API_BASE}/contacts/`, {
        method: 'POST',
        headers,
        body: JSON.stringify(paymentTestContact)
      });
      
      if (!retryResponse.ok) {
        throw new Error(`Failed to create payment test contact after retry: ${retryResponse.statusText}`);
      }
      
      const paymentContact = await retryResponse.json();
      console.log('✅ Payment Test Contact created (after retry):', paymentContact.id);
    } else if (!paymentResponse.ok) {
      const errorData = await paymentResponse.text();
      throw new Error(`Failed to create payment test contact: ${paymentResponse.statusText} - ${errorData}`);
    } else {
      const paymentContact = await paymentResponse.json();
      console.log('✅ Payment Test Contact created:', paymentContact.id);
      console.log('   Email:', paymentContact.email);
      console.log('   Tags:', paymentContact.tags?.join(', '));
      console.log('   Custom Fields:', JSON.stringify(paymentContact.customFields, null, 2));
    }

    console.log('\n⏰ Waiting 5 seconds before creating next contact...\n');
    await delay(5000);

    // Create Phone Test Contact
    console.log('📝 Creating Phone Test Contact...');
    const phoneResponse = await fetch(`${GHL_API_BASE}/contacts/`, {
      method: 'POST',
      headers,
      body: JSON.stringify(phoneTestContact)
    });

    if (phoneResponse.status === 429) {
      console.log('⏰ Rate limited, waiting 60 seconds before retrying...');
      await delay(60000);
      
      // Retry the request
      const retryResponse = await fetch(`${GHL_API_BASE}/contacts/`, {
        method: 'POST',
        headers,
        body: JSON.stringify(phoneTestContact)
      });
      
      if (!retryResponse.ok) {
        throw new Error(`Failed to create phone test contact after retry: ${retryResponse.statusText}`);
      }
      
      const phoneContact = await retryResponse.json();
      console.log('✅ Phone Test Contact created (after retry):', phoneContact.id);
    } else if (!phoneResponse.ok) {
      const errorData = await phoneResponse.text();
      throw new Error(`Failed to create phone test contact: ${phoneResponse.statusText} - ${errorData}`);
    } else {
      const phoneContact = await phoneResponse.json();
      console.log('✅ Phone Test Contact created:', phoneContact.id);
      console.log('   Email:', phoneContact.email);
      console.log('   Tags:', phoneContact.tags?.join(', '));
      console.log('   Custom Fields:', JSON.stringify(phoneContact.customFields, null, 2));
    }

    console.log('\n🎉 Test contacts created successfully!');
    console.log('\nNext steps:');
    console.log('1. Go to GHL and verify the contacts were created');
    console.log('2. Check that all tags and custom fields are set correctly');
    console.log('3. Start testing your workflows with these contacts');

  } catch (error) {
    console.error('❌ Error creating test contacts:', error.message);
    
    if (error.message.includes('Too Many Requests') || error.message.includes('429')) {
      console.log('\n💡 API Rate Limited - You can create these contacts manually in GHL:');
      console.log('\n📋 Payment Test Contact:');
      console.log('   Name: Payment Test');
      console.log('   Email: payment-test@example.com');
      console.log('   Phone: 555-111-2222');
      console.log('   Tag: status:booking_pendingpayment');
      console.log('   Custom Fields:', JSON.stringify(paymentTestContact.customFields, null, 4));
      
      console.log('\n📋 Phone Test Contact:');
      console.log('   Name: Phone Test');
      console.log('   Email: phone-test@example.com');
      console.log('   Phone: 555-333-4444');
      console.log('   Tag: lead:phone_qualified');
      console.log('   Custom Fields:', JSON.stringify(phoneTestContact.customFields, null, 4));
    }
  }
}

// Run the script
createTestContacts(); 