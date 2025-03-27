import type { Metadata } from "next"
import { GHLCalendarWidget } from "@/components/ghl-calendar-widget"

export const metadata: Metadata = {
  title: "Schedule an Appointment | Houston Mobile Notary Pros",
  description:
    "Schedule your mobile notary appointment directly using our online calendar. Choose a date and time that works for you.",
}

export default function SchedulePage() {
  // This would be your actual Go High Level calendar ID
  const calendarId = process.env.GHL_BOOKING_CALENDAR_ID || ""

  return (
    <main className="container py-12 space-y-8">
      <div className="max-w-3xl mx-auto text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-oxfordBlue">Schedule an Appointment</h1>
        <p className="text-xl text-muted-foreground">
          Choose a date and time that works for you. Our online scheduling system makes it easy to book your mobile
          notary service.
        </p>
      </div>

      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-6">
        <GHLCalendarWidget calendarId={calendarId} className="min-h-[600px]" />
      </div>

      <div className="max-w-3xl mx-auto text-center">
        <p className="text-muted-foreground">
          Need help scheduling? Call us at (281) 779-8847 or{" "}
          <a href="/contact" className="text-auburn underline">
            contact us
          </a>{" "}
          for assistance.
        </p>
      </div>
    </main>
  )
}

