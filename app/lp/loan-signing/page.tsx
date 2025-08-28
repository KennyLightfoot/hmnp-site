import Link from 'next/link'
import { Button } from '@/components/ui/button'
import PrefetchBooking from '@/components/PrefetchBooking'
import { getBusinessPhoneFormatted, getBusinessTel } from '@/lib/phone'
import EstimatorStrip from '@/components/EstimatorStrip'
import MicroTestimonials from '@/components/MicroTestimonials'

export default function LoanSigningLP() {
  const phone = getBusinessPhoneFormatted()
  const tel = getBusinessTel()
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-secondary text-white">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-5xl font-bold">Certified Loan Signing — On‑Time, NNA Certified</h1>
            <p className="mt-3 text-white/90">From $125 • Purchase, Refi, HELOC • Experienced, reliable, insured</p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link href="/booking?serviceType=LOAN_SIGNING" className="inline-flex">
                <Button className="bg-white text-secondary hover:bg-white/90 h-12 px-6">Book Loan Signing</Button>
              </Link>
              <a href={`tel:${tel}`} className="inline-flex">
                <Button variant="outline" className="h-12 px-6 border-white/30 text-white hover:bg-white/10">Call {phone}</Button>
              </a>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className="bg-white/10 border border-white/20 rounded-full px-3 py-1">NNA Certified</span>
              <span className="bg-white/10 border border-white/20 rounded-full px-3 py-1">Experienced signers</span>
              <span className="bg-white/10 border border-white/20 rounded-full px-3 py-1">On‑time guarantee</span>
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
            <h3 className="font-semibold">Coverage</h3>
            <p className="text-sm text-black/70">Greater Houston. We meet at homes, offices, or title companies.</p>
          </div>
          <div className="p-5 border rounded-xl">
            <h3 className="font-semibold">Pricing</h3>
            <p className="text-sm text-black/70">From $125. Clear pricing for travel and scanbacks if needed.</p>
          </div>
          <div className="p-5 border rounded-xl">
            <h3 className="font-semibold">Trusted</h3>
            <p className="text-sm text-black/70">Background‑checked, insured, and highly rated by clients.</p>
          </div>
        </div>
      </section>
    </div>
  )
}



