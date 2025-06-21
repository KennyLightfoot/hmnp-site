import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Check, Clock, MapPin, Shield, FileText, Users, DollarSign, Calendar, Briefcase, Award, Building, PlusCircle, Info, ListPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import MiniFAQ from "@/components/mini-faq"

// Define Base URL for metadata
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://houstonmobilenotarypros.com'; // Replace with your actual domain

export const metadata = {
  metadataBase: new URL(BASE_URL),
  title: "Notary Services You Can Rely On | Houston Mobile Notary Pros",
  description:
    "Our Promise: Fast, precise notary service—every time, no hassle. Houston Mobile Notary Pros offers Standard, Extended Hours, Loan Signing, Specialty, and Business Notary Solutions.",
  keywords:
    "mobile notary, Houston notary, standard notary, extended hours notary, loan signing specialist, specialty notary services, business notary solutions, transparent pricing, notary services, loan signing, priority notary",
  alternates: {
    canonical: '/services',
  },
  openGraph: {
    title: "Notary Services You Can Rely On | Houston Mobile Notary Pros",
    description: "Our Promise: Fast, precise notary service—every time, no hassle. Discover our range of mobile notary services tailored to your needs.",
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
    title: "Notary Services You Can Rely On | Houston Mobile Notary Pros",
    description: "Need a reliable mobile notary in Houston? We offer fast, precise service for all your notary needs. Our Promise: Fast, precise notary service—every time, no hassle.",
    // Add your Twitter handle here if you have one
    // siteId: 'YourTwitterID',
    // creator: '@YourTwitterHandle',
    // creatorId: 'YourTwitterCreatorID',
    images: [`${BASE_URL}/og-image.jpg`], // Must be an absolute URL
  },
}

export default function ServicesPage() {
  // Move services array inside the component
  const services = [
    {
      slug: "standard",
      name: "Standard Notary",
      price: "$75+",
      tagline: "On-time, every time.",
      description:
        "On-site notarizations of standard documents (POAs, affidavits, contracts) between 9 am–5 pm.",
      link: "/services/standard",
      icon: FileText,
      features: [
        "POAs, affidavits, contracts",
        "Service between 9 am - 5 pm",
        "Travel within 15 miles included",
      ],
      bgColor: "bg-[#002147]",
      borderColor: "border-t-[#002147]",
      buttonVariant: "outline" as "outline" | "default",
      textColor: "text-[#002147]",
      hoverBgColor: "hover:bg-[#002147]",
      hoverTextColor: "hover:text-white",
    },
    {
      slug: "priority",
      name: "Priority Mobile Notary",
      price: "$100",
      tagline: "Urgent notarization, 2-hour response.",
      description:
        "Guaranteed 2-hour response for urgent notarization needs, available 7am-9pm daily.",
      link: "/services/priority",
      icon: Clock,
      features: [
        "2-hour response guarantee",
        "Service 7am-9pm daily",
        "Up to 5 documents, 2 signers",
      ],
      bgColor: "bg-[#A52A2A]",
      borderColor: "border-t-[#A52A2A]",
      buttonVariant: "default" as "outline" | "default",
      textColor: "text-white",
      hoverBgColor: "hover:bg-[#8B0000]",
      isPopular: true,
    },
    {
      slug: "extended",
      name: "Extended Hours Notary",
      price: "$100+",
      tagline: "When 9–5 just won't cut it.",
      description:
        "Same-day or after-hours service (7 am–9 pm) for when 9–5 won't cut it.",
      link: "/services/extended",
      icon: Calendar,
      features: [
        "Same-day or after-hours",
        "Service between 7 am - 9 pm",
        "Flexible scheduling",
      ],
      bgColor: "bg-[#002147]",
      borderColor: "border-t-[#002147]",
      buttonVariant: "outline" as "outline" | "default",
      textColor: "text-[#002147]",
      hoverBgColor: "hover:bg-[#002147]",
      hoverTextColor: "hover:text-white",
    },
    {
      slug: "loan-signing",
      name: "Loan Signing Specialist",
      price: "$200+",
      tagline: "Paperwork pros you can trust.",
      description:
        "Certified loan signings, including all trip-chain, remote online signings, and courier returns.",
      link: "/services/loan-signing",
      icon: Briefcase,
      features: [
        "Certified loan signings",
        "RON and courier returns",
        "Meticulous & professional",
      ],
      bgColor: "bg-[#002147]",
      borderColor: "border-t-[#002147]",
      buttonVariant: "outline" as "outline" | "default",
      textColor: "text-[#002147]",
      hoverBgColor: "hover:bg-[#002147]",
      hoverTextColor: "hover:text-white",
    },
    {
      slug: "estate-planning",
      name: "Estate Planning Package",
      price: "$250+",
      tagline: "Secure your legacy, simply.",
      description:
        "A comprehensive package for notarizing all your estate documents—Wills, Trusts, POAs, and more.",
      link: "/services/estate-planning", // Links to the main service page
      icon: Shield,
      features: [
        "Notarize up to 10 documents",
        "Includes up to 4 signers",
        "Mobile service to your location",
      ],
      bgColor: "bg-[#002147]",
      borderColor: "border-t-[#002147]",
      buttonVariant: "outline" as "outline" | "default",
      textColor: "text-[#002147]",
      hoverBgColor: "hover:bg-[#002147]",
      hoverTextColor: "hover:text-white",
    },
    {
      slug: "specialty",
      name: "Specialty Notary Services",
      price: "$150+",
      tagline: "Complex docs handled.",
      description:
        "Apostilles, embassy certifications, translations, and other complex notarial acts.",
      link: "/services/specialty",
      icon: Award,
      features: [
        "Apostilles, translations",
        "Embassy certifications",
        "Expert handling of unique needs",
      ],
      bgColor: "bg-[#002147]",
      borderColor: "border-t-[#002147]",
      buttonVariant: "outline" as "outline" | "default",
      textColor: "text-[#002147]",
      hoverBgColor: "hover:bg-[#002147]",
      hoverTextColor: "hover:text-white",
    },
    {
      slug: "business",
      name: "Business Notary Solutions",
      price: "$250+",
      tagline: "Keep your business moving.",
      description:
        "Volume signings, block-booking discounts, corporate account setups, and recurring appointments.",
      link: "/services/business",
      icon: Building,
      features: [
        "Volume & block-booking discounts",
        "Corporate accounts",
        "Recurring appointments",
      ],
      bgColor: "bg-[#002147]",
      borderColor: "border-t-[#002147]",
      buttonVariant: "outline" as "outline" | "default",
      textColor: "text-[#002147]",
      hoverBgColor: "hover:bg-[#002147]",
      hoverTextColor: "hover:text-white",
    },
    {
      slug: "extras",
      name: "Extras & Fees",
      price: "See details",
      tagline: "Transparent pricing, no surprises.",
      description:
        "Mileage Fee: $0.50/mile • After-Hours Fee: $30 • Weekend Fee: $40",
      link: "/services/extras",
      icon: ListPlus,
      features: [
        "Mileage Fee: $0.50/mile",
        "After-Hours Fee: $30",
        "Weekend Fee: $40",
      ],
      bgColor: "bg-[#002147]",
      borderColor: "border-t-[#002147]",
      buttonVariant: "outline" as "outline" | "default",
      textColor: "text-[#002147]",
      hoverBgColor: "hover:bg-[#002147]",
      hoverTextColor: "hover:text-white",
    },
  ];

  // Updated FAQ data
  const serviceFaqs = [
    {
      id: "service-difference",
      question: "What's the difference between your service packages?",
      answer: (
        <p>
          Our services are designed to meet diverse needs:
          <strong className="block mt-2">Standard Notary:</strong> For on-site notarizations of standard documents (POAs, affidavits, contracts) during 9 am–5 pm.
          <strong className="block mt-2">Priority Mobile Notary:</strong> Guaranteed 2-hour response for urgent notarization needs, available 7am-9pm daily.
          <strong className="block mt-2">Extended Hours Notary:</strong> Offers same-day or after-hours service (7 am–9 pm) for urgent needs outside standard business hours.
          <strong className="block mt-2">Loan Signing Specialist:</strong> Provides certified loan signings, including remote online notarizations (RON) and courier services.
          <strong className="block mt-2">Specialty Notary Services:</strong> Covers complex notarial acts like apostilles, embassy certifications, and translations.
          <strong className="block mt-2">Business Notary Solutions:</strong> Caters to businesses with volume signings, block-booking discounts, and corporate account setups.
          Each service ensures professionalism and precision. Please check individual service details for specifics.
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

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <section className="hero text-center mb-16">
  <h1 className="text-4xl font-bold text-[#002147] mb-4">
    Notary Services You Can Rely On
  </h1>
  <p className="subtitle text-xl text-gray-600 max-w-3xl mx-auto">
    Our Promise: Fast, precise notary service—every time, no hassle.
  </p>
</section>

      {/* Service Categories Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {services.map((service) => (
          <Card
            key={service.slug}
            className={`shadow-md hover:shadow-lg transition-all duration-300 border-t-4 ${service.borderColor} ${service.isPopular ? 'shadow-xl hover:shadow-2xl' : ''}`}
          >
            {service.isPopular && (
              <div className={`absolute top-0 right-0 ${service.bgColor} text-white px-3 py-1 text-xs font-medium rounded-bl-lg -mt-1`}>
                MOST POPULAR
              </div>
            )}
            <CardHeader className="pb-2">
              <div className="flex items-center mb-2">
                <div className={`${service.bgColor} p-2 rounded-full mr-3`}>
                  <service.icon className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-[#002147]">{service.name}</CardTitle>
              </div>
              <CardDescription>{service.tagline}</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex items-baseline mb-4">
                <p className="text-3xl font-bold text-[#002147]">{service.price}</p>
                {service.price !== "See details" && !service.price.includes("/") && <span className="ml-2 text-gray-500">starting at</span>}
              </div>
              <p className="text-sm text-gray-600 mb-4 h-20 overflow-hidden">{service.description}</p> {/* Added fixed height and overflow hidden for uniform look */}
              <ul className="space-y-3 mb-6">
                {service.features?.slice(0, 3).map((feature, index) => ( // Display up to 3 features
                  <li key={index} className="flex items-start">
                    <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="pt-0">
              <Link href={service.link} className="w-full">
                <Button
                  variant={service.buttonVariant || 'outline'}
                  className={`w-full ${service.buttonVariant === 'outline' ? `${service.borderColor ? `border-[${service.borderColor.split('-')[2]}]` : 'border-[#002147]'} ${service.textColor || 'text-[#002147]'} ${service.hoverBgColor || 'hover:bg-[#002147]'} ${service.hoverTextColor || 'hover:text-white'}` : `${service.bgColor} ${service.textColor || 'text-white'} ${service.hoverBgColor || 'hover:bg-[#8B0000]'}`}`}
                >
                  Learn More
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
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
                <TableHead className="w-[150px] md:w-[200px]">Feature</TableHead>
                <TableHead>Standard Notary</TableHead>
                <TableHead>Extended Hours Notary</TableHead>
                <TableHead>Loan Signing Specialist</TableHead>
                <TableHead>Specialty Notary Services</TableHead>
                <TableHead>Business Notary Solutions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Starting Price</TableCell>
                <TableCell>$75+</TableCell>
                <TableCell>$100+</TableCell>
                <TableCell>$200+</TableCell>
                <TableCell>$150+</TableCell>
                <TableCell>$250+</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Service Hours</TableCell>
                <TableCell>9 am–5 pm M-F</TableCell>
                <TableCell>7 am–9 pm Daily</TableCell>
                <TableCell>By Appointment</TableCell>
                <TableCell>By Appointment</TableCell>
                <TableCell>Custom / Recurring</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Key Documents/Use</TableCell>
                <TableCell>POAs, Affidavits, Contracts</TableCell>
                <TableCell>Urgent, Same-day, After-hours</TableCell>
                <TableCell>Certified Loan Signings, RON</TableCell>
                <TableCell>Apostilles, Translations, Embassy</TableCell>
                <TableCell>Volume Signings, Corporate</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Best For</TableCell>
                <TableCell>Standard legal documents</TableCell>
                <TableCell>Time-sensitive situations</TableCell>
                <TableCell>Real estate transactions</TableCell>
                <TableCell>International & complex docs</TableCell>
                <TableCell>Businesses with ongoing needs</TableCell>
              </TableRow>
              {/* Add more feature rows as needed */}
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

        <Tabs defaultValue={services[0].slug} className="w-full">
          <TabsList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 mb-8">
            {services.map(service => (
              <TabsTrigger key={service.slug} value={service.slug} className="data-[state=active]:bg-[#002147] data-[state=active]:text-white">
                {service.name.replace(" Notary", "").replace(" Services", "").replace(" Specialist", "").replace(" Solutions", "")} {/* Shortened name for tab */}
              </TabsTrigger>
            ))}
          </TabsList>

          {services.map(service => (
            <TabsContent key={service.slug} value={service.slug} className="mt-0">
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="grid md:grid-cols-2 gap-8 items-start">
                  <div>
                    <h3 className="text-xl font-bold text-[#002147] mb-4">{service.name}</h3>
                    <p className="text-gray-600 mb-2"><strong>Tagline:</strong> {service.tagline}</p>
                    <p className="text-gray-600 mb-4">
                      {service.description}
                    </p>
                    {service.price && (
                       <p className="text-lg font-semibold text-[#002147] mb-4">
                        {service.price === "See details" ? "Pricing: See details below or contact us" : `Starting at: ${service.price}`}
                      </p>
                    )}
                    {service.slug === "extras" && (
                       <div className="mt-4">
                        <h4 className="font-semibold text-[#002147] mb-2">Fee Details:</h4>
                        <ul className="space-y-1 text-gray-600">
                          <li>Mileage Fee: $0.50/mile</li>
                          <li>After-Hours Fee: $30</li>
                          <li>Weekend Fee: $40</li>
                        </ul>
                       </div>
                    )}
                    <div className="mt-6">
                      <Link href={service.link}>
                        <Button className={`${service.bgColor} ${service.textColor || 'text-white'} ${service.hoverBgColor || 'hover:bg-[#001a38]'}`}>
                          Learn More About {service.name.replace(" Notary", "").replace(" Services", "")}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {service.features && service.features.length > 0 && service.slug !== "extras" && (
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <h4 className="font-semibold text-[#002147] mb-2">Key Features & Inclusions</h4>
                        <ul className="space-y-2">
                          {service.features.map((feature, index) => (
                            <li key={index} className="flex items-start">
                              <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                     {service.slug === "standard" && (
                       <div className="bg-white p-4 rounded-lg shadow-sm">
                        <h4 className="font-semibold text-[#002147] mb-2">Common Documents Handled</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li>Wills, Trusts, & Estate Planning</li>
                          <li>Powers of Attorney (Financial, Medical)</li>
                          <li>Affidavits & Sworn Statements</li>
                          <li>Deeds (Quitclaim, Warranty, etc.)</li>
                          <li>Contracts & Business Agreements</li>
                          <li>Vehicle Title Transfers</li>
                          <li>Travel Consent Forms for Minors</li>
                          <li>I-9 Employment Verification (as applicable)</li>
                        </ul>
                       </div>
                    )}
                    {service.slug === "loan-signing" && (
                       <div className="bg-white p-4 rounded-lg shadow-sm">
                        <h4 className="font-semibold text-[#002147] mb-2">Loan Signing Expertise</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li>Certified Loan Signing Agent</li>
                            <li>Purchase, Refinance, HELOC, Seller Packages</li>
                            <li>Remote Online Notarization (RON) capabilities</li>
                            <li>Courier and document return services</li>
                            <li>Meticulous attention to detail</li>
                        </ul>
                       </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
          ))}
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
