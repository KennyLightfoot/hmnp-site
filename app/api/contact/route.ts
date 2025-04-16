import { NextResponse } from "next/server"

// GHL API base URL from environment variable
const GHL_API_BASE_URL = process.env.GHL_API_BASE_URL
const GHL_API_KEY = process.env.GHL_API_KEY
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID
const GHL_CONTACT_FORM_WORKFLOW_ID = process.env.GHL_CONTACT_FORM_WORKFLOW_ID

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

// Helper function to create a task/note in GHL
async function createNote(contactId: string, message: string) {
  const response = await fetch(`${GHL_API_BASE_URL}/contacts/${contactId}/notes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GHL_API_KEY}`,
      Version: "V2",
    },
    body: JSON.stringify({
      body: message,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(`Failed to create note: ${JSON.stringify(errorData)}`)
  }

  return response.json()
}

// Helper function to trigger a workflow in GHL
async function triggerWorkflow(contactId: string) {
  if (!GHL_CONTACT_FORM_WORKFLOW_ID) {
    console.warn("No workflow ID provided, skipping workflow trigger")
    return null
  }

  const response = await fetch(`${GHL_API_BASE_URL}/workflows/${GHL_CONTACT_FORM_WORKFLOW_ID}/trigger`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GHL_API_KEY}`,
      Version: "V2",
    },
    body: JSON.stringify({
      contactId: contactId,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    console.error(`Failed to trigger workflow: ${JSON.stringify(errorData)}`)
    // Don't throw error here, as this is optional
    return null
  }

  return response.json()
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Extract contact data from the form submission
    const { firstName, lastName, email, phone, subject, message, smsConsent } = data

    // Create contact in GHL
    const contactData = {
      firstName,
      lastName,
      email,
      phone,
      source: "Website Contact Form",
    }

    const contactResponse = await createContact(contactData)
    const contactId = contactResponse.id

    // Add the message as a note
    const noteContent = `Subject: ${subject}

Message: ${message}

SMS Consent: ${smsConsent ? "Yes" : "No"}`
    await createNote(contactId, noteContent)

    // Trigger workflow if configured
    if (GHL_CONTACT_FORM_WORKFLOW_ID) {
      await triggerWorkflow(contactId)
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Contact form submitted successfully",
    })
  } catch (error) {
    console.error("Contact form error:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 500 },
    )
  }
}
