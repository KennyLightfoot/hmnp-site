import Link from "next/link"
import { ChevronLeft, Printer, Cloud, Mail, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Define Base URL for metadata
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://houstonmobilenotarypros.com'; // Replace with your actual domain

export const metadata = {
  metadataBase: new URL(BASE_URL),
  title: "Comprehensive Notary Add-On Services Houston | Printing, Storage & More | HMNP",
  description:
    "Elevate your Houston mobile notary experience with our convenient add-on services: printing, secure storage, mail, premium times, and more. Handled with care and precision.",
  keywords:
    "notary printing Houston, notary scanning, notary mail service, document storage, notary premium time slots, Houston mobile notary, notary add-on services, Houston notary add-ons, secure document solutions, notary convenience services, professional document handling, complete notary service Houston",
  alternates: {
    canonical: '/services/additional',
  },
  openGraph: {
    title: "Houston Mobile Notary: Full Suite of Add-On Services | HMNP",
    description: "Go beyond notarization with HMNP's add-on services in Houston. Printing, secure cloud storage, mail, and premium booking for a complete, stress-free experience.",
    url: `${BASE_URL}/services/additional`,
    siteName: 'Houston Mobile Notary Pros',
    images: [
      {
        url: '/og-image.jpg', // Ensure this image exists in /public
        width: 1200,
        height: 630,
        alt: 'Additional Notary Services by Houston Mobile Notary Pros',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "More Than Notary: Houston Add-On Services (Printing, Storage) | HMNP",
    description: "Complete your Houston notary needs with our professional add-on services: document printing, secure storage, mail, bilingual support & premium times. Book with confidence!",
    // Add your Twitter handle here if you have one
    // siteId: 'YourTwitterID',
    // creator: '@YourTwitterHandle',
    // creatorId: 'YourTwitterCreatorID',
    images: [`${BASE_URL}/og-image.jpg`], // Must be an absolute URL
  },
}

export default function AdditionalServicesPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Link href="/services" className="flex items-center text-[#002147] hover:text-[#A52A2A] mb-8">
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back to All Services
      </Link>

      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-[#002147] mb-4">Additional Services</h1>
        <p className="text-xl text-gray-700 max-w-3xl mx-auto">
          Elevate your notary experience with convenient add-on services designed for your <span className="font-semibold text-[#002147]">complete peace of mind and efficiency</span>. Handled with our signature <span className="font-semibold text-[#002147]">care and precision</span>.
        </p>
      </div>

      {/* Service Categories */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {/* Document Services */}
        <Card className="shadow-md">
          <CardHeader className="bg-[#002147] text-white">
            <CardTitle className="flex items-center">
              <Printer className="mr-2 h-5 w-5" />
              Document Services
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="mb-4 text-sm text-gray-700">Save time and hassle. We handle your document printing, scanning, and faxing needs with precision and care.</p>
            <h3 className="text-xl font-semibold mb-3">Printing</h3>
            <ul className="space-y-2 mb-6">
              <li className="flex items-start">
                <span className="text-[#A52A2A] mr-2">•</span>
                <span>Black & White: $0.30/page</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#A52A2A] mr-2">•</span>
                <span>Color: $1.00/page</span>
              </li>
            </ul>
            <h3 className="text-xl font-semibold mb-3">Scanning & Faxing</h3>
            <ul className="space-y-2 mb-6">
              <li className="flex items-start">
                <span className="text-[#A52A2A] mr-2">•</span>
                <span>Basic Fax/Scan: $15</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#A52A2A] mr-2">•</span>
                <span>Secure Email Delivery: $10</span>
              </li>
            </ul>
            <div className="mt-6">
              <Button className="w-full bg-[#002147] hover:bg-[#001a38]">Add to Booking</Button>
            </div>
          </CardContent>
        </Card>

        {/* Digital Storage */}
        <Card className="shadow-md">
          <CardHeader className="bg-[#002147] text-white">
            <CardTitle className="flex items-center">
              <Cloud className="mr-2 h-5 w-5" />
              Digital Storage
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <h3 className="text-xl font-semibold mb-3">Secure Cloud Storage</h3>
            <ul className="space-y-2 mb-6">
              <li className="flex items-start">
                <span className="text-[#A52A2A] mr-2">•</span>
                <span>Monthly Plan: $15/month</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#A52A2A] mr-2">•</span>
                <span>Annual Plan: $150/year (save $30)</span>
              </li>
            </ul>
            <p className="mb-4 text-sm text-gray-700">
              Enjoy peace of mind with our secure, encrypted cloud storage for your vital documents. Access them anytime, anywhere, with confidence in their protection. Includes up to 10GB.
            </p>
            <div className="mt-6">
              <Button className="w-full bg-[#002147] hover:bg-[#001a38]">Learn More</Button>
            </div>
          </CardContent>
        </Card>

        {/* Mail Services */}
        <Card className="shadow-md">
          <CardHeader className="bg-[#002147] text-white">
            <CardTitle className="flex items-center">
              <Mail className="mr-2 h-5 w-5" />
              Mail Services
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="mb-4 text-sm text-gray-700">Ensure your documents reach their destination reliably. We offer USPS Certified Mail and express shipping options, handled efficiently.</p>
            <h3 className="text-xl font-semibold mb-3">USPS Services</h3>
            <ul className="space-y-2 mb-6">
              <li className="flex items-start">
                <span className="text-[#A52A2A] mr-2">•</span>
                <span>USPS Certified Mail: $20</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#A52A2A] mr-2">•</span>
                <span>Return Receipt: +$5</span>
              </li>
            </ul>
            <h3 className="text-xl font-semibold mb-3">Express Shipping</h3>
            <ul className="space-y-2 mb-6">
              <li className="flex items-start">
                <span className="text-[#A52A2A] mr-2">•</span>
                <span>Overnight Document Handling: $35</span>
              </li>
            </ul>
            <div className="mt-6">
              <Button className="w-full bg-[#002147] hover:bg-[#001a38]">Add to Booking</Button>
            </div>
          </CardContent>
        </Card>

        {/* Premium Time Slots */}
        <Card className="shadow-md">
          <CardHeader className="bg-[#002147] text-white">
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              Premium Time Slots
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <h3 className="text-xl font-semibold mb-3">Special Scheduling</h3>
            <ul className="space-y-2 mb-6">
              <li className="flex items-start">
                <span className="text-[#A52A2A] mr-2">•</span>
                <span>Sunday & Federal Holidays: +$40</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#A52A2A] mr-2">•</span>
                <span>After-Hours (7-9pm): +$30</span>
              </li>
            </ul>
            <p className="mb-4 text-sm text-gray-700">For your convenience, we offer premium time slots outside standard hours. Book in advance to secure appointments that fit your demanding schedule, always handled with our professional care. Premium time slots require 24-hour advance booking and are subject to availability.</p>
            <div className="mt-6">
              <Button className="w-full bg-[#002147] hover:bg-[#001a38]">Check Availability</Button>
            </div>
          </CardContent>
        </Card>

        {/* Bilingual Services */}
        <Card className="shadow-md">
          <CardHeader className="bg-[#002147] text-white">
            <CardTitle>Bilingual Services</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <h3 className="text-xl font-semibold mb-3">Spanish/English</h3>
            <ul className="space-y-2 mb-6">
              <li className="flex items-start">
                <span className="text-[#A52A2A] mr-2">•</span>
                <span>Bilingual Notary: +$20</span>
              </li>
            </ul>
            <p className="mb-4 text-sm text-gray-700">
              Ensuring clear communication for all parties, our professional bilingual (Spanish/English) notaries provide calm and accurate assistance with document explanation and notarization, fostering complete understanding.
            </p>
            <div className="mt-6">
              <Button className="w-full bg-[#002147] hover:bg-[#001a38]">Request Bilingual Service</Button>
            </div>
          </CardContent>
        </Card>

        {/* Custom Add-Ons */}
        <Card className="shadow-md border-[#A52A2A] border-2">
          <CardHeader className="bg-[#A52A2A] text-white">
            <CardTitle>Custom Add-Ons</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="mb-4 text-sm text-gray-700">
              Have a unique requirement? We're here to provide flexible, tailored solutions. Contact us to discuss how we can create a custom add-on service with the clarity and precision you expect.
            </p>
            <h3 className="text-xl font-semibold mb-3">Examples:</h3>
            <ul className="space-y-2 mb-6">
              <li className="flex items-start">
                <span className="text-[#A52A2A] mr-2">•</span>
                <span>Document preparation assistance</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#A52A2A] mr-2">•</span>
                <span>Multi-language services</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#A52A2A] mr-2">•</span>
                <span>Specialized document handling</span>
              </li>
            </ul>
            <div className="mt-6">
              <Button className="w-full bg-[#A52A2A] hover:bg-[#8B0000]">Request Custom Service</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Value-Added Services */}
      <div className="bg-gray-50 p-8 rounded-lg mb-16">
        <h2 className="text-2xl font-bold text-[#002147] mb-6">Complimentary Value-Added Services</h2>
        <p className="mb-6 text-gray-700">
          The following services are included at no additional charge with any notary service booking, ensuring a seamless and stress-free experience:
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold text-[#002147] mb-3">Digital Document Archiving</h3>
            <p className="text-gray-700 text-sm">For your convenience and peace of mind, enjoy complimentary secure digital archiving of your notarized documents for one full year.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold text-[#002147] mb-3">Real-Time SMS Updates</h3>
            <p className="text-gray-700 text-sm">Stay informed with complimentary real-time SMS updates, providing clarity and status tracking throughout your service.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold text-[#002147] mb-3">Mobile Tracking</h3>
            <p className="text-gray-700 text-sm">Experience predictability with our complimentary mobile tracking system, allowing you to monitor your notary's arrival time.</p>
          </div>
        </div>
      </div>

      {/* How to Add Services */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-[#002147] mb-6">How to Add These Services</h2>
        <p className="text-gray-700 mb-6 text-center max-w-2xl mx-auto">
          Adding these convenient services to your appointment is simple and designed for your ease:
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="bg-[#91A3B0]/20">
              <CardTitle className="flex items-center">
                <div className="bg-[#002147] text-white w-8 h-8 rounded-full flex items-center justify-center mr-2">
                  1
                </div>
                During Booking
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p>
                Select additional services when making your appointment online or mention them when booking by phone.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="bg-[#91A3B0]/20">
              <CardTitle className="flex items-center">
                <div className="bg-[#002147] text-white w-8 h-8 rounded-full flex items-center justify-center mr-2">
                  2
                </div>
                Before Your Appointment
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p>
                Contact us at least 2 hours before your scheduled appointment to add services to an existing booking.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="bg-[#91A3B0]/20">
              <CardTitle className="flex items-center">
                <div className="bg-[#002147] text-white w-8 h-8 rounded-full flex items-center justify-center mr-2">
                  3
                </div>
                During Your Appointment
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p>
                Some services can be added during your appointment, subject to availability and notary capabilities.
              </p>
            </CardContent>
          </Card>
        </div>
        <p className="text-sm text-gray-600 mt-6 text-center">
          To understand the full notary process before adding these services, please see our detailed{" "}
          <Link href="/what-to-expect" className="text-[#A52A2A] hover:underline font-medium">
            What to Expect guide
          </Link>.
        </p>
      </div>

      {/* FAQ */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-[#002147] mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-[#002147] mb-2">
              How secure is your cloud storage for documents?
            </h3>
            <p>
              Our cloud storage uses 256-bit AES encryption and complies with industry security standards. All data is
              stored on secure servers with regular backups. We maintain strict access controls and can provide a
              detailed security overview upon request.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-[#002147] mb-2">
              Can I add printing services at the last minute?
            </h3>
            <p>
              Yes, printing services can usually be added even during your appointment. However, for large document sets
              (over 20 pages), we recommend giving us advance notice to ensure we bring sufficient supplies.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-[#002147] mb-2">
              How do I access my documents in cloud storage?
            </h3>
            <p>
              After subscribing to our cloud storage service, you'll receive secure login credentials to access your
              documents through our client portal. You can view, download, and manage your documents 24/7 from any
              device with internet access.
            </p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-[#002147] text-white p-8 rounded-lg text-center">
        <h2 className="text-2xl font-bold mb-4">Create Your Complete, Stress-Free Notary Solution</h2>
        <p className="mb-6 max-w-2xl mx-auto">
          Customize your appointment with our range of professional add-on services for ultimate convenience and peace of mind. Let us handle all the details with care and precision.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/booking">
            <Button size="lg" className="bg-[#A52A2A] hover:bg-[#8B0000] text-white w-full sm:w-auto">
              Book with Additional Services
            </Button>
          </Link>
          <Link href="/contact">
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[#002147] w-full sm:w-auto">
              Contact for Custom Services
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
