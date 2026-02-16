/**
 * RON Payment Simulation Utility
 * 
 * This script simulates a successful Stripe payment for a RON session
 * and triggers the webhook handler to create a BlueNotary session.
 * 
 * Usage: node scripts/simulate-ron-payment.js
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Mock Stripe checkout session for a RON payment
const mockStripeSession = {
  id: `cs_test_${Date.now()}`,
  payment_intent: `pi_test_${Date.now()}`,
  payment_status: 'paid',
  status: 'complete',
  customer_details: {
    email: 'test@example.com',
    name: 'Test User'
  },
  metadata: {
    isRON: 'true',
    customerEmail: 'test@example.com',
    customerName: 'Test User',
    customerPhone: '5551234567',
    documentType: 'GENERAL',
    notes: 'This is a test RON session created via the payment simulation script'
  },
  amount_total: 3500,
  currency: 'usd'
};

async function main() {
  try {
    console.log('🧪 RON Payment Simulation Tool');
    console.log('==============================');
    console.log('Simulating Stripe checkout.session.completed event');
    
    // Dynamically import the webhook handler
    const { handleWebhookEvent } = require('../app/api/webhooks/stripe/route');
    
    // Create a mock event object
    const mockEvent = {
      type: 'checkout.session.completed',
      data: {
        object: mockStripeSession
      }
    };
    
    console.log(`Session ID: ${mockStripeSession.id}`);
    console.log(`Customer: ${mockStripeSession.metadata.customerName} (${mockStripeSession.metadata.customerEmail})`);
    console.log(`Amount: $${(mockStripeSession.amount_total / 100).toFixed(2)} ${mockStripeSession.currency.toUpperCase()}`);
    console.log(`Document Type: ${mockStripeSession.metadata.documentType}`);
    
    console.log('\n📤 Sending webhook event to handler...');
    
    // Call the webhook handler directly
    const result = await handleWebhookEvent(mockEvent);
    
    console.log('\n📥 Handler response:');
    console.log(result);
    
    console.log('\n✅ Simulation complete!');
    console.log('Check the logs for BlueNotary session creation details.');
    console.log('If the RON service is properly configured, a BlueNotary session should have been created.');
    
  } catch (error) {
    console.error('\n❌ Simulation failed:');
    console.error(error);
    process.exit(1);
  }
}

main();