import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Check, Clock, MapPin, Shield, FileText, Users, DollarSign, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import MiniFAQ from "@/components/mini-faq"

// Define Base URL for metadata
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://houstonmobilenotarypros.com'; // Replace with your actual domain

export const metadata = {
  metadataBase: new URL(BASE_URL),
  title: "Mobile Notary Services | Houston Mobile Notary Pros",
  description:
    "Professional mobile notary services in Houston and surrounding areas. We offer essential notarization, priority service, loan signings, specialty services, and business packages.",
  keywords:
    "mobile notary, Houston notary, notary services, loan signing, priority notary, business notary, specialty notary",
  alternates: {
    canonical: '/services',
  },
  openGraph: {
    title: "Mobile Notary Services | Houston Mobile Notary Pros",
    description: "Comprehensive mobile notary services in Houston: Essential, Priority, Loan Signing, Specialty, and Business packages available.",
    url: `${BASE_URL}/services`,
    siteName: 'Houston Mobile Notary Pros',
    images: [
      {
        url: '/og-image.jpg', // Ensure this image exists in /public
        width: 1200,
        height: 630,
        alt: 'Houston Mobile Notary Pros Service Offerings',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Mobile Notary Services | Houston Mobile Notary Pros",
    description: "Need a mobile notary in Houston? We offer fast, reliable service for all notary needs, including loan signings & priority appointments.",
    // Add your Twitter handle here if you have one
    // siteId: 'YourTwitterID',
    // creator: '@YourTwitterHandle',
    // creatorId: 'YourTwitterCreatorID',
    images: [`${BASE_URL}/og-image.jpg`], // Must be an absolute URL
  },
}

// Sample FAQ data for the services page
const serviceFaqs = [
  {
    id: "service-difference",
    question: "What's the difference between your service packages?",
    answer: (
      <p>
        Our Essential Package is for standard notarizations during business hours. Priority Service offers 2-hour
        response times, 7 days a week. Loan Signing is specialized for real estate transactions. Specialty Services
        cover unique needs like apostille services, and Business Packages provide ongoing service for companies with
        regular notary needs.
      </p>
    ),
  },
  {
    id: "service-area",
    question: "How far do you travel for your services?",
    answer: (
      <p>
        We serve clients within a 20-mile radius of ZIP code 77591 at no additional travel fee. For locations beyond
        this radius, we charge $0.50 per mile. Our Priority Service extends to a 35-mile radius. We can travel to most
        locations in the greater Houston area.
      </p>
    ),
  },
  {
    id: "weekend-availability",
    question: "Do you offer weekend services?",
    answer: (
      <p>
        Yes, we offer weekend services for all our service packages with a $50 weekend surcharge. Our Priority Service
        is available 7 days a week from 7am-9pm, including weekends. Weekend appointments should be booked at least 48
        hours in advance when possible.
      </p>
    ),
  },
  {
    id: "prevent-mistakes",
    question: "I'm worried about making a mistake on important documents. How do you help prevent that?",
    answer: (
      <p>
        We understand! Our process is built on precision and clarity. We guide you patiently, explain documents
        clearly, and double-check everything – from ID verification to signatures and dates – to ensure accuracy
        and prevent errors that could cause future issues. Your confidence is our priority.
      </p>
    ),
  },
  {
    id: "hmnp-difference",
    question: "What makes your notary service different from others?",
    answer: (
      <p>
        Beyond convenience, we're committed to a higher standard of care. This means arriving early and
        professionally, explaining everything without jargon, ensuring every detail is accurate, and following
        through diligently. We believe every signing deserves this level of dedication for your peace of mind.
      </p>
    ),
  },
  {
    id: "notary-process",
    question: "What is the mobile notary process like?",
    answer: (
      <p>
        We aim for a clear, calm, and professional experience every time. We've outlined our entire mobile notary process
        from start to finish for your convenience. Please visit our{" "}
        <Link href="/what-to-expect" className="text-[#A52A2A] hover:underline font-medium">
          What to Expect page
        </Link>{" "}
        for a detailed guide.
      </p>
    ),
  },
]

export default function ServicesPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-[#002147] mb-4">
          Clear, Calm, Professional Notary Services, When and Where You Need Them.
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Experience peace of mind with our meticulous and reliable mobile notary services. We bring clarity and
          professionalism to every signing, ensuring your important documents are handled with the utmost care and
          precision.
        </p>
      </div>

      {/* Service Categories Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {/* Essential Service */}
        <Card className="shadow-md hover:shadow-lg transition-all duration-300 border-t-4 border-t-[#002147]">
          <CardHeader className="pb-2">
            <div className="flex items-center mb-2">
              <div className="bg-[#002147] p-2 rounded-full mr-3">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-[#002147]">Essential Mobile Package</CardTitle>
            </div>
            <CardDescription>
              For straightforward notarizations, handled with precision and care. We ensure your documents are
              correctly processed, providing a calm and clear experience.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex items-baseline mb-4">
              <p className="text-3xl font-bold text-[#002147]">$75</p>
              <span className="ml-2 text-gray-500">starting at</span>
            </div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>1-2 documents notarized</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Travel within 15 miles included</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Available Monday-Friday, 9am-5pm</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter className="pt-0">
            <Link href="/services/essential" className="w-full">
              <Button
                variant="outline"
                className="w-full border-[#002147] text-[#002147] hover:bg-[#002147] hover:text-white"
              >
                Learn More
              </Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Priority Service */}
        <Card className="shadow-xl hover:shadow-2xl transition-all duration-300 border-t-4 border-t-[#A52A2A] relative">
          <div className="absolute top-0 right-0 bg-[#A52A2A] text-white px-3 py-1 text-xs font-medium rounded-bl-lg -mt-1">
            MOST POPULAR
          </div>
          <CardHeader className="pb-2">
            <div className="flex items-center mb-2">
              <div className="bg-[#A52A2A] p-2 rounded-full mr-3">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-[#002147]">Priority Service Package</CardTitle>
            </div>
            <CardDescription>
              Urgent needs met with speed and professionalism. When time is critical, rely on our prompt, meticulous
              service to manage your time-sensitive documents accurately.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex items-baseline mb-4">
              <p className="text-3xl font-bold text-[#002147]">$100</p>
              <span className="ml-2 text-gray-500">flat fee</span>
            </div>
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
                <span>Up to 5 documents and 2 signers</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter className="pt-0">
            <Link href="/services/priority" className="w-full">
              <Button className="w-full bg-[#A52A2A] hover:bg-[#8B0000]">Learn More</Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Loan Signing */}
        <Card className="shadow-md hover:shadow-lg transition-all duration-300 border-t-4 border-t-[#002147]">
          <CardHeader className="pb-2">
            <div className="flex items-center mb-2">
              <div className="bg-[#002147] p-2 rounded-full mr-3">
                <Users className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-[#002147]">Loan Signing Services</CardTitle>
            </div>
            <CardDescription>
              Expert handling of complex loan documents. We bring clarity and precision to your real estate
              transactions, ensuring every detail is meticulously managed for a smooth closing.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex items-baseline mb-4">
              <p className="text-3xl font-bold text-[#002147]">$150</p>
              <span className="ml-2 text-gray-500">flat fee</span>
            </div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Unlimited documents</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Up to 4 signers</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>90-minute signing session</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter className="pt-0">
            <Link href="/services/loan-signing" className="w-full">
              <Button
                variant="outline"
                className="w-full border-[#002147] text-[#002147] hover:bg-[#002147] hover:text-white"
              >
                Learn More
              </Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Specialty Services */}
        <Card className="shadow-md hover:shadow-lg transition-all duration-300 border-t-4 border-t-[#002147]">
          <CardHeader className="pb-2">
            <div className="flex items-center mb-2">
              <div className="bg-[#002147] p-2 rounded-full mr-3">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-[#002147]">Specialty Services</CardTitle>
            </div>
            <CardDescription>
              Professional solutions for unique notary needs. From apostilles to I-9 verification, we provide
              specialized, reliable service with a focus on accuracy and clarity.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex items-baseline mb-4">
              <p className="text-3xl font-bold text-[#002147]">$55</p>
              <span className="ml-2 text-gray-500">starting at</span>
            </div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Apostille services</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Background check verification</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Wedding certificate expediting</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter className="pt-0">
            <Link href="/services/specialty" className="w-full">
              <Button
                variant="outline"
                className="w-full border-[#002147] text-[#002147] hover:bg-[#002147] hover:text-white"
              >
                Learn More
              </Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Business Packages */}
        <Card className="shadow-md hover:shadow-lg transition-all duration-300 border-t-4 border-t-[#002147]">
          <CardHeader className="pb-2">
            <div className="flex items-center mb-2">
              <div className="bg-[#002147] p-2 rounded-full mr-3">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-[#002147]">Business Packages</CardTitle>
            </div>
            <CardDescription>
              Dedicated notary support for your business. Streamline your operations with our reliable, professional,
              and meticulous notary services, tailored to your company's ongoing needs.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex items-baseline mb-4">
              <p className="text-3xl font-bold text-[#002147]">$125</p>
              <span className="ml-2 text-gray-500">/month</span>
            </div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Title company partnerships</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Business concierge service</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Healthcare provider packages</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter className="pt-0">
            <Link href="/services/business" className="w-full">
              <Button
                variant="outline"
                className="w-full border-[#002147] text-[#002147] hover:bg-[#002147] hover:text-white"
              >
                Learn More
              </Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Additional Services */}
        <Card className="shadow-md hover:shadow-lg transition-all duration-300 border-t-4 border-t-[#002147]">
          <CardHeader className="pb-2">
            <div className="flex items-center mb-2">
              <div className="bg-[#002147] p-2 rounded-full mr-3">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-[#002147]">Additional Services</CardTitle>
            </div>
            <CardDescription>
              Convenient document and mail services to support your notary needs. We provide clear, reliable
              assistance for printing, scanning, and shipping, ensuring a complete service experience.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex items-baseline mb-4">
              <p className="text-3xl font-bold text-[#002147]">$10</p>
              <span className="ml-2 text-gray-500">starting at</span>
            </div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Document printing services</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Secure cloud storage</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Mail and shipping services</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter className="pt-0">
            <Link href="/services/additional" className="w-full">
              <Button
                variant="outline"
                className="w-full border-[#002147] text-[#002147] hover:bg-[#002147] hover:text-white"
              >
                Learn More
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      {/* What to Expect Call-out */}
      <div className="my-16 p-8 bg-gray-50 rounded-lg text-center">
        <h2 className="text-2xl font-bold text-[#002147] mb-4">New to Mobile Notary Services?</h2>
        <p className="text-gray-700 mb-6 max-w-xl mx-auto">
          Understanding the process can bring peace of mind. We've detailed every step, so you know exactly what to expect when you book with us.
        </p>
        <Link href="/what-to-expect">
          <Button variant="outline" className="border-[#002147] text-[#002147] hover:bg-[#002147] hover:text-white">
            Learn About Our Process
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Service Comparison */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-[#002147] mb-8 text-center">Service Comparison</h2>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Feature</TableHead>
                <TableHead>Essential</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Loan Signing</TableHead>
                <TableHead>Specialty</TableHead>
                <TableHead>Business</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Starting Price</TableCell>
                <TableCell>$75</TableCell>
                <TableCell>$100</TableCell>
                <TableCell>$150</TableCell>
                <TableCell>$55</TableCell>
                <TableCell>$125/month</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Response Time</TableCell>
                <TableCell>24 hours</TableCell>
                <TableCell>2 hours</TableCell>
                <TableCell>24-48 hours</TableCell>
                <TableCell>Varies</TableCell>
                <TableCell>Priority</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Service Hours</TableCell>
                <TableCell>9am-5pm M-F</TableCell>
                <TableCell>7am-9pm Daily</TableCell>
                <TableCell>9am-5pm M-F</TableCell>
                <TableCell>9am-5pm M-F</TableCell>
                <TableCell>Custom</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Documents</TableCell>
                <TableCell>1-2</TableCell>
                <TableCell>Up to 5</TableCell>
                <TableCell>Unlimited</TableCell>
                <TableCell>Varies</TableCell>
                <TableCell>Unlimited</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Signers</TableCell>
                <TableCell>1 ($10/additional)</TableCell>
                <TableCell>2 ($10/additional)</TableCell>
                <TableCell>Up to 4</TableCell>
                <TableCell>1-2</TableCell>
                <TableCell>Unlimited</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Weekend Service</TableCell>
                <TableCell>+$50</TableCell>
                <TableCell>Included</TableCell>
                <TableCell>+$50</TableCell>
                <TableCell>+$50</TableCell>
                <TableCell>Negotiable</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Best For</TableCell>
                <TableCell>General notarizations</TableCell>
                <TableCell>Urgent needs</TableCell>
                <TableCell>Real estate closings</TableCell>
                <TableCell>Unique document needs</TableCell>
                <TableCell>Regular notary needs</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Service Area */}
      <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
        <div>
          <h2 className="text-2xl font-bold text-[#002147] mb-6">Our Service Area</h2>
          <p className="text-gray-600 mb-6">
            We proudly serve the greater Houston area, providing mobile notary services wherever you need them.
          </p>

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
        </div>

        <div className="relative h-[400px] rounded-lg overflow-hidden shadow-md border border-gray-200">
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
      </div>

      {/* Service Tabs - Mobile Friendly Alternative */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-[#002147] mb-8 text-center">Explore Our Services</h2>

        <Tabs defaultValue="essential" className="w-full">
          <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-8">
            <TabsTrigger value="essential" className="data-[state=active]:bg-[#002147] data-[state=active]:text-white">
              Essential
            </TabsTrigger>
            <TabsTrigger value="priority" className="data-[state=active]:bg-[#002147] data-[state=active]:text-white">
              Priority
            </TabsTrigger>
            <TabsTrigger value="loan" className="data-[state=active]:bg-[#002147] data-[state=active]:text-white">
              Loan Signing
            </TabsTrigger>
            <TabsTrigger value="specialty" className="data-[state=active]:bg-[#002147] data-[state=active]:text-white">
              Specialty
            </TabsTrigger>
            <TabsTrigger value="business" className="data-[state=active]:bg-[#002147] data-[state=active]:text-white">
              Business
            </TabsTrigger>
            <TabsTrigger value="additional" className="data-[state=active]:bg-[#002147] data-[state=active]:text-white">
              Additional
            </TabsTrigger>
          </TabsList>

          <TabsContent value="essential" className="mt-0">
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-[#002147] mb-4">Essential Mobile Notary Service</h3>
                  <p className="text-gray-600 mb-4">
                    Need to notarize important personal or business documents like wills, POAs, or contracts? The Essential
                    Mobile Package brings our <strong>professional and precise notary services</strong> directly to you in the
                    Houston area. We understand that even standard notarizations carry significant weight.
                  </p>
                  <p className="text-gray-600 mb-4">
                    That's why we <strong>arrive prepared, explain everything clearly</strong>, and <strong>meticulously
                    check every detail</strong> to ensure your documents are executed correctly and without confusion. Avoid
                    the hassle of travel and experience a <strong>calm, efficient signing process</strong> that gives you
                    confidence and peace of mind.
                  </p>
                  <div className="mt-6">
                    <Link href="/services/essential">
                      <Button className="bg-[#002147] hover:bg-[#001a38]">
                        View Essential Package Details
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h4 className="font-semibold text-[#002147] mb-2">Common Documents Handled</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                        <span>Wills, Trusts, & Estate Planning Documents</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                        <span>Powers of Attorney (Financial, Medical)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                        <span>Affidavits & Sworn Statements</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                        <span>Deeds (Quitclaim, Warranty, etc.)</span>
                      </li>
                       <li className="flex items-start">
                        <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                        <span>Contracts & Business Agreements</span>
                      </li>
                       <li className="flex items-start">
                        <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                        <span>Vehicle Title Transfers</span>
                      </li>
                       <li className="flex items-start">
                        <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                        <span>Travel Consent Forms for Minors</span>
                      </li>
                       <li className="flex items-start">
                        <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                        <span>I-9 Employment Eligibility Verification*</span>
                      </li>
                       <li className="flex items-start">
                        <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                        <span>And many other documents requiring notarization!</span>
                      </li>
                    </ul>
                    <p className="text-xs text-gray-500 mt-2">*I-9 Verification may fall under Specialty Services depending on requirements.</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="priority" className="mt-0">
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-[#002147] mb-4">Priority Service Package</h3>
                  <p className="text-gray-600 mb-4">
                    Our Priority Service Package is designed for clients with urgent notarization needs. When time is of
                    the essence, we provide a rapid response with our 2-hour service window, available from 7am to 9pm,
                    seven days a week.
                  </p>
                  <p className="text-gray-600 mb-4">
                    This premium service ensures that your time-sensitive documents are notarized promptly and
                    professionally. Whether you're facing a tight deadline or need last-minute notarization, our
                    Priority Service has you covered.
                  </p>
                  <div className="mt-6">
                    <Link href="/services/priority">
                      <Button className="bg-[#A52A2A] hover:bg-[#8B0000]">
                        View Priority Service Details
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h4 className="font-semibold text-[#002147] mb-2">Package Details</h4>
                    <p className="text-xl font-bold mb-2">$100 flat fee</p>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                        <div>
                          <span className="font-medium">2-hour response time</span>
                          <p className="text-sm text-gray-600">Quick service when you need it most</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                        <div>
                          <span className="font-medium">Extended hours</span>
                          <p className="text-sm text-gray-600">Service from 7am-9pm daily</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                        <div>
                          <span className="font-medium">Additional signers: +$10 each</span>
                          <p className="text-sm text-gray-600">Beyond the 2 included signers</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h4 className="font-semibold text-[#002147] mb-2">Ideal For</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                        <span>Urgent deadlines and time-sensitive documents</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                        <span>After-hours notarization needs</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                        <span>Last-minute requirements</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                        <span>Weekend and holiday service</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="loan" className="mt-0">
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-[#002147] mb-4">Loan Signing Agent Services</h3>
                  <p className="text-gray-600 mb-4">
                    Our certified Loan Signing Agents (LSAs) specialize in facilitating real estate closings throughout the Houston area. We understand the critical importance of accuracy, timeliness, and professionalism in handling mortgage documents for title companies, lenders, and borrowers.
                  </p>
                  <p className="text-gray-600 mb-4">
                    Whether it's a Purchase, Refinance, HELOC, Seller Package, or Reverse Mortgage, our experienced LSAs ensure a smooth and error-free signing experience. We meticulously review documents and guide signers through the process with clarity.
                  </p>
                  <div className="mt-6">
                    <Link href="/services/loan-signing">
                      <Button className="bg-[#002147] hover:bg-[#001a38]">
                        View Loan Signing Details
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h4 className="font-semibold text-[#002147] mb-2">Why Choose Us for Loan Signings?</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                        <span>Experienced & Certified LSAs (NNA, LSS - *TODO: Confirm/add specific certs*)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                        <span>Comprehensive E&O Insurance (*TODO: Update level - $1M Recommended*)</span>
                      </li>
                       <li className="flex items-start">
                        <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                        <span>Expertise in various loan types: Purchase, Refi, HELOC, Seller, Reverse Mortgage</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                        <span>Meticulous attention to detail & accuracy</span>
                      </li>
                       <li className="flex items-start">
                        <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                        <span>Reliable, punctual, and professional service</span>
                      </li>
                       <li className="flex items-start">
                        <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                        <span>Flexible scheduling (evenings/weekends available)</span>
                      </li>
                        <li className="flex items-start">
                        <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                        <span>Mobile convenience - We travel to the signing location</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="specialty" className="mt-0">
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-[#002147] mb-4">Specialty Services</h3>
                  <p className="text-gray-600 mb-4">
                    Our Specialty Services go beyond standard notarizations to address complex document requirements.
                    With specialized training and experience, our notaries can handle unique situations that require
                    additional expertise.
                  </p>
                  <p className="text-gray-600 mb-4">
                    Whether you need documents authenticated for international use, verification for sensitive
                    background checks, or expedited processing of important certificates, our team has the knowledge and
                    credentials to assist you.
                  </p>
                  <div className="mt-6">
                    <Link href="/services/specialty">
                      <Button className="bg-[#002147] hover:bg-[#001a38]">
                        View Specialty Services Details
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h4 className="font-semibold text-[#002147] mb-2">Specialty Options</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                        <div>
                          <span className="font-medium">Apostille Services: $75 + state fees</span>
                          <p className="text-sm text-gray-600">Authentication for international documents</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                        <div>
                          <span className="font-medium">Background Check Verification: $55</span>
                          <p className="text-sm text-gray-600">For employment and licensing verification</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                        <div>
                          <span className="font-medium">Wedding Certificate Expediting: $75</span>
                          <p className="text-sm text-gray-600">Streamlined processing of marriage documentation</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                        <div>
                          <span className="font-medium">Medallion Signature: $95</span>
                          <p className="text-sm text-gray-600">For financial securities transactions</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="business" className="mt-0">
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-[#002147] mb-4">Business Packages</h3>
                  <p className="text-gray-600 mb-4">
                    Our Business Packages are tailored solutions for businesses with regular notary needs. These
                    packages provide consistent, reliable notary services with the convenience of a dedicated account
                    manager and customized service schedule.
                  </p>
                  <p className="text-gray-600 mb-4">
                    Whether you're a title company, healthcare provider, educational institution, or any other business
                    with ongoing notary requirements, we have a package that can be customized to meet your specific
                    needs.
                  </p>
                  <div className="mt-6">
                    <Link href="/services/business">
                      <Button className="bg-[#002147] hover:bg-[#001a38]">
                        View Business Packages Details
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h4 className="font-semibold text-[#002147] mb-2">Business Package Options</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                        <div>
                          <span className="font-medium">Title Company Partnership: $125/month</span>
                          <p className="text-sm text-gray-600">Priority scheduling for closings</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                        <div>
                          <span className="font-medium">Business Concierge Package: $200/month</span>
                          <p className="text-sm text-gray-600">On-site service twice monthly</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                        <div>
                          <span className="font-medium">Healthcare Provider Package: $175/month</span>
                          <p className="text-sm text-gray-600">HIPAA-compliant document handling</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                        <div>
                          <span className="font-medium">Custom Business Solution</span>
                          <p className="text-sm text-gray-600">Tailored to your specific requirements</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="additional" className="mt-0">
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-[#002147] mb-4">Additional Services</h3>
                  <p className="text-gray-600 mb-4">
                    Our Additional Services complement our notary offerings to provide a more comprehensive solution for
                    your document needs. These services can be added to any notary appointment or used independently.
                  </p>
                  <p className="text-gray-600 mb-4">
                    From document printing and scanning to secure cloud storage and mail services, we offer a range of
                    supplementary services to enhance your notary experience and make the process as convenient as
                    possible.
                  </p>
                  <div className="mt-6">
                    <Link href="/services/additional">
                      <Button className="bg-[#002147] hover:bg-[#001a38]">
                        View Additional Services Details
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h4 className="font-semibold text-[#002147] mb-2">Additional Service Options</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                        <div>
                          <span className="font-medium">Document Services</span>
                          <p className="text-sm text-gray-600">Printing, scanning, and faxing</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                        <div>
                          <span className="font-medium">Digital Storage</span>
                          <p className="text-sm text-gray-600">Secure cloud storage for your documents</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                        <div>
                          <span className="font-medium">Mail Services</span>
                          <p className="text-sm text-gray-600">USPS certified mail and express shipping</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                        <div>
                          <span className="font-medium">Premium Time Slots</span>
                          <p className="text-sm text-gray-600">Sunday, holiday, and after-hours service</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* FAQ Section */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-[#002147] mb-8 text-center">Frequently Asked Questions</h2>
        <div className="max-w-3xl mx-auto">
          <MiniFAQ faqs={serviceFaqs} />
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-[#002147] text-white p-8 rounded-lg text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to Book Your Notary Service?</h2>
        <p className="mb-6 max-w-2xl mx-auto">
          Schedule your appointment today and experience the convenience of our mobile notary services.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/booking">
            <Button size="lg" className="bg-[#A52A2A] hover:bg-[#8B0000] text-white">
              Book Now
            </Button>
          </Link>
          <Link href="/contact">
            <Button size="lg" variant="outline" className="border-white text-white bg-transparent hover:bg-white hover:text-[#002147]">
              Contact Us
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
