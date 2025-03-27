import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Get the API key from environment variables
    const apiKey = process.env.GHL_API_KEY || ""

    // Test different header combinations
    const testResults = await Promise.all([
      testHeaders("Direct PIT Key", {
        Authorization: apiKey,
        Version: "2021-07-28",
        "Content-Type": "application/json",
      }),
      testHeaders("Bearer PIT Key", {
        Authorization: `Bearer ${apiKey}`,
        Version: "2021-07-28",
        "Content-Type": "application/json",
      }),
      testHeaders("PIT Key with Version Header", {
        Authorization: apiKey,
        Version: "2021-07-28",
        Accept: "application/json",
        "Content-Type": "application/json",
      }),
      testHeaders("PIT Key without Version Header", {
        Authorization: apiKey,
        "Content-Type": "application/json",
      }),
    ])

    // Check environment variables
    const environmentVariables = {
      GHL_API_KEY: apiKey ? "Set" : "Not set",
      GHL_API_BASE_URL: process.env.GHL_API_BASE_URL || "Not set (using default)",
      GHL_CONTACT_FORM_WORKFLOW_ID: process.env.GHL_CONTACT_FORM_WORKFLOW_ID || "Not set",
      GHL_NEW_CONTACT_WORKFLOW_ID: process.env.GHL_NEW_CONTACT_WORKFLOW_ID || "Not set",
      GHL_NEW_BOOKING_WORKFLOW_ID: process.env.GHL_NEW_BOOKING_WORKFLOW_ID || "Not set",
      GHL_CALL_REQUEST_WORKFLOW_ID: process.env.GHL_CALL_REQUEST_WORKFLOW_ID || "Not set",
      GHL_ESSENTIAL_CALENDAR_ID: process.env.GHL_ESSENTIAL_CALENDAR_ID || "Not set",
      GHL_PRIORITY_CALENDAR_ID: process.env.GHL_PRIORITY_CALENDAR_ID || "Not set",
      GHL_LOAN_CALENDAR_ID: process.env.GHL_LOAN_CALENDAR_ID || "Not set",
      GHL_SPECIALTY_CALENDAR_ID: process.env.GHL_SPECIALTY_CALENDAR_ID || "Not set",
      GHL_CALLS_CALENDAR_ID: process.env.GHL_CALLS_CALENDAR_ID || "Not set",
    }

    // Analyze API key format
    const apiKeyFormat = {
      isPIT: apiKey.startsWith("pit-"),
      length: apiKey.length,
      prefix: apiKey.substring(0, 4),
      suffix: apiKey.substring(apiKey.length - 4),
    }

    // Validate workflow IDs
    const workflowValidation = []
    const successfulTest = testResults.find((test) => test.success)

    if (successfulTest) {
      const workflowIds = [
        { key: "GHL_CONTACT_FORM_WORKFLOW_ID", value: process.env.GHL_CONTACT_FORM_WORKFLOW_ID },
        { key: "GHL_NEW_CONTACT_WORKFLOW_ID", value: process.env.GHL_NEW_CONTACT_WORKFLOW_ID },
        { key: "GHL_NEW_BOOKING_WORKFLOW_ID", value: process.env.GHL_NEW_BOOKING_WORKFLOW_ID },
        { key: "GHL_CALL_REQUEST_WORKFLOW_ID", value: process.env.GHL_CALL_REQUEST_WORKFLOW_ID },
      ]

      for (const workflow of workflowIds) {
        if (workflow.value) {
          try {
            const locationId = successfulTest.locationId
            const response = await fetch(
              `https://services.leadconnectorhq.com/locations/${locationId}/workflows/${workflow.value}`,
              {
                headers: successfulTest.headers,
              },
            )

            if (response.ok) {
              workflowValidation.push({
                ...workflow,
                exists: true,
                reason: "Workflow exists and is accessible",
              })
            } else {
              workflowValidation.push({
                ...workflow,
                exists: false,
                reason: `HTTP error ${response.status}: ${response.statusText}`,
              })
            }
          } catch (error) {
            workflowValidation.push({
              ...workflow,
              exists: false,
              reason: error instanceof Error ? error.message : String(error),
            })
          }
        } else {
          workflowValidation.push({
            ...workflow,
            exists: false,
            reason: "Environment variable not set",
          })
        }
      }
    }

    return NextResponse.json({
      testResults,
      environmentVariables,
      apiKeyFormat,
      workflowValidation: workflowValidation.length > 0 ? workflowValidation : null,
    })
  } catch (error) {
    console.error("Error in GHL diagnostic:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}

async function testHeaders(testName: string, headers: Record<string, string>) {
  try {
    const response = await fetch("https://services.leadconnectorhq.com/locations", {
      headers,
    })

    const result = {
      testName,
      headers,
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      locationId: null,
      responsePreview: null,
      error: null,
    }

    if (response.ok) {
      const data = await response.json()
      if (data && data.locations && data.locations.length > 0) {
        result.locationId = data.locations[0].id
        result.responsePreview = JSON.stringify(data).substring(0, 200) + "..."
      }
    } else {
      try {
        const errorData = await response.text()
        result.error = errorData.substring(0, 200)
      } catch (e) {
        result.error = "Could not parse error response"
      }
    }

    return result
  } catch (error) {
    return {
      testName,
      headers,
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

