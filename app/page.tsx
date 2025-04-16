import Link from "next/link"
import Image from "next/image"
import {
  MapPin,
  Clock,
  Award,
  CheckCircle,
  ArrowRight,
  Phone,
  Mail,
  Shield,
  Calendar,
  FileText,
  Users,
  Star,
} from "lucide-react"
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
      {/* Hero Section with Background Image */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <Image src="/hero-background.jpg" alt="Houston skyline" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-r from-[#002147]/90 to-[#002147]/70"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 text-white">
              <div className="inline-block bg-[#A52A2A] px-4 py-2 rounded-full">
                <span className="text-white font-medium">Professional Mobile Notary Services</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Notary Services <span className="text-[#91A3B0]">That Come To You</span>
              </h1>
              <p className="text-xl text-gray-100">
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
                    className="border-white text-white hover:bg-white/20 w-full sm:w-auto"
                  >
                    Our Services
                  </Button>
                </Link>
              </div>
              <div className="flex items-center pt-2">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-[#A52A2A] flex items-center justify-center text-white text-xs">
                    JD
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#91A3B0] flex items-center justify-center text-white text-xs">
                    SM
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white text-[#002147] flex items-center justify-center text-xs">
                    KL
                  </div>
                </div>
                <div className="ml-3 text-sm text-gray-200">
                  <span className="font-medium">Trusted by 500+ clients</span> in the Houston area
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 backdrop-blur-sm bg-white/95">
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
                      <div className="bg-[#002147] text-white px-3 py-1 rounded-full">
                        <span className="text-sm font-medium">Same-day available</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-[#91A3B0]/30 rounded-full blur-md"></div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#A52A2A]/20 rounded-full blur-md"></div>
            </div>
          </div>
        </div>

        {/* Decorative wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="w-full h-auto">
            <path
              fill="#ffffff"
              fillOpacity="1"
              d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
            ></path>
          </svg>
        </div>
      </section>

      {/* Service Hours Banner - Simplified */}
      <section className="bg-[#002147] text-white py-5">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center">
              <div className="bg-[#91A3B0] p-2 rounded-full mr-3">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-white text-sm font-medium">Essential Services</p>
                <p className="text-white/80 text-xs">Mon-Fri, 9am-5pm</p>
              </div>
            </div>

            <div className="flex items-center">
              <div className="bg-[#91A3B0] p-2 rounded-full mr-3">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-white text-sm font-medium">Priority Services</p>
                <p className="text-white/80 text-xs">7 days a week, 7am-9pm</p>
              </div>
            </div>

            <div className="flex items-center">
              <div className="bg-[#A52A2A] p-2 rounded-full mr-3">
                <Phone className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-white text-sm font-medium">Need Same-Day Service?</p>
                <p className="text-white/80 text-xs">Call (123) 456-7890</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Overview - Simplified */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-block bg-[#002147]/10 px-4 py-2 rounded-full mb-4">
              <span className="text-[#002147] font-medium">Our Services</span>
            </div>
            <h2 className="text-3xl font-bold text-[#002147] mb-4">Professional Notary Solutions</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We offer a range of mobile notary services to meet your needs, from basic notarizations to complex loan
              signings.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Essential Service */}
            <Card className="shadow-md hover:shadow-lg transition-all duration-300 border-t-4 border-t-[#002147]">
              <CardHeader className="bg-[#002147]/5 pb-2">
                <div className="flex items-center mb-2">
                  <div className="bg-[#002147] p-2 rounded-full mr-3">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-[#002147]">Essential Mobile Package</CardTitle>
                </div>
                <CardDescription>Perfect for wills, POAs, and general notarizations</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex items-baseline mb-6">
                  <p className="text-3xl font-bold text-[#002147]">$75</p>
                  <span className="ml-2 text-gray-500">starting at</span>
                </div>
                <ul className="space-y-3">
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
              <CardFooter className="pt-4 pb-6">
                <Link href="/services/essential" className="w-full">
                  <Button
                    variant="outline"
                    className="w-full border-[#002147] text-[#002147] hover:bg-[#002147] hover:text-white"
                  >
                    Learn More
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            {/* Priority Service */}
            <Card className="shadow-xl hover:shadow-2xl transition-all duration-300 border-t-4 border-t-[#A52A2A] relative">
              <div className="absolute top-0 right-0 bg-[#A52A2A] text-white px-3 py-1 text-xs font-medium rounded-bl-lg -mt-1">
                MOST POPULAR
              </div>
              <CardHeader className="bg-[#A52A2A] text-white pb-2">
                <div className="flex items-center mb-2">
                  <div className="bg-white p-2 rounded-full mr-3">
                    <Clock className="h-5 w-5 text-[#A52A2A]" />
                  </div>
                  <CardTitle>Priority Service Package</CardTitle>
                </div>
                <CardDescription className="text-gray-100">For time-sensitive documents</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex items-baseline mb-6">
                  <p className="text-3xl font-bold text-[#002147]">$100</p>
                  <span className="ml-2 text-gray-500">flat fee</span>
                </div>
                <ul className="space-y-3">
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
              <CardFooter className="pt-4 pb-6">
                <Link href="/services/priority" className="w-full">
                  <Button className="w-full bg-[#A52A2A] hover:bg-[#8B0000]">Learn More</Button>
                </Link>
              </CardFooter>
            </Card>

            {/* Loan Signing */}
            <Card className="shadow-md hover:shadow-lg transition-all duration-300 border-t-4 border-t-[#002147]">
              <CardHeader className="bg-[#002147]/5 pb-2">
                <div className="flex items-center mb-2">
                  <div className="bg-[#002147] p-2 rounded-full mr-3">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-[#002147]">Loan Signing Services</CardTitle>
                </div>
                <CardDescription>For real estate and mortgage transactions</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex items-baseline mb-6">
                  <p className="text-3xl font-bold text-[#002147]">$150</p>
                  <span className="ml-2 text-gray-500">flat fee</span>
                </div>
                <ul className="space-y-3">
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
              <CardFooter className="pt-4 pb-6">
                <Link href="/services/loan-signing" className="w-full">
                  <Button
                    variant="outline"
                    className="w-full border-[#002147] text-[#002147] hover:bg-[#002147] hover:text-white"
                  >
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

      {/* Why Choose Us - Simplified */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-block bg-[#002147]/10 px-4 py-2 rounded-full mb-4">
              <span className="text-[#002147] font-medium">Why Choose Us</span>
            </div>
            <h2 className="text-3xl font-bold text-[#002147] mb-4">The Houston Mobile Notary Pros Difference</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're committed to providing exceptional notary services with professionalism, convenience, and
              reliability.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
              <div className="bg-[#002147]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="h-8 w-8 text-[#002147]" />
              </div>
              <h3 className="text-xl font-semibold text-[#002147] mb-3 text-center">Convenience</h3>
              <p className="text-gray-600 text-center">
                We come to your location, saving you time and hassle. Available evenings and weekends.
              </p>
              <div className="w-12 h-1 bg-[#A52A2A] mx-auto mt-4"></div>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
              <div className="bg-[#002147]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="h-8 w-8 text-[#002147]" />
              </div>
              <h3 className="text-xl font-semibold text-[#002147] mb-3 text-center">Experience</h3>
              <p className="text-gray-600 text-center">
                Our notaries are experienced professionals with specialized training in all types of notarizations.
              </p>
              <div className="w-12 h-1 bg-[#A52A2A] mx-auto mt-4"></div>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
              <div className="bg-[#002147]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-8 w-8 text-[#002147]" />
              </div>
              <h3 className="text-xl font-semibold text-[#002147] mb-3 text-center">Reliability</h3>
              <p className="text-gray-600 text-center">
                We arrive on time, every time. Our notaries are punctual, professional, and prepared.
              </p>
              <div className="w-12 h-1 bg-[#A52A2A] mx-auto mt-4"></div>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
              <div className="bg-[#002147]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="h-8 w-8 text-[#002147]" />
              </div>
              <h3 className="text-xl font-semibold text-[#002147] mb-3 text-center">Trusted</h3>
              <p className="text-gray-600 text-center">
                Fully insured with $100k E&O coverage. Strict compliance with all Texas notary laws.
              </p>
              <div className="w-12 h-1 bg-[#A52A2A] mx-auto mt-4"></div>
            </div>
          </div>

          {/* Stats section */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-[#002147] text-white p-6 rounded-lg text-center">
              <p className="text-4xl font-bold mb-2">500+</p>
              <p className="text-sm">Satisfied Clients</p>
            </div>
            <div className="bg-[#A52A2A] text-white p-6 rounded-lg text-center">
              <p className="text-4xl font-bold mb-2">20+</p>
              <p className="text-sm">Mile Service Radius</p>
            </div>
            <div className="bg-[#91A3B0] text-white p-6 rounded-lg text-center">
              <p className="text-4xl font-bold mb-2">7</p>
              <p className="text-sm">Days a Week</p>
            </div>
            <div className="bg-[#002147] text-white p-6 rounded-lg text-center">
              <p className="text-4xl font-bold mb-2">100%</p>
              <p className="text-sm">Satisfaction Guarantee</p>
            </div>
          </div>
        </div>
      </section>

      {/* Service Area - Fixed with proper map */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block bg-[#91A3B0]/20 px-4 py-2 rounded-full mb-4">
                <span className="text-[#002147] font-medium">Service Coverage</span>
              </div>
              <h2 className="text-3xl font-bold text-[#002147] mb-4">Our Service Area</h2>
              <p className="text-gray-600 mb-6">
                We proudly serve the greater Houston area, including but not limited to:
              </p>

              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-[#002147] mb-2 border-b border-gray-200 pb-2">North & West</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <MapPin className="text-[#A52A2A] mr-2 h-4 w-4" />
                      <span>Houston</span>
                    </li>
                    <li className="flex items-center">
                      <MapPin className="text-[#A52A2A] mr-2 h-4 w-4" />
                      <span>The Woodlands</span>
                    </li>
                    <li className="flex items-center">
                      <MapPin className="text-[#A52A2A] mr-2 h-4 w-4" />
                      <span>Katy</span>
                    </li>
                    <li className="flex items-center">
                      <MapPin className="text-[#A52A2A] mr-2 h-4 w-4" />
                      <span>Sugar Land</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-[#002147] mb-2 border-b border-gray-200 pb-2">South & East</h3>
                  <ul className="space-y-2">
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
                    <li className="flex items-center">
                      <MapPin className="text-[#A52A2A] mr-2 h-4 w-4" />
                      <span>Baytown</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-[#002147]/5 p-5 rounded-lg border border-[#002147]/10 mb-6">
                <div className="flex items-start">
                  <div className="bg-[#002147] p-2 rounded-full mr-3 shrink-0">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#002147] mb-1">Standard Service Area</h3>
                    <p className="text-gray-700">
                      Our standard service area extends to a 20-mile radius from ZIP code 77591. We can travel beyond
                      this area for an additional fee of $0.50 per mile.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <Link href="/contact">
                  <Button className="bg-[#002147] hover:bg-[#001a38]">
                    Check if We Serve Your Area
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="h-[450px] rounded-lg overflow-hidden shadow-md border border-gray-200">
                <Image
                  src="/texas-city-radius.png"
                  alt="Service area map showing 20-mile radius from ZIP 77591"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#002147]/60 to-transparent"></div>

                {/* Service radius indicator */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-[300px] h-[300px] border-2 border-[#A52A2A] rounded-full opacity-70 flex items-center justify-center">
                    <div className="w-4 h-4 bg-[#A52A2A] rounded-full"></div>
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <div className="flex items-center mb-2">
                    <div className="w-3 h-3 bg-[#A52A2A] rounded-full mr-2"></div>
                    <p className="font-semibold">ZIP 77591 (Texas City, TX)</p>
                  </div>
                  <p className="text-sm mb-1">20-mile standard service radius</p>
                  <p className="text-sm">Extended coverage available for additional fee</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials - Simplified */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-block bg-[#91A3B0]/20 px-4 py-2 rounded-full mb-4">
              <span className="text-[#002147] font-medium">Client Testimonials</span>
            </div>
            <h2 className="text-3xl font-bold text-[#002147] mb-4">What Our Clients Say</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Read testimonials from satisfied clients who have used our mobile notary services
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md mb-12">
            <div className="flex justify-center mb-6">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-6 w-6 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
            </div>
            <TestimonialCarousel itemsToShow={3} />
          </div>

          <div className="text-center">
            <Link href="/testimonials">
              <Button variant="outline" className="border-[#002147] text-[#002147] hover:bg-[#002147] hover:text-white">
                View All Testimonials
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section - Simplified */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-block bg-[#002147]/10 px-4 py-2 rounded-full mb-4">
              <span className="text-[#002147] font-medium">FAQ</span>
            </div>
            <h2 className="text-3xl font-bold text-[#002147] mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Find answers to common questions about our mobile notary services
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="bg-white p-8 rounded-lg shadow-md border border-gray-100">
              <MiniFAQ faqs={faqs} showMoreLink={true} />

              <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-[#002147]">Still have questions?</h3>
                  <p className="text-gray-600 text-sm">We're here to help with any questions you may have.</p>
                </div>
                <Link href="/faq">
                  <Button className="bg-[#002147] hover:bg-[#001a38]">
                    View All FAQs
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Simplified */}
      <section className="py-16 bg-[#002147]">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">Ready to Book Your Notary Service?</h2>
              <p className="text-xl text-gray-200 max-w-2xl mx-auto">
                Schedule your appointment today and experience the convenience of our mobile notary services.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
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

            <div className="grid md:grid-cols-2 gap-6 text-white">
              <div className="bg-white/10 p-4 rounded-lg">
                <div className="flex items-center mb-3">
                  <Phone className="mr-3 h-5 w-5 text-[#91A3B0]" />
                  <h3 className="font-semibold">Call Us</h3>
                </div>
                <p className="text-lg">(123) 456-7890</p>
                <p className="text-sm text-gray-300">Available 7am-9pm daily</p>
              </div>

              <div className="bg-white/10 p-4 rounded-lg">
                <div className="flex items-center mb-3">
                  <Mail className="mr-3 h-5 w-5 text-[#91A3B0]" />
                  <h3 className="font-semibold">Email Us</h3>
                </div>
                <p className="text-lg">info@houstonmobilenotarypros.com</p>
                <p className="text-sm text-gray-300">We respond within 2 hours</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
