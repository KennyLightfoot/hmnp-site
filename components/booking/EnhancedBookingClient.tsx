'use client'

import { useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import BookingForm from '@/components/booking/BookingForm'

function normalizeTime(input: string | null): string | undefined {
  if (!input) return undefined
  const t = input.trim()
  const twelve = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(t)
  if (twelve) {
    let h = parseInt(twelve[1], 10)
    const m = twelve[2]
    const mer = twelve[3].toUpperCase()
    if (mer === 'PM' && h !== 12) h += 12
    if (mer === 'AM' && h === 12) h = 0
    return `${String(h).padStart(2, '0')}:${m}`
  }
  const twenty = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(t)
  if (twenty) {
    const h = parseInt(twenty[1], 10)
    const m = twenty[2]
    if (h >= 0 && h <= 23) return `${String(h).padStart(2, '0')}:${m}`
  }
  return undefined
}

export default function EnhancedBookingClient() {
  const sp = useSearchParams()

  const campaign = sp.get('campaign') || ''
  const serviceTypeParam = sp.get('serviceType') || ''
  const name = sp.get('name') || ''
  const email = sp.get('email') || ''
  const address = sp.get('address') || ''
  const date = sp.get('date') || '' // YYYY-MM-DD
  const time = normalizeTime(sp.get('time'))
  const express = sp.get('express') === '1'

  const { hero } = useMemo(() => {
    let headline = 'Mobile Notary in Houston — Book in Minutes'
    let subhead = 'Same‑day and evening appointments with clear pricing.'
    let badge = 'Trusted • 4.9★ Rated'
    if (campaign.toLowerCase() === 'priority') {
      headline = 'Priority Mobile Notary — 60–120 Minute Arrival'
      subhead = 'Get a notary to you fast. Clear travel tiers. From $125.'
      badge = 'Priority Arrival • 7–21 Daily'
    } else if (campaign.toLowerCase() === 'loan') {
      headline = 'Certified Loan Signing — Schedule Your Appointment'
      subhead = 'Refinance, purchase, HELOC. NNA‑certified specialists.'
      badge = 'NNA Certified • 4.9★ Rated'
    }
    return { hero: { headline, subhead, badge } }
  }, [campaign])

  const defaultService = useMemo(() => {
    if (campaign.toLowerCase() === 'priority') return 'EXTENDED_HOURS'
    if (campaign.toLowerCase() === 'loan') return 'LOAN_SIGNING'
    return 'STANDARD_NOTARY'
  }, [campaign])

  const initialData = useMemo(() => {
    const chosenService = serviceTypeParam || defaultService
    return {
      serviceType: chosenService,
      customer: {
        name: name,
        email: email,
      },
      location: {
        address: address,
        city: '',
        state: 'TX',
        zipCode: ''
      },
      scheduling: {
        preferredDate: date || '',
        preferredTime: time || '',
      }
    }
  }, [serviceTypeParam, defaultService, name, email, address, date, time])

  // dataLayer funnel start
  if (typeof window !== 'undefined') {
    try {
      (window as any).dataLayer = (window as any).dataLayer || []
      ;(window as any).dataLayer.push({ event: 'booking_form_view', page: 'booking_enhanced' })
    } catch {}
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Hero with trust and tel CTA */}
      <div className="text-center mb-8">
        <div className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium mb-4">
          {hero.badge}
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
          {hero.headline}
        </h1>
        <p className="text-lg text-gray-600 mb-4 max-w-2xl mx-auto">
          {hero.subhead}
        </p>
        <div className="flex items-center justify-center gap-3 text-sm text-gray-600 mb-2">
          <span>4.9★ Rated</span>
          <span>•</span>
          <span>Licensed & Insured</span>
          <span>•</span>
          <a href="tel:+18326174285" className="text-blue-600 hover:text-blue-700">(832) 617‑4285</a>
        </div>
      </div>

      {/* Booking form with prefill and optional express initial step */}
      <div className="max-w-4xl mx-auto">
        <BookingForm initialData={initialData as any} className="" {...(express ? { } : {})} />
      </div>

      {/* Sticky second CTA for mobile callers */}
      <div className="md:hidden text-center mt-6">
        <a href="tel:+18326174285" className="inline-flex items-center justify-center text-blue-700 underline">
          Prefer to call? Tap to dial now
        </a>
      </div>
    </div>
  )
}


