import { type NextRequest, NextResponse } from "next/server"
import { registerCacheKey } from "@/lib/cache-utils"

export async function POST(request: NextRequest) {
  try {
    const { key } = await request.json()

    if (!key) {
      return NextResponse.json({ success: false, message: "No key provided" }, { status: 400 })
    }

    await registerCacheKey(key)

    return NextResponse.json({
      success: true,
      message: `Cache key ${key} registered successfully`,
    })
  } catch (error) {
    console.error("Error registering cache key:", error)
    return NextResponse.json({ success: false, message: `Failed to register cache key: ${error}` }, { status: 500 })
  }
}

