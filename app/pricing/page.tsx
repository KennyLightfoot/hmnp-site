import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing | Houston Mobile Notary Pros',
  description: 'Transparent pricing: mobile, online (RON), and loan signing. Travel up to 25 miles included.',
}

export default function PricingPage() {
  return (
    <main>
      <section className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-secondary mb-2">Transparent Pricing</h1>
        <p className="text-secondary/70 mb-6">Clear, upfront pricing. Travel up to 25 miles included.</p>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="rounded-xl border p-6 bg-white">
            <h2 className="font-semibold text-secondary mb-2">Standard Notary</h2>
            <p className="text-sm text-secondary/70">First seal $10, each additional $10</p>
            <p className="text-sm text-secondary/70">Evenings/weekends +$25</p>
          </div>
          <div className="rounded-xl border p-6 bg-white">
            <h2 className="font-semibold text-secondary mb-2">Mobile Service</h2>
            <p className="text-sm text-secondary/70">Travel up to 25 miles — Included</p>
            <p className="text-sm text-secondary/70">Extended radius quoted instantly</p>
          </div>
          <div className="rounded-xl border p-6 bg-white">
            <h2 className="font-semibold text-secondary mb-2">Loan Signing</h2>
            <p className="text-sm text-secondary/70">From $125 package</p>
            <p className="text-sm text-secondary/70">Scanbacks by request</p>
          </div>
        </div>
        <p className="text-xs text-secondary/60 mt-4">Final price depends on distance, time, and document count. Get an instant estimate on the homepage or in booking.</p>
      </section>
    </main>
  )
}


