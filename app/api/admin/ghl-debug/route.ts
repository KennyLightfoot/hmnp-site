import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    // 1. Check environment variables
    const envVars = {
      GHL_API_KEY: process.env.GHL_API_KEY
        ? `${process.env.GHL_API_KEY.substring(0, 5)}...${process.env.GHL_API_KEY.substring(process.env.GHL_API_KEY.length - 5)}`
        : "Not set",
      GHL_API_BASE_URL: process.env.GHL_API_BASE_URL || "Not set",
      GHL_ESSENTIAL_CALENDAR_ID: process.env.GHL_ESSENTIAL_CALENDAR_ID ? "Set" : "Not set",
      GHL_PRIORITY_CALENDAR_ID: process.env.GHL_PRIORITY_CALENDAR_ID ? "Set" : "Not set",
      GHL_LOAN_CALENDAR_ID: process.env.GHL_LOAN_CALENDAR_ID ? "Set" : "Not set",
      GHL_SPECIALTY_CALENDAR_ID: process.env.GHL_SPECIALTY_CALENDAR_ID ? "Set" : "Not set",
      GHL_CALLS_CALENDAR_ID: process.env.GHL_CALLS_CALENDAR_ID ? "Set" : "Not set",
      GHL_BOOKING_CALENDAR_ID: process.env.GHL_BOOKING_CALENDAR_ID ? "Set" : "Not set",
      GHL_REVERSE_MORTGAGE_CALENDAR_ID: process.env.GHL_REVERSE_MORTGAGE_CALENDAR_ID ? "Set" : "Not set",
      GHL_CONTACT_FORM_WORKFLOW_ID: process.env.GHL_CONTACT_FORM_WORKFLOW_ID ? "Set" : "Not set",
      GHL_CALL_REQUEST_WORKFLOW_ID: process.env.GHL_CALL_REQUEST_WORKFLOW_ID ? "Set" : "Not set",
      GHL_NEW_CONTACT_WORKFLOW_ID: process.env.GHL_NEW_CONTACT_WORKFLOW_ID ? "Set" : "Not set",
      GHL_NEW_BOOKING_WORKFLOW_ID: process.env.GHL_NEW_BOOKING_WORKFLOW_ID ? "Set" : "Not set",
    }

    // 2. Test direct API call with different auth methods
    const apiKey = process.env.GHL_API_KEY
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: "GHL_API_KEY environment variable is not set",
        environmentVariables: envVars,
      })
    }

    // Test with different auth methods
    const authMethods = [
      { name: "Direct PIT", headers: { Authorization: apiKey } },
      { name: "Bearer Token", headers: { Authorization: `Bearer ${apiKey}` } },
      { name: "PIT with Version", headers: { Authorization: apiKey, Version: "2021-07-28" } },
      { name: "Bearer with Version", headers: { Authorization: `Bearer ${apiKey}`, Version: "2021-07-28" } },
    ]

    const baseUrl = process.env.GHL_API_BASE_URL || "https://services.leadconnectorhq.com"
    const testResults = []

    for (const method of authMethods) {
      try {
        console.log(`Testing auth method: ${method.name}`)
        console.log(`Headers: ${JSON.stringify(method.headers)}`)

        const response = await fetch(`${baseUrl}/locations`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...method.headers,
          },
          cache: "no-store",
        })

        const status = response.status
        let data = null
        let error = null

        try {
          if (response.ok) {
            data = await response.json()
          } else {
            error = await response.text()
          }
        } catch (e) {
          error = `Failed to parse response: ${e instanceof Error ? e.message : String(e)}`
        }

        testResults.push({
          method: method.name,
          success: response.ok,
          status,
          data: data
            ? data.locations
              ? `Found ${data.locations.length} locations`
              : JSON.stringify(data).substring(0, 100)
            : null,
          error,
          headers: method.headers,
        })
      } catch (error) {
        testResults.push({
          method: method.name,
          success: false,
          status: 0,
          data: null,
          error: error instanceof Error ? error.message : String(error),
          headers: method.headers,
        })
      }
    }

    // 3. Test network connectivity
    let networkTest = null
    try {
      const networkResponse = await fetch("https://services.leadconnectorhq.com/ping", {
        method: "GET",
        cache: "no-store",
      })

      networkTest = {
        success: networkResponse.ok,
        status: networkResponse.status,
        statusText: networkResponse.statusText,
      }
    } catch (error) {
      networkTest = {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }
    }

    return NextResponse.json({
      success: testResults.some((r) => r.success),
      environmentVariables: envVars,
      authTests: testResults,
      networkTest,
      serverInfo: {
        nodeVersion: process.version,
        platform: process.platform,
      },
    })
  } catch (error) {
    console.error("Error in GHL debug endpoint:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    })
  }
}

