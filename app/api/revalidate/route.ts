import { type NextRequest, NextResponse } from "next/server"
import { revalidatePath, revalidateTag } from "next/cache"
import { getAllCacheKeys, clearAllCache } from "@/lib/cache-utils"
import { REVALIDATE_TOKEN } from "@/lib/constants"

export async function POST(request: NextRequest) {
  try {
    const { token, type, target } = await request.json()

    // If no token is provided, just return the cache keys
    if (!token) {
      const cacheKeys = await getAllCacheKeys()
      return NextResponse.json({ success: true, cacheKeys })
    }

    // Validate token for revalidation actions
    if (token !== REVALIDATE_TOKEN) {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 })
    }

    if (type === "path" && target) {
      revalidatePath(target)
      return NextResponse.json({
        success: true,
        message: `Path ${target} revalidated successfully`,
      })
    } else if (type === "tag" && target) {
      revalidateTag(target)
      return NextResponse.json({
        success: true,
        message: `Tag ${target} revalidated successfully`,
      })
    } else if (type === "all") {
      const count = await clearAllCache()
      // Also revalidate the entire site
      revalidatePath("/", "layout")
      return NextResponse.json({
        success: true,
        message: `Cleared ${count} cache keys successfully`,
      })
    } else {
      return NextResponse.json(
        { success: false, message: "Invalid revalidation type or missing target" },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("Error during revalidation:", error)
    return NextResponse.json({ success: false, message: `Revalidation failed: ${error}` }, { status: 500 })
  }
}

