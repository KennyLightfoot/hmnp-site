import Link from "next/link"
import { ChevronLeft, Check, Building, Users, Briefcase, GraduationCap, HardHat } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function BusinessPackagesPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Link href="/services" className="flex items-center text-[#002147] hover:text-[#A52A2A] mb-8">
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back to All Services
      </Link>

      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-[#002147] mb-4">Business Notary Packages</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Tailored notary solutions for businesses and organizations
        </p>
      </div>

      {/* Service Options */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {/* Title Company Partnership */}
        <Card className="shadow-md">
          <CardHeader className="bg-[#002147] text-white">
            <CardTitle className="flex items-center">
              <Building className="mr-2 h-5 w-5" />
              Title Company Partnership
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-3xl font-bold mb-6">$125/month</p>
            <p className="mb-4">Dedicated notary services for title companies and real estate professionals.</p>
            <h3 className="text-xl font-semibold mb-3">What's Included:</h3>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Priority scheduling for closings</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Dedicated phone line</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>
                  Volume pricing:
                  <ul className="ml-6 mt-1">
                    <li>1-10 signings: $140/each</li>
                    <li>11-20 signings: $130/each</li>
                    <li>21+ signings: $120/each</li>
                  </ul>
                </span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Monthly reporting and analytics</span>
              </li>
            </ul>
            <div className="mt-6">
              <Button className="w-full bg-[#002147] hover:bg-[#001a38]">Request Partnership</Button>
            </div>
          </CardContent>
        </Card>

        {/* Business Concierge Package */}
        <Card className="shadow-md">
          <CardHeader className="bg-[#002147] text-white">
            <CardTitle className="flex items-center">
              <Briefcase className="mr-2 h-5 w-5" />
              Business Concierge Package
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-3xl font-bold mb-6">$200/month</p>
            <p className="mb-4">Comprehensive notary services for businesses with regular document needs.</p>
            <h3 className="text-xl font-semibold mb-3">What's Included:</h3>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Up to 10 standard notarizations</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>On-site service twice monthly</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Scheduled office hours</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Employee document verification</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Corporate billing options</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Dedicated account manager</span>
              </li>
            </ul>
            <div className="mt-6">
              <Button className="w-full bg-[#002147] hover:bg-[#001a38]">Request Concierge Service</Button>
            </div>
          </CardContent>
        </Card>

        {/* Healthcare Provider Package */}
        <Card className="shadow-md">
          <CardHeader className="bg-[#002147] text-white">
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Healthcare Provider Package
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-3xl font-bold mb-6">$175/month</p>
            <p className="mb-4">Specialized notary services for healthcare facilities and medical professionals.</p>
            <h3 className="text-xl font-semibold mb-3">What's Included:</h3>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>HIPAA-compliant document handling</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Medical facility priority service</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Patient room visits</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Healthcare POA expertise</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Staff training sessions</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Emergency response (within 90 minutes)</span>
              </li>
            </ul>
            <div className="mt-6">
              <Button className="w-full bg-[#002147] hover:bg-[#001a38]">Request Healthcare Package</Button>
            </div>
          </CardContent>
        </Card>

        {/* Education Institution Package */}
        <Card className="shadow-md">
          <CardHeader className="bg-[#002147] text-white">
            <CardTitle className="flex items-center">
              <GraduationCap className="mr-2 h-5 w-5" />
              Education Institution Package
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-3xl font-bold mb-6">$150/month</p>
            <p className="mb-4">Tailored notary services for schools, colleges, and universities.</p>
            <h3 className="text-xl font-semibold mb-3">What's Included:</h3>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Student ID verification services</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>International student document processing</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Faculty/Staff priority service</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Campus office hours</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Bulk processing discounts</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Academic document certification</span>
              </li>
            </ul>
            <div className="mt-6">
              <Button className="w-full bg-[#002147] hover:bg-[#001a38]">Request Education Package</Button>
            </div>
          </CardContent>
        </Card>

        {/* Construction & Real Estate Developer Package */}
        <Card className="shadow-md">
          <CardHeader className="bg-[#002147] text-white">
            <CardTitle className="flex items-center">
              <HardHat className="mr-2 h-5 w-5" />
              Construction & Real Estate Package
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-3xl font-bold mb-6">$250/month</p>
            <p className="mb-4">Specialized notary services for construction companies and real estate developers.</p>
            <h3 className="text-xl font-semibold mb-3">What's Included:</h3>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Multiple site visits</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Contractor document processing</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Lien release handling</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Permit documentation</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Progress payment notarization</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Project-based billing</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Emergency weekend service</span>
              </li>
            </ul>
            <div className="mt-6">
              <Button className="w-full bg-[#002147] hover:bg-[#001a38]">Request Construction Package</Button>
            </div>
          </CardContent>
        </Card>

        {/* Custom Business Solution */}
        <Card className="shadow-md border-[#A52A2A] border-2">
          <CardHeader className="bg-[#A52A2A] text-white">
            <CardTitle className="flex items-center">
              <Briefcase className="mr-2 h-5 w-5" />
              Custom Business Solution
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-3xl font-bold mb-6">Custom Pricing</p>
            <p className="mb-4">
              Don't see a package that fits your business needs? We'll create a custom solution tailored specifically
              for your organization.
            </p>
            <h3 className="text-xl font-semibold mb-3">Potential Inclusions:</h3>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Custom service frequency</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Industry-specific document handling</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Multi-location service</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Specialized training for your staff</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Custom reporting and analytics</span>
              </li>
            </ul>
            <div className="mt-6">
              <Button className="w-full bg-[#A52A2A] hover:bg-[#8B0000]">Request Custom Solution</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Business Benefits */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-[#002147] mb-6">Benefits for Your Business</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-[#002147] mb-3">Time & Cost Savings</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Eliminate employee travel time to notary offices</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Reduce document processing delays</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Predictable monthly billing</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Volume discounts for regular users</span>
              </li>
            </ul>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-[#002147] mb-3">Convenience & Reliability</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>On-site service at your location</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Priority scheduling for urgent needs</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Consistent, professional service</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Dedicated account manager</span>
              </li>
            </ul>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-[#002147] mb-3">Expertise & Compliance</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Industry-specific document knowledge</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Reduced risk of document rejection</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Fully insured service ($100k E&O coverage)</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Compliance with Texas notary laws</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-gray-50 p-8 rounded-lg mb-16">
        <h2 className="text-2xl font-bold text-[#002147] mb-6">How Our Business Packages Work</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="bg-[#A52A2A] text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              1
            </div>
            <h3 className="font-semibold mb-2">Initial Consultation</h3>
            <p className="text-sm">We discuss your business needs and recommend the best package</p>
          </div>
          <div className="text-center">
            <div className="bg-[#A52A2A] text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              2
            </div>
            <h3 className="font-semibold mb-2">Customization</h3>
            <p className="text-sm">We tailor the package to your specific requirements</p>
          </div>
          <div className="text-center">
            <div className="bg-[#A52A2A] text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              3
            </div>
            <h3 className="font-semibold mb-2">Implementation</h3>
            <p className="text-sm">We set up your service schedule and account management</p>
          </div>
          <div className="text-center">
            <div className="bg-[#A52A2A] text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              4
            </div>
            <h3 className="font-semibold mb-2">Ongoing Service</h3>
            <p className="text-sm">Regular service delivery with monthly reporting and reviews</p>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-[#002147] mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-[#002147] mb-2">
              Can we change our package as our needs evolve?
            </h3>
            <p>
              Yes, all business packages can be adjusted with 30 days' notice. We understand that business needs change,
              and we're flexible in adapting your service package accordingly.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-[#002147] mb-2">
              How are additional services beyond the package billed?
            </h3>
            <p>
              Any services beyond your package allowance are billed at a discounted rate compared to our standard
              pricing. These additional services will appear on your monthly invoice with clear itemization.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-[#002147] mb-2">
              Do you offer multi-location service for businesses?
            </h3>
            <p>
              Yes, we can service multiple locations within our service area. For businesses with locations outside our
              standard service area, we can discuss extended coverage options with additional travel fees.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-[#002147] mb-2">
              Is there a minimum contract period for business packages?
            </h3>
            <p>
              Our standard business packages require a 3-month minimum commitment. After this initial period, service
              continues on a month-to-month basis with a 30-day cancellation notice.
            </p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-[#002147] text-white p-8 rounded-lg text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to Streamline Your Business Notary Needs?</h2>
        <p className="mb-6 max-w-2xl mx-auto">
          Contact us today to discuss how our business packages can save your organization time and money.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-[#A52A2A] hover:bg-[#8B0000] text-white">
            Request Business Package
          </Button>
          <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[#002147]">
            Schedule Consultation
          </Button>
        </div>
      </div>
    </div>
  )
}
