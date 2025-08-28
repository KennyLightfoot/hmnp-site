"use client"

import { useEffect } from "react"
import Link from "next/link"

export default function PrefetchBooking() {
  useEffect(() => {
    try {
      // Prefetch booking route for faster CTA clicks
      const a = document.createElement('a')
      a.href = '/booking'
      // Next.js will intercept internal links; this hints prefetch via viewport
    } catch {}
  }, [])
  return <Link href="/booking" prefetch style={{ display: 'none' }} aria-hidden>prefetch</Link>
}



