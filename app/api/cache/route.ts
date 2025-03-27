import { type NextRequest, NextResponse } from "next/server"
import { getAllCacheKeys, clearCacheEntry, clearAllCache } from "@/lib/cache-utils"

// Secret token for authentication
const REVALIDATE_TOKEN = process.env.REVALIDATE_TOKEN

export async function GET(request: NextRequest) {
  try {
    // Verify the request has the correct token
    const token = request.headers.get("x-revalidate-token")

    if (!REVALIDATE_TOKEN || token !== REVALIDATE_TOKEN) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Return all cache keys
    return NextResponse.json({
      success: true,
      cacheKeys: getAllCacheKeys(),
    })
  } catch (error) {
    console.error("Error fetching cache keys:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch cache keys" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify the request has the correct token
    const token = request.headers.get("x-revalidate-token")

    if (!REVALIDATE_TOKEN || token !== REVALIDATE_TOKEN) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const { key, clearAll } = await request.json()

    if (clearAll) {
      // Clear all cache
      clearAllCache()
      return NextResponse.json({
        success: true,
        message: "All cache cleared",
      })
    }

    if (key) {
      // Clear a specific cache entry
      clearCacheEntry(key)
      return NextResponse.json({
        success: true,
        message: `Cache entry ${key} cleared`,
      })
    }

    return NextResponse.json(
      {
        success: false,
        message: "No action specified",
      },
      { status: 400 },
    )
  } catch (error) {
    console.error("Error managing cache:", error)
    return NextResponse.json({ success: false, message: "Cache management failed" }, { status: 500 })
  }
}

