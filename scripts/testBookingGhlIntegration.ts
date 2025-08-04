/**
 * Test script for the booking endpoint's GHL integration
 * Run with: npx tsx scripts/testBookingGhlIntegration.ts
 */
import { config } from 'dotenv';
import { getErrorMessage } from '@/lib/utils/error-utils';
import * as ghl from '../lib/ghl';

// Load environment variables
config({ path: '.env.local' });
config();

async function testGhlIntegration() {
  try {
    // First test GHL connection
    console.log('--- Testing GHL API Connection ---');
    const locationId = process.env.GHL_LOCATION_ID;
    if (!locationId) {
      throw new Error('GHL_LOCATION_ID is not set in environment variables');
    }
    
    console.log(`Using GHL Location ID: ${locationId}`);
    
    // Test location fetch
    console.log('\n--- Testing Location Fetch ---');
    const locationDetails = await ghl.testGhlConnection(locationId);
    console.log('Successfully connected to GHL location:', locationDetails.name);
    
    // Test custom fields fetch
    console.log('\n--- Testing Custom Fields Fetch ---');
    const customFields = await ghl.getLocationCustomFields(locationId);
    console.log(`Retrieved ${customFields.length} custom fields.`);
    console.log('Sample custom fields:', customFields.slice(0, 3));
    
    // Test contact upsert with custom fields
    console.log('\n--- Testing Contact Upsert with Custom Fields ---');
    
    // Create a test array of custom fields
    const testCustomFieldsArray = customFields
      .filter(field => field.id && field.name)
      .slice(0, 3) // Just use first 3 fields for test
      .map(field => ({
        id: field.id!, // Use non-null assertion since we filtered for existence
        field_value: `Test Value for ${field.name}`
      }));
      
    console.log('Test custom fields array:', JSON.stringify(testCustomFieldsArray, null, 2));
    
    // Convert to the format expected by GHL API
    const customFieldObject = ghl.convertCustomFieldsArrayToObject(testCustomFieldsArray);
    console.log('Converted custom fields object:', JSON.stringify(customFieldObject, null, 2));
    
    // Test contact upsert
    const contactPayload = {
      email: `test.contact.${Date.now()}@test.com`, // Use timestamp to ensure uniqueness
      firstName: 'Test',
      lastName: 'Contact',
      phone: '5555555555',
      source: 'API Test Script',
      locationId,
      customField: customFieldObject
    };
    
    console.log('Contact payload:', JSON.stringify(contactPayload, null, 2));
    
    const upsertedContact = await ghl.upsertContact(contactPayload);
    console.log('Successfully upserted contact:', JSON.stringify(upsertedContact, null, 2));
    
    // Test adding tags
    if (upsertedContact.id) {
      console.log('\n--- Testing Tag Addition ---');
      const tagsToAdd = ['Test:APIScript', 'Status:TestContact'];
      await ghl.addTagsToContact(upsertedContact.id, tagsToAdd);
      console.log(`Successfully added tags to contact: ${tagsToAdd.join(', ')}`);
    }
    
    console.log('\n--- All Tests Completed Successfully ---');
  } catch (error) {
    console.error('Test failed with error:', error instanceof Error ? {
      message: getErrorMessage(error),
      name: error.name,
      stack: error.stack
    } : error);
  }
}

testGhlIntegration().catch(console.error);
