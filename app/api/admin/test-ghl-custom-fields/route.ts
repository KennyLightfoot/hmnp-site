import { NextResponse } from "next/server"
import { getCustomFields, CUSTOM_FIELD_NAMES } from "@/lib/gohighlevel"

export async function GET() {
  try {
    console.log("Testing GHL custom fields...")

    // Get all custom fields
    const customFields = await getCustomFields()
    console.log(`Retrieved ${customFields.length} custom fields`)

    // Check if the configured custom fields exist
    const customFieldStatus: Record<string, { exists: boolean; id?: string; fieldType?: string }> = {}

    // Check each custom field
    for (const [key, fieldName] of Object.entries(CUSTOM_FIELD_NAMES)) {
      const field = customFields.find((f: any) => f.name.toLowerCase() === String(fieldName).toLowerCase())

      customFieldStatus[key] = {
        exists: !!field,
        id: field?.id || "Not found",
        fieldType: field?.fieldType || "Unknown",
      }
    }

    // Check if all required custom fields exist
    const allCustomFieldsExist = Object.values(customFieldStatus).every((status) => status.exists)

    return NextResponse.json({
      success: allCustomFieldsExist,
      error: allCustomFieldsExist ? null : "Some custom fields are missing",
      details: {
        customFieldStatus,
        allCustomFields: customFields.map((field: any) => ({
          id: field.id,
          name: field.name,
          type: field.fieldType,
        })),
      },
    })
  } catch (error) {
    console.error("Error testing GHL custom fields:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      details: {
        customFieldNames: CUSTOM_FIELD_NAMES,
      },
    })
  }
}

