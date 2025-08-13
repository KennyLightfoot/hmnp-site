import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Quick Booking | Houston Mobile Notary Pros',
}

export default function SimpleBookingPage() {
  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Quick Booking</h1>
      <p className="text-sm text-gray-600 mb-6">Minimal form to get you scheduled fast.</p>
      <form method="post" action="/api/booking/create" className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Service Type</label>
          <select name="serviceType" className="w-full border rounded px-3 py-2" required>
            <option value="STANDARD_NOTARY">Standard Notary</option>
            <option value="EXTENDED_HOURS_NOTARY">Extended Hours Notary</option>
            <option value="LOAN_SIGNING_SPECIALIST">Loan Signing</option>
            <option value="RON_SERVICES">Remote Online Notarization</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Your Name</label>
          <input name="customerName" className="w-full border rounded px-3 py-2" required />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input type="email" name="customerEmail" className="w-full border rounded px-3 py-2" required />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">When</label>
          <input type="datetime-local" name="scheduledDateTime" className="w-full border rounded px-3 py-2" required />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Address (optional)</label>
          <input name="locationAddress" className="w-full border rounded px-3 py-2" />
        </div>

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Book</button>
      </form>

      <div className="mt-6 text-sm text-gray-600">
        Prefer the full experience? <Link href="/booking">Use advanced booking</Link>
      </div>
    </div>
  )
}


