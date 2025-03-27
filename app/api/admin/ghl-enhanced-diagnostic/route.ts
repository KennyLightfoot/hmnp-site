import { NextResponse } from "next/server"
import { ghlRequest } from "@/lib/ghl-client"

export async function GET() {
  try {
    // Get the API key from environment variables
    const apiKey = process.env.GHL_API_KEY || ""
    const baseUrl = process.env.GHL_API_BASE_URL || "https://services.leadconnectorhq.com"

    // Test the API key with different endpoints
    const endpointTests = await Promise.all([
      testEndpoint("Locations Endpoint", "locations"),
      testEndpoint("Company Endpoint", "company"),
      testEndpoint("User Endpoint", "users/self"),
      testEndpoint("Workflows Endpoint", "workflows"),
    ])

    // Check if the API key is valid
    const apiKeyInfo = {
      value: apiKey ? `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}` : "Not set",
      isPIT: apiKey.startsWith("pit-"),
      length: apiKey.length,
      isValid: endpointTests.some((test) => test.success),
    }

    // Get detailed error information
    const errorDetails = endpointTests
      .filter((test) => !test.success && test.errorData)
      .map((test) => ({
        endpoint: test.endpoint,
        status: test.status,
        message: test.errorData,
      }))

    // Check if there are any successful endpoints
    const workingEndpoints = endpointTests.filter((test) => test.success)

    // Generate recommendations based on the test results
    const recommendations = generateRecommendations(apiKeyInfo, endpointTests, errorDetails)

    return NextResponse.json({
      apiKeyInfo,
      endpointTests,
      errorDetails,
      workingEndpoints,
      recommendations,
    })
  } catch (error) {
    console.error("Error in enhanced GHL diagnostic:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}

async function testEndpoint(name: string, endpoint: string) {
  try {
    console.log(`Testing endpoint: ${endpoint}`)

    const response = await ghlRequest(endpoint).catch((error) => {
      throw error
    })

    return {
      name,
      endpoint,
      success: true,
      status: 200,
      statusText: "OK",
      errorData: null,
      responsePreview: JSON.stringify(response).substring(0, 200) + "...",
    }
  } catch (error) {
    let status = 0
    let statusText = "Network Error"
    let errorData = ""

    try {
      if (error instanceof Error) {
        const parsedError = JSON.parse(error.message)
        status = parsedError.status || 0
        statusText = parsedError.statusText || "Unknown Error"
        errorData = JSON.stringify(parsedError.data)
      } else {
        errorData = String(error)
      }
    } catch (e) {
      errorData = error instanceof Error ? error.message : String(error)
    }

    return {
      name,
      endpoint,
      success: false,
      status,
      statusText,
      errorData,
      responsePreview: null,
    }
  }
}

function generateRecommendations(apiKeyInfo: any, endpointTests: any[], errorDetails: any[]) {
  const recommendations = []

  // Check if API key is set
  if (!apiKeyInfo.value || apiKeyInfo.value === "Not set") {
    recommendations.push({
      priority: "high",
      issue: "Missing API Key",
      solution: "Add your GoHighLevel API key to the environment variables as GHL_API_KEY.",
    })
  }

  // Check if API key is in PIT format
  if (apiKeyInfo.value !== "Not set" && !apiKeyInfo.isPIT) {
    recommendations.push({
      priority: "high",
      issue: "Invalid API Key Format",
      solution: 'Your API key should start with "pit-". Generate a new Private Integration Token in GoHighLevel.',
    })
  }

  // Check for 404 errors
  if (endpointTests.every((test) => test.status === 404)) {
    recommendations.push({
      priority: "high",
      issue: "All endpoints returning 404",
      solution:
        "This could indicate an issue with the API base URL or that your account doesn't have access to these resources. Verify your GoHighLevel account is active and has the necessary permissions.",
    })
  }

  // Check for 401/403 errors
  if (endpointTests.some((test) => test.status === 401 || test.status === 403)) {
    recommendations.push({
      priority: "high",
      issue: "Authentication/Authorization Failure",
      solution:
        "Your API key may be invalid, expired, or doesn't have the necessary permissions. Generate a new API key with the required scopes.",
    })
  }

  // If no specific issues found but still failing
  if (recommendations.length === 0 && !apiKeyInfo.isValid) {
    recommendations.push({
      priority: "medium",
      issue: "Unknown API Integration Issue",
      solution:
        "Contact GoHighLevel support with the error details provided below. Your account might have specific configuration requirements.",
    })
  }

  return recommendations
}

