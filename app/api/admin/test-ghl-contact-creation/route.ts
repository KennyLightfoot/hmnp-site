import { NextResponse } from "next/server"
import { createContact } from "@/lib/gohighlevel"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    console.log("Testing GHL contact creation...")

    // Create a test contact
    const contactData = {
      firstName: body.firstName || "Test",
      lastName: body.lastName || "User",
      email: body.email || `test-${Date.now()}@example.com`,
      phone: body.phone || "5555555555",
      tags: ["Test", "API Test"],
      customFields: {
        source: "API Test",
        submittedAt: new Date().toISOString(),
        message: "This is a test contact created via the API test utility",
      },
    }

    console.log(`Creating test contact: ${JSON.stringify(contactData, null, 2)}`)

    const contact = await createContact(contactData)

    console.log(`Contact created successfully: ${JSON.stringify(contact, null, 2)}`)

    return NextResponse.json({
      success: true,
      details: {
        contactData,
        createdContact: contact,
      },
    })
  } catch (error) {
    console.error("Error creating test contact:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    })
  }
}

