"use client"

import { useEffect, useRef } from "react"

export default function GAConversionEvents() {
  const sentSuccessRef = useRef(false)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement
      const anchor = target?.closest?.('a') as HTMLAnchorElement | null
      if (!anchor) return
      const href = anchor.getAttribute('href') || ''
      if (!href) return
      try {
        if (href === '/booking' || href.startsWith('/booking?')) {
          const gtag = (window as any).gtag as undefined | ((...args: any[]) => void)
          if (gtag) {
            gtag('event', 'booking_started', {
              event_category: 'booking',
              event_label: document.location.pathname,
            })
          }
        }
        if (href.startsWith('tel:')) {
          const gtag = (window as any).gtag as undefined | ((...args: any[]) => void)
          if (gtag) {
            gtag('event', 'click_to_call', {
              event_category: 'engagement',
              event_label: href,
            })
          }
        }
        if (href.startsWith('sms:')) {
          const gtag = (window as any).gtag as undefined | ((...args: any[]) => void)
          if (gtag) {
            gtag('event', 'click_to_text', {
              event_category: 'engagement',
              event_label: href,
            })
          }
        }
      } catch {}
    }

    document.addEventListener('click', handleClick, { capture: true })
    return () => document.removeEventListener('click', handleClick, { capture: true } as any)
  }, [])

  return null
}


