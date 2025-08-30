import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing | Houston Mobile Notary Pros',
  description: 'Transparent pricing: mobile, online (RON), and loan signing. Travel up to 25 miles included.',
}

export default function PricingPage() {
  return (
    <main>
      <section className="container mx-auto px-4 py-16">
        <h1 className="text-4xl md:text-5xl font-serif text-secondary tracking-tight mb-3">Transparent Pricing</h1>
        <p className="text-base text-secondary/70 mb-10">Clear, upfront pricing. First 20–30 miles included by service. Instant quote available.</p>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="rounded-xl border p-6 bg-white shadow">
            <h2 className="font-semibold text-secondary mb-2">Standard Notary</h2>
            <p className="text-sm text-secondary/70">First seal $10, each additional $10</p>
            <p className="text-sm text-secondary/70">Business hours • No hidden fees</p>
          </div>
          <div className="rounded-xl border p-6 bg-white shadow">
            <h2 className="font-semibold text-secondary mb-2">Mobile Service</h2>
            <p className="text-sm text-secondary/70">Travel up to 20–30 miles — Included</p>
            <p className="text-sm text-secondary/70">Tiered travel beyond included radius</p>
          </div>
          <div className="rounded-xl border p-6 bg-white shadow">
            <h2 className="font-semibold text-secondary mb-2">Loan Signing</h2>
            <p className="text-sm text-secondary/70">From $125 package</p>
            <p className="text-sm text-secondary/70">Evening/weekend availability</p>
          </div>
        </div>
        <p className="text-xs text-secondary/60 mt-4">Final price depends on distance, time, and document count. Get an instant estimate on the homepage or in booking.</p>
      </section>
    </main>
  )
}


