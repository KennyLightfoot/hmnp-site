import { NextResponse } from "next/server"

export async function GET() {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      console.error("Google Maps API key is missing")
      return NextResponse.json(
        {
          success: false,
          message: "API configuration error",
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      apiKey,
    })
  } catch (error) {
    console.error("Map API error:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 500 },
    )
  }
}
