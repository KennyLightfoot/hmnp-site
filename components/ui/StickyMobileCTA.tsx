'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CalendarDays, Phone } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { getBusinessPhoneFormatted, getBusinessTel } from '@/lib/phone'
import { trackBookingFunnel } from '@/app/lib/analytics'

interface StickyMobileCTAProps {
  className?: string
  headline?: string
  subheadline?: string
  primaryHref?: string
  primaryLabel?: string
  secondaryHref?: string
  secondaryLabel?: string
  showCallButton?: boolean
  analyticsContext?: string
}

function pushAnalyticsEvent(action: string, context: string, extras?: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  try {
    const dataLayer = (window as any).dataLayer || []
    dataLayer.push({
      event: 'sticky_cta_interaction',
      cta_action: action,
      cta_context: context,
      ts: Date.now(),
      ...(extras || {}),
    })
    ;(window as any).dataLayer = dataLayer
    trackBookingFunnel('cta_click', {
      cta_action: action,
      cta_context: context,
    })
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[StickyCTA] Failed to push analytics event', error)
    }
  }
}

export default function StickyMobileCTA({
  className,
  headline = 'Need a mobile notary?',
  subheadline,
  primaryHref = '/booking',
  primaryLabel = 'Book Now',
  secondaryHref,
  secondaryLabel,
  showCallButton = true,
  analyticsContext = 'sticky_mobile',
}: StickyMobileCTAProps) {
  const [callHref, setCallHref] = useState<string>('')
  const [callLabel, setCallLabel] = useState<string>('Call Now')

  useEffect(() => {
    if (!showCallButton) return
    try {
      const tel = getBusinessTel()
      const formatted = getBusinessPhoneFormatted()
      setCallHref(`tel:${tel}`)
      setCallLabel(`Call ${formatted}`)
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[StickyCTA] Failed to resolve business phone', error)
      }
    }
  }, [showCallButton])

  const finalSecondaryHref = showCallButton ? secondaryHref ?? callHref : secondaryHref
  const finalSecondaryLabel = showCallButton ? secondaryLabel ?? callLabel : secondaryLabel

  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 md:hidden pwa-bottom-navigation',
        className
      )}
    >
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1 text-sm text-gray-700">
          <span className="font-semibold text-gray-900">{headline}</span>
          <span className="text-xs text-gray-500">
            {subheadline || 'Same-day appointments • Licensed & insured'}
          </span>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          {finalSecondaryHref && finalSecondaryLabel && (
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
              asChild
              onClick={() =>
                pushAnalyticsEvent('call_click', analyticsContext, {
                  cta_value: finalSecondaryHref.startsWith('tel:') ? finalSecondaryHref : undefined,
                })
              }
            >
              <a href={finalSecondaryHref}>
                <Phone className="mr-2 h-4 w-4" />
                {finalSecondaryLabel}
              </a>
            </Button>
          )}

          <Button
            size="lg"
            className="w-full bg-[#A52A2A] hover:bg-[#8B0000] sm:w-auto"
            asChild
            onClick={() => pushAnalyticsEvent('book_click', analyticsContext)}
          >
            <Link href={primaryHref}>
              <CalendarDays className="mr-2 h-4 w-4" />
              {primaryLabel}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

