import Link from 'next/link'
import { Button } from '@/components/ui/button'
import PrefetchBooking from '@/components/PrefetchBooking'
import { getBusinessPhoneFormatted, getBusinessTel } from '@/lib/phone'
import EstimatorStrip from '@/components/EstimatorStrip'
import MicroTestimonials from '@/components/MicroTestimonials'

export default function RonLP() {
  const phone = getBusinessPhoneFormatted()
  const tel = getBusinessTel()
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-r from-secondary/95 to-secondary text-white">
        <div className="container mx-auto px-4 py-16 md:py-20">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-serif tracking-tight">Remote Online Notarization (RON) — Secure & Fast</h1>
            <p className="mt-3 text-base md:text-lg text-white/90">From $35 • Same‑day slots • NNA & insured • Works on desktop/mobile</p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link href="/booking?serviceType=RON_SERVICES" className="inline-flex">
                <Button className="bg-white text-secondary hover:bg-white/90 h-12 px-6">Start Online Notary</Button>
              </Link>
              <a href={`tel:${tel}`} className="inline-flex">
                <Button variant="outline" className="h-12 px-6 border-white/30 text-white hover:bg-white/10">Call {phone}</Button>
              </a>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className="bg-white/10 border border-white/20 rounded-full px-3 py-1">Secure video session</span>
              <span className="bg-white/10 border border-white/20 rounded-full px-3 py-1">ID verification</span>
              <span className="bg-white/10 border border-white/20 rounded-full px-3 py-1">Fast turnaround</span>
            </div>
          </div>
        </div>
      </section>
      <section className="container mx-auto px-4 -mt-8">
        <EstimatorStrip defaultMode="RON" />
      </section>
      <MicroTestimonials />
      <PrefetchBooking />
      <section className="container mx-auto px-4 py-14">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-5 border rounded-xl shadow">
            <h3 className="font-semibold">What You Need</h3>
            <p className="text-sm text-black/70">Valid ID, stable internet, and a device with a camera.</p>
          </div>
          <div className="p-5 border rounded-xl shadow">
            <h3 className="font-semibold">Pricing</h3>
            <p className="text-sm text-black/70">From $35. Additional signers/pages priced clearly.</p>
          </div>
          <div className="p-5 border rounded-xl shadow">
            <h3 className="font-semibold">Trusted</h3>
            <p className="text-sm text-black/70">NNA‑certified, compliant, and insured. 4.9★ rated service.</p>
          </div>
        </div>
      </section>
    </div>
  )
}



