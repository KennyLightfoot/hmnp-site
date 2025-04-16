import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({ bookings })
  } catch (error) {
    console.error("Error fetching bookings:", error)
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        date: new Date(data.date),
        time: data.time,
        serviceType: data.serviceType,
        location: data.location,
        numberOfSigners: data.numberOfSigners || 1,
        numberOfDocs: data.numberOfDocs || 1,
        notes: data.notes,
        status: "pending",
      },
    })

    return NextResponse.json({ booking })
  } catch (error) {
    console.error("Error creating booking:", error)
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 })
  }
}
