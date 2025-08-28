import Link from 'next/link'
import { Button } from '@/components/ui/button'
import PrefetchBooking from '@/components/PrefetchBooking'
import { getBusinessPhoneFormatted, getBusinessTel } from '@/lib/phone'
import EstimatorStrip from '@/components/EstimatorStrip'
import MicroTestimonials from '@/components/MicroTestimonials'

export default function MobileNotaryLP() {
  const phone = getBusinessPhoneFormatted()
  const tel = getBusinessTel()
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-secondary text-white">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-5xl font-bold">Mobile Notary Near You — Book in Minutes</h1>
            <p className="mt-3 text-white/90">From $75 • Transparent travel tiers • 25‑mile radius • NNA & insured • On‑time or we discount</p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link href="/booking?serviceType=STANDARD_NOTARY" className="inline-flex">
                <Button className="bg-white text-secondary hover:bg-white/90 h-12 px-6">Book Mobile Notary</Button>
              </Link>
              <a href={`tel:${tel}`} className="inline-flex">
                <Button variant="outline" className="h-12 px-6 border-white/30 text-white hover:bg-white/10">Call {phone}</Button>
              </a>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className="bg-white/10 border border-white/20 rounded-full px-3 py-1">Same‑day windows</span>
              <span className="bg-white/10 border border-white/20 rounded-full px-3 py-1">Transparent pricing</span>
              <span className="bg_white/10 border border-white/20 rounded-full px-3 py-1">25‑mile radius</span>
              <span className="bg-white/10 border border-white/20 rounded-full px-3 py-1">NNA Certified</span>
            </div>
          </div>
        </div>
      </section>
      <section className="container mx-auto px-4 -mt-6">
        <EstimatorStrip defaultMode="MOBILE" />
      </section>
      <MicroTestimonials />
      <PrefetchBooking />
      <section className="container mx-auto px-4 py-10">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-5 border rounded-xl">
            <h3 className="font-semibold">Service Area</h3>
            <p className="text-sm text-black/70">We serve Greater Houston with standard 25‑mile radius from 77591. Clear travel tiers beyond.</p>
          </div>
          <div className="p-5 border rounded-xl">
            <h3 className="font-semibold">Pricing</h3>
            <p className="text-sm text-black/70">From $75 plus travel. Multi‑doc discounts available.</p>
          </div>
          <div className="p-5 border rounded-xl">
            <h3 className="font-semibold">Trust</h3>
            <p className="text-sm text-black/70">Licensed, insured, 4.9★ rated. On‑time guarantee or we discount.</p>
          </div>
        </div>
      </section>
    </div>
  )
}



