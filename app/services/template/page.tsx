import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { CheckCircle2, ChevronRight, AlertCircle, Clock, MapPin, FileText } from "lucide-react"
import { ServiceSchema } from "@/components/structured-data"

// This is a template - replace these values for each service
const SERVICE_DATA = {
  title: "Service Name",
  description: "Brief description of the service that will appear in search results and social shares.",
  slug: "template", // URL segment, e.g., "essential-mobile"
  price: "XX.XX",
  priceLabel: "Starting at",
  heroImage: "/placeholder.svg?height=800&width=800",
  heroAlt: "Service Name Image",
  introText: "Longer introduction to the service that explains its purpose and value.",
  features: [
    {
      title: "Feature 1",
      description: "Description of feature 1",
    },
    {
      title: "Feature 2",
      description: "Description of feature 2",
    },
    {
      title: "Feature 3",
      description: "Description of feature 3",
    },
    {
      title: "Feature 4",
      description: "Description of feature 4",
    },
    {
      title: "Feature 5",
      description: "Description of feature 5",
    },
  ],
  documentTypes: [
    "Document Type 1",
    "Document Type 2",
    "Document Type 3",
    "Document Type 4",
    "Document Type 5",
    "Document Type 6",
    "Document Type 7",
    "Document Type 8",
  ],
  pricing: {
    base: "XX.XX",
    includes: ["Item 1", "Item 2", "Item 3"],
    addons: [
      {
        name: "Add-on 1",
        price: "+$XX.XX",
      },
      {
        name: "Add-on 2",
        price: "+$XX.XX",
      },
      {
        name: "Add-on 3",
        price: "+$XX.XX",
      },
    ],
  },
  benefits: [
    {
      icon: Clock,
      title: "Benefit 1",
      description: "Description of benefit 1",
    },
    {
      icon: MapPin,
      title: "Benefit 2",
      description: "Description of benefit 2",
    },
    {
      icon: FileText,
      title: "Benefit 3",
      description: "Description of benefit 3",
    },
  ],
  process: [
    {
      title: "Step 1",
      description: "Description of step 1",
    },
    {
      title: "Step 2",
      description: "Description of step 2",
    },
    {
      title: "Step 3",
      description: "Description of step 3",
    },
    {
      title: "Step 4",
      description: "Description of step 4",
    },
  ],
  faqs: [
    {
      question: "Frequently asked question 1?",
      answer: "Answer to question 1",
    },
    {
      question: "Frequently asked question 2?",
      answer: "Answer to question 2",
    },
    {
      question: "Frequently asked question 3?",
      answer: "Answer to question 3",
    },
    {
      question: "Frequently asked question 4?",
      answer: "Answer to question 4",
    },
    {
      question: "Frequently asked question 5?",
      answer: "Answer to question 5",
    },
    {
      question: "Frequently asked question 6?",
      answer: "Answer to question 6",
    },
  ],
  ctaTitle: "Ready to Book This Service?",
  ctaDescription: "Schedule your appointment today and experience our professional service.",
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
                      the notary arrives.
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

