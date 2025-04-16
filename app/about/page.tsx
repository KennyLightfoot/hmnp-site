import Link from "next/link"
import Image from "next/image"
import { ChevronRight, Check, Shield, Clock, Award, MapPin, FileText, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "About Us | Houston Mobile Notary Pros",
  description:
    "Learn about Houston Mobile Notary Pros, our history, mission, and commitment to providing professional mobile notary services throughout the Houston area.",
  keywords:
    "about Houston Mobile Notary Pros, mobile notary company, notary history, professional notary, Houston notary service",
}

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-[#002147] mb-4">About Houston Mobile Notary Pros</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Professional mobile notary services delivered with integrity, reliability, and convenience throughout the
          Houston area.
        </p>
      </div>

      {/* Company Story */}
      <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
        <div>
          <h2 className="text-2xl font-bold text-[#002147] mb-6">Our Story</h2>
          <p className="text-gray-600 mb-4">
            Houston Mobile Notary Pros was founded with a simple mission: to make notary services more accessible and
            convenient for the residents and businesses of Houston and surrounding areas.
          </p>
          <p className="text-gray-600 mb-4">
            What began as a small operation has grown into one of Houston's most trusted mobile notary services, with a
            reputation for reliability, professionalism, and exceptional customer service.
          </p>
          <p className="text-gray-600 mb-4">
            Over the years, we've expanded our service offerings and coverage area to meet the diverse needs of our
            clients, from individuals requiring basic document notarization to businesses needing regular notary
            services and specialized solutions.
          </p>
          <p className="text-gray-600">
            Today, we're proud to serve hundreds of clients throughout the greater Houston area, bringing professional
            notary services directly to their homes, offices, hospitals, or any other convenient location.
          </p>
        </div>
        <div className="relative h-[400px] rounded-lg overflow-hidden shadow-md">
          <Image src="/houston-street-grid.png" alt="Houston city map" fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#002147]/60 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h3 className="text-xl font-bold mb-2">Serving Houston Since 2018</h3>
            <p>Bringing professional notary services to your doorstep</p>
          </div>
        </div>
      </div>

      {/* Mission & Values */}
      <div className="bg-[#002147]/5 p-8 rounded-lg mb-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-[#002147] mb-4">Our Mission & Values</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            At Houston Mobile Notary Pros, we're guided by a set of core principles that define how we operate and serve
            our clients.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="bg-white shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-[#002147]">
                <Shield className="mr-2 h-5 w-5 text-[#A52A2A]" />
                Integrity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                We uphold the highest ethical standards in all our interactions. As notaries, we recognize the
                importance of our role in preventing fraud and ensuring the validity of important documents.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-[#002147]">
                <Clock className="mr-2 h-5 w-5 text-[#A52A2A]" />
                Reliability
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                We understand that our clients depend on us to be punctual, prepared, and professional. We take this
                responsibility seriously and strive to exceed expectations with every appointment.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-[#002147]">
                <Users className="mr-2 h-5 w-5 text-[#A52A2A]" />
                Convenience
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                We believe that notary services should adapt to our clients' needs, not the other way around. That's why
                we come to you, on your schedule, making the process as simple and hassle-free as possible.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Credentials & Qualifications */}
      <div className="mb-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-[#002147] mb-4">Our Credentials & Qualifications</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Houston Mobile Notary Pros maintains the highest professional standards in the industry.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="bg-[#002147] p-3 rounded-full mr-4">
                <Award className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#002147]">Professional Standards</h3>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>All notaries commissioned by the Texas Secretary of State</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Comprehensive background checks for all team members</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Regular participation in continuing education programs</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Specialized training for loan signing agents</span>
              </li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="bg-[#002147] p-3 rounded-full mr-4">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#002147]">Insurance & Compliance</h3>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>$100,000 Errors & Omissions (E&O) insurance coverage</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Strict compliance with all Texas notary laws and regulations</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Secure record-keeping and document handling</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Regular audits of notary journals and procedures</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Service Commitment */}
      <div className="bg-[#002147] text-white p-8 rounded-lg mb-16 text-center">
        <h2 className="text-2xl font-bold mb-6">Our Service Commitment</h2>
        <p className="text-xl max-w-3xl mx-auto mb-8">
          When you choose Houston Mobile Notary Pros, you can expect professional, efficient, and courteous service
          every time. We're not satisfied unless you are.
        </p>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="bg-white/10 p-4 rounded-lg">
            <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8" />
            </div>
            <h3 className="font-semibold mb-2">Punctuality</h3>
            <p className="text-sm">We arrive on time, every time</p>
          </div>
          <div className="bg-white/10 p-4 rounded-lg">
            <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8" />
            </div>
            <h3 className="font-semibold mb-2">Expertise</h3>
            <p className="text-sm">Professional handling of all document types</p>
          </div>
          <div className="bg-white/10 p-4 rounded-lg">
            <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8" />
            </div>
            <h3 className="font-semibold mb-2">Security</h3>
            <p className="text-sm">Confidential and secure document handling</p>
          </div>
          <div className="bg-white/10 p-4 rounded-lg">
            <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8" />
            </div>
            <h3 className="font-semibold mb-2">Courtesy</h3>
            <p className="text-sm">Respectful and professional service</p>
          </div>
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="mb-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-[#002147] mb-4">Why Choose Houston Mobile Notary Pros</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            We understand you have options when it comes to notary services. Here's why clients throughout Houston
            choose us:
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <h3 className="text-xl font-bold text-[#002147] mb-4">For Individuals</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Convenience of service at your home, office, or preferred location</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Flexible scheduling, including evenings and weekends</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Clear, upfront pricing with no hidden fees</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Professional service for all document types</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Priority service available for urgent needs</span>
              </li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <h3 className="text-xl font-bold text-[#002147] mb-4">For Businesses</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Customized service packages for regular notary needs</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Volume discounts and corporate billing options</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Specialized expertise for industry-specific documents</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Dedicated account manager for consistent service</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Compliance with all regulatory requirements</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Service Area */}
      <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
        <div className="relative h-[400px] rounded-lg overflow-hidden shadow-md">
          <Image
            src="/texas-city-radius.png"
            alt="Service area map showing 20-mile radius from ZIP 77591"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#002147]/60 to-transparent"></div>

          {/* Service radius indicator */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[250px] h-[250px] border-2 border-[#A52A2A] rounded-full opacity-70 flex items-center justify-center">
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

        <div>
          <h2 className="text-2xl font-bold text-[#002147] mb-6">Our Service Area</h2>
          <p className="text-gray-600 mb-4">
            Houston Mobile Notary Pros serves clients throughout the greater Houston area, including:
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
                  Our standard service area extends to a 20-mile radius from ZIP code 77591. We can travel beyond this
                  area for an additional fee of $0.50 per mile.
                </p>
              </div>
            </div>
          </div>

          <Link href="/contact">
            <Button className="bg-[#002147] hover:bg-[#001a38]">
              Check if We Serve Your Area
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-[#A52A2A] text-white p-8 rounded-lg text-center">
        <h2 className="text-2xl font-bold mb-4">Experience Our Professional Service</h2>
        <p className="mb-6 max-w-2xl mx-auto">
          Ready to experience the convenience and professionalism of Houston Mobile Notary Pros? Book your appointment
          today or contact us to learn more about our services.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/booking">
            <Button size="lg" className="bg-white text-[#A52A2A] hover:bg-gray-100">
              Book Now
            </Button>
          </Link>
          <Link href="/contact">
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/20">
              Contact Us
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
