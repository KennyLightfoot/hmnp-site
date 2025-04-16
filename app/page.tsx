import Link from "next/link"
import Image from "next/image"
import { MapPin, Clock, Award, CheckCircle, ArrowRight, Phone, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import TestimonialCarousel from "@/components/testimonial-carousel"
import MiniFAQ from "@/components/mini-faq"

export default function HomePage() {
  // FAQ items for the MiniFAQ component
  const faqs = [
    {
      id: "what-is-notary",
      question: "What is a mobile notary?",
      answer: (
        <p>
          A mobile notary is a state-commissioned notary public who travels to your location to perform notarial acts.
          This service saves you time and hassle by bringing the notary to your home, office, or other convenient
          location.
        </p>
      ),
    },
    {
      id: "service-area",
      question: "What areas do you serve?",
      answer: (
        <p>
          We serve clients within a 20-mile radius of ZIP code 77591, covering the greater Houston area including
          Houston, Galveston, League City, Pearland, Sugar Land, and more. We can also travel beyond our standard
          service area for an additional fee.
        </p>
      ),
    },
    {
      id: "id-requirements",
      question: "What forms of ID do you accept?",
      answer: (
        <p>
          We accept government-issued photo IDs such as driver's licenses, passports, military IDs, and state ID cards.
          The ID must be current (not expired) and contain a photograph, physical description, signature, and serial
          number.
        </p>
      ),
    },
  ]

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-white py-16 md:py-24 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 order-2 md:order-1">
              <div className="inline-block bg-[#91A3B0]/20 px-4 py-2 rounded-full">
                <span className="text-[#002147] font-medium">Professional Mobile Notary Services</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-[#002147]">
                Notary Services <span className="text-[#A52A2A]">That Come To You</span>
              </h1>
              <p className="text-xl text-gray-700">
                Fast, reliable, and convenient notarization at your home, office, or preferred location throughout the
                Houston area.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/booking">
                  <Button size="lg" className="bg-[#A52A2A] hover:bg-[#8B0000] text-white w-full sm:w-auto">
                    Book Now
                  </Button>
                </Link>
                <Link href="/services">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-[#002147] text-[#002147] hover:bg-[#002147]/5 w-full sm:w-auto"
                  >
                    Our Services
                  </Button>
                </Link>
              </div>
              <div className="flex items-center pt-2">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-[#002147] flex items-center justify-center text-white text-xs">
                    JD
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#A52A2A] flex items-center justify-center text-white text-xs">
                    SM
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#91A3B0] flex items-center justify-center text-white text-xs">
                    KL
                  </div>
                </div>
                <div className="ml-3 text-sm text-gray-600">
                  <span className="font-medium">Trusted by 500+ clients</span> in the Houston area
                </div>
              </div>
            </div>
            <div className="relative order-1 md:order-2">
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-[#91A3B0]/20 rounded-full"></div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#A52A2A]/10 rounded-full"></div>

              <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <div className="absolute top-0 right-0 bg-[#A52A2A] text-white px-4 py-1 text-sm font-medium rounded-bl-lg">
                  Professional Service
                </div>

                <div className="p-6 pt-10">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-[#002147] rounded-full flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-white"
                      >
                        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                        <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-xl font-bold text-[#002147]">Mobile Notary</h3>
                      <p className="text-gray-600">We come to you</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-green-600"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                      <p className="ml-3 text-gray-700">Available 7 days a week</p>
                    </div>
                    <div className="flex items-start">
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-green-600"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                      <p className="ml-3 text-gray-700">Fast response times</p>
                    </div>
                    <div className="flex items-start">
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-green-600"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                      <p className="ml-3 text-gray-700">Experienced professionals</p>
                    </div>
                    <div className="flex items-start">
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-green-600"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                      <p className="ml-3 text-gray-700">Serving all of Houston</p>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-100">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-500">Starting at</p>
                        <p className="text-2xl font-bold text-[#002147]">$75</p>
                      </div>
                      <div className="bg-[#002147]/10 px-3 py-1 rounded-full">
                        <span className="text-sm font-medium text-[#002147]">Same-day available</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Hours Banner */}
      <section className="bg-[#A52A2A] text-white py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              <span>
                <strong>Essential Services:</strong> Mon-Fri, 9am-5pm
              </span>
            </div>
            <div className="flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              <span>
                <strong>Priority Services:</strong> 7 days a week, 7am-9pm
              </span>
            </div>
            <div className="flex items-center">
              <Phone className="mr-2 h-5 w-5" />
              <span>Call for same-day appointments</span>
            </div>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#002147] mb-4">Our Notary Services</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We offer a range of mobile notary services to meet your needs, from basic notarizations to complex loan
              signings.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Essential Service */}
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="bg-[#002147]/5">
                <CardTitle className="text-[#002147]">Essential Mobile Package</CardTitle>
                <CardDescription>Perfect for wills, POAs, and general notarizations</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-3xl font-bold mb-4">Starting at $75</p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                    <span>1-2 documents notarized</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                    <span>Travel within 15 miles included</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                    <span>Available Monday-Friday, 9am-5pm</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Link href="/services/essential" className="w-full">
                  <Button variant="outline" className="w-full">
                    Learn More
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            {/* Priority Service */}
            <Card className="shadow-md hover:shadow-lg transition-shadow border-[#A52A2A]">
              <CardHeader className="bg-[#A52A2A] text-white">
                <CardTitle>Priority Service Package</CardTitle>
                <CardDescription className="text-gray-100">For time-sensitive documents</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-3xl font-bold mb-4">$100 flat fee</p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                    <span>2-hour response time</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                    <span>Service from 7am-9pm daily</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                    <span>Up to 5 documents and 2 signers</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Link href="/services/priority" className="w-full">
                  <Button className="w-full bg-[#A52A2A] hover:bg-[#8B0000]">Learn More</Button>
                </Link>
              </CardFooter>
            </Card>

            {/* Loan Signing */}
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="bg-[#002147]/5">
                <CardTitle className="text-[#002147]">Loan Signing Services</CardTitle>
                <CardDescription>For real estate and mortgage transactions</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-3xl font-bold mb-4">$150 flat fee</p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                    <span>Unlimited documents</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                    <span>Up to 4 signers</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                    <span>90-minute signing session</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Link href="/services/loan-signing" className="w-full">
                  <Button variant="outline" className="w-full">
                    Learn More
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Link href="/services">
              <Button className="bg-[#002147] hover:bg-[#001a38]">
                View All Services
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#002147] mb-4">Why Choose Houston Mobile Notary Pros</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're committed to providing exceptional notary services with professionalism, convenience, and
              reliability.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-[#002147]/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-[#002147]" />
              </div>
              <h3 className="text-xl font-semibold text-[#002147] mb-2">Convenience</h3>
              <p className="text-gray-600">
                We come to your location, saving you time and hassle. Available evenings and weekends.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-[#002147]/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-[#002147]" />
              </div>
              <h3 className="text-xl font-semibold text-[#002147] mb-2">Experience</h3>
              <p className="text-gray-600">
                Our notaries are experienced professionals with specialized training in all types of notarizations.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-[#002147]/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-[#002147]" />
              </div>
              <h3 className="text-xl font-semibold text-[#002147] mb-2">Reliability</h3>
              <p className="text-gray-600">
                We arrive on time, every time. Our notaries are punctual, professional, and prepared.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-[#002147]/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-[#002147]" />
              </div>
              <h3 className="text-xl font-semibold text-[#002147] mb-2">Coverage</h3>
              <p className="text-gray-600">
                We serve the entire Houston metro area, with extended coverage available for an additional fee.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Service Area */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-[#002147] mb-4">Our Service Area</h2>
              <p className="text-gray-600 mb-6">
                We proudly serve the greater Houston area, including but not limited to:
              </p>
              <div className="grid grid-cols-2 gap-4">
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <MapPin className="text-[#A52A2A] mr-2 h-4 w-4" />
                    <span>Houston</span>
                  </li>
                  <li className="flex items-center">
                    <MapPin className="text-[#A52A2A] mr-2 h-4 w-4" />
                    <span>Galveston</span>
                  </li>
                  <li className="flex items-center">
                    <MapPin className="text-[#A52A2A] mr-2 h-4 w-4" />
                    <span>League City</span>
                  </li>
                  <li className="flex items-center">
                    <MapPin className="text-[#A52A2A] mr-2 h-4 w-4" />
                    <span>Pearland</span>
                  </li>
                </ul>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <MapPin className="text-[#A52A2A] mr-2 h-4 w-4" />
                    <span>Sugar Land</span>
                  </li>
                  <li className="flex items-center">
                    <MapPin className="text-[#A52A2A] mr-2 h-4 w-4" />
                    <span>Katy</span>
                  </li>
                  <li className="flex items-center">
                    <MapPin className="text-[#A52A2A] mr-2 h-4 w-4" />
                    <span>The Woodlands</span>
                  </li>
                  <li className="flex items-center">
                    <MapPin className="text-[#A52A2A] mr-2 h-4 w-4" />
                    <span>Baytown</span>
                  </li>
                </ul>
              </div>
              <p className="mt-6 text-gray-600">
                Our standard service area extends to a 20-mile radius from ZIP code 77591. We can travel beyond this
                area for an additional fee of $0.50 per mile.
              </p>
              <div className="mt-6">
                <Link href="/contact">
                  <Button variant="outline">
                    Check if We Serve Your Area
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative h-[400px] rounded-lg overflow-hidden shadow-lg">
              <Image src="/houston-street-grid.png" alt="Houston service area map" fill className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <TestimonialCarousel
            title="What Our Clients Say"
            description="Read testimonials from satisfied clients who have used our mobile notary services"
            itemsToShow={3}
          />
          <div className="text-center mt-8">
            <Link href="/testimonials">
              <Button variant="outline">
                View All Testimonials
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#002147] mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Find answers to common questions about our mobile notary services
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
            <MiniFAQ faqs={faqs} showMoreLink={true} />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[#002147] text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Ready to Book Your Notary Service?</h2>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto">
              Schedule your appointment today and experience the convenience of our mobile notary services.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/booking">
              <Button size="lg" className="bg-[#A52A2A] hover:bg-[#8B0000] text-white w-full sm:w-auto">
                Book Now
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-[#002147] w-full sm:w-auto"
              >
                Contact Us
              </Button>
            </Link>
          </div>
          <div className="mt-8 text-center">
            <p className="text-gray-200 mb-2">Have questions? We're here to help!</p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <div className="flex items-center justify-center">
                <Phone className="mr-2 h-5 w-5" />
                <span>(123) 456-7890</span>
              </div>
              <div className="flex items-center justify-center">
                <Mail className="mr-2 h-5 w-5" />
                <span>info@houstonmobilenotarypros.com</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
