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
            Houston suburbs (25‑mile radius)
          </p>
        </div>
        {/* Simple inline map (SVG pins for Webster/League City) – decorative only */}
        <div className="w-full md:w-auto">
          <svg
            width="260"
            height="120"
            viewBox="0 0 260 120"
            aria-hidden="true"
            role="presentation"
            className="rounded-lg border border-black/10 bg-gray-50"
          >
            <rect x="0" y="0" width="260" height="120" fill="#f8fafc" />
            {/* Webster pin */}
            <circle cx="90" cy="60" r="6" fill="#ef4444" />
            <text x="100" y="64" fontSize="10" fill="#374151">
              Webster
            </text>
            {/* League City pin */}
            <circle cx="160" cy="80" r="6" fill="#ef4444" />
            <text x="170" y="84" fontSize="10" fill="#374151">
              League City
            </text>
            {/* Houston marker (context) */}
            <circle cx="40" cy="40" r="3" fill="#94a3b8" />
            <text x="48" y="44" fontSize="9" fill="#6b7280">
              Houston
            </text>
          </svg>
        </div>
      </div>
    </section>
  )
}







