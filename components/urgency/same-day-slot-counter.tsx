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
      setSource(data?.metadata?.source)
    } catch (e: any) {
      setError(e?.message || "Failed to load")
      setCount(null)
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

  return (
    <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm ${className}`}>
      <span className="inline-flex h-2.5 w-2.5 rounded-full bg-green-500"></span>
      {typeof count === "number" ? (
        <span>
          Same-day mobile slots left today: <strong>{count}</strong>
          {source ? <span className="ml-1 text-xs text-gray-500">({source})</span> : null}
        </span>
      ) : error ? (
        <span className="text-gray-600">Limited availability — check calendar</span>
      ) : (
        <span className="text-gray-600">Checking today’s slots…</span>
      )}
    </div>
  )
}



