import Link from "next/link"
import { Button } from "@/components/ui/button"
import ServiceAreaMap from "@/components/service-area-map"
import ServiceAreaLegend from "@/components/service-area-legend"
import MiniFAQ from "@/components/mini-faq"

export default function ServiceAreaPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-[#002147] mb-4">Our Service Area</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Houston Mobile Notary Pros serves clients throughout Houston and surrounding areas. Check our coverage map to
          see if you're within our service area.
        </p>
      </div>

      {/* Map Section */}
      <div className="mb-16">
        <div className="max-w-4xl mx-auto">
          <ServiceAreaMap height="500px" />
          <ServiceAreaLegend />
        </div>
      </div>

      {/* Coverage Details */}
      <div className="grid md:grid-cols-2 gap-12 mb-16">
        <div>
          <h2 className="text-2xl font-bold text-[#002147] mb-6">Areas We Serve</h2>
          <p className="mb-4">
            Our mobile notaries are based in Texas City (ZIP 77591) and serve clients within a 30-mile radius,
            including:
          </p>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 mb-6">
            <div>
              <ul className="list-disc list-inside space-y-1">
                <li>Houston</li>
                <li>Galveston</li>
                <li>League City</li>
                <li>Pearland</li>
                <li>Sugar Land</li>
                <li>Friendswood</li>
              </ul>
            </div>
            <div>
              <ul className="list-disc list-inside space-y-1">
                <li>Katy</li>
                <li>The Woodlands</li>
                <li>Baytown</li>
                <li>Missouri City</li>
                <li>Clear Lake</li>
                <li>Dickinson</li>
              </ul>
            </div>
          </div>
          <p>Not sure if you're within our service area? Enter your address in the map above or contact us directly.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[#002147] mb-6">Travel Fees</h2>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-[#002147] mb-2">Standard Service Area (0-20 miles)</h3>
              <p>No travel fee within a 20-mile radius of ZIP 77591.</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-[#002147] mb-2">Extended Service Area (20-30 miles)</h3>
              <p>$0.50 per mile for the distance beyond 20 miles.</p>
              <p className="text-sm text-gray-600 mt-2">
                Example: For a location 25 miles away, the travel fee would be $2.50 (5 miles × $0.50).
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-[#002147] mb-2">Beyond 30 Miles</h3>
              <p>
                Service may be available for locations beyond 30 miles at a higher mileage rate. Please contact us for a
                custom quote.
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-[#002147] mb-2">Additional Considerations</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Toll fees are charged at cost</li>
                <li>Severe weather may incur a $0.65/mile surcharge</li>
                <li>Priority Service extends coverage to 35 miles</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mb-16">
        <MiniFAQ
          faqs={[
            {
              id: "calculate-distance",
              question: "How do you calculate the travel distance?",
              answer:
                "We calculate travel distance based on the most direct driving route from our base location (ZIP 77591) to your location, not as a straight-line distance. We use Google Maps to determine the exact mileage.",
            },
            {
              id: "outside-service-area",
              question: "What if I'm outside your service area?",
              answer:
                "If you're located beyond our standard 30-mile service radius, please contact us directly. We may be able to accommodate your request for an additional travel fee, depending on our schedule and the distance involved.",
            },
            {
              id: "multiple-locations",
              question: "Do you charge travel fees between multiple locations?",
              answer:
                "If your appointment requires our notary to travel to multiple locations, additional travel fees may apply for the distance between locations. Please discuss your specific needs with us when booking.",
            },
          ]}
        />
      </div>

      {/* Call to Action */}
      <div className="bg-[#002147] text-white p-8 rounded-lg text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to Book Your Mobile Notary?</h2>
        <p className="mb-6 max-w-2xl mx-auto">
          Whether you're in downtown Houston or the surrounding suburbs, we're ready to come to your location.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-[#A52A2A] hover:bg-[#8B0000] text-white">
            <Link href="/booking">Book Appointment</Link>
          </Button>
          <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[#002147]">
            <Link href="/contact">Contact Us</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
