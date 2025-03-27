import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { key } = await request.json()

    if (!key) {
      return NextResponse.json({
        success: false,
        error: "No API key provided",
      })
    }

    // Determine key type
    const keyType = key.startsWith("pit-") ? "Private Integration Token (PIT)" : "JWT Token"

    // Test the key with a direct API call
    const result = await testKey(key)

    return NextResponse.json({
      success: result.success,
      keyType,
      ...result,
    })
  } catch (error) {
    console.error("Error testing API key:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    })
  }
}

async function testKey(key: string): Promise<{ success: boolean; error?: string; details?: any }> {
  try {
    // Set up headers according to GHL v2 documentation
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
      Version: "2021-07-28",
    }

    // Determine if the key is a PIT or a JWT token
    if (key.startsWith("pit-")) {
      headers["Authorization"] = key
    } else {
      headers["Authorization"] = `Bearer ${key}`
    }

    // Make a direct API call to the locations endpoint
    const response = await fetch("https://services.leadconnectorhq.com/locations", {
      method: "GET",
      headers,
      cache: "no-store",
    })

    // Log the full response for debugging
    console.log(`API Key Test - Status: ${response.status}`)

    // If the response is not OK, try to get more details
    if (!response.ok) {
      let errorData: any = {}

      // Try to parse error as JSON
      try {
        errorData = await response.json()
        console.log(`API Key Test - Error Data: ${JSON.stringify(errorData)}`)
      } catch (e) {
        // If not JSON, try to get text
        try {
          const text = await response.text()
          errorData = { message: text }
          console.log(`API Key Test - Error Text: ${text}`)
        } catch (e2) {
          // If text fails too, use status text
          errorData = { message: response.statusText }
          console.log(`API Key Test - Error Status Text: ${response.statusText}`)
        }
      }

      return {
        success: false,
        error: `API Error: ${response.status} ${response.statusText}`,
        details: {
          status: response.status,
          statusText: response.statusText,
          errorData,
        },
      }
    }

    // Parse successful response
    const data = await response.json()
    console.log(`API Key Test - Success: ${JSON.stringify(data).substring(0, 500)}...`)

    return {
      success: true,
      details: {
        locations: data.locations?.length || 0,
        firstLocation: data.locations?.[0]
          ? {
              id: data.locations[0].id,
              name: data.locations[0].name,
            }
          : null,
      },
    }
  } catch (error) {
    console.error("API Key Test - Request Failed:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

