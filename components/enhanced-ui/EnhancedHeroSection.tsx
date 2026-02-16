'use client'

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, useScroll, useTransform } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { track } from "@/app/lib/analytics"
import { useVariant } from "@/app/lib/abTesting"
import { getBusinessTel, getBusinessPhoneFormatted } from "@/lib/phone"
import { Phone, Sparkles, Zap, Shield, Star, Clock } from "lucide-react"

// Enhanced UI Components
import AnimatedBackground from "./AnimatedBackground"
import InteractiveButton from "./InteractiveButton"
import TrustBadgeCarousel from "./TrustBadgeCarousel"
import EnhancedPricingCalculator from "./EnhancedPricingCalculator"

type EstimateResponse = {
  ok: boolean
  mode: "MOBILE" | "RON"
  miles?: number
  breakdown?: { label: string; amount: number; qty?: number }[]
  total?: number
  error?: string
}

export default function EnhancedHeroSection() {
  const [zip, setZip] = useState("")
  const [mode, setMode] = useState<"MOBILE" | "RON">("MOBILE")
  const [acts, setActs] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [estimate, setEstimate] = useState<EstimateResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [phone, setPhone] = useState("")
  const [sending, setSending] = useState(false)
  const [sendMsg, setSendMsg] = useState<string | null>(null)
  const [pricingOpen, setPricingOpen] = useState(false)
  const [showAdvancedCalc, setShowAdvancedCalc] = useState(false)

  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 300], [0, -50])
  const y2 = useTransform(scrollY, [0, 300], [0, -100])

  useEffect(() => {
    track("enhanced_hero_viewed")
  }, [])

  const headlineVariant = useVariant('heroHeadline', 'A')
  const headlines = {
    A: "Mobile Notary Near You Today",
    B: "Same‑Day Mobile Notary — We Come To You",
  }
  const currentHeadline = (headlines as any)[headlineVariant] || headlines.A
  const ctaVariant = useVariant('heroCta', 'A')
  const ctaText = ({ fallback = 'Book Same‑Day' }: { fallback?: string } = {}) => ({ A: 'Book Same‑Day', B: 'Book Now' } as const)[(ctaVariant as 'A' | 'B')] || fallback

  // Prefill zip/acts from localStorage
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

  async function getEstimate() {
    try {
      setIsLoading(true)
      setError(null)
      setEstimate(null)
      track("enhanced_estimate_requested", { mode, zip, acts })
      const res = await fetch("/api/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, zip, acts }),
      })
      const data: EstimateResponse = await res.json()
      if (!data.ok) throw new Error(data.error || "Unable to calculate estimate")
      setEstimate(data)
      track("enhanced_estimate_shown", {
        mode: data.mode,
        amount: data.total ?? 0,
        acts,
      })
    } catch (e) {
      const message = (e as Error).message
      setError(message)
      track("enhanced_estimate_error", { message })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="relative min-h-screen bg-secondary text-white overflow-hidden">
      {/* Enhanced Background with Parallax */}
      <div className="absolute inset-0 -z-10">
        <AnimatedBackground />
        <motion.div 
          className="relative w-full h-full"
          style={{ y: y1 }}
        >
          <Image
            src="/hero-background.jpg"
            alt="Houston Mobile Notary Pros"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-secondary/90 via-secondary/70 to-secondary/90" />
        </motion.div>
      </div>

      <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          {/* Left Column - Enhanced Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ y: y2 }}
          >
            {/* Animated Headline */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <motion.h1 
                className="text-4xl md:text-6xl lg:text-7xl font-serif mb-4 leading-tight"
                initial={{ backgroundPosition: "200% center" }}
                animate={{ backgroundPosition: "0% center" }}
                transition={{ duration: 2, ease: "easeOut" }}
                style={{
                  background: 'linear-gradient(90deg, #ffffff 0%, #A52A2A 50%, #ffffff 100%)',
                  backgroundSize: '200% 100%',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {currentHeadline}
              </motion.h1>
            </motion.div>

            {/* Enhanced Feature Points */}
            <motion.div
              className="space-y-3 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              {[
                { icon: Clock, text: "Typically within 1–2 hours", color: "text-green-400" },
                { icon: Zap, text: "Same‑day, 20–30 mi included", color: "text-blue-400" },
                { icon: Shield, text: "From $75 • No hidden fees", color: "text-yellow-400" }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <item.icon className={`h-5 w-5 ${item.color}`} />
                  <p className="text-white/90 text-lg">{item.text}</p>
                </motion.div>
              ))}
              
              <Dialog open={pricingOpen} onOpenChange={setPricingOpen}>
                <DialogTrigger asChild>
                  <motion.button 
                    className="text-primary underline underline-offset-4 hover:text-white transition-colors"
                    onClick={() => track('enhanced_cta_click', { cta_name: 'See full pricing', location: 'hero' })}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Sparkles className="inline h-4 w-4 mr-1" />
                    See full pricing breakdown
                  </motion.button>
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
                    <p className="text-xs text-[#0F1419]/70">Final price depends on distance, time, and document count. You'll see your estimate instantly.</p>
                  </div>
                </DialogContent>
              </Dialog>
            </motion.div>

            {/* Enhanced Trust Badges */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="mb-8"
            >
              <TrustBadgeCarousel />
            </motion.div>

            {/* Enhanced Quick Estimate Form */}
            <motion.div
              className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <div className="flex gap-2 mb-4">
                <motion.button
                  aria-pressed={mode === "MOBILE"}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    mode === "MOBILE" 
                      ? "bg-white text-[#0F1419] shadow-lg" 
                      : "bg-white/10 hover:bg-white/20"
                  }`}
                  onClick={() => { setMode("MOBILE"); track("enhanced_mode_toggled", { mode: "MOBILE" }) }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  📍 Mobile
                </motion.button>
                <motion.button
                  aria-pressed={mode === "RON"}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    mode === "RON" 
                      ? "bg-white text-[#0F1419] shadow-lg" 
                      : "bg-white/10 hover:bg-white/20"
                  }`}
                  onClick={() => { setMode("RON"); track("enhanced_mode_toggled", { mode: "RON" }) }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  💻 Online (RON)
                </motion.button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <motion.input
                  className="col-span-2 md:col-span-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                  placeholder="ZIP"
                  value={zip}
                  onChange={(e) => setZip(e.target.value.replace(/[^0-9]/g, '').slice(0, 5))}
                  onBlur={() => zip && track('enhanced_zip_submit', { zip })}
                  inputMode="numeric"
                  maxLength={5}
                  whileFocus={{ scale: 1.02 }}
                />
                <motion.input
                  className="col-span-2 md:col-span-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                  placeholder="# of acts"
                  value={acts}
                  onChange={(e) => setActs(Math.max(1, parseInt(e.target.value || "1", 10)))}
                  onBlur={() => track('enhanced_acts_submit', { acts })}
                  inputMode="numeric"
                  whileFocus={{ scale: 1.02 }}
                />
                <InteractiveButton 
                  onClick={getEstimate} 
                  variant="primary"
                  size="lg"
                  className="col-span-2 md:col-span-2"
                  glow
                  ripple
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="h-5 w-5" />
                    </motion.div>
                  ) : (
                    "Get Instant Estimate"
                  )}
                </InteractiveButton>
              </div>

              {error && (
                <motion.p 
                  className="text-red-300 text-sm mb-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {error}
                </motion.p>
              )}

              {estimate?.ok && (
                <motion.div 
                  className="bg-white/10 rounded-lg p-4 mb-4"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-white/80 text-sm">
                      {estimate.mode === "RON" ? (
                        <span>Online notarizations from ${estimate.total}</span>
                      ) : (
                        <span>
                          Estimated total ${estimate.total} {estimate.miles != null && `(~${estimate.miles} mi)`}
                        </span>
                      )}
                    </div>
                    <Link
                      href={`/booking?mode=${estimate.mode}&zip=${zip}&acts=${acts}&est=${estimate.total ?? ''}`}
                      className="inline-flex"
                    >
                      <InteractiveButton 
                        size="md"
                        variant="secondary"
                        glow
                        onClick={() => track('enhanced_booking_started', { mode: estimate.mode, amount: estimate.total ?? 0 })}
                      >
                        {ctaText({ fallback: 'Book Same‑Day' })}
                      </InteractiveButton>
                    </Link>
                  </div>
                  <p className="mt-2 text-xs text-white/70">
                    Transparent pricing: first 20–30 miles included by service; travel tiers apply beyond. Final price confirmed at booking.
                  </p>
                </motion.div>
              )}

              {/* Advanced Calculator Toggle */}
              <motion.button
                onClick={() => setShowAdvancedCalc(!showAdvancedCalc)}
                className="text-sm text-white/70 hover:text-white transition-colors flex items-center gap-1"
                whileHover={{ scale: 1.05 }}
              >
                <Sparkles className="h-4 w-4" />
                {showAdvancedCalc ? 'Hide' : 'Show'} Advanced Calculator
              </motion.button>
            </motion.div>

            {/* Main CTA Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
            >
              <Link href="/booking" className="flex-1">
                <InteractiveButton 
                  size="xl"
                  variant="primary"
                  className="w-full"
                  glow
                  pulse
                  onClick={() => track('enhanced_cta_click', { cta_name: ctaText(), location: 'hero' })}
                >
                  <Zap className="h-5 w-5" />
                  {ctaText()}
                </InteractiveButton>
              </Link>
              
              <a href={`tel:${getBusinessTel()}`} className="flex-1">
                <InteractiveButton
                  size="xl"
                  variant="outline"
                  className="w-full"
                  glow
                  onClick={() => track('enhanced_call_click', { location: 'hero', phone: getBusinessPhoneFormatted() })}
                >
                  <Phone className="h-5 w-5" />
                  Call {getBusinessPhoneFormatted()}
                </InteractiveButton>
              </a>
            </motion.div>

            {/* SMS Link Feature */}
            <motion.div 
              className="mt-6 flex flex-col sm:flex-row gap-2 items-start sm:items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
            >
              <input
                className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 w-full sm:w-64"
                placeholder="Your mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^0-9+]/g, '').slice(0, 16))}
                inputMode="tel"
              />
              <InteractiveButton
                size="md"
                variant="secondary"
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
                    track('enhanced_sms_link_sent', { location: 'hero' })
                    setSendMsg('Sent! Check your phone for the link.')
                  } catch {
                    setSendMsg('Could not send. Please call or try again.')
                  } finally {
                    setSending(false)
                  }
                }}
              >
                {sending ? 'Sending…' : 'Text me the booking link'}
              </InteractiveButton>
            </motion.div>
            
            {sendMsg && (
              <motion.p 
                className="mt-2 text-xs text-white/80"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {sendMsg}
              </motion.p>
            )}

            {/* Trust Indicators */}
            <motion.div 
              className="flex flex-wrap items-center gap-2 mt-4 text-xs text-white/80"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4, duration: 0.6 }}
            >
              <span className="px-2 py-1 rounded bg-white/10 flex items-center gap-1">
                <Shield className="h-3 w-3" />
                NNA Certified
              </span>
              <span className="px-2 py-1 rounded bg-white/10 flex items-center gap-1">
                <Star className="h-3 w-3" />
                Bonded & Insured
              </span>
              <span className="px-2 py-1 rounded bg-white/10 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                On‑time or we discount
              </span>
            </motion.div>
          </motion.div>

          {/* Right Column - Advanced Calculator (when toggled) */}
          <motion.div
            className="hidden lg:block"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {showAdvancedCalc && <EnhancedPricingCalculator />}
          </motion.div>
        </div>
      </div>

      {/* Floating Action Elements */}
      {/* Reduce floating motion to keep above-the-fold calm */}
      <div className="fixed bottom-6 right-6 z-50">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="w-14 h-14 bg-primary rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-105 transition-transform"
                onClick={() => setShowAdvancedCalc(!showAdvancedCalc)}
              >
                <Sparkles className="h-6 w-6" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Advanced Price Calculator</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </section>
  )
}

