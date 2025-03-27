import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { CheckCircle2, ChevronRight, AlertCircle, Clock, MapPin, FileText, Briefcase } from "lucide-react"
import { ServiceSchema } from "@/components/structured-data"

// Service data for Specialty Services
const SERVICE_DATA = {
  title: "Specialty Notary Services",
  description:
    "Professional mobile notary services for specialized documents including apostilles, I-9 verification, medical directives, and other complex or unusual notarization needs.",
  slug: "specialty-services",
  price: "125.00",
  priceLabel: "Starting at",
  heroImage: "/placeholder.svg?height=800&width=800",
  heroAlt: "Specialty Notary Services",
  introText:
    "Our Specialty Notary Services are designed for unique, complex, or unusual notarization needs that require additional expertise or handling. From international document authentication to medical directives and business formation documents, our experienced notaries provide professional service for your specialized requirements.",
  features: [
    {
      title: "Specialized Document Expertise",
      description:
        "Our notaries are experienced with complex and unusual document types that require special handling or knowledge.",
    },
    {
      title: "Apostille & Authentication Guidance",
      description:
        "We provide guidance on the apostille process for documents that need to be recognized internationally.",
    },
    {
      title: "I-9 Employment Verification",
      description: "Authorized agent services for completing the I-9 employment eligibility verification process.",
    },
    {
      title: "Medical & Healthcare Directives",
      description: "Sensitive handling of advance directives, medical powers of attorney, and healthcare proxies.",
    },
    {
      title: "Business Formation Documents",
      description:
        "Professional notarization of articles of incorporation, operating agreements, and other business formation documents.",
    },
  ],
  documentTypes: [
    "Apostille Documents",
    "I-9 Employment Verification",
    "Medical Directives",
    "Living Wills",
    "Healthcare Powers of Attorney",
    "Articles of Incorporation",
    "Operating Agreements",
    "Affidavits & Sworn Statements",
    "Adoption Documents",
    "Name Change Documents",
    "International Documents",
    "Certified Copies",
  ],
  pricing: {
    base: "125.00",
    includes: [
      "1-hour appointment",
      "Up to 3 signers",
      "Up to 5 notarizations",
      "Document review",
      "25-mile travel radius",
    ],
    addons: [
      {
        name: "Additional 30 minutes",
        price: "+$40.00",
      },
      {
        name: "Additional notarizations (beyond 5)",
        price: "+$15.00 each",
      },
      {
        name: "Additional signers (beyond 3)",
        price: "+$25.00 each",
      },
      {
        name: "Extended travel (beyond 25 miles)",
        price: "+$1.50/mile",
      },
      {
        name: "Apostille guidance & preparation",
        price: "+$50.00",
      },
    ],
  },
  benefits: [
    {
      icon: Briefcase,
      title: "Specialized Expertise",
      description:
        "Our notaries understand the unique requirements of complex documents and specialized notarization needs.",
    },
    {
      icon: Clock,
      title: "Efficient Service",
      description:
        "We come prepared with the knowledge and materials needed for your specific document type, saving you time and hassle.",
    },
    {
      icon: MapPin,
      title: "Convenient Mobile Service",
      description:
        "We come to your location, whether it's your home, office, hospital, or another convenient location.",
    },
  ],
  process: [
    {
      title: "Discuss Your Needs",
      description: "Contact us to discuss your specific document requirements and schedule your appointment.",
    },
    {
      title: "Document Preparation",
      description: "We'll provide guidance on how to prepare your documents before the appointment.",
    },
    {
      title: "On-Site Service",
      description: "Our notary arrives at your location with all necessary materials and expertise.",
    },
    {
      title: "Follow-Up Support",
      description: "If needed, we provide guidance on next steps after notarization, such as apostille processing.",
    },
  ],
  faqs: [
    {
      question: "What is an apostille and when do I need one?",
      answer:
        "An apostille is a certificate that authenticates the origin of a public document for use in countries that participate in the Hague Apostille Convention. You need an apostille when you have documents that will be used in another country, such as powers of attorney, birth certificates, marriage certificates, or corporate documents for international business.",
    },
    {
      question: "Can you help with I-9 employment verification?",
      answer:
        "Yes, our notaries can serve as authorized representatives to complete Section 2 of the I-9 form for remote employees. We can verify the employee's identity and employment authorization documents in person and complete the necessary paperwork for employers.",
    },
    {
      question: "Do you notarize medical directives and living wills?",
      answer:
        "Yes, we provide notarization services for advance healthcare directives, living wills, and medical powers of attorney. These documents often require witnesses in addition to notarization, which we can help coordinate.",
    },
    {
      question: "Can you notarize documents in a hospital or care facility?",
      answer:
        "Yes, we regularly provide mobile notary services at hospitals, nursing homes, and assisted living facilities. We understand the sensitivity and often urgency of these situations and can work with facility staff to ensure a smooth process.",
    },
    {
      question: "What's involved in notarizing business formation documents?",
      answer:
        "Business formation documents like articles of incorporation, operating agreements, and corporate bylaws often require notarization. We can notarize signatures of business principals and help ensure all notarial requirements are met for proper filing with state agencies.",
    },
    {
      question: "Do you provide certified copies of documents?",
      answer:
        "In Texas, notaries can certify copies of certain documents. However, there are limitations—we cannot certify copies of vital records (birth certificates, death certificates, marriage licenses) or recordable documents. We can advise on which documents qualify for notarial certified copies.",
    },
  ],
  ctaTitle: "Need Specialized Notary Services?",
  ctaDescription: "Our experienced notaries are ready to assist with your complex or unusual document needs.",
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
                      All signers must present valid government-issued photo ID. For specialized documents, please
                      inform us of any specific requirements when booking so we can be fully prepared for your
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

