import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { CheckCircle2, ChevronRight, AlertCircle, Clock, MapPin, FileText, Users } from "lucide-react"
import { ServiceSchema } from "@/components/structured-data"

// Service-specific data
const SERVICE_DATA = {
  title: "Essential Mobile Package",
  description:
    "Our standard mobile notary service for general documents. Perfect for wills, powers of attorney, affidavits, and other personal documents.",
  slug: "essential-mobile",
  price: "75.00",
  priceLabel: "Base price",
  heroImage: "/placeholder.svg?height=800&width=800",
  heroAlt: "Essential Mobile Notary Service",
  introText:
    "Our Essential Mobile Package is designed for individuals and families who need standard notarization services for personal documents. This package provides a convenient and professional notary experience at your chosen location, with same-day availability when booked at least 4 hours in advance.",
  features: [
    {
      title: "One signer",
      description: "Service for one person signing documents",
    },
    {
      title: "Two documents",
      description: "Notarization of up to two documents",
    },
    {
      title: "Travel within 20-mile radius",
      description: "We come to your location within 20 miles of ZIP 77591",
    },
    {
      title: "Professional notary service",
      description: "Licensed and insured notary with proper equipment",
    },
    {
      title: "Weekday service",
      description: "Available Monday-Friday, 9am-5pm",
    },
    {
      title: "Same-day availability",
      description: "Available for same-day service with minimum 4 hours notice",
    },
  ],
  documentTypes: [
    "Wills and Living Wills",
    "Powers of Attorney",
    "Affidavits",
    "Medical Directives",
    "Consent Forms",
    "Property Deeds",
    "School Documents",
    "Employment Documents",
  ],
  pricing: {
    base: "75.00",
    includes: ["1 signer", "2 documents", "20-mile travel radius"],
    addons: [
      {
        name: "Additional signer",
        price: "+$25 each",
      },
      {
        name: "Additional document",
        price: "+$15 each",
      },
      {
        name: "Weekend service",
        price: "+$50",
      },
      {
        name: "After hours (5pm-9pm)",
        price: "+$30",
      },
      {
        name: "Extended travel",
        price: "+$0.50/mile",
      },
    ],
  },
  benefits: [
    {
      icon: Clock,
      title: "Convenience",
      description:
        "Save time and avoid the hassle of traveling to a notary office. We come to your home, office, or any location that works for you.",
    },
    {
      icon: Users,
      title: "Personalized Service",
      description:
        "Receive one-on-one attention from a professional notary who can guide you through the notarization process.",
    },
    {
      icon: MapPin,
      title: "Flexible Location",
      description:
        "Choose the location that's most comfortable for you. We can meet at your home, office, coffee shop, or any other convenient place.",
    },
  ],
  process: [
    {
      title: "Book",
      description: "Schedule your appointment online or by phone",
    },
    {
      title: "Prepare",
      description: "Have your documents and valid ID ready",
    },
    {
      title: "Meet",
      description: "Our notary arrives at your location",
    },
    {
      title: "Complete",
      description: "Documents are notarized and payment is collected",
    },
  ],
  faqs: [
    {
      question: "What types of documents can be notarized with this package?",
      answer:
        "Our Essential Mobile Package is suitable for most personal documents, including wills, powers of attorney, affidavits, medical directives, consent forms, property deeds, and various personal or business documents that require notarization. If you're unsure whether your document can be notarized, please contact us to discuss your specific needs.",
    },
    {
      question: "How do I prepare for the notary appointment?",
      answer:
        "To prepare for your appointment: Have your documents ready but unsigned (unless it's an acknowledgment), ensure all signers have valid government-issued photo ID, provide a clean, well-lit space for the notarization, be available at the scheduled time, and have your payment method ready.",
    },
    {
      question: "What if I have more than two documents to notarize?",
      answer:
        "The Essential Mobile Package includes notarization for up to two documents. For each additional document, there is a fee of $15. There is no limit to the number of additional documents we can notarize during your appointment, but please let us know in advance if you have multiple documents so we can allocate sufficient time.",
    },
    {
      question: "Can I add more signers to this package?",
      answer:
        "Yes, you can add additional signers to the Essential Mobile Package for $25 per additional signer. Each signer must be present at the appointment and have valid government-issued photo identification. Please specify the number of signers when booking your appointment.",
    },
    {
      question: "How far in advance should I book?",
      answer:
        "For the Essential Mobile Package, we recommend booking 24-48 hours in advance to ensure availability. However, we understand that sometimes notarization needs arise unexpectedly. If you need same-day service, please consider our Priority Service Package, which offers a 2-hour response time.",
    },
    {
      question: "What forms of payment do you accept?",
      answer:
        "We accept credit/debit cards (Visa, MasterCard, American Express, Discover), cash (exact change required), and mobile payment apps (Venmo, Zelle, Cash App). Payment is due at the time of service. For credit/debit cards, we place a secure hold at booking, which is processed after the service is completed.",
    },
    {
      question: "Is same-day service available with the Essential Mobile Package?",
      answer:
        "Yes, we offer same-day service for our Essential Mobile Package with a minimum of 4 hours notice. Please contact us as early as possible to ensure availability for same-day appointments. For more urgent needs with less than 4 hours notice, please consider our Priority Service Package.",
    },
  ],
  ctaTitle: "Ready to Book Your Mobile Notary Service?",
  ctaDescription:
    "Schedule your Essential Mobile Package appointment today and experience the convenience of our professional mobile notary services.",
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

export default function EssentialMobilePage() {
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
                  <h3 className="section-subheading mb-4">Common Documents We Notarize</h3>
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
          <h2 className="section-heading mb-8 text-center">Benefits of Our Essential Mobile Package</h2>

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

