import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get("address")
    const city = searchParams.get("city")
    const state = searchParams.get("state")
    const zip = searchParams.get("zip")

    if (!address || !city || !state || !zip) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required parameters: address, city, state, zip",
        },
        { status: 400 },
      )
    }

    const fullAddress = `${address}, ${city}, ${state} ${zip}`
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

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${apiKey}`,
    )

    const data = await response.json()

    if (data.results && data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry.location
      return NextResponse.json({
        success: true,
        data: { lat, lng },
      })
    }

    return NextResponse.json(
      {
        success: false,
        message: "No results found for the provided address",
      },
      { status: 404 },
    )
  } catch (error) {
    console.error("Geocoding error:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 500 },
    )
  }
}
