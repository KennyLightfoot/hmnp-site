import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { origin, destination } = await request.json()

    if (!origin || !destination) {
      return NextResponse.json({ error: "Origin and destination are required" }, { status: 400 })
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "Google Maps API key not configured" }, { status: 500 })
    }

    // Use Houston Mobile Notary Pros base location as origin
    const baseLocation = `${process.env.HMNP_ORIGIN_LAT},${process.env.HMNP_ORIGIN_LNG}` || "29.7604,-95.3698" // Houston, TX

    const url = new URL("https://maps.googleapis.com/maps/api/distancematrix/json")
    url.searchParams.set("origins", baseLocation)
    url.searchParams.set("destinations", destination)
    url.searchParams.set("units", "imperial")
    url.searchParams.set("key", apiKey)

    const response = await fetch(url.toString())
    const data = await response.json()

    if (data.status !== "OK") {
      throw new Error(`Google Maps API error: ${data.status}`)
    }

    const element = data.rows[0]?.elements[0]
    if (!element || element.status !== "OK") {
      throw new Error("Could not calculate distance to destination")
    }

    // Extract distance in miles and duration in minutes
    const distanceText = element.distance.text
    const distanceMiles = element.distance.value * 0.000621371 // Convert meters to miles
    const durationMinutes = Math.ceil(element.duration.value / 60) // Convert seconds to minutes

    return NextResponse.json({
      distance: Math.round(distanceMiles * 10) / 10, // Round to 1 decimal place
      duration: durationMinutes,
      status: "ok",
      raw: {
        distanceText,
        durationText: element.duration.text,
      },
    })
  } catch (error) {
    console.error("Distance calculation error:", error)
    return NextResponse.json(
      { error: "Failed to calculate distance", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
