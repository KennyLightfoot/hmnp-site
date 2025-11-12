import Link from "next/link"
import SameDaySlotCounter from "@/components/urgency/same-day-slot-counter"
import ServiceSchema from "@/components/schema/ServiceSchema"

export const metadata = {
  title: "Remote Online Notarization in Texas – Often 15–30 Minutes | From $35",
  description: "Upload. Verify. Notarized — often in 15–30 minutes. Built on Proof.com. Texas‑compliant RON with credential analysis, KBA, and recording.",
}

export const dynamic = "force-static"

export default function RonInstantPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-gradient-to-r from-secondary to-secondary text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl">
            <div className="inline-block bg-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              24/7 Remote Online Notarization (Texas)
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Upload. Verify. Notarized — often in 15–30 minutes.
            </h1>
            <p className="mt-4 text-lg text-gray-100">
              Built on Proof.com. From $35 online. Texas‑compliant with credential analysis, KBA, and recording.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 items-center">
              <Link href="/ron/dashboard" className="inline-flex items-center justify-center bg-primary hover:bg-primary/90 text-white rounded-md px-5 py-3">
                Start RON Now
              </Link>
              <span className="text-sm text-gray-200">Avg completion: 30–45 min</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-sm text-gray-100/90">
              <span className="inline-flex items-center rounded-full bg-white/10 border border-white/20 px-3 py-1">Credential analysis</span>
              <span className="inline-flex items-center rounded-full bg-white/10 border border-white/20 px-3 py-1">KBA</span>
              <span className="inline-flex items-center rounded-full bg-white/10 border border-white/20 px-3 py-1">AV recording</span>
              <span className="inline-flex items-center rounded-full bg-white/10 border border-white/20 px-3 py-1">Transparent pricing</span>
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
              <h3 className="text-lg font-semibold text-secondary mb-2">What you get</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• Session + first notarial included</li>
                <li>• Up to 10 documents</li>
                <li>• Downloadable recording</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-secondary mb-2">Service standards</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• Flexible rescheduling with ≥4 hours’ notice</li>
                <li>• Live support during service hours</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-secondary mb-2">Pricing</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• From $35 (session + first notarial)</li>
                <li>• $5 per additional seal</li>
                <li>• After 9pm convenience fee may apply</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="py-12 border-t">
          <div className="container mx-auto px-4">
            <h3 className="text-2xl font-semibold text-secondary mb-6">How it works</h3>
            <div className="grid md:grid-cols-3 gap-6 text-gray-700 text-sm">
              <div>
                <div className="font-medium mb-1">1) Upload & verify</div>
                <p>Upload documents, complete ID check and KBA in the secure Proof.com flow.</p>
              </div>
              <div>
                <div className="font-medium mb-1">2) Join session</div>
                <p>Meet your notary in a recorded video session. We guide you through signing.</p>
              </div>
              <div>
                <div className="font-medium mb-1">3) Download & done</div>
                <p>Receive your notarized docs and session recording. Need another seal? Add it in seconds.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 border-t">
          <div className="container mx-auto px-4">
            <h3 className="text-2xl font-semibold text-secondary mb-6">What customers say</h3>
            <div className="grid md:grid-cols-3 gap-6 text-sm text-gray-700">
              <div className="rounded-lg border p-4">“Booked at 10pm—done by 10:25. Super easy.”</div>
              <div className="rounded-lg border p-4">“Clear pricing and a recorded session for our records.”</div>
              <div className="rounded-lg border p-4">“ID check was quick, notary was professional and friendly.”</div>
            </div>
          </div>
        </section>

        <section className="py-12 border-t">
          <div className="container mx-auto px-4">
            <h3 className="text-2xl font-semibold text-secondary mb-6">In‑product screenshots</h3>
            <div className="grid md:grid-cols-3 gap-6 text-sm text-gray-700">
              <img src="/screenshots/booking.svg" alt="Booking flow" className="border rounded-lg" loading="lazy" decoding="async" />
              <img src="/screenshots/verification.svg" alt="Verification flow" className="border rounded-lg" loading="lazy" decoding="async" />
              <img src="/screenshots/session.svg" alt="RON session" className="border rounded-lg" loading="lazy" decoding="async" />
            </div>
          </div>
        </section>

        <section className="py-12 border-t">
          <div className="container mx-auto px-4">
            <h3 className="text-2xl font-semibold text-secondary mb-6">FAQ</h3>
            <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-700">
              <div>
                <div className="font-medium mb-1">What IDs are accepted?</div>
                <p>Valid, unexpired government‑issued photo ID. RON requires credential analysis + KBA.</p>
              </div>
              <div>
                <div className="font-medium mb-1">How fast can you start?</div>
                <p>Most RON sessions begin within 15–30 minutes, depending on demand.</p>
              </div>
              <div>
                <div className="font-medium mb-1">Can you provide witnesses?</div>
                <p>Yes, when arranged in advance; otherwise, bring your own witnesses as required by your document.</p>
              </div>
              <div>
                <div className="font-medium mb-1">What if something goes wrong?</div>
                <p>We’ll help you re‑connect and get it finished. Flexible rescheduling is available with ≥4 hours’ notice.</p>
              </div>
            </div>
          </div>
        </section>

        <ServiceSchema
          serviceName="Remote Online Notarization (RON)"
          description="Texas‑compliant RON with credential analysis, KBA, and recording. Built on Proof.com."
          price="$35"
          serviceType="ProfessionalService"
          serviceUrl="/lp/ron-instant"
          areaServed={["Texas"]}
          features={["Credential analysis", "KBA", "AV Recording", "Up to 10 docs"]}
          additionalInfo={{ isOnlineService: true }}
        />
      </main>
    </div>
  )
}



