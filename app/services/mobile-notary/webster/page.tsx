import type { Metadata } from 'next'
import EstimatorStrip from '@/components/EstimatorStrip'
import Script from 'next/script'

export const metadata: Metadata = {
  title: 'Mobile Notary Webster TX | Same‑Day Near 77598 | HMNP',
  description: 'Same‑day mobile notary in Webster (77598) and Clear Lake area. From $75, transparent travel tiers, NNA certified & insured. On‑time or we discount.',
}

export default function WebsterMobileNotaryPage() {
  return (
    <div className="min-h-screen bg-white">
      <Script id="ld-localbusiness-webster" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "name": "Houston Mobile Notary Pros",
          "image": `${process.env.NEXT_PUBLIC_BASE_URL || ''}/logo.png`,
          "telephone": "+18326174285",
          "priceRange": "$$",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Webster",
            "addressRegion": "TX",
            "postalCode": "77598",
            "addressCountry": "US"
          },
          "geo": { "@type": "GeoCoordinates", "latitude": 29.5377, "longitude": -95.1183 },
          "areaServed": [
            "Webster", "Clear Lake", "League City", "Nassau Bay"
          ],
          "knowsAbout": [
            "Houston Methodist Clear Lake Hospital", "HCA Houston Healthcare Clear Lake", "NASA Johnson Space Center"
          ]
        })}
      </Script>
      <section className="bg-secondary text-white">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <h1 className="text-3xl md:text-5xl font-bold">Mobile Notary in Webster — Book Today</h1>
          <p className="mt-3 text-white/90">From $75 • 25‑mile radius • NNA certified • On‑time or we discount</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="bg-white/10 border border-white/20 rounded-full px-3 py-1">Same‑day windows</span>
            <span className="bg-white/10 border border-white/20 rounded-full px-3 py-1">Transparent pricing</span>
            <span className="bg-white/10 border border-white/20 rounded-full px-3 py-1">Webster • Clear Lake</span>
            <span className="bg-white/10 border border-white/20 rounded-full px-3 py-1">NNA Certified</span>
          </div>
        </div>
      </section>
      <section className="container mx-auto px-4 -mt-6">
        <EstimatorStrip defaultMode="MOBILE" />
      </section>

      {/* Hospital Bedside Notarization (Webster) */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-bold text-[#002147] mb-4">Hospital Bedside Notarization — Webster & Clear Lake</h2>
          <p className="text-gray-700 mb-4">
            We regularly serve families and patients at nearby hospitals with compassionate, on‑time bedside notarization.
            Our process is HIPAA‑aware and coordinated around unit policies and visiting hours.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-5 border rounded-xl">
              <h3 className="font-semibold mb-2">Hospitals We Serve</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Houston Methodist Clear Lake Hospital (Webster)</li>
                <li>• HCA Houston Healthcare Clear Lake</li>
                <li>• Nearby rehab and long‑term care facilities</li>
              </ul>
            </div>
            <div className="p-5 border rounded-xl">
              <h3 className="font-semibold mb-2">Common Medical Documents</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Medical Power of Attorney</li>
                <li>• HIPAA authorization</li>
                <li>• Advanced directives / living will</li>
                <li>• General POA and acknowledgments</li>
              </ul>
            </div>
          </div>
          <div className="mt-6 grid md:grid-cols-2 gap-6">
            <div className="p-5 border rounded-xl">
              <h3 className="font-semibold mb-2">What To Bring</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Patient’s valid ID (or acceptable alternative per Texas rules)</li>
                <li>• Your ID if you’re signing too</li>
                <li>• Original documents (unstapled if possible)</li>
                <li>• Witnesses if required by the form (we can advise)</li>
              </ul>
            </div>
            <div className="p-5 border rounded-xl">
              <h3 className="font-semibold mb-2">How It Works</h3>
              <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                <li>Call or book with the unit/room number if possible</li>
                <li>We confirm ID/witness needs and ETA</li>
                <li>Bedside notarization with minimal disruption</li>
                <li>Receipt provided; scanbacks available on request</li>
              </ol>
            </div>
          </div>
          <p className="mt-6 text-sm text-gray-600">Urgent need? Call now: <a className="underline" href={`tel:${require('@/lib/phone').getBusinessTel()}`}>{require('@/lib/phone').getBusinessPhoneFormatted()}</a></p>
        </div>
      </section>

      {/* Space Center & Contractors */}
      <section className="container mx-auto px-4 pb-12">
        <div className="max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-bold text-[#002147] mb-4">Space Center Houston & NASA Contractors</h2>
          <p className="text-gray-700 mb-4">
            We support Space Center Houston visitors and Johnson Space Center contractors with fast on‑site notarization
            for employment, vendor, and travel paperwork.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-5 border rounded-xl">
              <h3 className="font-semibold mb-2">Typical Needs</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• I‑9 / onboarding affidavits</li>
                <li>• Vendor / contractor forms</li>
                <li>• Travel consent letters</li>
              </ul>
            </div>
            <div className="p-5 border rounded-xl">
              <h3 className="font-semibold mb-2">Where We Meet</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Space Center Houston public areas</li>
                <li>• Near JSC gates (public side)</li>
                <li>• Offices and nearby cafes</li>
              </ul>
            </div>
            <div className="p-5 border rounded-xl">
              <h3 className="font-semibold mb-2">Timing</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Same‑day windows available</li>
                <li>• Clear ETAs and text updates</li>
                <li>• Scanbacks available</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}


