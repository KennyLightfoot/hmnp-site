"use client"

import Link from "next/link"
import { track } from "@/app/lib/analytics"
import { getBusinessTel, getBusinessPhoneFormatted } from "@/lib/phone"
import { getAttribution, persistAttribution } from "@/lib/utm"

export default function MobileDock() {
  if (typeof window !== 'undefined') {
    try { persistAttribution() } catch {}
  }
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
      <div className="m-3 rounded-2xl shadow-lg bg-white border border-black/10 overflow-hidden">
        <div className="grid grid-cols-3 divide-x divide-black/10">
          <Link href="/booking" onClick={() => track('cta_click', { cta_name: 'Book', location: 'mobile_dock' })} className="py-3 text-center font-semibold">Book</Link>
          <a href={`tel:${getBusinessTel()}`} onClick={() => {
            const a = getAttribution()
            track('call_click', { location: 'mobile_dock', phone: getBusinessPhoneFormatted(), ...a })
          }} className="py-3 text-center font-semibold">Call</a>
          <Link href="/ron" onClick={() => track('cta_click', { cta_name: 'RON', location: 'mobile_dock' })} className="py-3 text-center font-semibold">RON</Link>
        </div>
      </div>
    </div>
  )
}


