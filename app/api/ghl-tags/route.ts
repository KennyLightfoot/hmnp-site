import { NextResponse } from "next/server"
import { getGhlTags } from "@/lib/ghl-test"

export async function GET() {
  try {
    const result = await getGhlTags()

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error getting GHL tags:", error)

    return NextResponse.json(
      {
        success: false,
        message: `Error getting GHL tags: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 },
    )
  }
}

