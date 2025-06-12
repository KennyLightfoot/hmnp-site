import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, ArrowRight, Clock, FileText, MapPin, Shield, Phone, ChevronLeft } from 'lucide-react'
import MiniFAQ from '@/components/mini-faq'

// Define Base URL for metadata
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://houstonmobilenotarypros.com';

export const metadata = {
  metadataBase: new URL(BASE_URL),
  title: "Standard Notary Services | Houston Mobile Notary Pros",
  description:
    "Reliable on-site notarizations for POAs, affidavits, contracts, and more during standard business hours (9 am–5 pm). On-time, every time.",
  keywords:
    "standard notary, mobile notary Houston, POA notarization, affidavit notary, contract notarization, 9-5 notary service, Houston notary",
  alternates: {
    canonical: '/services/standard',
  },
  openGraph: {
    title: "Standard Notary Services | Houston Mobile Notary Pros",
    description: "Professional and precise standard notary services in Houston. We handle your important documents with care.",
    url: `${BASE_URL}/services/standard`,
    siteName: 'Houston Mobile Notary Pros',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Standard Notary Services by Houston Mobile Notary Pros',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Standard Notary Services | Houston Mobile Notary Pros",
    description: "Need a notary for standard documents in Houston? We offer on-time, professional service from 9 am to 5 pm.",
    images: [`${BASE_URL}/og-image.jpg`],
  },
}

const standardServiceFaqs = [
  {
    id: "standard-documents",
    question: "What types of documents are covered under Standard Notary service?",
    answer: (
      <p>
        Our Standard Notary service covers a wide range of common documents requiring notarization, including but not limited to:
        Powers of Attorney (POAs), Affidavits, Contracts and Business Agreements, Wills and Trusts (estate planning documents),
        Deeds (Quitclaim, Warranty, etc.), Vehicle Title Transfers, and Travel Consent Forms for Minors.
        If you have a document not listed, feel free to <Link href="/contact" className="text-[#A52A2A] hover:underline">contact us</Link> to confirm.
      </p>
    ),
  },
  {
    id: "standard-hours",
    question: "What are the service hours for Standard Notary?",
    answer: (
      <p>
        Standard Notary services are available Monday through Friday, from 9:00 AM to 5:00 PM.
        If you require services outside these hours or on weekends, please consider our <Link href="/services/extended" className="text-[#A52A2A] hover:underline">Extended Hours Notary</Link> service.
      </p>
    ),
  },
  {
    id: "standard-travel",
    question: "Is travel included in the Standard Notary price?",
    answer: (
      <p>
        The Standard Notary service starting price of $75 includes travel within a 15-mile radius of our base (ZIP code 77591).
        For locations beyond this, a mileage fee of $0.50 per mile (one-way) will apply. This will be confirmed when you book.
        You can find more details on our <Link href="/services/extras" className="text-[#A52A2A] hover:underline">Extras & Fees</Link> page.
      </p>
    ),
  },
];

export default function StandardNotaryPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <Link href="/services" className="flex items-center text-[#002147] hover:text-[#A52A2A] mb-8">
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back to All Services
      </Link>

      {/* Hero Section */}
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-[#002147] mb-4">Standard Notary Services</h1>
        <p className="text-xl text-[#A52A2A] font-semibold mb-4">On-time, every time.</p>
        <p className="text-lg text-gray-700 max-w-3xl mx-auto mb-8">
          Professional, on-site notarizations for your everyday documents. We bring reliability and precision 
          directly to your location during standard business hours.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/booking?service=standard">
            <Button size="lg" className="bg-[#002147] hover:bg-[#001a38] text-white">
              Book Standard Notary
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/contact">
            <Button size="lg" variant="outline" className="border-[#002147] text-[#002147] hover:bg-[#002147] hover:text-white">
              Ask Questions
              <Phone className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-8 mb-12">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          {/* Service Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-[#002147]">Reliable Notarization for Your Everyday Needs</CardTitle>
              <CardDescription className="text-lg">
                Professional document notarization during standard business hours with mobile convenience.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Our Standard Notary service provides professional, on-site notarizations for a wide range of documents.
                Whether you're dealing with Powers of Attorney, affidavits, contracts, or other important paperwork,
                we ensure a smooth, precise, and calm experience.
              </p>
              <p className="text-gray-700">
                Operating during standard business hours (9 AM – 5 PM, Monday to Friday), we bring our services 
                directly to your location, saving you time and eliminating the hassle of finding a notary.
              </p>
            </CardContent>
          </Card>

          {/* Key Features */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Clock className="text-[#A52A2A] mr-2 h-5 w-5" />
                  Business Hours Service
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-3">Monday - Friday, 9:00 AM - 5:00 PM</p>
                <p className="text-sm text-gray-500">
                  Perfect for routine document needs during regular business hours. 
                  Need after-hours service? Check our Extended Hours option.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <MapPin className="text-[#A52A2A] mr-2 h-5 w-5" />
                  Mobile Convenience
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-3">We come to your preferred location</p>
                <p className="text-sm text-gray-500">
                  Travel included within 15 miles. Home, office, or other location - 
                  wherever is most convenient for you.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <FileText className="text-[#A52A2A] mr-2 h-5 w-5" />
                  Wide Document Coverage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-3">POAs, Affidavits, Contracts & More</p>
                <p className="text-sm text-gray-500">
                  From estate planning documents to business contracts, 
                  we handle all your standard notarization needs.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Shield className="text-[#A52A2A] mr-2 h-5 w-5" />
                  Professional Excellence
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-3">Certified, Insured & Experienced</p>
                <p className="text-sm text-gray-500">
                  NNA certified notaries with comprehensive insurance and 
                  commitment to accuracy and professionalism.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Pricing Section */}
          <Card className="border-2 border-[#002147]/20 bg-[#002147]/5">
            <CardHeader>
              <CardTitle className="text-2xl text-[#002147]">Transparent Pricing</CardTitle>
              <CardDescription>Starting at $75 with travel included</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-3xl font-bold text-[#002147]">$75</span>
                <span className="text-lg text-gray-600">starting price</span>
              </div>
              <ul className="space-y-2 text-sm text-gray-600 mb-6">
                <li className="flex items-center"><Check className="text-green-600 mr-2 h-4 w-4" />Travel up to 15 miles included</li>
                <li className="flex items-center"><Check className="text-green-600 mr-2 h-4 w-4" />1-2 notarized signatures</li>
                <li className="flex items-center"><Check className="text-green-600 mr-2 h-4 w-4" />Document review and guidance</li>
                <li className="flex items-center"><Check className="text-green-600 mr-2 h-4 w-4" />Professional service guarantee</li>
              </ul>
              <p className="text-xs text-gray-500 mb-4">
                Additional signatures, documents, or extended travel may incur extra fees. 
                See our <Link href="/services/extras" className="text-[#A52A2A] hover:underline">Extras & Fees</Link> page for details.
              </p>
              <Link href="/booking?service=standard">
                <Button size="lg" className="w-full bg-[#002147] hover:bg-[#001a38] text-white">
                  Book Your Standard Notary Service
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Common Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-[#002147]">Common Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Powers of Attorney (Financial, Medical)</li>
                <li>• Affidavits & Sworn Statements</li>
                <li>• Contracts & Business Agreements</li>
                <li>• Last Will & Testament</li>
                <li>• Trust Documents</li>
                <li>• Quitclaim / Warranty Deeds</li>
                <li>• Vehicle Title Transfers</li>
                <li>• Minor Travel Consent Forms</li>
                <li>• I-9 Employment Verification</li>
                <li>• And many more...</li>
              </ul>
            </CardContent>
          </Card>

          {/* Why Choose Us */}
          <Card className="bg-[#002147] text-white">
            <CardHeader>
              <CardTitle className="text-lg">Why Choose Us?</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-3">
                <li className="flex items-start">
                  <Check className="mr-2 mt-0.5 h-4 w-4 shrink-0" />
                  Reliable & Always On Time
                </li>
                <li className="flex items-start">
                  <Check className="mr-2 mt-0.5 h-4 w-4 shrink-0" />
                  Clear, Calm Communication
                </li>
                <li className="flex items-start">
                  <Check className="mr-2 mt-0.5 h-4 w-4 shrink-0" />
                  Meticulous Attention to Detail
                </li>
                <li className="flex items-start">
                  <Check className="mr-2 mt-0.5 h-4 w-4 shrink-0" />
                  Fully Insured & Bonded
                </li>
                <li className="flex items-start">
                  <Check className="mr-2 mt-0.5 h-4 w-4 shrink-0" />
                  NNA Certified & Background Screened
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Contact Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-[#002147] flex items-center">
                <Phone className="text-[#A52A2A] mr-2 h-5 w-5" />
                Need Help Deciding?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Not sure if this service fits your needs? Have specific questions about your documents? 
                We're here to help.
              </p>
              <div className="space-y-3">
                <Link href="/contact">
                  <Button variant="outline" className="w-full border-[#002147] text-[#002147] hover:bg-[#002147] hover:text-white">
                    Contact Us
                  </Button>
                </Link>
                <Link href="/services">
                  <Button variant="ghost" className="w-full text-[#002147] hover:bg-[#002147]/10">
                    Compare All Services
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* FAQ Section */}
      <section className="mt-16">
        <h2 className="text-3xl font-bold text-[#002147] mb-8 text-center">Frequently Asked Questions</h2>
        <div className="max-w-4xl mx-auto">
          <MiniFAQ faqs={standardServiceFaqs} />
        </div>
      </section>
    </div>
  );
} 