import type { Metadata } from "next"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FAQAccordion } from "@/components/faq-accordion"
import { CTABanner } from "@/components/cta-banner"
import { generalFaqs, loanSigningFaqs, corporateFaqs } from "@/data/faqs"
import { FaqSchema } from "@/components/faq-schema"

export const metadata: Metadata = {
  title: "Frequently Asked Questions | Houston Mobile Notary Pros",
  description:
    "Find answers to common questions about our mobile notary services, loan signing, and corporate services in Houston.",
  keywords: ["notary FAQ", "mobile notary questions", "loan signing FAQ", "notary services questions"],
  alternates: {
    canonical: "/faq",
  },
}

export default function FAQPage() {
  // Combine all FAQs for the schema
  const allFaqs = [...generalFaqs, ...loanSigningFaqs, ...corporateFaqs]

  return (
    <main className="container py-12 space-y-12">
      <FaqSchema faqs={allFaqs} />

      <div className="max-w-3xl mx-auto text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Frequently Asked Questions</h1>
        <p className="text-xl text-muted-foreground">
          Find answers to common questions about our mobile notary services.
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="loan">Loan Signing</TabsTrigger>
            <TabsTrigger value="corporate">Corporate Services</TabsTrigger>
          </TabsList>
          <TabsContent value="general" className="mt-6">
            <FAQAccordion
              faqs={generalFaqs}
              title="General Questions"
              description="Common questions about our mobile notary services"
            />
          </TabsContent>
          <TabsContent value="loan" className="mt-6">
            <FAQAccordion
              faqs={loanSigningFaqs}
              title="Loan Signing Questions"
              description="Information about our loan signing services"
            />
          </TabsContent>
          <TabsContent value="corporate" className="mt-6">
            <FAQAccordion
              faqs={corporateFaqs}
              title="Corporate Services Questions"
              description="Information about our services for businesses"
            />
          </TabsContent>
        </Tabs>
      </div>

      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-2xl font-semibold mb-4">Still Have Questions?</h2>
        <p className="text-muted-foreground mb-6">
          If you couldn't find the answer to your question, please don't hesitate to contact us. Our team is ready to
          assist you with any inquiries you may have.
        </p>
        <CTABanner
          title="Contact Us for More Information"
          description="We're here to help with any questions about our notary services."
          primaryButtonText="Contact Us"
          primaryButtonHref="/contact"
          secondaryButtonText="Book a Service"
          secondaryButtonHref="/booking"
        />
      </div>
    </main>
  )
}

