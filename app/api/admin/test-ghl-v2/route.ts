import { NextResponse } from "next/server"
import * as GHL from "@/lib/gohighlevel-v2"

export async function GET() {
  try {
    // Test the locations endpoint
    console.log("Testing GHL v2 implementation...")

    const locations = await GHL.getLocations()
    console.log(`Retrieved ${locations.length} locations`)

    if (!locations || locations.length === 0) {
      return NextResponse.json({
        success: false,
        error: "No locations found in your GoHighLevel account",
      })
    }

    // Get the first location ID
    const locationId = locations[0].id

    // Test workflows
    let workflows = []
    try {
      workflows = await GHL.getWorkflows()
      console.log(`Retrieved ${workflows.length} workflows`)
    } catch (error) {
      console.error("Error getting workflows:", error)
    }

    // Test calendars
    let calendars = []
    try {
      calendars = await GHL.getCalendars()
      console.log(`Retrieved ${calendars.length} calendars`)
    } catch (error) {
      console.error("Error getting calendars:", error)
    }

    // Test custom fields
    let customFields = []
    try {
      customFields = await GHL.getCustomFields()
      console.log(`Retrieved ${customFields.length} custom fields`)
    } catch (error) {
      console.error("Error getting custom fields:", error)
    }

    return NextResponse.json({
      success: true,
      details: {
        locations: locations.map((loc: any) => ({
          id: loc.id,
          name: loc.name,
        })),
        workflows: workflows.map((wf: any) => ({
          id: wf.id,
          name: wf.name,
        })),
        calendars: calendars.map((cal: any) => ({
          id: cal.id,
          name: cal.name,
        })),
        customFields: customFields.map((field: any) => ({
          id: field.id,
          name: field.name,
          type: field.fieldType,
        })),
      },
    })
  } catch (error) {
    console.error("Error testing GHL v2 implementation:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    })
  }
}

