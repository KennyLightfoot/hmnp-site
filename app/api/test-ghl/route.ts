import { NextResponse } from "next/server"
import { getCustomFields, getTags, getCalendars } from "@/lib/gohighlevel"

export async function GET() {
  try {
    // Test the connection by fetching custom fields
    const customFields = await getCustomFields()
    const tags = await getTags()
    const calendars = await getCalendars()

    return NextResponse.json({
      success: true,
      message: "GoHighLevel connection successful",
      data: {
        customFields,
        tags,
        calendars,
      },
    })
  } catch (error) {
    console.error("Error testing GoHighLevel connection:", error)

    return NextResponse.json(
      {
        success: false,
        message: "GoHighLevel connection failed",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

