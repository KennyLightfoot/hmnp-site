import { NextResponse } from "next/server"
import prisma from "@/lib/db"
import { logApiError } from "@/lib/error-logger"
import { calculateTotalPrice } from "@/lib/pricing"

export async function GET(request: Request) {
  // GET implementation from previous code
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Extract booking data from the request
    const {
      serviceType,
      numberOfSigners,
      appointmentDate,
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      state,
      postalCode,
      signingLocation,
      specialInstructions,
    } = data

    // Calculate the price based on service type and number of signers
    const pricing = calculateTotalPrice({
      serviceType: serviceType.toLowerCase(),
      numberOfSigners,
      distance: 0, // This would need to be calculated based on address
      isWeekend: new Date(appointmentDate).getDay() === 0 || new Date(appointmentDate).getDay() === 6,
      isHoliday: false, // This would need to be determined
      isAfterHours: false, // This would need to be determined based on time
      extraDocuments: 0,
      needsOvernightHandling: false,
      needsBilingualService: false,
    })

    // Create the booking in the database
    const booking = await prisma.booking.create({
      data: {
        serviceType,
        numberOfSigners,
        appointmentDate: new Date(appointmentDate),
        firstName,
        lastName,
        email,
        phone,
        address,
        city,
        state,
        postalCode,
        signingLocation,
        specialInstructions,
        totalPrice: pricing.totalPrice,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Booking created successfully",
      data: {
        id: booking.id,
        appointmentDate: booking.appointmentDate,
      },
    })
  } catch (error) {
    // Log the error with our enhanced logger
    logApiError("/api/bookings", error as Error, request, {
      endpoint: "POST /api/bookings",
      service: "Prisma Database",
    })

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 500 },
    )
  }
}
