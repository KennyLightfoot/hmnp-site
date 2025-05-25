import Link from "next/link"
import { ChevronLeft, Check, Building, Users, Briefcase, GraduationCap, HardHat, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import MiniFAQ from "@/components/mini-faq";

// Define Base URL for metadata
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://houstonmobilenotarypros.com';

export const metadata = {
  metadataBase: new URL(BASE_URL),
  title: "Business Notary Solutions Houston | Corporate & Volume Signings | HMNP",
  description:
    "Tailored Business Notary Solutions in Houston. We offer volume signings, block-booking discounts, corporate accounts, and recurring appointments to keep your business moving.",
  keywords:
    "business notary solutions Houston, corporate notary services, volume notary signings, block-booking notary, recurring notary appointments, mobile notary for business Houston, Houston notary packages",
  alternates: {
    canonical: '/services/business',
  },
  openGraph: {
    title: "Houston Business Notary Solutions | Keep Your Business Moving | HMNP",
    description: "Houston Mobile Notary Pros provides tailored notary solutions for businesses, including volume signings and corporate accounts.",
    url: `${BASE_URL}/services/business`,
    siteName: 'Houston Mobile Notary Pros',
    images: [
      {
        url: '/og-image.jpg', 
        width: 1200,
        height: 630,
        alt: 'Business Notary Solutions by Houston Mobile Notary Pros',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Business Notary Solutions in Houston | Corporate & Volume | HMNP",
    description: "Keep your Houston business moving with our expert notary solutions: volume signings, corporate accounts, and recurring appointments.",
    images: [`${BASE_URL}/og-image.jpg`],
  },
}

const businessFaqs = [
  {
    id: "how-to-start-business-solution",
    question: "How do we get started with a Business Notary Solution for our company?",
    answer: (
      <p>
        The best way to start is by <Link href="/contact?subject=Business%20Notary%20Solution%20Inquiry" className="text-[#A52A2A] hover:underline">contacting us for a consultation</Link>. We'll discuss your specific needs, typical document volume, types of notarizations required, and preferred scheduling. Based on this, we can recommend an existing package or design a custom solution with transparent pricing for your business.
      </p>
    ),
  },
  {
    id: "custom-packages",
    question: "Do you offer custom packages if the listed ones don't fit our needs?",
    answer: (
      <p>
        Absolutely! The packages listed (Title Company, Healthcare, etc.) are examples of solutions we provide. We specialize in creating Custom Business Solutions tailored to unique operational needs, service frequencies, and industry-specific document handling. Let's discuss your requirements.
      </p>
    ),
  },
  {
    id: "volume-discounts",
    question: "Are volume discounts available for regular business clients?",
    answer: (
      <p>
        Yes, volume discounts and block-booking rates are key components of our Business Notary Solutions. We aim to provide cost-effective services for businesses with ongoing or high-volume notary needs. This will be factored into your customized quote or package pricing.
      </p>
    ),
  },
  {
    id: "multi-location-business",
    question: "Can you service multiple business locations?",
    answer: (
      <p>
        Yes, we can arrange to service multiple business locations within our greater Houston service area. For businesses with needs that span broader geographical areas, we can discuss potential arrangements or help coordinate with trusted partners if necessary.
      </p>
    ),
  }
];

export default function BusinessSolutionsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Link href="/services" className="flex items-center text-[#002147] hover:text-[#A52A2A] mb-8">
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back to All Services
      </Link>

      {/* Hero Section */}
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold text-[#002147] mb-3">
          Business Notary Solutions
        </h1>
        <p className="text-2xl font-semibold text-[#A52A2A] mb-4">
          Keep your business moving.
        </p>
        <p className="text-lg text-gray-700 max-w-3xl mx-auto mb-6">
          Your critical business documents demand more than just a stamp. They Demand Our Expertise. Our Promise: Fast, precise notary service—every time, no hassle.
        </p>
      </section>

      {/* Introductory Section */}
      <section className="mb-12 bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-[#002147] mb-6 text-center">Streamline Your Operations with Tailored Notary Support</h2>
        <p className="text-gray-700 mb-4 text-center max-w-2xl mx-auto">
          Houston Mobile Notary Pros offers comprehensive Business Notary Solutions designed to meet the unique demands of your company. Whether you require regular volume signings, desire the convenience of block-booking, need a dedicated corporate account, or seek reliable recurring appointments, we provide efficient, professional, and meticulous notary services.
        </p>
        <div className="text-center my-6">
            <p className="text-3xl font-bold text-[#002147] mb-1">Starting at $250+</p>
            <p className="text-sm text-gray-600">For customized business packages and volume pricing.</p>
        </div>
        <p className="text-gray-700 mb-6 text-center max-w-2xl mx-auto">
          Our goal is to integrate seamlessly with your workflow, saving you time, reducing administrative burden, and ensuring your important documents are handled with the utmost care and compliance. Explore our example packages below or contact us for a personalized consultation.
        </p>
        <div className="text-center">
            <Link href="/contact?subject=Business%20Notary%20Solutions%20Inquiry">
              <Button size="lg" className="bg-[#002147] hover:bg-[#001a38] text-white">
                Inquire About Business Solutions
              </Button>
            </Link>
        </div>
      </section>

      {/* Service Package Examples - Retain existing detailed cards */}
      <h2 className="text-3xl font-bold text-[#002147] mb-8 text-center">Example Business Packages & Industry Solutions</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {/* Title Company Partnership Card - (Ensure content matches general tone, pricing consistent if specified elsewhere) */}
        <Card className="shadow-md">
          <CardHeader className="bg-[#002147] text-white">
            <CardTitle className="flex items-center">
              <Building className="mr-2 h-5 w-5" />
              Title Company Partnership
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-gray-700 mb-2"><strong className="text-[#002147]">Ideal for:</strong> Title companies, Escrow officers, Real estate law firms</p>
            <p className="mb-4 text-sm text-gray-700">A seamless, reliable notary partnership ensuring efficient and precise closings. We understand the demands of the real estate industry.</p>
            <h4 className="text-md font-semibold text-[#002147] mb-2">Key Features:</h4>
            <ul className="space-y-1 text-sm text-gray-700 list-disc list-inside mb-4">
              <li>Guaranteed priority scheduling</li>
              <li>Dedicated communication channel</li>
              <li>Volume-based pricing tiers</li>
              <li>Monthly reporting & analytics</li>
            </ul>
             <p className="text-lg font-semibold text-[#002147] mb-4">From $125/month + per-signing fees</p>
            <Link href="/contact?subject=Title%20Company%20Partnership%20Inquiry">
              <Button className="w-full bg-[#002147] hover:bg-[#001a38] text-white text-sm">
                Inquire About Title Partnerships
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Business Concierge Package Card */}
        <Card className="shadow-md">
          <CardHeader className="bg-[#002147] text-white">
            <CardTitle className="flex items-center">
              <Briefcase className="mr-2 h-5 w-5" />
              Business Concierge Package
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-gray-700 mb-2"><strong className="text-[#002147]">Ideal for:</strong> Corporate offices, Professional service firms</p>
            <p className="mb-4 text-sm text-gray-700">Comprehensive, proactive notary support with scheduled on-site visits to keep your operations running smoothly.</p>
             <h4 className="text-md font-semibold text-[#002147] mb-2">Key Features:</h4>
            <ul className="space-y-1 text-sm text-gray-700 list-disc list-inside mb-4">
              <li>Includes a set number of notarizations monthly</li>
              <li>Scheduled on-site service (e.g., twice a month)</li>
              <li>I-9 verifications & other employee docs</li>
              <li>Dedicated account manager</li>
            </ul>
            <p className="text-lg font-semibold text-[#002147] mb-4">From $200/month</p>
             <Link href="/contact?subject=Business%20Concierge%20Inquiry">
              <Button className="w-full bg-[#002147] hover:bg-[#001a38] text-white text-sm">
                Inquire About Concierge Services
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Healthcare Provider Package Card */}
        <Card className="shadow-md">
          <CardHeader className="bg-[#002147] text-white">
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Healthcare Provider Solutions
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-gray-700 mb-2"><strong className="text-[#002147]">Ideal for:</strong> Hospitals, Clinics, Assisted living facilities</p>
            <p className="mb-4 text-sm text-gray-700">HIPAA-compliant, compassionate notary services for healthcare facilities, meeting patient needs and regulatory requirements.</p>
             <h4 className="text-md font-semibold text-[#002147] mb-2">Key Features:</h4>
            <ul className="space-y-1 text-sm text-gray-700 list-disc list-inside mb-4">
              <li>Strict HIPAA compliance</li>
              <li>Priority response for urgent medical needs</li>
              <li>Discreet patient room visits</li>
              <li>Handling of POAs & Advance Directives</li>
            </ul>
            <p className="text-lg font-semibold text-[#002147] mb-4">From $175/month</p>
            <Link href="/contact?subject=Healthcare%20Notary%20Inquiry">
              <Button className="w-full bg-[#002147] hover:bg-[#001a38] text-white text-sm">
                Inquire About Healthcare Solutions
              </Button>
            </Link>
          </CardContent>
        </Card>
        
        {/* Retaining other specific package cards (Education, Construction, Custom) from existing file, with minor style updates if needed */}
        {/* Education Institution Package */}
        <Card className="shadow-md">
          <CardHeader className="bg-[#002147] text-white">
            <CardTitle className="flex items-center">
              <GraduationCap className="mr-2 h-5 w-5" />
              Education Institution Support
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-gray-700 mb-2"><strong className="text-[#002147]">Ideal for:</strong> Schools, Colleges, Universities</p>
            <p className="mb-4 text-sm text-gray-700">Reliable notary support for educational institutions, ensuring document integrity for students, faculty, and administration.</p>
            <h4 className="text-md font-semibold text-[#002147] mb-2">Key Features:</h4>
            <ul className="space-y-1 text-sm text-gray-700 list-disc list-inside mb-4">
                <li>Student ID verifications</li>
                <li>International student documentation</li>
                <li>Faculty & staff notary needs</li>
                <li>On-campus office hours option</li>
            </ul>
            <p className="text-lg font-semibold text-[#002147] mb-4">From $150/month</p>
            <Link href="/contact?subject=Education%20Notary%20Inquiry">
              <Button className="w-full bg-[#002147] hover:bg-[#001a38] text-white text-sm">
                Inquire About Education Support
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Construction & Real Estate Developer Package */}
        <Card className="shadow-md">
          <CardHeader className="bg-[#002147] text-white">
            <CardTitle className="flex items-center">
              <HardHat className="mr-2 h-5 w-5" />
              Construction & Real Estate Dev
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
             <p className="text-gray-700 mb-2"><strong className="text-[#002147]">Ideal for:</strong> Construction firms, Developers, Contractors</p>
            <p className="mb-4 text-sm text-gray-700">Robust notary solutions for fast-paced construction/real estate sectors, handling critical documents on-site with precision.</p>
            <h4 className="text-md font-semibold text-[#002147] mb-2">Key Features:</h4>
            <ul className="space-y-1 text-sm text-gray-700 list-disc list-inside mb-4">
                <li>Flexible multiple site visits</li>
                <li>Contractor agreements, lien releases</li>
                <li>Permit applications</li>
                <li>Emergency weekend service option</li>
            </ul>
            <p className="text-lg font-semibold text-[#002147] mb-4">From $250/month</p>
            <Link href="/contact?subject=Construction%20Notary%20Inquiry">
              <Button className="w-full bg-[#002147] hover:bg-[#001a38] text-white text-sm">
                Inquire About Construction Support
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Custom Business Solution */}
        <Card className="shadow-md border-[#A52A2A] border-2 col-span-1 md:col-span-2 lg:col-span-1">
          <CardHeader className="bg-[#A52A2A] text-white">
            <CardTitle className="flex items-center">
              <Briefcase className="mr-2 h-5 w-5" />
              Your Custom Business Solution
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-gray-700 mb-2"><strong className="text-[#A52A2A]">Fully Tailored to Your Needs</strong></p>
            <p className="mb-4 text-sm text-gray-700">
              Your business is unique. We provide bespoke notary solutions, meticulously crafted to your specific operational needs.
            </p>
            <h4 className="text-md font-semibold text-[#A52A2A] mb-2">Potential Inclusions:</h4>
            <ul className="space-y-1 text-sm text-gray-700 list-disc list-inside mb-4">
              <li>Service frequency matched to your workflow</li>
              <li>Handling of industry-specific documents</li>
              <li>Multi-location coverage</li>
              <li>Customized staff training</li>
              <li>Tailored reporting & analytics</li>
            </ul>
            <p className="text-lg font-semibold text-[#A52A2A] mb-4">Custom Pricing</p>
            <Link href="/contact?subject=Custom%20Business%20Solution%20Inquiry">
              <Button className="w-full bg-[#A52A2A] hover:bg-[#8B0000] text-white text-sm">
                Design Your Custom Solution
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Business Benefits Section - (Retain existing, good content) */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-[#002147] mb-6 text-center">Benefits for Your Business</h2>
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
                <span>Operate with confidence knowing our services are fully insured ($1M E&O).</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Ensure full compliance with all Texas notary laws and best practices.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* How It Works Section - (Retain existing, good content) */}
      <div className="bg-gray-50 p-8 rounded-lg mb-16">
        <h2 className="text-2xl font-bold text-[#002147] mb-6 text-center">How Our Business Solutions Work</h2>
        <p className="text-gray-700 mb-8 text-center max-w-3xl mx-auto">
          Our process for establishing your business notary solution is designed for clarity, collaboration, and a seamless start to our professional partnership:
        </p>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="bg-[#A52A2A] text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-semibold">1</div>
            <h3 className="font-semibold mb-2 text-[#002147]">Consultation</h3>
            <p className="text-sm text-gray-700">We begin with a clear consultation to understand your unique business needs and recommend the most effective solution.</p>
          </div>
          <div className="text-center">
            <div className="bg-[#A52A2A] text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-semibold">2</div>
            <h3 className="font-semibold mb-2 text-[#002147]">Proposal & Customization</h3>
            <p className="text-sm text-gray-700">We provide a tailored proposal. Your chosen package is meticulously customized to your specific operational needs.</p>
          </div>
          <div className="text-center">
            <div className="bg-[#A52A2A] text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-semibold">3</div>
            <h3 className="font-semibold mb-2 text-[#002147]">Agreement & Implementation</h3>
            <p className="text-sm text-gray-700">Service plan agreed, implemented with precision, including scheduling and clear communication protocols.</p>
          </div>
          <div className="text-center">
            <div className="bg-[#A52A2A] text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-semibold">4</div>
            <h3 className="font-semibold mb-2 text-[#002147]">Ongoing Partnership</h3>
            <p className="text-sm text-gray-700">Benefit from reliable service, supported by transparent reporting and proactive account reviews.</p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="my-12">
        <h2 className="text-2xl font-bold text-[#002147] mb-8 text-center">Business Solutions FAQs</h2>
        <div className="max-w-3xl mx-auto">
          <MiniFAQ faqs={businessFaqs} />
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-[#002147] text-white p-8 rounded-lg text-center">
        <h2 className="text-2xl font-bold mb-4">Partner with Us for Reliable Business Notary Services</h2>
        <p className="mb-6 max-w-2xl mx-auto">
          Elevate your business operations with tailored notary solutions that deliver efficiency, ensure compliance, and provide complete peace of mind. Schedule a consultation to discover the perfect solution for your organization.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/contact?subject=Business%20Notary%20Solutions%20Inquiry">
            <Button size="lg" className="bg-[#A52A2A] hover:bg-[#8B0000] text-white">
              Discuss Your Business Needs
            </Button>
          </Link>
          <Link href="/services">
            <Button size="lg" variant="outline" className="border-white text-white bg-transparent hover:bg-white hover:text-[#002147]">
              View All Service Types
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
