import Link from "next/link"
import SameDaySlotCounter from "@/components/urgency/same-day-slot-counter"

export const dynamic = "force-static"

export default function RonInstantPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-gradient-to-r from-[#002147] to-[#003366] text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl">
            <div className="inline-block bg-[#A52A2A] px-4 py-2 rounded-full text-sm font-medium mb-6">
              24/7 Remote Online Notarization (Texas)
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Notarized online in 15–30 minutes — from $35.
            </h1>
            <p className="mt-4 text-lg text-gray-100">
              Texas‑compliant RON with credential analysis, KBA, and recording. Up to 10 docs included.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 items-center">
              <Link href="/ron/dashboard" className="inline-flex items-center justify-center bg-[#A52A2A] hover:bg-[#8B0000] text-white rounded-md px-5 py-3">
                Start RON Now
              </Link>
              <span className="text-sm text-gray-200">Avg completion: 30–45 min</span>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="py-10 border-b">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="text-sm text-gray-700">Texas‑compliant • Credential analysis • KBA • AV Recording</div>
              <div className="flex-1"></div>
              <SameDaySlotCounter serviceType="RON_SERVICES" className="bg-gray-100" refreshMs={90000} />
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4 grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-[#002147] mb-2">What you get</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• Session + first notarial included</li>
                <li>• Up to 10 documents</li>
                <li>• Downloadable recording</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#002147] mb-2">Guarantees</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• Platform error? We re‑do it free</li>
                <li>• Refunds with ≥4 hours’ notice</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#002147] mb-2">Pricing</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• From $35 (session + first notarial)</li>
                <li>• $5 per additional seal</li>
                <li>• After 9pm convenience fee may apply</li>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}



