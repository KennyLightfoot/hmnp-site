"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function SimpleBookingPage() {
  const [csrfToken, setCsrfToken] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const fetchToken = async () => {
      try {
        const res = await fetch('/api/csrf-token', { method: 'GET', cache: 'no-store' })
        if (!res.ok) return
        const data = await res.json().catch(() => ({}))
        if (mounted) setCsrfToken(data?.csrfToken || null)
      } catch {}
    }
    fetchToken()
    return () => { mounted = false }
  }, [])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMessage(null)
    setSubmitting(true)
    try {
      const form = new FormData(e.currentTarget)
      const serviceType = String(form.get('serviceType') || '')
      const customerName = String(form.get('customerName') || '')
      const customerEmail = String(form.get('customerEmail') || '')
      const scheduledLocal = String(form.get('scheduledDateTime') || '')
      const locationAddress = String(form.get('locationAddress') || '')

      // Convert datetime-local to ISO string
      const scheduledDateTime = scheduledLocal ? new Date(scheduledLocal).toISOString() : ''

      const res = await fetch('/api/booking/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken ? { 'x-csrf-token': csrfToken } : {}),
        },
        body: JSON.stringify({
          serviceType,
          customerName,
          customerEmail,
          scheduledDateTime,
          locationAddress,
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        if (res.status === 409 && data?.error === 'TIME_UNAVAILABLE') {
          setMessage('Selected time is no longer available. Please choose a different time.')
        } else if (res.status === 400) {
          setMessage('Validation failed. Please check your entries.')
        } else if (res.status === 403) {
          setMessage('Session security error. Please refresh and try again.')
        } else {
          setMessage('Could not create booking. Please try again.')
        }
        return
      }

      setMessage('Booking created! Check your email for confirmation.')
      e.currentTarget.reset()
    } catch {
      setMessage('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Quick Booking</h1>
      <p className="text-sm text-gray-600 mb-6">Minimal form to get you scheduled fast.</p>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Service Type</label>
          <select name="serviceType" className="w-full border rounded px-3 py-2" defaultValue="STANDARD_NOTARY" required>
            <option value="STANDARD_NOTARY">Standard Notary</option>
            <option value="EXTENDED_HOURS">Extended Hours Notary</option>
            <option value="LOAN_SIGNING">Loan Signing</option>
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

        <button type="submit" disabled={submitting} className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60">
          {submitting ? 'Booking…' : 'Book'}
        </button>
      </form>

      {message && (
        <div className="mt-4 text-sm">
          {message}
        </div>
      )}

      <div className="mt-6 text-sm text-gray-600">
        Prefer the full experience? <Link href="/booking">Use advanced booking</Link>
      </div>
    </div>
  )
}


