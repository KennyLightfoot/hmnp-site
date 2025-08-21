/**
 * Enhanced Booking Landing - dedicated URL for ads
 * Reuses the main BookingForm with the same styling as /booking
 */
import { Metadata } from 'next'
import BookingForm from '@/components/booking/BookingForm'

export const metadata: Metadata = {
  title: 'Book Mobile Notary | Houston Mobile Notary Pros',
  description: 'Fast, professional mobile notary in Houston. Same‑day and evening appointments. Book in minutes.',
}

export default function EnhancedBookingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Book Your Mobile Notary Appointment
          </h1>
          <p className="text-xl text-gray-600 mb-6 max-w-2xl mx-auto">
            Professional mobile notary service in Houston with clear pricing and flexible scheduling.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <BookingForm />
        </div>
      </div>
    </div>
  )
}


