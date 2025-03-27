import { NextResponse } from "next/server"

export async function GET() {
  // Only return the key from the server, never expose it directly in client code
  return NextResponse.json({
    apiKey: process.env.GOOGLE_MAPS_API_KEY || "",
  })
}

