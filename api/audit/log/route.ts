import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const auditEvent = await request.json()
    const supabase = createServerClient()

    // Store audit event in database
    const { error } = await supabase.from("ron_audit_events").insert({
      id: auditEvent.id,
      session_id: auditEvent.sessionId,
      timestamp: auditEvent.timestamp,
      event_type: auditEvent.eventType,
      user_id: auditEvent.userId,
      user_role: auditEvent.userRole,
      details: auditEvent.details,
      ip_address: auditEvent.ipAddress,
      user_agent: auditEvent.userAgent,
      location: auditEvent.location,
    })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to store audit event" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("sessionId")

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID required" }, { status: 400 })
    }

    const supabase = createServerClient()

    const { data: events, error } = await supabase
      .from("ron_audit_events")
      .select("*")
      .eq("session_id", sessionId)
      .order("timestamp", { ascending: true })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to retrieve audit events" }, { status: 500 })
    }

    return NextResponse.json({ events })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
