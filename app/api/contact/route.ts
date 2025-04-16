import { NextResponse } from "next/server"
import { validateCSRFToken } from "@/lib/csrf"
import { cookies } from "next/headers"
import { logApiError } from "@/lib/error-logger"

// GHL API base URL from environment variable
const GHL_API_BASE_URL = process.env.GHL_API_BASE_URL
const GHL_API_KEY = process.env.GHL_API_KEY
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID
const GHL_CONTACT_FORM_WORKFLOW_ID = process.env.GHL_CONTACT_FORM_WORKFLOW_ID

// Helper functions
async function createContact(data: any) {
  const url = `${GHL_API_BASE_URL}/contacts`
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${GHL_API_KEY}`,
    Version: "2021-07-29",
  }

  const response = await fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error(`Failed to create contact: ${response.status} ${response.statusText}`)
  }

  return await response.json()
}

async function createNote(contactId: string, content: string) {
  const url = `${GHL_API_BASE_URL}/contacts/${contactId}/notes`
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${GHL_API_KEY}`,
    Version: "2021-07-29",
  }

  const data = {
    body: content,
    note_type: "NOTE",
  }

  const response = await fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error(`Failed to create note: ${response.status} ${response.statusText}`)
  }

  return await response.json()
}

async function triggerWorkflow(contactId: string) {
  const url = `${GHL_API_BASE_URL}/workflows/triggers/${GHL_CONTACT_FORM_WORKFLOW_ID}`
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${GHL_API_KEY}`,
    Version: "2021-07-29",
  }

  const data = {
    contactId: contactId,
  }

  const response = await fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error(`Failed to trigger workflow: ${response.status} ${response.statusText}`)
  }

  return await response.json()
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Validate CSRF token
    const storedToken = cookies().get("csrf_token")?.value
    if (!storedToken || !data.csrfToken || !validateCSRFToken(data.csrfToken, storedToken)) {
      const error = new Error("Invalid security token")
      logApiError("/api/contact", error, request, { reason: "CSRF validation failed" })

      return NextResponse.json(
        {
          success: false,
          message: "Invalid security token. Please refresh the page and try again.",
        },
        { status: 403 },
      )
    }

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
    // Log the error with our enhanced logger
    logApiError("/api/contact", error as Error, request, {
      endpoint: "POST /api/contact",
      service: "GHL Contact API",
    })

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 500 },
    )
  }
}
