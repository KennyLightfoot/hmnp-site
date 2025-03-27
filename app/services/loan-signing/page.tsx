import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { CheckCircle2, ChevronRight, AlertCircle, Clock, MapPin, FileText } from "lucide-react"
import { ServiceSchema } from "@/components/structured-data"

// Loan Signing Service data
const SERVICE_DATA = {
  title: "Loan Signing Service",
  description:
    "Professional loan signing service for real estate transactions, mortgage refinancing, and other loan documents with certified notary signing agents.",
  slug: "loan-signing",
  price: "150",
  priceLabel: "Flat fee",
  heroImage: "/placeholder.svg?height=800&width=800",
  heroAlt: "Loan Signing Service",
  introText:
    "Our Loan Signing Service provides professional notarization for all types of loan documents. Our certified notary signing agents are experienced in handling real estate transactions, mortgage refinancing, and other loan documents with precision and care.",
  features: [
    {
      title: "Unlimited Documents",
      description: "We handle all documents in your loan package, no matter how many pages.",
    },
    {
      title: "Up to 4 Signers",
      description: "Service includes notarization for up to 4 signers at the same location.",
    },
    {
      title: "Color Printing",
      description: "We provide color printing of all necessary documents if needed.",
    },
    {
      title: "Professional Closing Binder",
      description: "Your documents are organized in a professional binder for easy reference.",
    },
    {
      title: "90-Minute Signing Session",
      description: "We allocate ample time to thoroughly explain and process all documents.",
    },
  ],
  documentTypes: [
    "Mortgage Notes",
    "Deeds of Trust",
    "Closing Disclosures",
    "Loan Estimates",
    "Affidavits",
    "Riders",
    "HELOC Agreements",
    "Refinance Documents",
  ],
  pricing: {
    base: "150",
    includes: [
      "Unlimited documents",
      "Up to 4 signers",
      "Color printing service",
      "Professional closing binder",
      "Title company shipping",
      "90-minute signing session",
    ],
    addons: [
      {
        name: "Overnight document handling",
        price: "+$35",
      },
      {
        name: "Additional signers (beyond 4)",
        price: "+$10 each",
      },
      {
        name: "Extended signing session (beyond 90 min)",
        price: "+$25/30 min",
      },
    ],
  },
  benefits: [
    {
      icon: Clock,
      title: "Efficient Closings",
      description: "Our experienced signing agents ensure smooth, efficient closings with no delays.",
    },
    {
      icon: MapPin,
      title: "Convenient Location",
      description: "We come to your preferred location - home, office, or coffee shop.",
    },
    {
      icon: FileText,
      title: "Document Expertise",
      description: "Our agents understand loan documents and can answer basic procedural questions.",
    },
  ],
  process: [
    {
      title: "Schedule",
      description: "Book your appointment online or by phone.",
    },
    {
      title: "Prepare",
      description: "Have valid ID ready for all signers.",
    },
    {
      title: "Sign",
      description: "Our agent guides you through all documents.",
    },
    {
      title: "Complete",
      description: "Documents are returned to the title company or lender.",
    },
  ],
  faqs: [
    {
      question: "What is a loan signing agent?",
      answer:
        "A loan signing agent is a notary public who specializes in facilitating mortgage and loan document signings. They are trained to understand loan documents and guide signers through the signing process.",
    },
    {
      question: "How long does a typical loan signing take?",
      answer:
        "A typical loan signing takes about 60-90 minutes, depending on the number of documents and signers. We allocate a full 90 minutes to ensure there's plenty of time to answer questions and complete all documents properly.",
    },
    {
      question: "Can you explain the loan documents to me?",
      answer:
        "While our signing agents are knowledgeable about loan documents, they cannot provide legal advice or explain the legal implications of what you're signing. They can explain where to sign and answer procedural questions about the documents.",
    },
    {
      question: "What do I need to have ready for my loan signing?",
      answer:
        "All signers must have valid, government-issued photo identification. You should also have any information requested by your lender, such as insurance information or cashier's checks if needed for closing.",
    },
    {
      question: "Do you work with all title companies and lenders?",
      answer:
        "Yes, we work with all title companies and lenders. We can coordinate directly with them to ensure a smooth closing process.",
    },
    {
      question: "What happens after the signing is complete?",
      answer:
        "After the signing, we return the documents to the title company or lender as specified in your closing instructions. This can be done via overnight shipping, courier, or electronic return depending on the requirements.",
    },
  ],
  ctaTitle: "Ready to Schedule Your Loan Signing?",
  ctaDescription:
    "Our professional signing agents are ready to help you complete your transaction smoothly and efficiently.",
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
                      the notary arrives. Please have any information requested by your lender ready for the
                      appointment.
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

