import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Shield, Award, Users, MapPin, Clock, Phone } from "lucide-react"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { PageHeader } from "@/components/page-header"

const description =
  "Learn about Houston Mobile Notary Pros and our commitment to providing professional mobile notary services throughout the Houston area."

export const metadata: Metadata = {
  title: "About Us | Houston Mobile Notary Pros",
  description,
}

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      {/* Page Header */}
      <PageHeader
        title="About Houston Mobile Notary Pros"
        description="Professional, reliable, and convenient mobile notary services throughout the Greater Houston area."
        className="mb-8 md:mb-12 text-center"
      />

      {/* Hero Section */}
      <section className="mb-16 bg-[#002147] text-white rounded-xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          <div className="p-8 md:p-12 flex flex-col justify-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Your Trusted Mobile Notary Service</h2>
            <p className="text-lg mb-6 text-gray-200">
              At Houston Mobile Notary Pros, we bring professional notary services directly to you. Our team of
              experienced notaries is dedicated to making the notarization process as convenient and stress-free as
              possible.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button className="bg-[#A52A2A] hover:bg-[#8B2323] text-white border-none">
                <Link href="/booking">Book an Appointment</Link>
              </Button>
              <Button variant="outline" className="border-white text-white hover:bg-white/10">
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
          <div className="relative min-h-[300px] lg:min-h-[500px]">
            <OptimizedImage
              src="/placeholder.svg?height=800&width=800"
              alt="Houston Mobile Notary Pros Team"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-center">
          <div className="order-2 lg:order-1">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-[#002147]">Our Story</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                Houston Mobile Notary Pros was founded with a simple mission: to make notary services more accessible
                and convenient for the people of Houston.
              </p>
              <p>
                We recognized that traditional notary services often required individuals to take time out of their busy
                schedules to visit a physical location during limited business hours. This could be particularly
                challenging for those with mobility issues, busy professionals, or individuals dealing with
                time-sensitive documents.
              </p>
              <p>
                Our solution was to bring the notary service directly to our clients, offering flexible scheduling
                options that accommodate their needs, including evening and weekend appointments.
              </p>
              <p>
                Today, we're proud to be one of Houston's leading mobile notary services, continuing our commitment to
                making notarization as convenient and stress-free as possible for our clients.
              </p>
            </div>
          </div>
          <div className="relative h-[300px] md:h-[400px] rounded-xl overflow-hidden shadow-lg order-1 lg:order-2">
            <OptimizedImage
              src="/placeholder.svg?height=800&width=800"
              alt="Our Story"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      {/* What Sets Us Apart Section */}
      <section className="mb-16">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center text-[#002147]">What Sets Us Apart</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-[#002147]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-[#002147]" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-center text-[#002147]">Professional & Reliable</h3>
            <p className="text-gray-600 text-center">
              Our notaries are fully licensed in Texas and carry E&O Insurance. We pride ourselves on punctuality and
              professionalism with every appointment.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-[#A52A2A]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="h-8 w-8 text-[#A52A2A]" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-center text-[#002147]">Exceptional Service</h3>
            <p className="text-gray-600 text-center">
              We go above and beyond to ensure a smooth notarization process, offering clear communication and guidance
              throughout your experience with us.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-[#91A3B0]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-[#91A3B0]" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-center text-[#002147]">Client-Focused</h3>
            <p className="text-gray-600 text-center">
              We understand the importance of your documents and provide a client-centered approach with flexible
              scheduling to meet your unique needs.
            </p>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="mb-16 bg-gray-50 rounded-xl p-8 md:p-12">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center text-[#002147]">Why Choose Us</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="flex items-start space-x-4">
            <div className="bg-[#002147] rounded-full p-3 text-white">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2 text-[#002147]">Flexible Scheduling</h3>
              <p className="text-gray-600">
                We offer appointments 7 days a week, including evenings and weekends to accommodate your busy schedule.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="bg-[#A52A2A] rounded-full p-3 text-white">
              <MapPin className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2 text-[#002147]">Mobile Service</h3>
              <p className="text-gray-600">
                We come to your preferred location – home, office, coffee shop, or anywhere convenient for you.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="bg-[#91A3B0] rounded-full p-3 text-white">
              <Phone className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2 text-[#002147]">Responsive Communication</h3>
              <p className="text-gray-600">
                We respond promptly to inquiries and keep you informed throughout the scheduling process.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Service Area Section */}
      <section className="mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-center">
          <div className="relative h-[300px] md:h-[400px] rounded-xl overflow-hidden shadow-lg">
            <OptimizedImage
              src="/placeholder.svg?height=800&width=800"
              alt="Our Service Area"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-[#002147]">Our Service Area</h2>
            <p className="text-gray-700 mb-4">
              We proudly serve the Greater Houston area, providing mobile notary services within a 20-mile radius of ZIP
              code 77591.
            </p>
            <p className="text-gray-700 mb-4">Our service area includes but is not limited to:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
              <div className="bg-gray-50 px-3 py-2 rounded text-center text-gray-700">Texas City</div>
              <div className="bg-gray-50 px-3 py-2 rounded text-center text-gray-700">League City</div>
              <div className="bg-gray-50 px-3 py-2 rounded text-center text-gray-700">Dickinson</div>
              <div className="bg-gray-50 px-3 py-2 rounded text-center text-gray-700">La Marque</div>
              <div className="bg-gray-50 px-3 py-2 rounded text-center text-gray-700">Kemah</div>
              <div className="bg-gray-50 px-3 py-2 rounded text-center text-gray-700">Santa Fe</div>
              <div className="bg-gray-50 px-3 py-2 rounded text-center text-gray-700">Galveston</div>
              <div className="bg-gray-50 px-3 py-2 rounded text-center text-gray-700">Clear Lake</div>
              <div className="bg-gray-50 px-3 py-2 rounded text-center text-gray-700">Friendswood</div>
            </div>
            <p className="text-gray-700 mb-6">
              Need service outside our standard area? We can travel beyond our 20-mile radius for an additional $0.50
              per mile.
            </p>
            <Button className="bg-[#002147] hover:bg-[#001a38] text-white">
              <Link href="/service-area">View Full Service Area</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Preview */}
      <section className="mb-16">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center text-[#002147]">What Our Clients Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Testimonial 1 */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-[#002147] rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                S
              </div>
              <div>
                <h3 className="font-semibold">Sarah Johnson</h3>
                <p className="text-sm text-gray-500">Real Estate Transaction</p>
              </div>
            </div>
            <p className="text-gray-700 italic">
              "The notary arrived on time and was extremely professional. Made our home closing process so much easier!"
            </p>
          </div>

          {/* Testimonial 2 */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-[#A52A2A] rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                M
              </div>
              <div>
                <h3 className="font-semibold">Michael Rodriguez</h3>
                <p className="text-sm text-gray-500">Power of Attorney</p>
              </div>
            </div>
            <p className="text-gray-700 italic">
              "I needed a power of attorney notarized quickly, and they accommodated my schedule with same-day service.
              Excellent!"
            </p>
          </div>

          {/* Testimonial 3 */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-[#91A3B0] rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                J
              </div>
              <div>
                <h3 className="font-semibold">Jennifer Lee</h3>
                <p className="text-sm text-gray-500">Loan Signing</p>
              </div>
            </div>
            <p className="text-gray-700 italic">
              "The notary explained everything clearly and made sure all documents were properly signed. Very thorough
              and professional."
            </p>
          </div>
        </div>
        <div className="text-center mt-8">
          <Button variant="outline" className="border-[#002147] text-[#002147] hover:bg-[#002147] hover:text-white">
            <Link href="/testimonials">View All Testimonials</Link>
          </Button>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-[#002147] to-[#003a7a] text-white rounded-xl overflow-hidden">
        <div className="p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Experience Our Professional Service?</h2>
          <p className="text-lg max-w-3xl mx-auto mb-8 text-gray-200">
            Book an appointment today and discover why clients throughout Houston choose us for their mobile notary
            needs.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button className="bg-[#A52A2A] hover:bg-[#8B2323] text-white border-none">
              <Link href="/booking">Book Now</Link>
            </Button>
            <Button variant="outline" className="border-white text-white hover:bg-white/10">
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

