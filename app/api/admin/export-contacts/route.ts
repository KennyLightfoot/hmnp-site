import { exportContacts } from "@/lib/gohighlevel"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { dateRange, limit, tags } = body

    // Get contacts from GoHighLevel
    const contacts = await exportContacts({
      dateRange,
      limit,
      tags,
    })

    // Convert to CSV
    const headers = ["ID", "First Name", "Last Name", "Email", "Phone", "Tags", "Created At"]

    let csv = headers.join(",") + "\n"

    contacts.forEach((contact: any) => {
      const row = [
        contact.id || "",
        contact.firstName || "",
        contact.lastName || "",
        contact.email || "",
        contact.phone || "",
        (contact.tags || []).join(";"),
        contact.createdAt || "",
      ].map((field) => `"${String(field).replace(/"/g, '""')}"`)

      csv += row.join(",") + "\n"
    })

    // Return CSV as download
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="contacts-export-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error("Export contacts error:", error)
    return NextResponse.json({ error: "Failed to export contacts" }, { status: 500 })
  }
}

