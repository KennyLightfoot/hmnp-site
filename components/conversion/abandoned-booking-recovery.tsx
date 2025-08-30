"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

interface BookingData {
  serviceType?: string
  location?: string
  datetime?: string
  customerInfo?: {
    name?: string
    email?: string
    phone?: string
  }
  timestamp: number
}

export function AbandonedBookingRecovery() {
  const router = useRouter()

  useEffect(() => {
    const trackBookingAbandonment = () => {
      const bookingData = localStorage.getItem("incomplete_booking")
      if (bookingData) {
        try {
          const data: BookingData = JSON.parse(bookingData)
          const timeSinceStart = Date.now() - data.timestamp

          // If booking was started more than 5 minutes ago and not completed
          if (timeSinceStart > 5 * 60 * 1000) {
            // Track abandonment event
            if (typeof window !== "undefined" && window.gtag) {
              window.gtag("event", "booking_abandoned", {
                event_category: "conversion",
                event_label: data.serviceType || "unknown",
                value: timeSinceStart,
                custom_parameters: {
                  service_type: data.serviceType,
                  has_contact_info: !!(data.customerInfo?.email || data.customerInfo?.phone),
                  abandonment_stage: data.customerInfo ? "payment" : "details",
                },
              })
            }

            // Send recovery email if we have contact info
            if (data.customerInfo?.email) {
              sendRecoveryEmail(data)
            }

            console.log("[v0] Booking abandonment detected:", data)
          }
        } catch (error) {
          console.error("[v0] Error processing abandoned booking:", error)
        }
      }
    }

    // Check for abandoned bookings on page load
    trackBookingAbandonment()

    // Set up periodic checks
    const interval = setInterval(trackBookingAbandonment, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [])

  const sendRecoveryEmail = async (bookingData: BookingData) => {
    try {
      const response = await fetch("/api/booking/recovery-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      })

      if (response.ok) {
        console.log("[v0] Recovery email sent successfully")
        // Track recovery email sent
        if (typeof window !== "undefined" && window.gtag) {
          window.gtag("event", "recovery_email_sent", {
            event_category: "conversion",
            event_label: bookingData.serviceType || "unknown",
          })
        }
      }
    } catch (error) {
      console.error("[v0] Error sending recovery email:", error)
    }
  }

  return null // This component doesn't render anything
}

// Utility functions for booking tracking
export const BookingTracker = {
  startBooking: (serviceType: string) => {
    const bookingData: BookingData = {
      serviceType,
      timestamp: Date.now(),
    }
    localStorage.setItem("incomplete_booking", JSON.stringify(bookingData))

    // Track booking started
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "booking_started", {
        event_category: "conversion",
        event_label: serviceType,
      })
    }
  },

  updateBooking: (updates: Partial<BookingData>) => {
    const existing = localStorage.getItem("incomplete_booking")
    if (existing) {
      try {
        const data = JSON.parse(existing)
        const updated = { ...data, ...updates }
        localStorage.setItem("incomplete_booking", JSON.stringify(updated))
      } catch (error) {
        console.error("[v0] Error updating booking data:", error)
      }
    }
  },

  completeBooking: () => {
    localStorage.removeItem("incomplete_booking")

    // Track booking completed
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "booking_completed", {
        event_category: "conversion",
        event_label: "success",
      })
    }
  },

  abandonBooking: () => {
    const existing = localStorage.getItem("incomplete_booking")
    if (existing) {
      try {
        const data = JSON.parse(existing)
        // Track intentional abandonment
        if (typeof window !== "undefined" && window.gtag) {
          window.gtag("event", "booking_abandoned_intentional", {
            event_category: "conversion",
            event_label: data.serviceType || "unknown",
          })
        }
      } catch (error) {
        console.error("[v0] Error tracking booking abandonment:", error)
      }
    }
    localStorage.removeItem("incomplete_booking")
  },
}
