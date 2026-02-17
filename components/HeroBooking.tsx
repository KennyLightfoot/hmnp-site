"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
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
  const [phone, setPhone] = useState("")
  const [sending, setSending] = useState(false)
  const [sendMsg, setSendMsg] = useState<string | null>(null)
  const [pricingOpen, setPricingOpen] = useState(false)

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

  // We no longer surface a specific "earliest arrival" time in the hero.
  useEffect(() => { setEta(null) }, [mode])

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
          <p className="text-white/80 mb-2">Typically within 1–2 hours.</p>
          <p className="text-white/80 mb-2">Same‑day, 20–30 mi included.</p>
          <p className="text-white/80 mb-6">
            From $85 • No hidden fees. {" "}
            <Dialog open={pricingOpen} onOpenChange={setPricingOpen}>
              <DialogTrigger asChild>
                <button className="underline underline-offset-4 hover:text-white" onClick={() => track('cta_click', { cta_name: 'See full pricing', location: 'hero' })}>See full pricing</button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Transparent Pricing</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 text-sm text-[#0F1419]">
                  <div className="flex items-center justify-between"><span>Mobile notarization (first seal)</span><span>$10</span></div>
                  <div className="flex items-center justify-between"><span>Each additional seal</span><span>$10</span></div>
                  <div className="flex items-center justify-between"><span>Travel up to 20 miles</span><span>Included</span></div>
                  <div className="flex items-center justify-between"><span>Evenings/weekends</span><span>+$25</span></div>
                  <div className="flex items-center justify-between"><span>Loan signing (package)</span><span>From $125</span></div>
                  <p className="text-xs text-[#0F1419]/70">Final price depends on distance, time, and document count. You’ll see your estimate instantly.</p>
                </div>
              </DialogContent>
            </Dialog>
          </p>
          <div className="flex flex-wrap gap-3 text-sm text-white/70 mb-8">
            <span className="px-3 py-1 rounded-full bg-white/10">4.9★ Rated</span>
            <span className="px-3 py-1 rounded-full bg-white/10">500+ jobs</span>
            <span className="px-3 py-1 rounded-full bg-white/10">20‑mile radius</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="px-3 py-1 rounded-full bg-white/10 cursor-help">NNA Certified & Insured</span>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs text-xs">NNA certification means the notary completed background checks and training via the National Notary Association.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
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
                type="text"
                inputMode="numeric"
                maxLength={5}
                autoComplete="postal-code"
                enterKeyHint="next"
              />
              <input
                className="col-span-2 md:col-span-1 px-3 py-3 rounded-lg bg-white text-[#0F1419]"
                placeholder="# of acts"
                value={acts}
                onChange={(e) => setActs(Math.max(1, parseInt(e.target.value || "1", 10)))}
                onBlur={() => track('acts_submit', { acts })}
                type="number"
                inputMode="numeric"
                autoComplete="off"
                enterKeyHint="next"
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
          <div className="flex flex-col sm:flex-row gap-3 mt-4 items-start">
            <div className="text-sm text-white/80 order-2 sm:order-1">
              <span className="font-medium">Questions? Call or text</span>
              <span className="mx-1">•</span>
              <span>Open now</span>
            </div>
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
          <p className="mt-2 text-xs text-white/80">Trusted by 500+ neighbors.</p>
          <div className="mt-4 flex flex-col sm:flex-row gap-2 items-start sm:items-center">
            <input
              className="px-3 py-2 rounded-lg bg-white text-[#0F1419] placeholder:text-[#0F1419]/60 w-full sm:w-64"
              placeholder="Your mobile number"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/[^0-9+]/g, '').slice(0, 16))}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              enterKeyHint="send"
            />
            <Button
              className="h-10 px-4 bg-white text-[#0F1419] hover:bg-white/90"
              disabled={sending || phone.length < 10}
              onClick={async () => {
                try {
                  setSending(true)
                  setSendMsg(null)
                  const res = await fetch('/api/sms/send', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'x-api-key': process.env.NEXT_PUBLIC_SMS_API_KEY || ''
                    },
                    body: JSON.stringify({ to: phone, message: 'Here is your booking link: ' + (typeof window !== 'undefined' ? window.location.origin + '/booking' : 'https://houstonmobilenotarypros.com/booking') })
                  })
                  if (!res.ok) throw new Error('Failed to send')
                  track('sms_link_sent', { location: 'hero' })
                  setSendMsg('Sent! Check your phone for the link.')
                } catch {
                  setSendMsg('Could not send. Please call or try again.')
                } finally {
                  setSending(false)
                }
              }}
            >
              {sending ? 'Sending…' : 'Text me the booking link'}
            </Button>
          </div>
          {sendMsg && <p className="mt-1 text-xs text-white/80">{sendMsg}</p>}
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


