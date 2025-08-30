import Link from "next/link"
import SameDaySlotCounter from "@/components/urgency/same-day-slot-counter"
import ServiceSchema from "@/components/schema/ServiceSchema"

export const metadata = {
  title: "Priority Mobile Notary – 60–120 Minutes In‑Zone | From $125",
  description: "Mobile notary to you in 60–120 minutes (priority) — from $125. 30‑mile included, 7–21 daily. Same‑day windows with accurate travel tiers.",
}

export const dynamic = "force-static"

export default function MobilePriorityPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-gradient-to-r from-secondary/95 to-secondary text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-3xl">
            <div className="inline-block bg-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              Priority Mobile Notary (Greater Houston)
            </div>
            <h1 className="text-4xl md:text-5xl font-serif tracking-tight leading-tight">
              Mobile notary to you in 60–120 minutes (priority) — from $125.
            </h1>
            <p className="mt-3 text-base md:text-lg text-gray-100">
              30‑mile included, 7–21 daily. Same‑day windows with accurate travel tiers.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 items-center">
              <Link href="/booking" className="inline-flex items-center justify-center bg-primary hover:bg-primary/90 text-white rounded-md px-5 py-3">
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
              <h3 className="text-lg font-semibold text-secondary mb-2">Inclusions</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• ≤4 docs, ≤2 signers</li>
                <li>• 30‑mile included (priority tier)</li>
                <li>• 60‑minute on‑site slot</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-secondary mb-2">Service standards</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• Flexible rescheduling with ≥4 hours’ notice</li>
                <li>• Live updates if timing shifts</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-secondary mb-2">Add‑ons</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• Extra docs/signers</li>
                <li>• Witnesses (arranged in advance)</li>
                <li>• After‑hours/weekend, extended travel tiers</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="py-12 border-t">
          <div className="container mx-auto px-4">
            <h3 className="text-2xl font-semibold text-secondary mb-6">Travel tiers</h3>
            <div className="text-sm text-gray-700">
              <ul className="list-disc ml-6 space-y-1">
                <li>0–20 miles: included (Standard)</li>
                <li>21–30 miles: +$25 (Priority includes 30)</li>
                <li>31–40 miles: +$45</li>
                <li>41–50 miles: +$65 (max range)</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="py-12 border-t">
          <div className="container mx-auto px-4">
            <h3 className="text-2xl font-semibold text-secondary mb-6">FAQ</h3>
            <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-700">
              <div>
                <div className="font-medium mb-1">How fast can you arrive?</div>
                <p>Priority windows target 60–120 minutes in‑zone, subject to traffic and demand.</p>
              </div>
              <div>
                <div className="font-medium mb-1">Do you cover my area?</div>
                <p>We service up to 50 miles from 77591, with included travel up to 30 miles on priority.</p>
              </div>
              <div>
                <div className="font-medium mb-1">Can you provide witnesses?</div>
                <p>Yes, when arranged in advance; otherwise, customers provide witnesses if required.</p>
              </div>
              <div>
                <div className="font-medium mb-1">What if I need to reschedule?</div>
                <p>Flexible rescheduling with ≥4 hours’ notice. After‑hours/weekend surcharges may apply.</p>
              </div>
            </div>
          </div>
        </section>

        <ServiceSchema
          serviceName="Priority Mobile Notary"
          description="Priority mobile notary with 60–120 minute arrival windows in‑zone. Clear travel tiers and add‑ons."
          price="$125"
          serviceType="ProfessionalService"
          serviceUrl="/lp/mobile-priority"
          areaServed={["Houston, TX", "Greater Houston Area"]}
          features={["30‑mile included", "Priority windows", "Witness add‑on"]}
        />
      </main>
    </div>
  )
}



