import { NextResponse } from "next/server"
import { makeRequest } from "@/lib/gohighlevel-v2"

export async function GET() {
  try {
    // Log the API key (redacted for security)
    const apiKey = process.env.GHL_API_KEY || ""
    console.log("Using API Key:", apiKey.substring(0, 8) + "...")
    console.log("Base URL:", process.env.GHL_API_BASE_URL)

    // Test the connection by fetching company information
    const response = await makeRequest("/company")
    console.log("API Response:", JSON.stringify(response, null, 2))

    return NextResponse.json({
      success: true,
      message: "Successfully connected to GHL API",
      data: {
        companyId: response.companyId,
        companyName: response.companyName,
        apiKeyType: "Private Integration Token (PIT)",
        apiKeyLength: apiKey.length,
        apiKeyPrefix: apiKey.substring(0, 4),
        baseUrl: process.env.GHL_API_BASE_URL,
      },
    })
  } catch (error: any) {
    console.error("GHL API Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        details: {
          apiKeyType: "Private Integration Token (PIT)",
          apiKeyLength: (process.env.GHL_API_KEY || "").length,
          apiKeyPrefix: (process.env.GHL_API_KEY || "").substring(0, 4),
          baseUrl: process.env.GHL_API_BASE_URL,
        },
      },
      { status: 500 }
    )
  }
}

