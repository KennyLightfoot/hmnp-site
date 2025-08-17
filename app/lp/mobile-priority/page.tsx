import Link from "next/link"
import SameDaySlotCounter from "@/components/urgency/same-day-slot-counter"

export const dynamic = "force-static"

export default function MobilePriorityPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-gradient-to-r from-[#002147] to-[#004080] text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl">
            <div className="inline-block bg-[#A52A2A] px-4 py-2 rounded-full text-sm font-medium mb-6">
              Priority Mobile Notary (Greater Houston)
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Mobile notary to you in 60–120 minutes (priority) — from $125.
            </h1>
            <p className="mt-4 text-lg text-gray-100">
              30‑mile included, 7–21 daily. Same‑day windows with accurate travel tiers.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 items-center">
              <Link href="/booking" className="inline-flex items-center justify-center bg-[#A52A2A] hover:bg-[#8B0000] text-white rounded-md px-5 py-3">
                Book Mobile Now
              </Link>
              <span className="text-sm text-gray-200">Average same‑day: 2–4 hours</span>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="py-10 border-b">
          <div className="container mx-auto px-4 flex flex-wrap items-center gap-4">
            <div className="text-sm text-gray-700">20–30 mi included • After‑hours/weekend surcharges apply</div>
            <div className="flex-1"></div>
            <SameDaySlotCounter serviceType="EXTENDED_HOURS" className="bg-gray-100" refreshMs={90000} />
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4 grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-[#002147] mb-2">Inclusions</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• ≤4 docs, ≤2 signers</li>
                <li>• 30‑mile included (priority tier)</li>
                <li>• 60‑minute on‑site slot</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#002147] mb-2">Guarantees</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• Missed arrival window &gt;15 min? $25 credit/waived rush</li>
                <li>• Re‑booking with ≥4 hours’ notice — no fee</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#002147] mb-2">Add‑ons</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• Extra docs/signers</li>
                <li>• Witnesses (arranged in advance)</li>
                <li>• After‑hours/weekend, extended travel tiers</li>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}



