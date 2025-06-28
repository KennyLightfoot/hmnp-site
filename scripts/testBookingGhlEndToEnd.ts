/**
 * End-to-end test script for GHL integration with bookings
 * Run with: npx tsx scripts/testBookingGhlEndToEnd.ts
 * 
 * This script tests the full GHL integration flow by:
 * 1. Creating a test booking directly in the database
 * 2. Directly calling the GHL helper functions to upsert a contact with custom fields
 * 3. Adding tags to the contact in GHL
 */
import { config } from 'dotenv';
import { PrismaClient, Booking, BookingStatus, LocationType, ServiceType, Prisma, Role } from '@prisma/client';
import * as ghl from '../lib/ghl';

// Load environment variables
config({ path: '.env.local' });
config();

// Initialize Prisma client
const prisma = new PrismaClient();

// Main test function
async function testBookingGhlEndToEnd() {
  try {
    console.log('--- Testing GHL Integration End-to-End ---');
    
    // 1. Get an active service from the database
    console.log('Fetching active service from database...');
    const service = await prisma.Service.findFirst({
      where: { isActive: true },
      select: { id: true, name: true, serviceType: true, basePrice: true }
    });
    
    if (!service) {
      throw new Error('No active services found in the database. Please add a service first.');
    }
    
    console.log(`Found Service: ${service.name} (${service.id}) - Type: ${service.serviceType} - Price: $${service.basePrice}`);

    // 2. First create a test user to associate with the booking
    console.log('\nCreating test user in database...');
    const uniqueEmail = `test.booking.${Date.now()}@example.com`;
    
    const testUser = await prisma.User.create({
      data: {
        id: `test-user-${Date.now()}`,
        name: 'Test User',
        email: uniqueEmail,
        role: Role.SIGNER,
        updatedAt: new Date()
      }
    });
    console.log(`Created test user with ID: ${testUser.id}`);
    
    // 3. Now create a booking associated with this user
    console.log('\nCreating test booking in database...');
    const testBooking = await prisma.Booking.create({
      data: {
        id: `test-booking-${Date.now()}`,
        serviceId: service.id,
        signerId: testUser.id, // Link to the user we just created
        status: BookingStatus.CONFIRMED,
        locationType: LocationType.CLIENT_SPECIFIED_ADDRESS,
        scheduledDateTime: new Date(Date.now() + 86400000), // tomorrow
        addressStreet: '123 Test Street',
        addressCity: 'Test City',
        addressState: 'TX',
        addressZip: '12345',
        notes: 'This is a test booking created by the GHL integration test script',
        // Required decimal field for price
        priceAtBooking: new Prisma.Decimal(service.basePrice.toString()),
        updatedAt: new Date()
      },
      include: {
        User_Booking_signerIdToUser: true, // Include the related user data
        Service: true
      }
    });
    
    console.log(`Created test booking with ID: ${testBooking.id}`);
    console.log(`Booking details: ${testUser.name} (${testUser.email})`);
    
    // 3. Test GHL API connection
    console.log('\nTesting GHL API connection...');
    const locationId = process.env.GHL_LOCATION_ID;
    if (!locationId) {
      throw new Error('GHL_LOCATION_ID environment variable is not set');
    }
    
    const locationDetails = await ghl.testGhlConnection(locationId);
    console.log(`Successfully connected to GHL location: ${locationDetails.name}`);
    
    // 4. Get custom fields (will use fallback if API fails)
    console.log('\nFetching custom fields...');
    const customFields = await ghl.getLocationCustomFields(locationId);
    console.log(`Retrieved ${customFields.length} custom fields`);
    
    // 5. Prepare custom fields data for this booking
    console.log('\nPreparing custom fields for contact...');
    const bookingDate = testBooking.scheduledDateTime 
      ? new Date(testBooking.scheduledDateTime).toISOString().split('T')[0] 
      : 'Not scheduled';
    
    const bookingTime = testBooking.scheduledDateTime 
      ? new Date(testBooking.scheduledDateTime).toLocaleTimeString() 
      : 'Not scheduled';
    
    // Map custom fields to values
    const customFieldsArray = [
      { id: 'service_date', field_value: bookingDate },
      { id: 'service_time', field_value: bookingTime },
      { id: 'service_address', field_value: `${testBooking.addressStreet}, ${testBooking.addressCity}, ${testBooking.addressState} ${testBooking.addressZip}` },
      { id: 'service_type', field_value: testBooking.Service.name },
      { id: 'number_of_signers', field_value: '1' },
      { id: 'booking_id', field_value: testBooking.id },
      { id: 'booking_status', field_value: testBooking.status }
    ];
    
    // Convert to object format for GHL contact
    const customFieldsObject = ghl.convertCustomFieldsArrayToObject(customFieldsArray);
    console.log('Custom fields object:', customFieldsObject);
    
    // 6. Create/update contact in GHL
    console.log('\nUpserting contact in GHL...');
    const contactPayload = {
      email: testUser.email || '',
      firstName: testUser.name?.split(' ')[0] || 'Unknown',
      lastName: testUser.name?.split(' ').slice(1).join(' ') || 'Unknown',
      phone: '', // We don't have phone in our test user
      source: 'Booking Test Script',
      locationId: locationId,
      customField: customFieldsObject
    };
    
    console.log('Contact payload:', contactPayload);
    const ghlContact = await ghl.upsertContact(contactPayload);
    console.log(`Successfully upserted contact with ID: ${ghlContact.id}`);
    
    // 7. Add tags to contact
    console.log('\nAdding tags to contact...');
    const tags = [
      'Test:EndToEndScript',
      `Status:${testBooking.status}`,
      `Service:${service.serviceType}`
    ];
    
    await ghl.addTagsToContact(ghlContact.id, tags);
    console.log(`Successfully added tags to contact: ${tags.join(', ')}`);
    
    console.log('\n--- All Tests Completed Successfully ---');
    
    // 8. Clean up (optional - comment out if you want to keep the test booking)
    console.log('\nCleaning up test data...');
    await prisma.Booking.delete({ where: { id: testBooking.id } });
    console.log(`Deleted test booking with ID: ${testBooking.id}`);
    
    // Also delete the test user
    await prisma.User.delete({ where: { id: testUser.id } });
    console.log(`Deleted test user with ID: ${testUser.id}`);
    
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

// Run the test
testBookingGhlEndToEnd()
  .catch(console.error)
  .finally(async () => {
    // Close Prisma connection
    await prisma.$disconnect();
  });
