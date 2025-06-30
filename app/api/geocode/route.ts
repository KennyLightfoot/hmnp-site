import { NextResponse } from "next/server"

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY
const GOOGLE_MAPS_API_URL = "https://maps.googleapis.com/maps/api/geocode/json"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const address = searchParams.get("address")
  const city = searchParams.get("city")
  const state = searchParams.get("state")
  const zip = searchParams.get("zip")

  if (!address || !city || !state || !zip) {
    return NextResponse.json({ error: "Missing required address components" }, { status: 400 })
  }

  if (!GOOGLE_MAPS_API_KEY) {
    console.error("Geocoding error: GOOGLE_MAPS_API_KEY is not set in environment variables.")
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
  }

  const fullAddress = `${address}, ${city}, ${state} ${zip}`
  const params = new URLSearchParams({
    address: fullAddress,
    key: GOOGLE_MAPS_API_KEY,
  })

  try {
    const response = await fetch(`${GOOGLE_MAPS_API_URL}?${params.toString()}`)
    const data = await response.json()

    if (data.status === "REQUEST_DENIED") {
      console.warn(`Geocoding API key has referer restrictions for address "${fullAddress}"`)
      return NextResponse.json({ 
        error: "Geocoding service temporarily unavailable - please contact us for assistance",
        fallback: true 
      }, { status: 503 })
    }

    if (!response.ok || data.status !== "OK") {
      console.error(`Geocoding API error for address "${fullAddress}":`, data)
      return NextResponse.json({ error: `Geocoding failed: ${data.status} - ${data.error_message || "Unknown error"}` }, { status: response.status === 200 ? 500 : response.status })
    }

    if (!data.results || data.results.length === 0) {
      console.warn(`Geocoding: No results found for address "${fullAddress}"`)
      return NextResponse.json({ error: "No geocoding results found" }, { status: 404 })
    }

    const location = data.results[0].geometry.location
    const latitude = location.lat
    const longitude = location.lng

    return NextResponse.json({ latitude, longitude })
  } catch (error) {
    console.error(`Geocoding request failed for address "${fullAddress}":`, error)
    return NextResponse.json({ error: "Internal server error during geocoding" }, { status: 500 })
  }
} 