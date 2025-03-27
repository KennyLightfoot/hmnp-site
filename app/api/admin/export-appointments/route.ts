import { exportAppointments } from "@/lib/gohighlevel"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { dateRange, limit, calendarId, status } = body

    // Get appointments from GoHighLevel
    const appointments = await exportAppointments({
      dateRange,
      limit,
      calendarId,
      status,
    })

    // Convert to CSV
    const headers = ["ID", "Title", "Contact ID", "Calendar ID", "Start Time", "End Time", "Status", "Created At"]

    let csv = headers.join(",") + "\n"

    appointments.forEach((appointment: any) => {
      const row = [
        appointment.id || "",
        appointment.title || "",
        appointment.contactId || "",
        appointment.calendarId || "",
        appointment.startTime || "",
        appointment.endTime || "",
        appointment.status || "",
        appointment.createdAt || "",
      ].map((field) => `"${String(field).replace(/"/g, '""')}"`)

      csv += row.join(",") + "\n"
    })

    // Return CSV as download
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="appointments-export-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error("Export appointments error:", error)
    return NextResponse.json({ error: "Failed to export appointments" }, { status: 500 })
  }
}

