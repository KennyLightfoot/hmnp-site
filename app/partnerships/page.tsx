import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"
import PartnershipSchema from "./partnership-schema"

export const metadata: Metadata = {
  title: "Strategic Partnerships | Houston Mobile Notary Pros",
  description:
    "Explore partnership opportunities with Houston Mobile Notary Pros. We're seeking strategic alliances with real estate agencies, law firms, financial institutions, and more.",
  keywords:
    "notary partnerships, mobile notary collaboration, real estate partnerships, law firm notary services, Houston notary partners",
}

export default function PartnershipsPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <PartnershipSchema />

      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-primary">Strategic Partnerships</h1>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
          We're actively seeking partnerships to create mutually beneficial relationships that enhance service offerings
          for our clients.
        </p>
      </div>

      {/* Why Partner With Us */}
      <section className="mb-20">
        <h2 className="text-3xl font-bold mb-8 text-center">Why Partner With Houston Mobile Notary Pros?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="bg-primary/10 p-2 rounded-full mr-3">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </span>
                Reliable Service
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Our team of certified notaries provides consistent, professional service with quick response times and
                flexible scheduling.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="bg-primary/10 p-2 rounded-full mr-3">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </span>
                Client Satisfaction
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                We maintain a 5-star rating across review platforms, ensuring your clients receive exceptional service
                that reflects positively on your business.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="bg-primary/10 p-2 rounded-full mr-3">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </span>
                Revenue Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Our partnership programs can include referral fees, special pricing structures, or other financial
                incentives based on partnership type.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Partnership Types */}
      <section className="mb-20">
        <h2 className="text-3xl font-bold mb-8 text-center">Partnership Opportunities</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="bg-muted rounded-xl p-8 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-4">For Real Estate Professionals</h3>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span>Dedicated notary services for your clients</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span>Priority scheduling for closing documents</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span>Special partner rates for high-volume agencies</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span>Co-branded marketing materials</span>
                </li>
              </ul>
              <Button asChild className="mt-4">
                <Link href="#contact-form">Explore Real Estate Partnerships</Link>
              </Button>
            </div>
            <div className="absolute right-0 bottom-0 opacity-10">
              <Image
                src="/placeholder.svg?height=200&width=200"
                alt="Real Estate Icon"
                width={200}
                height={200}
                className="object-contain"
              />
            </div>
          </div>

          <div className="bg-muted rounded-xl p-8 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-4">For Legal Professionals</h3>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span>On-demand notary services for legal documents</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span>Confidential handling of sensitive documents</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span>Customized service packages for law firms</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span>Expedited service for urgent legal matters</span>
                </li>
              </ul>
              <Button asChild className="mt-4">
                <Link href="#contact-form">Explore Legal Partnerships</Link>
              </Button>
            </div>
            <div className="absolute right-0 bottom-0 opacity-10">
              <Image
                src="/placeholder.svg?height=200&width=200"
                alt="Legal Icon"
                width={200}
                height={200}
                className="object-contain"
              />
            </div>
          </div>

          <div className="bg-muted rounded-xl p-8 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-4">For Financial Institutions</h3>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span>Reliable notary services for loan documents</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span>Streamlined process for mortgage closings</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span>Dedicated account manager for your institution</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span>Volume-based pricing structures</span>
                </li>
              </ul>
              <Button asChild className="mt-4">
                <Link href="#contact-form">Explore Financial Partnerships</Link>
              </Button>
            </div>
            <div className="absolute right-0 bottom-0 opacity-10">
              <Image
                src="/placeholder.svg?height=200&width=200"
                alt="Financial Icon"
                width={200}
                height={200}
                className="object-contain"
              />
            </div>
          </div>

          <div className="bg-muted rounded-xl p-8 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-4">For Title Companies</h3>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span>Dedicated notaries for closing appointments</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span>Flexible scheduling for last-minute closings</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span>Consistent, professional service for your clients</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span>Streamlined communication and document handling</span>
                </li>
              </ul>
              <Button asChild className="mt-4">
                <Link href="#contact-form">Explore Title Company Partnerships</Link>
              </Button>
            </div>
            <div className="absolute right-0 bottom-0 opacity-10">
              <Image
                src="/placeholder.svg?height=200&width=200"
                alt="Title Company Icon"
                width={200}
                height={200}
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="mb-20">
        <h2 className="text-3xl font-bold mb-8 text-center">Our Partnership Process</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="bg-primary/10 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-primary">1</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Initial Consultation</h3>
            <p className="text-muted-foreground">
              We'll discuss your needs and how our services can complement your business.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-primary/10 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-primary">2</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Custom Proposal</h3>
            <p className="text-muted-foreground">
              We'll create a tailored partnership plan with specific terms and benefits.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-primary/10 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-primary">3</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Agreement</h3>
            <p className="text-muted-foreground">
              Once terms are finalized, we'll formalize our partnership with a clear agreement.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-primary/10 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-primary">4</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Implementation</h3>
            <p className="text-muted-foreground">
              We'll integrate our services with your business processes and begin our collaboration.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="contact-form" className="bg-muted p-8 rounded-xl mb-20">
        <h2 className="text-3xl font-bold mb-8 text-center">Interested in Partnering With Us?</h2>
        <div className="max-w-3xl mx-auto">
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  className="w-full p-3 border border-input rounded-md"
                  placeholder="John Smith"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="company" className="text-sm font-medium">
                  Company Name
                </label>
                <input
                  id="company"
                  type="text"
                  className="w-full p-3 border border-input rounded-md"
                  placeholder="Your Company LLC"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  className="w-full p-3 border border-input rounded-md"
                  placeholder="john@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium">
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  className="w-full p-3 border border-input rounded-md"
                  placeholder="(123) 456-7890"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="partnership-type" className="text-sm font-medium">
                Partnership Type
              </label>
              <select id="partnership-type" className="w-full p-3 border border-input rounded-md" required>
                <option value="">Select Partnership Type</option>
                <option value="real-estate">Real Estate Agency</option>
                <option value="legal">Law Firm</option>
                <option value="financial">Financial Institution</option>
                <option value="title">Title Company</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-medium">
                Tell Us About Your Business
              </label>
              <textarea
                id="message"
                className="w-full p-3 border border-input rounded-md min-h-[120px]"
                placeholder="Please share details about your business and what you're looking for in a partnership..."
                required
              ></textarea>
            </div>

            <Button type="submit" className="w-full">
              Submit Partnership Inquiry
            </Button>
          </form>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mb-20">
        <h2 className="text-3xl font-bold mb-8 text-center">Partnership FAQs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-2">Is there a cost to partner with you?</h3>
            <p className="text-muted-foreground">
              No, there's no upfront cost to establish a partnership. Our partnerships are based on mutual value
              creation through service provision and referrals.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-2">How quickly can we establish a partnership?</h3>
            <p className="text-muted-foreground">
              Most partnerships can be established within 1-2 weeks after our initial consultation, depending on the
              complexity of the arrangement.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-2">Do you offer exclusive partnerships?</h3>
            <p className="text-muted-foreground">
              Yes, we can discuss exclusive arrangements for certain geographic areas or service types, depending on
              your business needs and volume.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-2">What information will you need from us?</h3>
            <p className="text-muted-foreground">
              We typically need basic business information, service requirements, volume expectations, and specific
              needs to create a customized partnership proposal.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center bg-primary/5 p-12 rounded-xl">
        <h2 className="text-3xl font-bold mb-4">Ready to Explore a Partnership?</h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Join forces with Houston's premier mobile notary service to enhance your client experience and streamline your
          document processes.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="#contact-form">Start the Conversation</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/contact">Contact Our Team</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}

