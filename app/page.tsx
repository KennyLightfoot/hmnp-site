import Link from "next/link"
import { MapPin, Clock, Shield, Calendar, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import TestimonialCarousel from "@/components/testimonial-carousel"
import ServiceAreaMap from "@/components/service-area-map"
import ServiceAreaLegend from "@/components/service-area-legend"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-[#002147] text-white">
        <div className="container mx-auto px-4 py-20 md:py-24 flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Houston Mobile Notary Pros</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl">Professional Notary Services Day & Evening</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="bg-[#A52A2A] hover:bg-[#8B0000] text-white">
              <Link href="/booking">Book Appointment</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[#002147]">
              View Services
            </Button>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-white to-transparent"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-[#002147]">
            Why Choose Houston Mobile Notary Pros?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="bg-[#91A3B0]/20 p-4 rounded-full mb-4">
                <Clock className="h-10 w-10 text-[#A52A2A]" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast Response Times</h3>
              <p className="text-gray-600">Priority service with 2-hour response time available 7am-9pm daily.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="bg-[#91A3B0]/20 p-4 rounded-full mb-4">
                <MapPin className="h-10 w-10 text-[#A52A2A]" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Mobile Service</h3>
              <p className="text-gray-600">We come to you within a 30-mile radius of ZIP 77591.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="bg-[#91A3B0]/20 p-4 rounded-full mb-4">
                <Shield className="h-10 w-10 text-[#A52A2A]" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Fully Insured</h3>
              <p className="text-gray-600">$100k E&O Insurance for your peace of mind.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-[#002147]">Our Services</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="shadow-lg">
              <CardHeader className="bg-[#002147] text-white">
                <CardTitle>Essential Package</CardTitle>
                <CardDescription className="text-gray-200">Perfect for general notarizations</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-3xl font-bold mb-4">$75</p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="text-[#A52A2A] mr-2">✓</span>
                    <span>1 signer, 2 documents</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#A52A2A] mr-2">✓</span>
                    <span>15-mile radius travel</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#A52A2A] mr-2">✓</span>
                    <span>Mon-Fri, 9am-5pm</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-[#002147] hover:bg-[#001a38]">
                  <Link href="/booking">Book Now</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card className="shadow-lg border-[#A52A2A] border-2">
              <CardHeader className="bg-[#A52A2A] text-white">
                <CardTitle>Priority Package</CardTitle>
                <CardDescription className="text-gray-200">For urgent notarization needs</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-3xl font-bold mb-4">$100</p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="text-[#A52A2A] mr-2">✓</span>
                    <span>2-hour response time</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#A52A2A] mr-2">✓</span>
                    <span>Up to 5 documents, 2 signers</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#A52A2A] mr-2">✓</span>
                    <span>7am-9pm daily service</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-[#A52A2A] hover:bg-[#8B0000]">
                  <Link href="/booking">Book Now</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card className="shadow-lg">
              <CardHeader className="bg-[#002147] text-white">
                <CardTitle>Loan Signing</CardTitle>
                <CardDescription className="text-gray-200">Specialized for real estate</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-3xl font-bold mb-4">$150</p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="text-[#A52A2A] mr-2">✓</span>
                    <span>Unlimited documents</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#A52A2A] mr-2">✓</span>
                    <span>Up to 4 signers</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#A52A2A] mr-2">✓</span>
                    <span>Title company shipping</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-[#002147] hover:bg-[#001a38]">
                  <Link href="/booking">Book Now</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
          <div className="text-center mt-8">
            <Link href="/services">
              <Button variant="outline" className="border-[#002147] text-[#002147]">
                View All Services & Fees
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Service Area Map */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-6 text-[#002147]">Our Service Area</h2>
          <p className="text-center mb-8 max-w-2xl mx-auto text-gray-600">
            We provide mobile notary services within a 30-mile radius of ZIP 77591, covering Houston and surrounding
            areas. Travel within 20 miles is free, with a small fee for extended distances.
          </p>
          <div className="max-w-4xl mx-auto">
            <ServiceAreaMap height="450px" />
            <ServiceAreaLegend />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <TestimonialCarousel />
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-[#91A3B0]/20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6 text-[#002147]">Ready to Book Your Notary Service?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Schedule an appointment today and have a professional mobile notary come to your location.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-[#A52A2A] hover:bg-[#8B0000]">
              <Calendar className="mr-2 h-5 w-5" />
              <Link href="/booking">Book Appointment</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-[#002147] text-[#002147]">
              <Phone className="mr-2 h-5 w-5" />
              Contact Us
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
