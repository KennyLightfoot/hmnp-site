"use client"

import { useEffect, useMemo, useState } from "react"

type AvailabilityResponse = {
  availableSlots: Array<{
    startTime: string
    endTime: string
    duration: number
    available: boolean
    demand?: "low" | "moderate" | "high"
  }>
  metadata?: { source?: string }
}

function getTodayInBusinessTz(): string {
  // Houston timezone; keep it simple using local time if Intl fails
  try {
    const now = new Date()
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Chicago",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    // en-CA gives YYYY-MM-DD format
    // However, some environments may add slashes; normalize
    // @ts-ignore
    const parts = formatter.formatToParts ? formatter.formatToParts(now) : []
    if (Array.isArray(parts) && parts.length) {
      const y = parts.find(p => p.type === "year")?.value
      const m = parts.find(p => p.type === "month")?.value
      const d = parts.find(p => p.type === "day")?.value
      if (y && m && d) return `${y}-${m}-${d}`
    }
    const formatted = formatter.format(now)
    if (/^\d{4}-\d{2}-\d{2}$/.test(formatted)) return formatted
    const cleaned = formatted.replaceAll("/", "-")
    const [mm, dd, yyyy] = cleaned.split("-")
    if (yyyy && mm && dd) return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`
  } catch {}
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

export default function SameDaySlotCounter({
  serviceType = "EXTENDED_HOURS",
  className = "",
  refreshMs = 60000,
}: {
  serviceType?: string
  className?: string
  refreshMs?: number
}) {
  const [count, setCount] = useState<number | null>(null)
  const [source, setSource] = useState<string | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)
  const [lastSuccessful, setLastSuccessful] = useState<{ count: number; timestamp: number } | null>(null)

  const dateStr = useMemo(() => getTodayInBusinessTz(), [])

  async function load() {
    try {
      setError(null)
      const params = new URLSearchParams({ date: dateStr, serviceType })
      const res = await fetch(`/api/availability?${params.toString()}`, { cache: "no-store" })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = (await res.json()) as AvailabilityResponse
      const slots = (data?.availableSlots || []).filter(s => s.available)
      setCount(slots.length)
      setLastSuccessful({ count: slots.length, timestamp: Date.now() })
      setSource(data?.metadata?.source)
    } catch (e: any) {
      setError(e?.message || "Failed to load")
    }
  }

  useEffect(() => {
    load()
    let intervalId: ReturnType<typeof setInterval> | null = null
    if (refreshMs > 0) {
      intervalId = setInterval(load, refreshMs)
    }
    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [dateStr, serviceType, refreshMs])

  const displayCount = typeof count === "number" ? count : lastSuccessful?.count ?? null
  const isStale = typeof count !== "number" && !!lastSuccessful

  const relativeTimestamp = useMemo(() => {
    if (!lastSuccessful) return null
    const diffSeconds = Math.max(0, Math.round((Date.now() - lastSuccessful.timestamp) / 1000))
    if (diffSeconds < 45) return 'just now'
    if (diffSeconds < 90) return 'about a minute ago'
    if (diffSeconds < 3600) {
      const minutes = Math.round(diffSeconds / 60)
      return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
    }
    const hours = Math.round(diffSeconds / 3600)
    return `${hours} hour${hours === 1 ? '' : 's'} ago`
  }, [lastSuccessful])

  return (
    <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm ${className}`}>
      <span className={`inline-flex h-2.5 w-2.5 rounded-full ${displayCount !== null ? 'bg-green-500' : 'bg-amber-400'}`}></span>
      {displayCount !== null ? (
        <span>
          Same-day appointments available
          {relativeTimestamp ? (
            <span className="ml-1 text-xs text-gray-500">
              {isStale ? `Last checked ${relativeTimestamp}` : `Updated ${relativeTimestamp}`}
            </span>
          ) : null}
          {error && isStale ? (
            <span className="ml-1 text-xs text-amber-600">Refreshing availability…</span>
          ) : null}
        </span>
      ) : error ? (
        <span className="text-gray-600">We’re confirming today’s openings — tap “Book” to see live availability.</span>
      ) : (
        <span className="text-gray-600">Checking today’s slots…</span>
      )}
    </div>
  )
}



