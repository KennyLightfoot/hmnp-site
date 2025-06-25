"use client"

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

interface UTMParams {
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmTerm?: string
  utmContent?: string
}

export function useUTMParams(): UTMParams {
  const searchParams = useSearchParams()
  const [utmParams, setUtmParams] = useState<UTMParams>({})

  useEffect(() => {
    const params: UTMParams = {
      utmSource: searchParams?.get('utm_source') || undefined,
      utmMedium: searchParams?.get('utm_medium') || undefined,
      utmCampaign: searchParams?.get('utm_campaign') || undefined,
      utmTerm: searchParams?.get('utm_term') || undefined,
      utmContent: searchParams?.get('utm_content') || undefined,
    }

    // Filter out undefined values
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== undefined)
    ) as UTMParams

    setUtmParams(filteredParams)

    // Store in localStorage for persistence across pages
    if (Object.keys(filteredParams).length > 0) {
      localStorage.setItem('hmnp_utm_params', JSON.stringify(filteredParams))
    }
  }, [searchParams])

  // Check localStorage for existing UTM params if none in URL
  useEffect(() => {
    if (Object.keys(utmParams).length === 0) {
      const stored = localStorage.getItem('hmnp_utm_params')
      if (stored) {
        try {
          setUtmParams(JSON.parse(stored))
        } catch (error) {
          console.warn('Failed to parse stored UTM params:', error)
        }
      }
    }
  }, [utmParams])

  return utmParams
} 