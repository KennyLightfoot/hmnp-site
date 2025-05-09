import Link from "next/link"
import { ChevronLeft, Check, Building, Users, Briefcase, GraduationCap, HardHat } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Define Base URL for metadata
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://houstonmobilenotarypros.com'; // Replace with your actual domain

export const metadata = {
  metadataBase: new URL(BASE_URL),
  title: "Houston Business Notary Services | Reliable Corporate Packages | HMNP",
  description:
    "Streamline your Houston business's notary needs with our reliable, professional packages. Tailored solutions for efficiency, compliance, and peace of mind.",
  keywords:
    "business notary Houston, corporate notary services, mobile notary for business, title company notary, healthcare notary, construction notary, education notary, Houston notary packages, Houston corporate notary, reliable business notary, professional notary packages, efficient notary solutions, business compliance notary",
  alternates: {
    canonical: '/services/business',
  },
  openGraph: {
    title: "Professional Business Notary Packages in Houston | HMNP",
    description: "Optimize your Houston business operations with HMNP's tailored notary packages. Ensure efficiency, compliance, and peace of mind with our reliable mobile services.",
    url: `${BASE_URL}/services/business`,
    siteName: 'Houston Mobile Notary Pros',
    images: [
      {
        url: '/og-image.jpg', // Ensure this image exists in /public
        width: 1200,
        height: 630,
        alt: 'Business Notary Packages by Houston Mobile Notary Pros',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Houston Business Notary: Packages for Efficiency & Compliance | HMNP",
    description: "Reliable mobile notary packages for Houston businesses. Save time, ensure compliance, and operate with peace of mind. Tailored solutions available.",
    // Add your Twitter handle here if you have one
    // siteId: 'YourTwitterID',
    // creator: '@YourTwitterHandle',
    // creatorId: 'YourTwitterCreatorID',
    images: [`${BASE_URL}/og-image.jpg`], // Must be an absolute URL
  },
}

export default function BusinessPackagesPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Link href="/services" className="flex items-center text-[#002147] hover:text-[#A52A2A] mb-8">
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back to All Services
      </Link>

      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-[#002147] mb-4">Business Notary Packages</h1>
        <p className="text-xl text-gray-700 max-w-3xl mx-auto">
          Streamline your operations with <span className="font-semibold text-[#002147]">reliable, professional notary packages</span> designed for your business needs. Experience <span className="font-semibold text-[#002147]">efficiency, compliance, and complete peace of mind</span>.
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
            <p className="mb-4 text-sm text-gray-700">A seamless, reliable notary partnership for title companies and real estate professionals, ensuring efficient and precise closings every time.</p>
            <h3 className="text-xl font-semibold mb-3">What's Included:</h3>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Guaranteed priority scheduling to meet your demanding closing timelines.</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Direct access via a dedicated phone line for swift communication.</span>
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
                <span>Clear monthly reporting and analytics for transparency and business insights.</span>
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
            <p className="mb-4 text-sm text-gray-700">Our premier concierge package, offering comprehensive and proactive notary support to keep your business operations running smoothly and efficiently.</p>
            <h3 className="text-xl font-semibold mb-3">What's Included:</h3>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Includes up to 10 standard notarizations, handled with professional care.</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Convenient, scheduled on-site service twice a month.</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Reliable access during scheduled office hours for your team.</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Efficient verification of employee documents (e.g., I-9 forms).</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Simplified corporate billing for easy expense management.</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Personalized service from a dedicated account manager for clear communication.</span>
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
            <p className="mb-4 text-sm text-gray-700">HIPAA-compliant, compassionate, and precise notary services tailored for healthcare facilities, ensuring patient needs and regulatory requirements are met with utmost care.</p>
            <h3 className="text-xl font-semibold mb-3">What's Included:</h3>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Strictly HIPAA-compliant handling of all sensitive patient documents.</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Priority response for urgent needs within medical facilities.</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Discreet and compassionate patient room visits.</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Expert handling of Healthcare Powers of Attorney and Advance Directives.</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Informative staff training sessions on notary procedures and compliance.</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Rapid 90-minute emergency response for critical situations.</span>
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
            <p className="mb-4 text-sm text-gray-700">Reliable and precise notary support for educational institutions, ensuring document integrity and clear processes for students, faculty, and administration.</p>
            <h3 className="text-xl font-semibold mb-3">What's Included:</h3>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Accurate and efficient student ID verification services.</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Expert handling of international student documentation with clarity and care.</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Priority notary service for faculty and staff needs.</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Convenient on-campus office hours for easy accessibility.</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Cost-effective bulk processing discounts for high-volume needs.</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Precise certification of academic transcripts, diplomas, and other official documents.</span>
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
            <p className="mb-4 text-sm text-gray-700">Robust and reliable notary solutions for the fast-paced construction and real estate development sectors, ensuring critical documents are handled with precision and efficiency on-site.</p>
            <h3 className="text-xl font-semibold mb-3">What's Included:</h3>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Flexible multiple site visits to accommodate your project schedules.</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Efficient processing of contractor agreements and compliance documents.</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Meticulous handling of lien releases to protect your interests.</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Accurate notarization of permit applications and related documentation.</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Timely notarization for progress payments to keep projects on track.</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Clear, project-based billing for straightforward financial management.</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Reliable emergency weekend service for urgent project needs.</span>
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
            <p className="mb-4 text-sm text-gray-700">
              Your business is unique. We provide bespoke notary solutions, meticulously crafted to your specific operational needs, ensuring maximum efficiency, compliance, and peace of mind.
            </p>
            <h3 className="text-xl font-semibold mb-3">Potential Inclusions:</h3>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Service frequency precisely matched to your workflow.</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Expert handling of documents unique to your industry, ensuring compliance and clarity.</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Seamless notary coverage across multiple business locations.</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Customized notary procedure training for your staff, enhancing internal efficiency.</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Tailored reporting and analytics for clear oversight and valuable insights.</span>
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
        <p className="text-gray-700 mb-6 text-center max-w-2xl mx-auto">
          Partnering with Houston Mobile Notary Pros for your business needs translates into tangible benefits:
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-[#002147] mb-3">Time & Cost Savings</h3>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Boost productivity by eliminating employee travel for notarizations.</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Minimize costly document processing delays with our efficient service.</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Simplify budgeting with clear, predictable monthly billing.</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Achieve greater cost-efficiency with volume discounts for regular service.</span>
              </li>
            </ul>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-[#002147] mb-3">Convenience & Reliability</h3>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Ultimate convenience with professional on-site service at your business location(s).</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Dependable priority scheduling when urgent notary needs arise.</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Experience consistently professional and reliable service every time.</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Enjoy clear communication and personalized support from a dedicated account manager.</span>
              </li>
            </ul>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-[#002147] mb-3">Expertise & Compliance</h3>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Benefit from our expert knowledge of industry-specific documents and notary requirements.</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Significantly reduce the risk of document rejection due to notarization errors.</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Operate with confidence knowing our services are fully insured ($100k E&O).</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Ensure full compliance with all Texas notary laws and best practices.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-gray-50 p-8 rounded-lg mb-16">
        <h2 className="text-2xl font-bold text-[#002147] mb-6">How Our Business Packages Work</h2>
        <p className="text-gray-700 mb-8 text-center max-w-3xl mx-auto">
          Our process for establishing your business notary package is designed for clarity, collaboration, and a seamless start to our professional partnership:
        </p>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="bg-[#A52A2A] text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              1
            </div>
            <h3 className="font-semibold mb-2 text-[#002147]">Initial Consultation</h3>
            <p className="text-sm text-gray-700">We begin with a clear consultation to understand your unique business needs and recommend the most effective package.</p>
          </div>
          <div className="text-center">
            <div className="bg-[#A52A2A] text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              2
            </div>
            <h3 className="font-semibold mb-2 text-[#002147]">Customization</h3>
            <p className="text-sm text-gray-700">Your chosen package is meticulously tailored to your specific requirements, ensuring a perfect fit for your operations.</p>
          </div>
          <div className="text-center">
            <div className="bg-[#A52A2A] text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              3
            </div>
            <h3 className="font-semibold mb-2 text-[#002147]">Implementation</h3>
            <p className="text-sm text-gray-700">We implement your service plan with precision, including scheduling, account setup, and clear communication protocols.</p>
          </div>
          <div className="text-center">
            <div className="bg-[#A52A2A] text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              4
            </div>
            <h3 className="font-semibold mb-2 text-[#002147]">Ongoing Service</h3>
            <p className="text-sm text-gray-700">Benefit from reliable, ongoing service delivery, supported by transparent monthly reporting and proactive account reviews.</p>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-6 text-center">
          To understand the full notary process that underpins all our services, please see our detailed{" "}
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
        <h2 className="text-2xl font-bold mb-4">Partner with Us for Reliable, Professional Business Notary Services</h2>
        <p className="mb-6 max-w-2xl mx-auto">
          Elevate your business operations with tailored notary solutions that deliver efficiency, ensure compliance, and provide complete peace of mind. Schedule a consultation to discover the perfect package for your organization.
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
