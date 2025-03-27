import { NextResponse } from "next/server"
import { getGhlCustomFields } from "@/lib/ghl-test"

export async function GET() {
  try {
    const result = await getGhlCustomFields()

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error getting GHL custom fields:", error)

    return NextResponse.json(
      {
        success: false,
        message: `Error getting GHL custom fields: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 },
    )
  }
}

