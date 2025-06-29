/**
 * Test script for the booking endpoint with GHL integration
 * Run with: npx tsx scripts/testBookingEndpoint.ts
 * 
 * This script simulates a booking request to test the full flow including:
 * - Creating a booking in the database
 * - GHL contact creation with custom fields
 * - GHL tag application
 */
import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';
// Using global fetch API instead of node-fetch

// Load environment variables
config({ path: '.env.local' });
config();

// Initialize Prisma client
const prisma = new PrismaClient();

// Simulate the booking request
async function testBookingEndpoint() {
  try {
    console.log('--- Testing Booking Endpoint with GHL Integration ---');
    
    // Get a valid service ID from the database
    console.log('Fetching active service from database...');
    const service = await prisma.service.findFirst({
      where: { isActive: true },
      select: { id: true, name: true, serviceType: true, basePrice: true }
    });
    
    if (!service) {
      throw new Error('No active services found in the database. Please add a service first.');
    }
    
    console.log(`Found service: ${service.name} (${service.id}) - Type: ${service.serviceType} - Price: $${service.basePrice}`);
    
    // Create a mock booking request body
    const mockBookingRequest = {
      firstName: 'Test',
      lastName: 'User',
      email: `test.booking.${Date.now()}@example.com`,
      phone: '5555555555',
      serviceId: service.id, // Using the actual service ID from the database
      scheduledDateTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      locationType: 'CLIENT_SPECIFIED_ADDRESS',
      addressStreet: '123 Test Street',
      addressCity: 'Test City',
      addressState: 'TX',
      addressZip: '12345',
      notes: 'This is a test booking from API test script',
      booking_number_of_signers: 2,
      consent_terms_conditions: true,
      smsNotifications: true,
      emailUpdates: true,
      promoCode: 'TEST',
      referredBy: 'API Test Script'
    };
    
    console.log('Mock booking request:', JSON.stringify(mockBookingRequest, null, 2));
    
    // Get a valid service ID from the database (optional - requires database access)
    // If you don't have this, you can use a hardcoded valid service ID
    try {
      // This is just for logging to help with debugging
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';
      console.log(`API Base URL: ${apiBaseUrl}`);
      
      // Make the request to the booking endpoint
      const response = await fetch(`${apiBaseUrl}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockBookingRequest),
      });
      
      const responseStatus = response.status;
      const responseData = await response.json();
      
      console.log(`Response Status: ${responseStatus}`);
      console.log('Response Data:', JSON.stringify(responseData, null, 2));
      
      if (responseStatus >= 200 && responseStatus < 300) {
        console.log('✅ Booking created successfully!');
        if (responseData.booking && responseData.booking.id) {
          console.log(`✅ Booking ID: ${responseData.booking.id}`);
        }
      } else {
        console.error('❌ Booking creation failed!');
      }
    } catch (fetchError) {
      console.error('Error making request to booking endpoint:', fetchError);
    }
    
    console.log('\n--- Test Completed ---');
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

// Run the test
testBookingEndpoint()
  .catch(console.error)
  .finally(async () => {
    // Close Prisma connection
    await prisma.$disconnect();
  });
