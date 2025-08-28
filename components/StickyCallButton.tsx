"use client"

import { useEffect, useState } from 'react'
import { Phone } from 'lucide-react'
import { getBusinessPhoneFormatted, getBusinessTel } from '@/lib/phone'
import { getOpenLabel, isOpenNow } from '@/lib/hours'
import { track } from '@/app/lib/analytics'
import { getAttribution, persistAttribution } from '@/lib/utm'

export default function StickyCallButton() {
  const [openLabel, setOpenLabel] = useState<'Open now' | 'Closed'>(getOpenLabel())
  const [isOpen, setIsOpen] = useState<boolean>(isOpenNow())
  const tel = getBusinessTel()
  const display = getBusinessPhoneFormatted()

  useEffect(() => {
    persistAttribution()
    const id = setInterval(() => {
      setOpenLabel(getOpenLabel())
      setIsOpen(isOpenNow())
    }, 60000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="hidden md:block fixed right-4 top-1/3 z-[60]">
      <a
        href={`tel:${tel}`}
        onClick={() => {
          const a = getAttribution()
          track('call_click', { location: 'sticky_button', ...a })
        }}
        className="group flex items-center gap-3 bg-primary text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all"
        aria-label={`Call ${display}`}
      >
        <Phone className="h-5 w-5" />
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold">{display}</span>
          <span className={`text-[11px] ${isOpen ? 'text-white/90' : 'text-white/70'}`}>{openLabel}</span>
        </div>
      </a>
    </div>
  )
}






