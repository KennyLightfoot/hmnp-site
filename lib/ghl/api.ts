// lib/ghl/api.ts

// GHL API configuration from environment variables
const GHL_API_BASE_URL = process.env.GHL_API_BASE_URL;
const GHL_API_KEY = process.env.GHL_API_KEY;
const GHL_API_VERSION = process.env.GHL_API_VERSION || "V2";
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;

// Helper function to search for a contact by email in GHL
export async function findContactByEmail(email: string, locationId?: string): Promise<any | null> {
  if (!GHL_API_BASE_URL || !GHL_API_KEY) {
    console.error("GHL API credentials missing in environment variables.");
    throw new Error("Server configuration error.");
  }
  
  // Use the provided locationId or fall back to the environment variable
  const locationIdToUse = locationId || GHL_LOCATION_ID;
  
  // Add locationId to query params if provided
  const queryParams: Record<string, string> = { query: email };
  if (locationIdToUse) {
    queryParams.locationId = locationIdToUse;
  }
  
  const queryString = new URLSearchParams(queryParams).toString();

  // Change endpoint from /contacts/lookup to /contacts
  const response = await fetch(`${GHL_API_BASE_URL}/contacts?${queryString}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${GHL_API_KEY}`,
      Version: GHL_API_VERSION,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    // If the API returns 404, it means no contact was found, which is not an error in this context.
    if (response.status === 404) {
      return null; // No contact found
    }
    const errorData = await response.json().catch(() => ({})); // Catch errors if response is not JSON
    console.error(`Failed to search for contact by email (${email}): ${JSON.stringify(errorData)}`, { status: response.status });
    // Throw an error for non-404 responses as it indicates a different problem
    throw new Error(`Failed to search contact: Status ${response.status}`);
  }

  const data = await response.json();
  // The /contacts endpoint likely returns an array under 'contacts'
  if (data.contacts && data.contacts.length > 0) {
    return data.contacts[0]; // Return the first matching contact
  }

  return null; // No contact found
}

// Helper function to create a contact in GHL
export async function createContact(contactData: any, locationId?: string): Promise<any> {
  if (!GHL_API_BASE_URL || !GHL_API_KEY) {
    console.error("GHL API credentials missing in environment variables.");
    throw new Error("Server configuration error.");
  }
  
  // Use the provided locationId or fall back to the environment variable
  const locationIdToUse = locationId || GHL_LOCATION_ID;
  
  if (!locationIdToUse) {
    throw new Error("No location ID provided or available in environment.");
  }
  
  const response = await fetch(`${GHL_API_BASE_URL}/contacts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GHL_API_KEY}`,
      Version: GHL_API_VERSION,
    },
    body: JSON.stringify({
      locationId: locationIdToUse,
      ...contactData,
    }),
  });

  if (!response.ok) {
     const errorData = await response.json().catch(() => ({ message: "Failed to parse error JSON" }));

    // Check for the specific duplicate contact error (common in GHL)
    if (
      response.status === 400 &&
      errorData.message === "This location does not allow duplicated contacts." &&
      errorData.meta?.contactId
    ) {
      console.warn(`Attempted to create duplicate contact for ${contactData.email}. Using existing contact ID: ${errorData.meta.contactId}`);
      // Return the existing contact ID as if creation was successful
      return { id: errorData.meta.contactId };
    }

    // If it's a different error, log and throw
    console.error("GHL Create Contact Error:", errorData);
    throw new Error(`Failed to create contact: ${JSON.stringify(errorData)}`);
  }

  return response.json();
}

// Helper function to create an opportunity in GHL
export async function createOpportunity(contactId: string, opportunityData: any, locationId?: string): Promise<any> {
  if (!GHL_API_BASE_URL || !GHL_API_KEY) {
    console.error("GHL API credentials missing in environment variables.");
    throw new Error("Server configuration error.");
  }
  
  // Use the provided locationId or fall back to the environment variable
  const locationIdToUse = locationId || GHL_LOCATION_ID;
  
  if (!locationIdToUse) {
    throw new Error("No location ID provided or available in environment.");
  }
  
  const response = await fetch(`${GHL_API_BASE_URL}/opportunities`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GHL_API_KEY}`,
      Version: GHL_API_VERSION,
    },
    body: JSON.stringify({
      locationId: locationIdToUse,
      contactId: contactId,
      ...opportunityData,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("GHL Create Opportunity Error:", errorData);
    throw new Error(`Failed to create opportunity: ${JSON.stringify(errorData)}`);
  }

  return response.json();
}

// Helper function to update custom fields for a contact
export async function updateContactCustomFields(contactId: string, customFields: any): Promise<any> {
   if (!GHL_API_BASE_URL || !GHL_API_KEY) {
    console.error("GHL API credentials missing in environment variables.");
    throw new Error("Server configuration error.");
  }
  const response = await fetch(`${GHL_API_BASE_URL}/contacts/${contactId}/custom-fields`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GHL_API_KEY}`,
      Version: GHL_API_VERSION,
    },
    body: JSON.stringify({
      customFields: customFields,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("GHL Update Contact Custom Fields Error:", errorData);
    throw new Error(`Failed to update contact custom fields: ${JSON.stringify(errorData)}`);
  }

  return response.json();
}

// Helper function to update custom fields for an opportunity
export async function updateOpportunityCustomFields(opportunityId: string, customFields: any): Promise<any> {
   if (!GHL_API_BASE_URL || !GHL_API_KEY) {
    console.error("GHL API credentials missing in environment variables.");
    throw new Error("Server configuration error.");
  }
  const response = await fetch(`${GHL_API_BASE_URL}/opportunities/${opportunityId}/custom-fields`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GHL_API_KEY}`,
      Version: GHL_API_VERSION,
    },
    body: JSON.stringify({
      customFields: customFields,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("GHL Update Opportunity Custom Fields Error:", errorData);
    throw new Error(`Failed to update opportunity custom fields: ${JSON.stringify(errorData)}`);
  }

  return response.json();
}

// Helper function to create an appointment in GHL
export async function createAppointment(appointmentData: any, locationId?: string): Promise<any> {
  if (!GHL_API_BASE_URL || !GHL_API_KEY) {
    console.error("GHL API credentials missing in environment variables.");
    throw new Error("Server configuration error.");
  }
  
  // Use the provided locationId or fall back to the environment variable
  const locationIdToUse = locationId || GHL_LOCATION_ID;
  
  if (locationIdToUse && !appointmentData.locationId) {
    appointmentData.locationId = locationIdToUse;
  }
  
  try {
    const url = `${GHL_API_BASE_URL}/calendars/events/appointments`;
    
    // Log the appointment data for troubleshooting
    console.log("Creating appointment with data:", JSON.stringify({
      calendarId: appointmentData.calendarId,
      contactId: appointmentData.contactId,
      locationId: appointmentData.locationId, 
      title: appointmentData.title,
      startTime: appointmentData.startTime,
      endTime: appointmentData.endTime
    }));

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GHL_API_KEY}`,
        Version: GHL_API_VERSION,
      },
      body: JSON.stringify(appointmentData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`GHL Create Appointment API Response Status: ${response.status}`);
      console.error(`GHL Create Appointment API Response Headers:`, Object.fromEntries(response.headers.entries()));
      console.error(`GHL Create Appointment API Response Body:`, errorData);
      throw new Error(`Failed to create appointment: ${JSON.stringify(errorData)}`);
    }

    return response.json();
  } catch (error) {
    console.error("Error in createAppointment helper:", error);
    // Re-throw the error so the calling route handler can catch it
    throw error;
  }
}

// Function to get monetary value (Consider moving this elsewhere if not strictly GHL API related)
export function getServiceValue(serviceType: string, numberOfSigners: number): number {
  switch (serviceType) {
    case "essential":
      if (numberOfSigners === 1) return 75;
      if (numberOfSigners === 2) return 85;
      if (numberOfSigners === 3) return 95;
      return 100; // 4+ signers
    case "priority":
      return 100 + (numberOfSigners > 2 ? (numberOfSigners - 2) * 10 : 0);
    case "loan-signing":
    case "reverse-mortgage":
      return 150;
    case "specialty":
      return 75;
    default:
      return 75;
  }
} 