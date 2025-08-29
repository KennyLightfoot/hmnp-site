"use client"

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { getBusinessPhoneFormatted, getBusinessTel } from '@/lib/phone'
import { track } from '@/app/lib/analytics'

export default function StickyBookBar() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 220)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!visible) return null

  return (
    <div className="hidden md:block fixed bottom-4 left-1/2 -translate-x-1/2 z-40">
      <div className="rounded-full shadow-lg border border-black/10 bg-white/95 backdrop-blur px-3 py-2 flex items-center gap-3">
        <Link href="/booking" className="inline-flex" onClick={() => track('cta_click', { cta_name: 'Sticky Book', location: 'sticky_bar' })}>
          <Button className="h-10 px-5 bg-primary text-white">Book Same‑Day</Button>
        </Link>
        <a href={`tel:${getBusinessTel()}`} onClick={() => track('call_click', { location: 'sticky_bar', phone: getBusinessPhoneFormatted() })} className="text-[#0F1419] hover:underline">
          {getBusinessPhoneFormatted()}
        </a>
      </div>
    </div>
  )
}


