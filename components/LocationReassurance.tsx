"use client"

import { useEffect, useState } from 'react'

const ZIP_TO_CITY: Record<string, string> = {
  '77598': 'Webster',
  '77573': 'League City',
  '77591': 'Texas City',
}

export default function LocationReassurance() {
  const [city, setCity] = useState<string | null>(null)

  useEffect(() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('prefill_zip') : null
      if (saved && ZIP_TO_CITY[saved]) setCity(ZIP_TO_CITY[saved])
    } catch {}
  }, [])

  return (
    <section className="bg-white">
      <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row items-center gap-4">
        <div className="flex-1">
          <p className="text-sm text-[#0F1419]/80">
            Serving{" "}
            {city ? <strong>{city}</strong> : <strong>Webster &amp; League City</strong>} and nearby
            Texas City, Webster & League City and nearby Houston suburbs (20&#8209;mile radius)
          </p>
        </div>
        {/* Google Maps embed centered on Texas City / Webster service area */}
        <div
          className="w-full md:w-auto rounded-lg overflow-hidden border border-black/10 shadow-sm flex-shrink-0"
          style={{ width: 260, height: 160 }}
        >
          <iframe
            title="Houston Mobile Notary Pros service area map"
            width="260"
            height="160"
            style={{ border: 0, display: 'block' }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src="https://maps.google.com/maps?width=260&height=160&hl=en&q=Texas+City,+TX+77591&t=&z=10&ie=UTF8&iwloc=B&output=embed"
            aria-label="Map showing service area centered on Texas City, TX"
          />
        </div>
      </div>
    </section>
  )
}
