import type { Metadata } from "next"
import { PricingTable } from "@/components/pricing-table"
import { PricingFaq } from "@/components/pricing-faq"
import { PricingCalculator } from "@/components/pricing-calculator"
import { CTABanner } from "@/components/cta-banner"
import ClientMap from "@/components/client-map"

export const metadata: Metadata = {
  title: "Pricing | Houston Mobile Notary Pros",
  description:
    "Transparent pricing for all our mobile notary services in Houston. No hidden fees, just professional service at competitive rates.",
}

export default function PricingPage() {
  return (
    <main className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-oxfordBlue text-center mb-8">Notary Service Pricing</h1>

      <div className="max-w-3xl mx-auto mb-16">
        <p className="text-lg text-center mb-8">
          At Houston Mobile Notary Pros, we believe in transparent pricing with no hidden fees. Our rates are
          competitive and reflect our commitment to providing professional, reliable service.
        </p>

        <PricingTable />
      </div>

      <div className="max-w-4xl mx-auto mb-16">
        <h2 className="text-3xl font-bold text-oxfordBlue text-center mb-8">Pricing Calculator</h2>
        <PricingCalculator />
      </div>

      <div className="max-w-4xl mx-auto mb-16">
        <h2 className="text-3xl font-bold text-oxfordBlue text-center mb-8">Service Area</h2>
        <ClientMap />
      </div>

      <div className="max-w-3xl mx-auto mb-16">
        <h2 className="text-3xl font-bold text-oxfordBlue text-center mb-8">Frequently Asked Questions</h2>
        <PricingFaq />
      </div>

      <CTABanner
        title="Ready to Schedule a Notary Service?"
        description="Book an appointment or contact us for a custom quote."
        primaryButtonText="Book Now"
        primaryButtonHref="/booking"
        secondaryButtonText="Contact Us"
        secondaryButtonHref="/contact"
      />
      <p className="text-muted-foreground">
        Need help scheduling? Call us at (281) 779-8847 or{" "}
        <a href="/contact" className="text-auburn underline">
          contact us
        </a>{" "}
        for assistance.
      </p>
    </main>
  )
}

