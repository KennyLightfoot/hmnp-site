"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { track } from "@/app/lib/analytics"
import { useVariant } from "@/app/lib/abTesting"

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

  useEffect(() => {
    track("hero_viewed")
  }, [])

  const headlineVariant = useVariant('heroHeadline', 'A')
  const headlines = {
    A: "Houston Notary, On-Demand.",
    B: "On-Demand Notary in Houston.",
  }
  const currentHeadline = (headlines as any)[headlineVariant] || headlines.A

  async function getEstimate() {
    try {
      setIsLoading(true)
      setError(null)
      setEstimate(null)
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
      setError((e as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="bg-[#0F1419] text-white">
      <div className="container mx-auto px-4 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-serif mb-4">{currentHeadline}</h1>
          <p className="text-white/80 mb-6">
            Mobile to your door or online in minutes—transparent pricing.
          </p>
          <div className="flex flex-wrap gap-3 text-sm text-white/70 mb-8">
            <span className="px-3 py-1 rounded-full bg-white/10">NNA Certified</span>
            <span className="px-3 py-1 rounded-full bg-white/10">Bonded & Insured</span>
            <span className="px-3 py-1 rounded-full bg-white/10">24/7 Online</span>
            <span className="px-3 py-1 rounded-full bg-white/10">500+ served</span>
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
                inputMode="numeric"
                maxLength={5}
              />
              <input
                className="col-span-2 md:col-span-1 px-3 py-3 rounded-lg bg-white text-[#0F1419]"
                placeholder="# of acts"
                value={acts}
                onChange={(e) => setActs(Math.max(1, parseInt(e.target.value || "1", 10)))}
                inputMode="numeric"
              />
              <Button onClick={getEstimate} className="col-span-2 md:col-span-2 bg-[#A0522D] hover:bg-[#8d471f] h-12">
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
                  <Button className="bg-white text-[#0F1419] hover:bg-white/90 h-12 px-6" onClick={() => track('booking_started', { mode: estimate.mode, amount: estimate.total ?? 0 })}>Book Now</Button>
                </Link>
              </div>
            )}
          </div>

          <p className="text-xs text-white/60 mt-3">If we miss your window: $25 credit.</p>
        </div>

        <div className="hidden md:block" />
      </div>
    </section>
  )
}


