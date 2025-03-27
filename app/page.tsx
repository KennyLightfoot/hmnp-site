import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TestimonialCarousel } from "@/components/testimonial-carousel"
import { FAQAccordion } from "@/components/faq-accordion"
import { CTABanner } from "@/components/cta-banner"
import { ProcessTimeline } from "@/components/process-timeline"
import { ServiceComparisonTable } from "@/components/service-comparison-table"
import { testimonials } from "@/data/testimonials"
import { generalFaqs } from "@/data/faqs"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CheckCircle,
  Clock,
  MapPin,
  DollarSign,
  CalendarClock,
  ArrowRight,
  Home,
  Building,
  Briefcase,
} from "lucide-react"
import ClientMap from "@/components/client-map"
import { ServiceCard } from "@/components/service-card"

export default function HomePage() {
  // Only show 4 FAQs on the home page
  const featuredFaqs = generalFaqs.slice(0, 4)

  // Define process steps
  const processSteps = [
    {
      title: "Book Your Appointment",
      description: "Schedule online, by phone, or email. Choose a date and time that works for you.",
    },
    {
      title: "Confirmation",
      description: "We'll confirm your appointment and provide an estimated arrival time.",
    },
    {
      title: "Notarization",
      description: "Our notary arrives at your location with all necessary supplies to perform the notarization.",
    },
    {
      title: "Payment & Completion",
      description: "Pay for the service and receive your notarized documents, ready for use.",
    },
  ]

  return (
    <>
      {/* Hero Section */}
      <section className="section bg-gradient-to-br from-primary-500/10 to-accent-500/5 overflow-hidden relative">
        <div className="absolute inset-0 bg-grid opacity-30"></div>
        <div className="container relative">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
            <div className="flex-1 space-y-6">
              <div className="section-tag">Professional Mobile Notary</div>
              <h1 className="text-balance">Notary Services That Come To You</h1>
              <p className="text-xl text-muted-foreground">
                We bring notary services directly to you. Convenient, reliable, and professional notarization when and
                where you need it.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button asChild size="lg" className="btn-primary gap-2">
                  <Link href="/booking">
                    <CalendarClock className="h-5 w-5" />
                    Book an Appointment
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="btn-outline">
                  <Link href="/services">Learn More</Link>
                </Button>
              </div>
            </div>
            <div className="flex-1 relative">
              <div className="relative rounded-lg overflow-hidden shadow-xl border border-border">
                <Image
                  src="/placeholder.svg?height=500&width=500"
                  alt="Mobile notary service"
                  width={500}
                  height={500}
                  className="rounded-lg"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-500/20 to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section section-alt">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="section-tag">Why Choose Us</div>
            <h2 className="section-title">Houston Mobile Notary Pros</h2>
            <p className="section-subtitle">
              We provide professional, convenient, and reliable notary services throughout the Houston area.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="card-base card-hover h-full">
              <CardHeader className="pb-2">
                <Clock className="feature-icon" />
                <CardTitle>Convenient & Flexible</CardTitle>
              </CardHeader>
              <CardContent>
                <p>We come to your location at a time that works for you, including evenings and weekends.</p>
              </CardContent>
            </Card>

            <Card className="card-base card-hover h-full">
              <CardHeader className="pb-2">
                <MapPin className="feature-icon" />
                <CardTitle>Mobile Service</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  No need to travel or wait in line. We bring notary services directly to your home, office, or
                  preferred location.
                </p>
              </CardContent>
            </Card>

            <Card className="card-base card-hover h-full">
              <CardHeader className="pb-2">
                <CheckCircle className="feature-icon" />
                <CardTitle>Professional & Reliable</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Our notaries are experienced, background-checked, and committed to providing excellent service.</p>
              </CardContent>
            </Card>

            <Card className="card-base card-hover h-full">
              <CardHeader className="pb-2">
                <DollarSign className="feature-icon" />
                <CardTitle>Transparent Pricing</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Clear, upfront pricing with no hidden fees. Know exactly what you'll pay before booking.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="section">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="section-tag">Our Services</div>
            <h2 className="section-title">Professional Notary Solutions</h2>
            <p className="section-subtitle">We offer a range of notary services to meet your specific needs.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ServiceCard
              title="Essential Mobile Package"
              description="Standard mobile notary service for general documents."
              price="$75"
              priceDescription="Starting price"
              imageSrc="/placeholder.svg?height=200&width=400"
              href="/services/essential-mobile"
              features={[
                "Travel to your location",
                "General document notarization",
                "Professional service",
                "Flexible scheduling",
              ]}
            />

            <ServiceCard
              title="Loan Signing Services"
              description="Specialized service for mortgage closings and refinances."
              price="$150"
              priceDescription="Starting price"
              imageSrc="/placeholder.svg?height=200&width=400"
              href="/services/loan-signing"
              features={[
                "Certified Loan Signing Agent",
                "Complete loan document handling",
                "Thorough explanation of documents",
                "Efficient closing process",
              ]}
              highlighted={true}
            />

            <ServiceCard
              title="Priority Service"
              description="Same-day and urgent notarization services."
              price="$100"
              priceDescription="Starting price"
              imageSrc="/placeholder.svg?height=200&width=400"
              href="/services/priority-service"
              features={["Same-day service", "Urgent appointments", "Expedited processing", "After-hours availability"]}
            />
          </div>

          <div className="text-center mt-8">
            <Button asChild className="btn-primary">
              <Link href="/services">
                View All Services <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Tabbed Content Section */}
      <section className="section section-alt">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="section-tag">How We Can Help</div>
            <h2 className="section-title">Notary Services For Every Need</h2>
            <p className="section-subtitle">Explore our specialized services for different situations</p>
          </div>

          <Tabs defaultValue="individuals" className="max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-3 mb-8 bg-background">
              <TabsTrigger
                value="individuals"
                className="text-sm sm:text-base data-[state=active]:bg-primary-500 data-[state=active]:text-white"
              >
                <Home className="h-4 w-4 mr-2 hidden sm:inline" />
                For Individuals
              </TabsTrigger>
              <TabsTrigger
                value="businesses"
                className="text-sm sm:text-base data-[state=active]:bg-primary-500 data-[state=active]:text-white"
              >
                <Building className="h-4 w-4 mr-2 hidden sm:inline" />
                For Businesses
              </TabsTrigger>
              <TabsTrigger
                value="realestate"
                className="text-sm sm:text-base data-[state=active]:bg-primary-500 data-[state=active]:text-white"
              >
                <Briefcase className="h-4 w-4 mr-2 hidden sm:inline" />
                Real Estate
              </TabsTrigger>
            </TabsList>

            <TabsContent value="individuals" className="card-base p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4">Individual Services</h3>
                  <p className="text-muted-foreground mb-4">
                    We provide convenient notary services for all your personal document needs, including:
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-accent-500 mr-2 shrink-0" />
                      <span>Power of Attorney documents</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-accent-500 mr-2 shrink-0" />
                      <span>Affidavits and sworn statements</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-accent-500 mr-2 shrink-0" />
                      <span>Medical authorizations</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-accent-500 mr-2 shrink-0" />
                      <span>Consent forms and permission slips</span>
                    </li>
                  </ul>
                  <Button asChild className="mt-6 btn-primary">
                    <Link href="/services">Learn More</Link>
                  </Button>
                </div>
                <div className="relative h-64 md:h-auto rounded-lg overflow-hidden">
                  <Image
                    src="/placeholder.svg?height=300&width=400"
                    alt="Individual notary services"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="businesses" className="card-base p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4">Business Services</h3>
                  <p className="text-muted-foreground mb-4">
                    We help businesses with all their notarization needs, including:
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-accent-500 mr-2 shrink-0" />
                      <span>Corporate documents and contracts</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-accent-500 mr-2 shrink-0" />
                      <span>Board resolutions and meeting minutes</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-accent-500 mr-2 shrink-0" />
                      <span>Business formation documents</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-accent-500 mr-2 shrink-0" />
                      <span>Commercial lease agreements</span>
                    </li>
                  </ul>
                  <Button asChild className="mt-6 btn-primary">
                    <Link href="/services/corporate">Learn More</Link>
                  </Button>
                </div>
                <div className="relative h-64 md:h-auto rounded-lg overflow-hidden">
                  <Image
                    src="/placeholder.svg?height=300&width=400"
                    alt="Business notary services"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="realestate" className="card-base p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4">Real Estate Services</h3>
                  <p className="text-muted-foreground mb-4">Our specialized real estate notary services include:</p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-accent-500 mr-2 shrink-0" />
                      <span>Mortgage loan closings</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-accent-500 mr-2 shrink-0" />
                      <span>Refinance transactions</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-accent-500 mr-2 shrink-0" />
                      <span>Deed transfers and property documents</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-accent-500 mr-2 shrink-0" />
                      <span>Reverse mortgages</span>
                    </li>
                  </ul>
                  <Button asChild className="mt-6 btn-primary">
                    <Link href="/services/loan-signing">Learn More</Link>
                  </Button>
                </div>
                <div className="relative h-64 md:h-auto rounded-lg overflow-hidden">
                  <Image
                    src="/placeholder.svg?height=300&width=400"
                    alt="Real estate notary services"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Service Comparison Section */}
      <section className="section">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="section-tag">Service Comparison</div>
            <h2 className="section-title">Find Your Perfect Service</h2>
            <p className="section-subtitle">Find the right notary service for your specific needs</p>
          </div>

          <ServiceComparisonTable />
        </div>
      </section>

      {/* Process Section */}
      <section className="section section-alt">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="section-tag">Our Process</div>
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">Our simple process makes getting your documents notarized quick and easy</p>
          </div>

          <div className="max-w-3xl mx-auto">
            <ProcessTimeline steps={processSteps} />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section section-gradient">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="section-tag">Testimonials</div>
            <h2 className="section-title">What Our Clients Say</h2>
            <p className="section-subtitle">
              Don't just take our word for it — hear from some of our satisfied clients
            </p>
          </div>

          <TestimonialCarousel testimonials={testimonials} />

          <div className="text-center mt-8">
            <Button asChild variant="outline" className="btn-outline">
              <Link href="/testimonials">
                View All Testimonials <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section section-alt">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <div className="section-tag">FAQs</div>
              <h2 className="section-title">Frequently Asked Questions</h2>
              <p className="section-subtitle">Find answers to common questions about our notary services</p>
            </div>

            <FAQAccordion faqs={featuredFaqs} />

            <div className="text-center mt-8">
              <Button asChild variant="outline" className="btn-outline">
                <Link href="/faq">
                  View All FAQs <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Service Area Section */}
      <section className="section">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="section-tag">Service Area</div>
            <h2 className="section-title">Where We Serve</h2>
            <p className="section-subtitle">
              We proudly serve the Greater Houston area. See the map below for our primary service locations.
            </p>
          </div>
          <div className="border rounded-lg overflow-hidden shadow-lg">
            <ClientMap />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section section-accent">
        <div className="container">
          <CTABanner />
        </div>
      </section>
    </>
  )
}

