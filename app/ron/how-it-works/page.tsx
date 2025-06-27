import Link from "next/link"
import { ArrowRight, CheckCircle, Shield, Clock, Monitor, FileText, Video, CreditCard, Gavel, AlertTriangle, HelpCircle, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { metadata } from "./metadata"

export { metadata }

const ronSteps = [
  {
    number: 1,
    title: "Schedule Your RON Session",
    description: "Book your remote online notarization appointment through our secure online platform.",
    icon: <Clock className="h-6 w-6" />,
    details: [
      "Choose a convenient time that works for you",
      "Select the type of documents you need notarized",
      "Provide basic information about your notarization needs",
      "Receive confirmation and preparation instructions"
    ]
  },
  {
    number: 2,
    title: "Prepare Your Documents & Technology",
    description: "Get your documents ready and ensure your technology meets the requirements.",
    icon: <FileText className="h-6 w-6" />,
    details: [
      "Prepare all documents in digital format (PDF preferred)",
      "Ensure stable internet connection (minimum 5 Mbps recommended)",
      "Test your camera and microphone",
      "Have your government-issued ID ready"
    ]
  },
  {
    number: 3,
    title: "Identity Verification",
    description: "Complete secure identity verification using advanced technology.",
    icon: <CreditCard className="h-6 w-6" />,
    details: [
      "Present your government-issued photo ID to the camera",
      "Automated credential analysis verifies your ID",
      "Complete Knowledge-Based Authentication (KBA) questions",
      "Biometric verification ensures you are who you claim to be"
    ]
  },
  {
    number: 4,
    title: "Live Video Session",
    description: "Connect with our commissioned Texas notary for the notarization.",
    icon: <Video className="h-6 w-6" />,
    details: [
      "Join the secure video conference with our notary",
      "Review and sign documents electronically",
      "Receive notarial certificate and official seal",
      "Session is recorded for legal compliance"
    ]
  },
  {
    number: 5,
    title: "Receive Your Notarized Documents",
    description: "Download your completed, legally valid notarized documents.",
    icon: <Gavel className="h-6 w-6" />,
    details: [
      "Download notarized documents immediately after completion",
      "Receive digital copies with embedded notarial seal",
      "Documents are legally valid and accepted nationwide",
      "Secure backup stored in compliance with Texas law"
    ]
  }
]

const technicalRequirements = [
  {
    category: "Device Requirements",
    requirements: [
      "Computer, tablet, or smartphone with camera",
      "High-quality webcam (720p minimum)",
      "Working microphone and speakers",
      "Modern web browser (Chrome, Firefox, Safari, Edge)"
    ]
  },
  {
    category: "Internet Connection",
    requirements: [
      "Stable internet connection (5 Mbps minimum)",
      "Ethernet connection recommended for stability",
      "Backup internet option (mobile hotspot)",
      "Consistent connection throughout session"
    ]
  },
  {
    category: "Document Preparation",
    requirements: [
      "Documents in digital format (PDF, Word, etc.)",
      "Clear, readable document quality",
      "All pages present and in order",
      "Fillable forms completed in advance"
    ]
  },
  {
    category: "Identification",
    requirements: [
      "Government-issued photo ID (driver's license, passport, etc.)",
      "ID must be current and not expired",
      "Clear, visible ID for camera verification",
      "Backup ID recommended"
    ]
  }
]

const ronBenefits = [
  {
    title: "Convenient",
    description: "Notarize documents from anywhere with internet access",
    icon: <Monitor className="h-5 w-5 text-blue-600" />
  },
  {
    title: "Secure",
    description: "Advanced identity verification and encrypted sessions",
    icon: <Shield className="h-5 w-5 text-green-600" />
  },
  {
    title: "Fast",
    description: "Complete notarization in minutes, not hours",
    icon: <Clock className="h-5 w-5 text-orange-600" />
  },
  {
    title: "Legally Valid",
    description: "Fully compliant with Texas RON laws and regulations",
    icon: <Gavel className="h-5 w-5 text-purple-600" />
  }
]

const acceptedDocuments = [
  "Real estate documents (deeds, mortgages, affidavits)",
  "Business contracts and agreements",
  "Power of attorney documents",
  "Wills and estate planning documents",
  "Loan documents and refinancing paperwork",
  "Insurance forms and claims",
  "Employment and HR documents",
  "Personal affidavits and sworn statements"
]

const restrictedDocuments = [
  "Documents requiring witnesses (some wills)",
  "Documents specifically prohibited by Texas law",
  "Documents requiring in-person presence by law",
  "Court documents with specific appearance requirements"
]

export default function RONHowItWorksPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Breadcrumb Navigation */}
      <nav className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-6xl mx-auto">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <Link href="/" className="text-gray-500 hover:text-[#A52A2A]">
                Home
              </Link>
            </li>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <li>
              <Link href="/services" className="text-gray-500 hover:text-[#A52A2A]">
                Services
              </Link>
            </li>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <li>
              <Link href="/ron/dashboard" className="text-gray-500 hover:text-[#A52A2A]">
                RON
              </Link>
            </li>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <li className="text-gray-900 font-medium">
              How It Works
            </li>
          </ol>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <Badge className="mb-4 bg-blue-100 text-blue-800 border-blue-200">
            Remote Online Notarization
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            How RON Works
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Discover the simple, secure process of Remote Online Notarization. Get your documents notarized from anywhere in Texas with our step-by-step guide.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-[#A52A2A] hover:bg-[#8B0000]">
              <Link href="/ron/dashboard">
                Start RON Session
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/contact">
                Have Questions?
                <HelpCircle className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* RON Process Steps */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              The RON Process: 5 Simple Steps
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our streamlined Remote Online Notarization process makes getting your documents notarized quick, secure, and convenient.
            </p>
          </div>

          <div className="space-y-8">
            {ronSteps.map((step) => (
              <Card key={step.number} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full font-bold text-lg">
                      {step.number}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        {step.icon}
                      </div>
                      <div>
                        <CardTitle className="text-xl text-gray-900">{step.title}</CardTitle>
                        <CardDescription className="text-gray-600">{step.description}</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {step.details.map((detail, detailIndex) => (
                      <div key={detailIndex} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{detail}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Requirements */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Technical Requirements
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Ensure your setup meets these requirements for a smooth RON experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {technicalRequirements.map((category, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900">{category.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {category.requirements.map((requirement, reqIndex) => (
                      <li key={reqIndex} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{requirement}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose RON?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Remote Online Notarization offers significant advantages over traditional notarization methods.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {ronBenefits.map((benefit) => (
              <Card key={benefit.title} className="text-center">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-gray-100 rounded-full">
                      {benefit.icon}
                    </div>
                  </div>
                  <CardTitle className="text-lg text-gray-900">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Document Information */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Accepted Documents
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Most documents can be notarized remotely, but some have specific requirements.
            </p>
          </div>

          <Tabs defaultValue="accepted" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="accepted" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Accepted Documents
              </TabsTrigger>
              <TabsTrigger value="restricted" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Restricted Documents
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="accepted" className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-gray-900">Documents We Can Notarize Remotely</CardTitle>
                  <CardDescription>
                    These document types are commonly accepted for Remote Online Notarization in Texas.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {acceptedDocuments.map((doc, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{doc}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="restricted" className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-gray-900">Documents with Restrictions</CardTitle>
                  <CardDescription>
                    These documents may require in-person notarization or have special requirements.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {restrictedDocuments.map((doc, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{doc}</span>
                      </div>
                    ))}
                  </div>
                  <Alert className="mt-6">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Not Sure About Your Document?</AlertTitle>
                    <AlertDescription>
                      Contact us before your session to verify if your document can be notarized remotely. We&apos;re happy to help determine the best approach for your specific needs.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Pricing & CTA */}
      <section className="py-20 px-4 bg-[#A52A2A] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            RON sessions start at just $25 per session + $5 per seal. Fast, secure, and convenient notarization from anywhere in Texas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="bg-white text-[#A52A2A] hover:bg-gray-100">
              <Link href="/ron/dashboard">
                Start Your RON Session
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[#A52A2A]">
              <Link href="/contact">
                Contact Us
                <HelpCircle className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}