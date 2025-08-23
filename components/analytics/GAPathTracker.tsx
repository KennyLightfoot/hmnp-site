"use client"

import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"

export default function GAPathTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (typeof window === "undefined") return
    const gtag = (window as any).gtag as undefined | ((...args: any[]) => void)
    const gaId = process.env.NEXT_PUBLIC_GA_ID
    if (!gaId) return

    const query = searchParams?.toString()
    const page_path = query ? `${pathname}?${query}` : pathname
    if (gtag) {
      gtag("config", gaId, { page_path })
    } else {
      // Fallback for GTM-only installs: push virtual pageview into dataLayer
      try {
        (window as any).dataLayer = (window as any).dataLayer || []
        ;(window as any).dataLayer.push({
          event: 'virtual_page_view',
          page_path,
          ga_measurement_id: gaId
        })
      } catch {}
    }
  }, [pathname, searchParams])

  return null
}


