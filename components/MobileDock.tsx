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
        <div className="flex items-center gap-2 p-2">
          <Link
            href="/booking"
            onClick={() => track('cta_click', { cta_name: 'Book', location: 'mobile_dock' })}
            className="flex-1 inline-flex items-center justify-center rounded-xl bg-[#A52A2A] py-3 text-center font-semibold text-white shadow-sm"
          >
            Book now
          </Link>
          <a
            href={`tel:${getBusinessTel()}`}
            onClick={() => {
              const a = getAttribution()
              track('call_click', { location: 'mobile_dock', phone: getBusinessPhoneFormatted(), ...a })
            }}
            className="inline-flex items-center justify-center rounded-xl border border-black/10 bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-900"
            aria-label="Call a notary"
          >
            Call
          </a>
        </div>
      </div>
    </div>
  )
}


