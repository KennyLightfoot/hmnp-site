"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

export function ConversionAnalytics() {
  const pathname = usePathname()

  useEffect(() => {
    // Track page views with conversion funnel context
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "page_view", {
        page_path: pathname,
        page_title: document.title,
        event_category: "navigation",
      })

      // Track funnel steps
      if (pathname === "/") {
        window.gtag("event", "funnel_step", {
          event_category: "conversion_funnel",
          event_label: "homepage_view",
          funnel_step: 1,
        })
      } else if (pathname === "/booking") {
        window.gtag("event", "funnel_step", {
          event_category: "conversion_funnel",
          event_label: "booking_page_view",
          funnel_step: 2,
        })
      } else if (pathname.includes("/confirmation")) {
        window.gtag("event", "funnel_step", {
          event_category: "conversion_funnel",
          event_label: "booking_confirmation",
          funnel_step: 3,
        })
      }
    }
  }, [pathname])

  useEffect(() => {
    // Track scroll depth for engagement
    let maxScroll = 0
    const trackScrollDepth = () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100,
      )

      if (scrollPercent > maxScroll && scrollPercent % 25 === 0) {
        maxScroll = scrollPercent
        if (typeof window !== "undefined" && window.gtag) {
          window.gtag("event", "scroll_depth", {
            event_category: "engagement",
            event_label: `${scrollPercent}%`,
            value: scrollPercent,
          })
        }
      }
    }

    window.addEventListener("scroll", trackScrollDepth)
    return () => window.removeEventListener("scroll", trackScrollDepth)
  }, [])

  return null
}
