import { NextResponse } from "next/server"
import { getLocationId, makeRequest } from "@/lib/gohighlevel"

export async function GET() {
  try {
    console.log("Testing GHL workflows...")

    // Get location ID first
    const locationId = await getLocationId()
    console.log(`Using location ID: ${locationId}`)

    // Get all workflows using the location ID
    const response = await makeRequest(`/locations/${locationId}/workflows`)
    console.log(`Workflows API response: ${JSON.stringify(response).substring(0, 500)}...`)

    // Extract workflows from the response
    const workflows = response.workflows || []
    console.log(`Retrieved ${workflows.length} workflows`)

    // Check if the configured workflow IDs exist
    const workflowIds = {
      contactForm: process.env.GHL_CONTACT_FORM_WORKFLOW_ID,
      callRequest: process.env.GHL_CALL_REQUEST_WORKFLOW_ID,
      newContact: process.env.GHL_NEW_CONTACT_WORKFLOW_ID,
      newBooking: process.env.GHL_NEW_BOOKING_WORKFLOW_ID,
    }

    // Log the workflow IDs for debugging
    console.log(`Configured workflow IDs: ${JSON.stringify(workflowIds)}`)

    const workflowStatus: Record<string, { exists: boolean; name?: string; id?: string }> = {}

    // Check each workflow ID
    for (const [key, id] of Object.entries(workflowIds)) {
      if (!id) {
        workflowStatus[key] = { exists: false, id: "Not configured" }
        continue
      }

      const workflow = workflows.find((wf: any) => wf.id === id)
      workflowStatus[key] = {
        exists: !!workflow,
        name: workflow?.name || "Not found",
        id: id,
      }
    }

    // Check if all required workflows exist
    const allWorkflowsExist = Object.values(workflowStatus).every((status) => status.exists)

    return NextResponse.json({
      success: allWorkflowsExist,
      error: allWorkflowsExist ? null : "Some workflow IDs are missing or invalid",
      details: {
        workflowStatus,
        allWorkflows: workflows.map((wf: any) => ({
          id: wf.id,
          name: wf.name,
        })),
      },
    })
  } catch (error) {
    console.error("Error testing GHL workflows:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      details: {
        workflowIds: {
          contactForm: process.env.GHL_CONTACT_FORM_WORKFLOW_ID ? "Configured" : "Missing",
          callRequest: process.env.GHL_CALL_REQUEST_WORKFLOW_ID ? "Configured" : "Missing",
          newContact: process.env.GHL_NEW_CONTACT_WORKFLOW_ID ? "Configured" : "Missing",
          newBooking: process.env.GHL_NEW_BOOKING_WORKFLOW_ID ? "Configured" : "Missing",
        },
      },
    })
  }
}

