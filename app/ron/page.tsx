import type { Metadata } from "next"
import { RONOnboardingFlow } from "@/components/ron/ron-onboarding-flow"

export const metadata: Metadata = {
  title: "Remote Online Notarization | Houston Mobile Notary Pros",
  description:
    "Secure 24/7 remote notarization services. Get documents notarized from anywhere with our Texas-compliant RON platform.",
}

export default function RONPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Remote Online Notarization</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Get your documents notarized securely from anywhere, 24/7. Our Texas-compliant RON platform provides
              convenient, legally binding remote notarization services.
            </p>
          </div>

          <RONOnboardingFlow />
        </div>
      </div>
    </div>
  )
}
