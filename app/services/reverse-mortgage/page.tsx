import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { CheckCircle2, ChevronRight, AlertCircle, Clock, MapPin, FileText, Shield } from "lucide-react"
import { ServiceSchema } from "@/components/structured-data"

// Service data for Reverse Mortgage/HELOC
const SERVICE_DATA = {
  title: "Reverse Mortgage & HELOC Signing",
  description:
    "Professional notary services for Reverse Mortgage and Home Equity Line of Credit (HELOC) documents with experienced notaries who understand the complexities of these specialized loan types.",
  slug: "reverse-mortgage",
  price: "175.00",
  priceLabel: "Starting at",
  heroImage: "/placeholder.svg?height=800&width=800",
  heroAlt: "Reverse Mortgage & HELOC Signing Service",
  introText:
    "Our Reverse Mortgage & HELOC Signing service is designed specifically for seniors and homeowners accessing their home equity. We provide experienced notaries who understand the unique requirements and complexities of reverse mortgages and home equity lines of credit, ensuring a smooth and compliant signing process.",
  features: [
    {
      title: "Extended 2-Hour Signing Session",
      description:
        "We allocate extra time to thoroughly explain documents and answer all questions, ensuring complete understanding before signing.",
    },
    {
      title: "Experienced Reverse Mortgage Notaries",
      description:
        "Our notaries are specifically trained in reverse mortgage and HELOC documentation, understanding the unique requirements of these specialized loans.",
    },
    {
      title: "Senior-Friendly Service",
      description:
        "Patient, clear explanations with no rushing, ensuring comfort and understanding throughout the process.",
    },
    {
      title: "Complete Document Handling",
      description:
        "We manage all document organization, witnessing, and notarization requirements specific to reverse mortgages and HELOCs.",
    },
    {
      title: "Flexible Scheduling",
      description:
        "We work around your schedule to ensure convenience for you and any family members who may want to be present.",
    },
  ],
  documentTypes: [
    "Reverse Mortgage Application",
    "Home Equity Conversion Mortgage (HECM)",
    "HELOC Agreements",
    "Loan Estimates",
    "Closing Disclosures",
    "Deeds of Trust",
    "Promissory Notes",
    "Right of Rescission Notices",
    "HUD-1 Settlement Statements",
    "Counseling Certificates",
    "Proprietary Reverse Mortgage Documents",
    "Line of Credit Agreements",
  ],
  pricing: {
    base: "175.00",
    includes: [
      "2-hour signing session",
      "Up to 4 signers",
      "Document organization & preparation",
      "All required notarizations",
      "30-mile travel radius",
    ],
    addons: [
      {
        name: "Additional 30 minutes",
        price: "+$50.00",
      },
      {
        name: "Additional signer (beyond 4)",
        price: "+$25.00 each",
      },
      {
        name: "Extended travel (beyond 30 miles)",
        price: "+$1.50/mile",
      },
      {
        name: "Same-day service (when available)",
        price: "+$75.00",
      },
    ],
  },
  benefits: [
    {
      icon: Clock,
      title: "Thorough & Unhurried",
      description:
        "We take the time needed to ensure all parties fully understand the documents before signing, with no rushing through complex paperwork.",
    },
    {
      icon: Shield,
      title: "Specialized Expertise",
      description:
        "Our notaries understand the unique aspects of reverse mortgages and HELOCs, providing informed guidance throughout the signing process.",
    },
    {
      icon: MapPin,
      title: "Convenient In-Home Service",
      description:
        "We come to your home or preferred location, making the process comfortable and accessible, especially for seniors.",
    },
  ],
  process: [
    {
      title: "Schedule Your Appointment",
      description: "Book online or call us to arrange a convenient time for your reverse mortgage or HELOC signing.",
    },
    {
      title: "Document Preparation",
      description: "We'll coordinate with your lender to ensure all documents are ready for your signing appointment.",
    },
    {
      title: "In-Home Signing Session",
      description:
        "Our notary arrives at your location with all necessary documents and guides you through the signing process.",
    },
    {
      title: "Document Return",
      description:
        "After signing, we ensure all documents are properly executed and returned to the appropriate parties.",
    },
  ],
  faqs: [
    {
      question: "What makes reverse mortgage signings different from standard loan signings?",
      answer:
        "Reverse mortgage signings involve specialized documents designed for homeowners 62 and older. They typically require more explanation and understanding, as they involve unique terms where the borrower receives payments rather than making them. Our notaries are trained to explain these differences clearly and ensure all parties understand the obligations.",
    },
    {
      question: "Should I have family members present during a reverse mortgage signing?",
      answer:
        "While not required, having trusted family members present can be beneficial. They can ask additional questions and help ensure you understand all aspects of the agreement. Our notaries welcome family participation and are happy to explain documents to everyone present.",
    },
    {
      question: "How long does a reverse mortgage or HELOC signing typically take?",
      answer:
        "We allocate 2 hours for these specialized signings, which is usually sufficient. The process can take longer than standard loan signings because we take extra time to explain the unique aspects of these loans and ensure complete understanding before signing.",
    },
    {
      question: "Do you provide copies of all signed documents?",
      answer:
        "Yes, you will receive copies of all documents you sign. Additionally, we can provide guidance on which documents are most important to keep for your records.",
    },
    {
      question: "What identification is required for a reverse mortgage signing?",
      answer:
        "All signers must present valid government-issued photo identification, such as a driver's license, passport, or state ID card. Some lenders may require two forms of ID, which we can confirm before your appointment.",
    },
    {
      question: "Can you explain the Right of Rescission for reverse mortgages and HELOCs?",
      answer:
        "Yes. For most reverse mortgages and HELOCs, federal law provides a 3-business-day Right of Rescission period after signing, during which you can cancel the loan without penalty. Our notaries will explain this important right and how to exercise it if needed.",
    },
  ],
  ctaTitle: "Ready to Schedule Your Reverse Mortgage or HELOC Signing?",
  ctaDescription:
    "Our experienced notaries are ready to provide the specialized service you need for these important financial documents.",
}

export const metadata: Metadata = {
  title: SERVICE_DATA.title,
  description: SERVICE_DATA.description,
  alternates: {
    canonical: `https://houstonmobilenotarypros.com/services/${SERVICE_DATA.slug}`,
  },
  openGraph: {
    title: `${SERVICE_DATA.title} | Houston Mobile Notary Pros`,
    description: SERVICE_DATA.description,
    url: `https://houstonmobilenotarypros.com/services/${SERVICE_DATA.slug}`,
    images: [
      {
        url: SERVICE_DATA.heroImage,
        width: 800,
        height: 600,
        alt: SERVICE_DATA.heroAlt,
      },
    ],
  },
}

export default function ServicePage() {
  // Prepare service data for structured data
  const serviceSchemaData = {
    name: SERVICE_DATA.title,
    description: SERVICE_DATA.description,
    type: "Mobile Notary Service",
    price: SERVICE_DATA.price,
  }

  return (
    <main className="flex flex-col">
      {/* Add structured data for SEO */}
      <ServiceSchema service={serviceSchemaData} />

      {/* Service Details */}
      <section className="py-12 bg-background">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h2 className="section-heading mb-6">Service Details</h2>
              <p className="text-lg mb-6">{SERVICE_DATA.introText}</p>

              <h3 className="section-subheading mb-4">What's Included</h3>
              <ul className="space-y-4 mb-8">
                {SERVICE_DATA.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle2 className="h-6 w-6 text-primary mr-3 shrink-0" />
                    <div>
                      <span className="font-semibold">{feature.title}</span>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </div>
                  </li>
                ))}
              </ul>

              {SERVICE_DATA.documentTypes.length > 0 && (
                <>
                  <h3 className="section-subheading mb-4">Common Documents We Handle</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    {SERVICE_DATA.documentTypes.map((doc, index) => (
                      <div key={index} className="flex items-center">
                        <FileText className="h-5 w-5 text-primary mr-2" />
                        <span>{doc}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <div className="bg-muted p-6 rounded-lg mb-8">
                <div className="flex items-start">
                  <AlertCircle className="h-6 w-6 text-primary mr-3 shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-2">Important Reminder</h4>
                    <p>
                      All signers must present valid government-issued photo ID. Documents should NOT be signed before
                      the notary arrives. For reverse mortgages, consider having family members present during the
                      signing.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="bg-card rounded-lg border p-6 sticky top-20">
                <h3 className="text-xl font-bold mb-4">Pricing</h3>
                <p className="text-3xl font-bold mb-2">${SERVICE_DATA.pricing.base}</p>
                <p className="text-sm text-muted-foreground mb-6">{SERVICE_DATA.priceLabel}</p>

                <h4 className="font-semibold mb-2">What's Included:</h4>
                <ul className="space-y-2 mb-6">
                  {SERVICE_DATA.pricing.includes.map((item, index) => (
                    <li key={index} className="flex items-center">
                      <CheckCircle2 className="h-5 w-5 text-primary mr-2 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                {SERVICE_DATA.pricing.addons.length > 0 && (
                  <>
                    <h4 className="font-semibold mb-2">Add-ons:</h4>
                    <ul className="space-y-2 mb-6">
                      {SERVICE_DATA.pricing.addons.map((addon, index) => (
                        <li key={index} className="flex justify-between">
                          <span>{addon.name}</span>
                          <span className="font-medium">{addon.price}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                <Button className="w-full bg-primary text-primary-foreground">
                  <Link href="/booking" className="w-full flex items-center justify-center">
                    Book Now <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 bg-muted">
        <div className="container-custom">
          <h2 className="section-heading mb-8 text-center">Benefits of This Service</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {SERVICE_DATA.benefits.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <div key={index} className="bg-background rounded-lg p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 bg-background">
        <div className="container-custom">
          <h2 className="section-heading mb-8 text-center">How It Works</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {SERVICE_DATA.process.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary text-2xl font-bold">{index + 1}</span>
                </div>
                <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button className="bg-primary text-primary-foreground">
              <Link href="/booking" className="flex items-center">
                Book Your Appointment <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 bg-muted">
        <div className="container-custom max-w-4xl">
          <h2 className="section-heading mb-8 text-center">Frequently Asked Questions</h2>

          <Accordion type="single" collapsible className="w-full">
            {SERVICE_DATA.faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>
                  <p>{faq.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-accent text-accent-foreground">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-bold mb-4">{SERVICE_DATA.ctaTitle}</h2>
          <p className="text-xl max-w-3xl mx-auto mb-8">{SERVICE_DATA.ctaDescription}</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" className="bg-primary text-primary-foreground">
              <Link href="/booking" className="flex items-center">
                Book Now <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
            >
              <Link href="/contact" className="flex items-center">
                Contact Us <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}

