import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { CheckCircle2, ChevronRight, AlertCircle, Clock, MapPin, FileText } from "lucide-react"
import { ServiceSchema } from "@/components/structured-data"

// Priority Service data
const SERVICE_DATA = {
  title: "Priority Service Package",
  description:
    "Fast-response mobile notary service with 2-hour response time, extended service hours, and premium features for time-sensitive documents.",
  slug: "priority-service",
  price: "100",
  priceLabel: "Flat fee",
  heroImage: "/placeholder.svg?height=800&width=800",
  heroAlt: "Priority Mobile Notary Service",
  introText:
    "Our Priority Service Package is designed for clients with urgent notarization needs. When time is of the essence, our priority service ensures your documents are notarized promptly with our guaranteed 2-hour response time and extended service hours from 7am to 9pm daily.",
  features: [
    {
      title: "2-Hour Response Time",
      description: "Guaranteed response within 2 hours of your request, perfect for urgent documents.",
    },
    {
      title: "Extended Service Hours",
      description: "Available from 7am to 9pm daily, including weekends.",
    },
    {
      title: "Up to 5 Documents",
      description: "Notarization for up to 5 documents included in the base price.",
    },
    {
      title: "2 Signers Included",
      description: "Service covers up to 2 signers at the same location.",
    },
    {
      title: "Extended Travel Radius",
      description: "Service within a 35-mile radius of our base location.",
    },
  ],
  documentTypes: [
    "Time-Sensitive Contracts",
    "Real Estate Documents",
    "Business Agreements",
    "Power of Attorney",
    "Medical Directives",
    "Affidavits",
    "Court Documents",
    "Last-Minute Closings",
  ],
  pricing: {
    base: "100",
    includes: [
      "2-hour response time",
      "Service from 7am-9pm daily",
      "Up to 5 documents",
      "2 signers",
      "35-mile service radius",
      "SMS status updates",
    ],
    addons: [
      {
        name: "Additional signers",
        price: "+$10 each",
      },
      {
        name: "Extended travel (beyond 20 miles)",
        price: "+$0.50/mile",
      },
      {
        name: "Additional documents (beyond 5)",
        price: "+$5 each",
      },
    ],
  },
  benefits: [
    {
      icon: Clock,
      title: "Same-Day Service",
      description: "Get your documents notarized the same day you call, even with short notice.",
    },
    {
      icon: MapPin,
      title: "Extended Coverage Area",
      description: "We travel up to 35 miles to meet you where you are, saving you time and hassle.",
    },
    {
      icon: FileText,
      title: "Real-Time Updates",
      description: "Receive SMS updates on your notary's arrival time and service status.",
    },
  ],
  process: [
    {
      title: "Request Service",
      description: "Call or book online and specify your urgent needs.",
    },
    {
      title: "Confirmation",
      description: "Receive confirmation within minutes and a 2-hour arrival window.",
    },
    {
      title: "Preparation",
      description: "Have your documents and valid ID ready for the appointment.",
    },
    {
      title: "Notarization",
      description: "Our notary arrives and professionally handles your documents.",
    },
  ],
  faqs: [
    {
      question: "What makes the Priority Service different from the Essential Package?",
      answer:
        "The Priority Service guarantees a 2-hour response time, offers extended service hours (7am-9pm daily), includes more documents (up to 5), and covers a larger service area (35-mile radius).",
    },
    {
      question: "Is the Priority Service available on weekends?",
      answer: "Yes, our Priority Service is available 7 days a week, including weekends, from 7am to 9pm.",
    },
    {
      question: "What if I need service after 9pm?",
      answer:
        "For service after 9pm, please contact us directly to discuss availability. Additional fees may apply for late-night service.",
    },
    {
      question: "How quickly can you arrive after I make a request?",
      answer:
        "With our Priority Service, we guarantee arrival within 2 hours of your confirmed request, depending on your location and traffic conditions.",
    },
    {
      question: "Do you charge extra for weekend service with the Priority Package?",
      answer: "No, weekend service is included in the Priority Service Package price with no additional surcharge.",
    },
    {
      question: "What happens if I need more than 5 documents notarized?",
      answer: "Additional documents beyond the 5 included in the package are charged at $5 per document.",
    },
  ],
  ctaTitle: "Need Urgent Notary Service?",
  ctaDescription: "Don't wait - our Priority Service guarantees a notary within 2 hours of your request.",
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

