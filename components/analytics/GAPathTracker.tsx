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
    if (!gtag || !gaId) return

    const query = searchParams?.toString()
    const page_path = query ? `${pathname}?${query}` : pathname
    gtag("config", gaId, { page_path })
  }, [pathname, searchParams])

  return null
}


