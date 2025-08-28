"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { track } from "@/app/lib/analytics"
import { useVariant } from "@/app/lib/abTesting"
import { getBusinessTel, getBusinessPhoneFormatted } from "@/lib/phone"

type EstimateResponse = {
  ok: boolean
  mode: "MOBILE" | "RON"
  miles?: number
  breakdown?: { label: string; amount: number; qty?: number }[]
  total?: number
  error?: string
}

export default function HeroBooking() {
  const [zip, setZip] = useState("")
  const [mode, setMode] = useState<"MOBILE" | "RON">("MOBILE")
  const [acts, setActs] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [estimate, setEstimate] = useState<EstimateResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [eta, setEta] = useState<string | null>(null)

  useEffect(() => {
    track("hero_viewed")
  }, [])

  const headlineVariant = useVariant('heroHeadline', 'A')
  const headlines = {
    A: "Mobile Notary Near You Today",
    B: "Same‑Day Mobile Notary — We Come To You",
  }
  const currentHeadline = (headlines as any)[headlineVariant] || headlines.A
  const ctaVariant = useVariant('heroCta', 'A')
  const ctaText = ({ fallback = 'Book Same‑Day' }: { fallback?: string } = {}) => ({ A: 'Book Same‑Day', B: 'Book Now' } as const)[(ctaVariant as 'A' | 'B')] || fallback

  // Prefill zip/acts
  useEffect(() => {
    try {
      const savedZip = typeof window !== 'undefined' ? localStorage.getItem('prefill_zip') : null
      const savedActs = typeof window !== 'undefined' ? localStorage.getItem('prefill_acts') : null
      if (savedZip) setZip(savedZip)
      if (savedActs) setActs(Math.max(1, parseInt(savedActs, 10) || 1))
      if (!savedZip && process.env.NEXT_PUBLIC_DEFAULT_ZIP) setZip(process.env.NEXT_PUBLIC_DEFAULT_ZIP)
    } catch {}
  }, [])

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('prefill_zip', zip)
        localStorage.setItem('prefill_acts', String(acts))
      }
    } catch {}
  }, [zip, acts])

  // Fetch earliest ETA window for current mode
  useEffect(() => {
    async function fetchEta() {
      try {
        const today = new Date().toISOString().slice(0,10)
        const serviceType = mode === 'RON' ? 'RON_SERVICES' : 'STANDARD_NOTARY'
        const res = await fetch(`/api/v2/availability?serviceType=${serviceType}&date=${today}&timezone=America/Chicago`, { cache: 'no-store' })
        const data = await res.json()
        const slots = (data?.availableSlots || []) as Array<{ startTime?: string; start?: string; available?: boolean }>
        const nowTs = Date.now()
        const first = slots
          .filter(s => s.available !== false)
          .map(s => s.startTime || (s as any).start)
          .filter(Boolean)
          .map((iso: string) => new Date(iso).getTime())
          .filter(ts => ts >= nowTs)
          .sort((a,b) => a - b)[0]
        if (first) {
          const d = new Date(first)
          const label = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
          setEta(label)
        } else {
          setEta(null)
        }
      } catch {
        setEta(null)
      }
    }
    fetchEta()
  }, [mode])

  async function getEstimate() {
    try {
      setIsLoading(true)
      setError(null)
      setEstimate(null)
      track("estimate_requested", { mode, zip, acts })
      const res = await fetch("/api/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, zip, acts }),
      })
      const data: EstimateResponse = await res.json()
      if (!data.ok) throw new Error(data.error || "Unable to calculate estimate")
      setEstimate(data)
      track("estimate_shown", {
        mode: data.mode,
        amount: data.total ?? 0,
        acts,
      })
    } catch (e) {
      const message = (e as Error).message
      setError(message)
      track("estimate_error", { message })
    } finally {
      setIsLoading(false)
    }
  }

  // Track ETA shown
  useEffect(() => {
    if (eta) {
      track('eta_shown', { eta, mode })
    }
  }, [eta, mode])

  return (
    <section className="relative bg-secondary text-white">
      {/* Hero image (decorative), reserve space to prevent CLS */}
      <div className="absolute inset-0 -z-10">
        <div className="relative w-full h-[420px] md:h-[520px] lg:h-[600px]">
          <Image
            src="/hero-background.jpg"
            alt="Houston Mobile Notary Pros"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>
      </div>
      <div className="container mx-auto px-4 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-serif mb-2">{currentHeadline}</h1>
          {eta && (
            <p className="text-white/80 mb-2">Earliest arrival: {eta}</p>
          )}
          <p className="text-white/80 mb-2">Same‑day, 20–30 mi included.</p>
          <p className="text-white/80 mb-6">From $75 • No hidden fees.</p>
          <div className="flex flex-wrap gap-3 text-sm text-white/70 mb-8">
            <span className="px-3 py-1 rounded-full bg-white/10">4.9★ Rated</span>
            <span className="px-3 py-1 rounded-full bg-white/10">500+ jobs</span>
            <span className="px-3 py-1 rounded-full bg-white/10">25‑mile radius</span>
            <span className="px-3 py-1 rounded-full bg-white/10">NNA Certified & Insured</span>
          </div>

          <div className="bg-white/5 backdrop-blur rounded-2xl p-4 md:p-5">
            <div className="flex gap-2 mb-3">
              <button
                aria-pressed={mode === "MOBILE"}
                className={`px-3 py-2 rounded-full text-sm ${mode === "MOBILE" ? "bg-white text-[#0F1419]" : "bg-white/10"}`}
                onClick={() => { setMode("MOBILE"); track("mode_toggled", { mode: "MOBILE" }) }}
              >
                Mobile
              </button>
              <button
                aria-pressed={mode === "RON"}
                className={`px-3 py-2 rounded-full text-sm ${mode === "RON" ? "bg-white text-[#0F1419]" : "bg-white/10"}`}
                onClick={() => { setMode("RON"); track("mode_toggled", { mode: "RON" }) }}
              >
                Online (RON)
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <input
                className="col-span-2 md:col-span-1 px-3 py-3 rounded-lg bg-white text-[#0F1419]"
                placeholder="ZIP"
                value={zip}
                onChange={(e) => setZip(e.target.value.replace(/[^0-9]/g, '').slice(0, 5))}
                onBlur={() => zip && track('zip_submit', { zip })}
                inputMode="numeric"
                maxLength={5}
              />
              <input
                className="col-span-2 md:col-span-1 px-3 py-3 rounded-lg bg-white text-[#0F1419]"
                placeholder="# of acts"
                value={acts}
                onChange={(e) => setActs(Math.max(1, parseInt(e.target.value || "1", 10)))}
                onBlur={() => track('acts_submit', { acts })}
                inputMode="numeric"
              />
              <Button onClick={getEstimate} className="col-span-2 md:col-span-2 bg-primary hover:bg-primary/90 h-12">
                {isLoading ? "Calculating..." : "Get Instant Estimate"}
              </Button>
            </div>

            {error && <p className="text-red-300 text-sm mt-3">{error}</p>}
            {estimate?.ok && (
              <div className="mt-4 flex items-center justify-between">
                <div className="text-white/80 text-sm">
                  {estimate.mode === "RON" ? (
                    <span>Online notarizations from ${estimate.total}</span>
                  ) : (
                    <span>
                      Est. total ${estimate.total} {estimate.miles != null && `(~${estimate.miles} mi)`}
                    </span>
                  )}
                </div>
                <Link
                  href={`/booking?mode=${estimate.mode}&zip=${zip}&acts=${acts}&est=${estimate.total ?? ''}`}
                  className="inline-flex"
                >
                  <Button className="bg-white text-[#0F1419] hover:bg-white/90 h-12 px-6" onClick={() => track('booking_started', { mode: estimate.mode, amount: estimate.total ?? 0 })}>{ctaText({ fallback: 'Book Same‑Day' })}</Button>
                </Link>
              </div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <Link href="/booking" className="inline-flex">
              <Button className="bg-primary text-white h-12 px-6" onClick={() => track('cta_click', { cta_name: ctaText(), location: 'hero' })}>{ctaText()}</Button>
            </Link>
            <a
              href={`tel:${getBusinessTel()}`}
              className="inline-flex"
              onClick={() => track('call_click', { location: 'hero', phone: getBusinessPhoneFormatted() })}
            >
              <Button variant="outline" className="h-12 px-6 bg-white/10 text-white border-white/30 hover:bg-white/20">
                Call {getBusinessPhoneFormatted()}
              </Button>
            </a>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-white/80">
            <span className="px-2 py-1 rounded bg-white/10">NNA Certified</span>
            <span className="px-2 py-1 rounded bg-white/10">Bonded & Insured</span>
            <span className="px-2 py-1 rounded bg-white/10">On‑time or we discount</span>
          </div>
        </div>

        <div className="hidden md:block" />
      </div>
    </section>
  )
}


