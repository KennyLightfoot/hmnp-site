'use client'

import { useEffect } from 'react'

import { trackBookingFunnel } from '@/app/lib/analytics'

export default function PricingFunnelTracker() {
  useEffect(() => {
    trackBookingFunnel('pricing_view', { page: 'pricing' })
  }, [])

  return null
}

