import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, phone } = body

    // Validate required fields
    if (!firstName || !lastName || !email) {
      return NextResponse.json({ error: "First name, last name, and email are required" }, { status: 400 })
    }

    // Get API key and base URL from environment variables
    const apiKey = process.env.GHL_API_KEY
    const baseUrl = process.env.GHL_API_BASE_URL || "https://services.leadconnectorhq.com"

    if (!apiKey) {
      return NextResponse.json({ error: "GHL_API_KEY environment variable is not set" }, { status: 500 })
    }

    // First, get the location ID
    const locationResponse = await fetch(`${baseUrl}/locations`, {
      headers: {
        Authorization: apiKey,
        Version: "2021-07-28",
        "Content-Type": "application/json",
      },
    })

    if (!locationResponse.ok) {
      const errorText = await locationResponse.text()
      return NextResponse.json(
        {
          error: `Failed to get locations: ${locationResponse.status} ${locationResponse.statusText}`,
          details: errorText,
        },
        { status: 500 },
      )
    }

    const locationData = await locationResponse.json()

    if (!locationData.locations || locationData.locations.length === 0) {
      return NextResponse.json({ error: "No locations found in your GoHighLevel account" }, { status: 500 })
    }

    const locationId = locationData.locations[0].id

    // Create the contact
    const contactResponse = await fetch(`${baseUrl}/locations/${locationId}/contacts`, {
      method: "POST",
      headers: {
        Authorization: apiKey,
        Version: "2021-07-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        firstName,
        lastName,
        phone,
        source: "Website Test",
      }),
    })

    if (!contactResponse.ok) {
      const errorText = await contactResponse.text()
      return NextResponse.json(
        {
          error: `Failed to create contact: ${contactResponse.status} ${contactResponse.statusText}`,
          details: errorText,
        },
        { status: 500 },
      )
    }

    const contactData = await contactResponse.json()
    const contactId = contactData.contact?.id

    // Try to trigger the workflow if we have a workflow ID
    let workflowTriggered = false
    let workflowMessage = null
    const workflowId = process.env.GHL_CONTACT_FORM_WORKFLOW_ID

    if (workflowId && contactId) {
      try {
        const workflowResponse = await fetch(`${baseUrl}/locations/${locationId}/workflows/${workflowId}/run`, {
          method: "POST",
          headers: {
            Authorization: apiKey,
            Version: "2021-07-28",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contactId,
            values: {
              source: "Website Test",
            },
          }),
        })

        if (workflowResponse.ok) {
          workflowTriggered = true
          workflowMessage = "Workflow triggered successfully"
        } else {
          const errorText = await workflowResponse.text()
          workflowTriggered = false
          workflowMessage = `Failed to trigger workflow: ${workflowResponse.status} ${workflowResponse.statusText} - ${errorText}`
        }
      } catch (error) {
        workflowTriggered = false
        workflowMessage = error instanceof Error ? error.message : String(error)
      }
    } else {
      workflowMessage = "No workflow ID set in GHL_CONTACT_FORM_WORKFLOW_ID environment variable"
    }

    return NextResponse.json({
      success: true,
      contactId,
      workflowTriggered,
      workflowMessage,
      response: contactData,
    })
  } catch (error) {
    console.error("Error creating test contact:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}

