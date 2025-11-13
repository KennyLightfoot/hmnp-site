/**
 * Enhanced Booking Landing - dedicated URL for ads
 * Now renders a client wrapper to prefill form and adjust hero by campaign.
 */
import { Metadata } from 'next'
import EnhancedBookingClient from '@/components/booking/EnhancedBookingClient'

// Force dynamic rendering to prevent SSR issues with client components
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Book Mobile Notary | Houston Mobile Notary Pros',
  description: 'Fast, professional mobile notary in Houston. Same‑day and evening appointments. Book in minutes.',
}

export default function EnhancedBookingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <EnhancedBookingClient />
      </div>
    </div>
  )
}
