import type { Metadata } from "next"
import { BookingForm } from "@/components/booking-form"

export const metadata: Metadata = {
  title: "Book an Appointment",
  description:
    "Schedule your mobile notary appointment with Houston Mobile Notary Pros. We offer convenient mobile notary services throughout the Houston area.",
}

export default function BookingPage() {
  return (
    <main className="flex flex-col">
      <section className="py-12 bg-accent text-accent-foreground">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Book Your Mobile Notary Appointment</h1>
          <p className="text-lg max-w-2xl mx-auto">
            Fill out the form below to schedule your mobile notary service. We'll get back to you promptly to confirm
            your appointment.
          </p>
        </div>
      </section>

      <section className="py-12 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-card rounded-xl shadow-sm p-6 md:p-8">
            <BookingForm />
          </div>
        </div>
      </section>
    </main>
  )
}

