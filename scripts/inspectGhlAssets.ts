// scripts/inspectGhlAssets.ts
import 'dotenv/config'; // Load environment variables
import { getLocationCustomFields, GhlCustomField, testGhlConnection } from '../lib/ghl.js';

async function inspectGhl() {
  const locationId = process.env.GHL_LOCATION_ID;
  if (!locationId) {
    console.error('Error: GHL_LOCATION_ID environment variable is not set.');
    console.error('Please set GHL_LOCATION_ID in your .env file (e.g., GHL_LOCATION_ID=oUvYNTw2Wvul7JSJplqQ)');
    process.exit(1); // Exit the script with an error code
  }

  console.log('\n--- Testing GHL Connection (Fetching Location Details) ---');
  try {
    const locationDetails = await testGhlConnection(locationId);
    if (locationDetails) {
      console.log('Successfully fetched location details:', JSON.stringify(locationDetails, null, 2));
    } else {
      console.log('Could not fetch location details, or no data returned.');
    }
  } catch (error) {
    console.error('Error testing GHL connection (fetching location details):', error);
  }

  console.log('\n--- Inspecting GHL Custom Fields ---');
  try {
    const customFields: GhlCustomField[] = await getLocationCustomFields(locationId);
    if (customFields.length > 0) {
      console.log(`Found ${customFields.length} custom fields. Details below (Name | ID | Field Key):`);
      customFields.forEach(field => {
        console.log(`- Name: "${field.name || 'N/A'}" | ID: "${field.id}" | Field Key: "${field.fieldKey || 'N/A'}" | DataType: ${field.dataType || 'N/A'}`);
      });
    } else {
      console.log('No custom fields found or an error occurred.');
    }
  } catch (error) {
    console.error('Error fetching GHL custom fields:', error);
  }

  // console.log('\n--- Inspecting GHL Tags ---');
  // try {
  //   const tags: GhlTag[] = await getLocationTags();
  //   if (tags.length > 0) {
  //     console.log(`Found ${tags.length} tags. Details below (Name | ID):`);
  //     tags.forEach(tag => {
  //       console.log(`- Name: "${tag.name || 'N/A'}" | ID: "${tag.id}"`);
  //     });
  //   } else {
  //     console.log('No tags found or an error occurred.');
  //   }
  // } catch (error) {
  //   console.error('Error fetching GHL tags:', error);
  // }
}

inspectGhl().then(() => {
  console.log('\nInspection script finished.');
}).catch(error => {
  console.error('Script execution failed:', error);
});
