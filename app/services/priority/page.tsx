import Link from "next/link"
import { ChevronLeft, Check, Clock, MapPin, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PriorityServicePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Link href="/services" className="flex items-center text-[#002147] hover:text-[#A52A2A] mb-8">
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back to All Services
      </Link>

      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-[#002147] mb-4">Priority Service Package</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">For time-sensitive documents and last-minute needs</p>
      </div>

      {/* Hero Banner */}
      <div className="bg-[#A52A2A] text-white p-8 rounded-lg mb-12">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center">
            <Clock className="h-12 w-12 mb-4" />
            <h3 className="text-xl font-semibold mb-2">2-Hour Response</h3>
            <p>Quick service when you need it most</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <MapPin className="h-12 w-12 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Extended Coverage</h3>
            <p>35-mile service radius</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <Shield className="h-12 w-12 mb-4" />
            <h3 className="text-xl font-semibold mb-2">7am-9pm Daily</h3>
            <p>Including weekends and evenings</p>
          </div>
        </div>
      </div>

      {/* Service Description */}
      <div className="grid md:grid-cols-2 gap-12 mb-16">
        <div>
          <h2 className="text-2xl font-bold text-[#002147] mb-4">Service Overview</h2>
          <p className="mb-4">
            Our Priority Service Package is designed for clients with urgent notarization needs. When time is of the
            essence, we provide a rapid response with our 2-hour service window, available from 7am to 9pm, seven days a
            week.
          </p>
          <p className="mb-4">
            This premium service ensures that your time-sensitive documents are notarized promptly and professionally.
            Whether you're facing a tight deadline or need last-minute notarization, our Priority Service has you
            covered.
          </p>
          <p>
            All of our notaries are commissioned by the state of Texas, carry E&O insurance, and follow strict protocols
            to ensure the validity of every notarization, even when time is limited.
          </p>
        </div>
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-2xl font-bold text-[#002147] mb-4">Package Details</h2>
          <p className="text-3xl font-bold mb-6">$100 flat fee</p>
          <h3 className="text-xl font-semibold mb-3">What's Included:</h3>
          <ul className="space-y-3 mb-6">
            <li className="flex items-start">
              <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
              <span>2-hour response time</span>
            </li>
            <li className="flex items-start">
              <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
              <span>Service from 7am-9pm daily</span>
            </li>
            <li className="flex items-start">
              <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
              <span>Up to 5 documents</span>
            </li>
            <li className="flex items-start">
              <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
              <span>2 signers</span>
            </li>
            <li className="flex items-start">
              <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
              <span>Extended 35-mile radius (+$0.50/mile beyond 20 miles)</span>
            </li>
            <li className="flex items-start">
              <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
              <span>SMS status updates</span>
            </li>
          </ul>
          <h3 className="text-xl font-semibold mb-3">Additional Options:</h3>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-[#A52A2A] mr-2">+</span>
              <span>Additional signers: $10 each</span>
            </li>
            <li className="flex items-start">
              <span className="text-[#A52A2A] mr-2">+</span>
              <span>Extra documents (beyond 5): $5 each</span>
            </li>
          </ul>
        </div>
      </div>

      {/* When to Choose Priority Service */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-[#002147] mb-6">When to Choose Priority Service</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Urgent Deadlines</CardTitle>
            </CardHeader>
            <CardContent>
              <p>When you need notarization completed today for time-sensitive submissions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>After-Hours Needs</CardTitle>
            </CardHeader>
            <CardContent>
              <p>When you need service outside of standard business hours</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Last-Minute Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <p>When unexpected notarization needs arise with little notice</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Process */}
      <div className="bg-gray-50 p-8 rounded-lg mb-16">
        <h2 className="text-2xl font-bold text-[#002147] mb-6">The Priority Service Process</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="bg-[#A52A2A] text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              1
            </div>
            <h3 className="font-semibold mb-2">Request Service</h3>
            <p className="text-sm">Call or book online with "Priority" selected</p>
          </div>
          <div className="text-center">
            <div className="bg-[#A52A2A] text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              2
            </div>
            <h3 className="font-semibold mb-2">Confirmation</h3>
            <p className="text-sm">Receive confirmation and ETA within 15 minutes</p>
          </div>
          <div className="text-center">
            <div className="bg-[#A52A2A] text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              3
            </div>
            <h3 className="font-semibold mb-2">Notary Arrival</h3>
            <p className="text-sm">Notary arrives within the 2-hour window</p>
          </div>
          <div className="text-center">
            <div className="bg-[#A52A2A] text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              4
            </div>
            <h3 className="font-semibold mb-2">Service Completion</h3>
            <p className="text-sm">Documents notarized and payment collected</p>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-[#002147] mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-[#002147] mb-2">What if I need service in less than 2 hours?</h3>
            <p>
              While our standard Priority Service guarantees a 2-hour window, we may be able to accommodate more urgent
              requests depending on notary availability. Please call us directly to discuss your specific timeline.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-[#002147] mb-2">Is Priority Service available on holidays?</h3>
            <p>
              Yes, Priority Service is available on most holidays for an additional $40 surcharge. Please book in
              advance when possible for holiday service.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-[#002147] mb-2">
              What happens if I'm outside the 35-mile service radius?
            </h3>
            <p>
              We can still provide Priority Service beyond the 35-mile radius for an additional mileage fee of
              $0.65/mile (instead of the standard $0.50/mile) for the distance beyond 35 miles.
            </p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-[#A52A2A] text-white p-8 rounded-lg text-center">
        <h2 className="text-2xl font-bold mb-4">Need Urgent Notary Service?</h2>
        <p className="mb-6 max-w-2xl mx-auto">
          Don't wait! Book our Priority Service now and have a professional notary at your location within 2 hours.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-white text-[#A52A2A] hover:bg-gray-100">
            Book Priority Service
          </Button>
          <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[#A52A2A]">
            Call Now
          </Button>
        </div>
      </div>
    </div>
  )
}
