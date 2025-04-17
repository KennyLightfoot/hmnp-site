import { NextResponse } from "next/server"

// GHL API base URL from environment variable
const GHL_API_BASE_URL = process.env.GHL_API_BASE_URL
const GHL_API_KEY = process.env.GHL_API_KEY
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID

// Helper function to search for a contact by email in GHL
async function findContactByEmail(email: string) {
  const query = new URLSearchParams({
    locationId: GHL_LOCATION_ID!,
    query: email,
  }).toString()

  const response = await fetch(`${GHL_API_BASE_URL}/contacts/lookup?${query}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${GHL_API_KEY}`,
      Version: "V2",
      Accept: "application/json",
    },
  })

  if (!response.ok) {
    // If the API returns 404, it means no contact was found, which is not an error in this context.
    if (response.status === 404) {
      return null // No contact found
    }
    const errorData = await response.json().catch(() => ({})) // Catch errors if response is not JSON
    console.error(`Failed to search for contact by email (${email}): ${JSON.stringify(errorData)}`, { status: response.status })
    // Throw an error for non-404 responses as it indicates a different problem
    throw new Error(`Failed to search contact: Status ${response.status}`)
  }

  const data = await response.json()
  // The lookup API returns an array, usually with one element if found
  if (data.contacts && data.contacts.length > 0) {
    return data.contacts[0] // Return the first matching contact
  }

  return null // No contact found
}

// Helper function to create a contact in GHL
async function createContact(contactData: any) {
  const response = await fetch(`${GHL_API_BASE_URL}/contacts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GHL_API_KEY}`,
      Version: "V2",
    },
    body: JSON.stringify({
      locationId: GHL_LOCATION_ID,
      ...contactData,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(`Failed to create contact: ${JSON.stringify(errorData)}`)
  }

  return response.json()
}

// Helper function to create an opportunity in GHL
async function createOpportunity(contactId: string, opportunityData: any) {
  const response = await fetch(`${GHL_API_BASE_URL}/opportunities`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GHL_API_KEY}`,
      Version: "V2",
    },
    body: JSON.stringify({
      locationId: GHL_LOCATION_ID,
      contactId: contactId,
      ...opportunityData,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(`Failed to create opportunity: ${JSON.stringify(errorData)}`)
  }

  return response.json()
}

// Helper function to update custom fields for a contact
async function updateContactCustomFields(contactId: string, customFields: any) {
  const response = await fetch(`${GHL_API_BASE_URL}/contacts/${contactId}/custom-fields`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GHL_API_KEY}`,
      Version: "V2",
    },
    body: JSON.stringify({
      customFields: customFields,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(`Failed to update contact custom fields: ${JSON.stringify(errorData)}`)
  }

  return response.json()
}

// Helper function to update custom fields for an opportunity
async function updateOpportunityCustomFields(opportunityId: string, customFields: any) {
  const response = await fetch(`${GHL_API_BASE_URL}/opportunities/${opportunityId}/custom-fields`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GHL_API_KEY}`,
      Version: "V2",
    },
    body: JSON.stringify({
      customFields: customFields,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(`Failed to update opportunity custom fields: ${JSON.stringify(errorData)}`)
  }

  return response.json()
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Extract contact and opportunity data from the form submission
    const {
      firstName,
      lastName,
      email,
      phone,
      company,
      address,
      city,
      state,
      postalCode,
      addressLatitude,
      addressLongitude,
      serviceType,
      numberOfSigners,
      signingLocation,
      preferredDate,
      preferredTime,
      specialInstructions,
      smsNotifications,
      emailUpdates,
    } = data

    let contactId: string
    let contactResponse: any

    // 1. Check if contact already exists by email
    const existingContact = await findContactByEmail(email)

    if (existingContact) {
      console.log(`Existing contact found for ${email}: ${existingContact.id}`)
      contactId = existingContact.id
      // Optional: Update existing contact details if needed
      // For now, we just use the existing contact ID
    } else {
      // 2. Create contact in GHL if it doesn't exist
      console.log(`No existing contact found for ${email}. Creating new contact.`)
      const contactData = {
        firstName,
        lastName,
        email,
        phone,
        address1: address,
        city,
        state,
        postalCode,
        source: "Website Booking",
      }
      contactResponse = await createContact(contactData)
      contactId = contactResponse.id
      console.log(`New contact created for ${email}: ${contactId}`)
    }

    // Create opportunity in GHL
    const opportunityData = {
      name: `${serviceType} - ${firstName} ${lastName}`,
      status: "open",
      source: "Website Booking",
      monetaryValue: getServiceValue(serviceType, numberOfSigners),
    }

    const opportunityResponse = await createOpportunity(contactId, opportunityData)
    const opportunityId = opportunityResponse.id

    // Update contact custom fields
    const contactCustomFields = {
      booking_timestamp: new Date().toISOString(),
      sms_notifications: smsNotifications ? "Yes" : "No",
      email_updates: emailUpdates ? "Yes" : "No",
      company: company || "",
      address_latitude: addressLatitude || "",
      address_longitude: addressLongitude || "",
    }

    await updateContactCustomFields(contactId, contactCustomFields)

    // Update opportunity custom fields
    const opportunityCustomFields = {
      service_type: serviceType,
      number_of_signers: numberOfSigners.toString(),
      signing_location: signingLocation,
      preferred_date: preferredDate,
      preferred_time: preferredTime,
      special_instructions: specialInstructions || "",
      booking_status: "Pending",
      service_status: "Scheduled",
    }

    await updateOpportunityCustomFields(opportunityId, opportunityCustomFields)

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Booking created successfully",
      data: {
        contactId,
        opportunityId,
        bookingReference: opportunityId.substring(0, 8).toUpperCase(),
      },
    })
  } catch (error) {
    console.error("Booking error:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 500 },
    )
  }
}

// Helper function to determine the monetary value based on service type and number of signers
function getServiceValue(serviceType: string, numberOfSigners: number): number {
  switch (serviceType) {
    case "essential":
      if (numberOfSigners === 1) return 75
      if (numberOfSigners === 2) return 85
      if (numberOfSigners === 3) return 95
      return 100 // 4+ signers
    case "priority":
      return 100 + (numberOfSigners > 2 ? (numberOfSigners - 2) * 10 : 0)
    case "loan-signing":
    case "reverse-mortgage":
      return 150
    case "specialty":
      return 75
    default:
      return 75
  }
}
