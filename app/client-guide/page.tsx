import type { Metadata } from "next"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Clock, DollarSign, MapPin, AlertCircle, HelpCircle } from "lucide-react"

export const metadata: Metadata = {
  title: "Client Guide | Houston Mobile Notary Pros",
  description:
    "A comprehensive guide to our mobile notary services, what to expect, and how to prepare for your appointment.",
  keywords: [
    "notary guide",
    "mobile notary help",
    "notary preparation",
    "notary client guide",
    "houston notary services",
  ],
}

export default function ClientGuidePage() {
  return (
    <div className="container-custom py-12 md:py-16">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-oxfordBlue mb-4">Client Guide</h1>
          <p className="text-lg text-muted-foreground">Everything you need to know about our mobile notary services</p>
        </div>

        <Tabs defaultValue="overview" className="w-full mb-12">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="fees">Fees</TabsTrigger>
            <TabsTrigger value="preparation">Preparation</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Welcome to Houston Mobile Notary Pros</CardTitle>
                <CardDescription>Your guide to understanding our mobile notary services</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  We bring professional notary services directly to you, saving you time and hassle. Our mobile notaries
                  are commissioned by the State of Texas and are available for appointments throughout the Houston area.
                </p>

                <div className="grid gap-4 md:grid-cols-2 mt-6">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-auburn flex-shrink-0" />
                    <div>
                      <h3 className="font-medium">Convenience</h3>
                      <p className="text-sm text-muted-foreground">
                        We come to your location - home, office, or coffee shop
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Clock className="h-6 w-6 text-auburn flex-shrink-0" />
                    <div>
                      <h3 className="font-medium">Flexible Scheduling</h3>
                      <p className="text-sm text-muted-foreground">Day, evening, and weekend appointments available</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <DollarSign className="h-6 w-6 text-auburn flex-shrink-0" />
                    <div>
                      <h3 className="font-medium">Transparent Pricing</h3>
                      <p className="text-sm text-muted-foreground">Clear fee structure with no hidden charges</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <MapPin className="h-6 w-6 text-auburn flex-shrink-0" />
                    <div>
                      <h3 className="font-medium">Service Area</h3>
                      <p className="text-sm text-muted-foreground">
                        Serving Houston and surrounding areas within a 20-mile radius
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-lg mt-6">
                  <h3 className="font-medium flex items-center">
                    <AlertCircle className="h-5 w-5 text-auburn mr-2" />
                    Important Note
                  </h3>
                  <p className="text-sm mt-1">
                    Texas law requires all signers to be physically present during the notarization and provide valid
                    government-issued photo identification.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Our Services</CardTitle>
                <CardDescription>Choose the service that best fits your needs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium text-lg text-oxfordBlue">Essential Mobile Package</h3>
                  <p className="text-sm text-muted-foreground mt-1">Our standard service for general notarizations</p>
                  <ul className="mt-3 space-y-2">
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                      <span>Notarization of up to 3 signatures</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                      <span>Scheduled within 24-48 hours</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                      <span>Perfect for power of attorney, affidavits, and consent forms</span>
                    </li>
                  </ul>
                  <Link
                    href="/services/essential-mobile"
                    className="text-auburn hover:text-auburn/80 font-medium text-sm inline-flex items-center mt-3"
                  >
                    Learn more
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 ml-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </Link>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-medium text-lg text-oxfordBlue">Priority Service</h3>
                  <p className="text-sm text-muted-foreground mt-1">For urgent notarization needs</p>
                  <ul className="mt-3 space-y-2">
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                      <span>Same-day service (within 2-3 hours when available)</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                      <span>Notarization of up to 3 signatures</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                      <span>Priority scheduling</span>
                    </li>
                  </ul>
                  <Link
                    href="/services/priority-service"
                    className="text-auburn hover:text-auburn/80 font-medium text-sm inline-flex items-center mt-3"
                  >
                    Learn more
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 ml-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </Link>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-medium text-lg text-oxfordBlue">Loan Signing Services</h3>
                  <p className="text-sm text-muted-foreground mt-1">Specialized service for real estate transactions</p>
                  <ul className="mt-3 space-y-2">
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                      <span>Complete loan document signing service</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                      <span>Experienced with refinance, purchase, and HELOC transactions</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                      <span>Certified Loan Signing Agents available</span>
                    </li>
                  </ul>
                  <Link
                    href="/services/loan-signing"
                    className="text-auburn hover:text-auburn/80 font-medium text-sm inline-flex items-center mt-3"
                  >
                    Learn more
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 ml-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </Link>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-medium text-lg text-oxfordBlue">Specialty Services</h3>
                  <p className="text-sm text-muted-foreground mt-1">For unique or complex notarization needs</p>
                  <ul className="mt-3 space-y-2">
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                      <span>Medical facility visits</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                      <span>I-9 verification services</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                      <span>Apostille document preparation</span>
                    </li>
                  </ul>
                  <Link
                    href="/services/specialty"
                    className="text-auburn hover:text-auburn/80 font-medium text-sm inline-flex items-center mt-3"
                  >
                    Learn more
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 ml-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </Link>
                </div>

                <div className="mt-6 text-center">
                  <Link
                    href="/services"
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-oxfordBlue text-white hover:bg-oxfordBlue/90 h-10 px-4 py-2"
                  >
                    View All Services
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fees" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Understanding Our Fees</CardTitle>
                <CardDescription>A simplified explanation of our pricing structure</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="font-medium">How Our Fees Work</h3>
                    <p className="text-sm mt-1">Our fees consist of three main components:</p>
                    <ol className="mt-2 space-y-2 text-sm">
                      <li className="flex items-start">
                        <span className="bg-auburn text-white rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 flex-shrink-0 mt-0.5">
                          1
                        </span>
                        <span>
                          <strong>Base Service Fee:</strong> Covers the notarization service itself
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="bg-auburn text-white rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 flex-shrink-0 mt-0.5">
                          2
                        </span>
                        <span>
                          <strong>Travel Fee:</strong> Based on your location's distance from our base
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="bg-auburn text-white rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 flex-shrink-0 mt-0.5">
                          3
                        </span>
                        <span>
                          <strong>Additional Charges:</strong> For extra signatures, after-hours service, etc.
                        </span>
                      </li>
                    </ol>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium text-oxfordBlue">Base Service Fees</h3>
                      <ul className="mt-2 space-y-2 text-sm">
                        <li className="flex justify-between">
                          <span>Essential Mobile Package:</span>
                          <span className="font-medium">$60</span>
                        </li>
                        <li className="flex justify-between">
                          <span>Priority Service:</span>
                          <span className="font-medium">$85</span>
                        </li>
                        <li className="flex justify-between">
                          <span>Loan Signing:</span>
                          <span className="font-medium">$125</span>
                        </li>
                        <li className="flex justify-between">
                          <span>Specialty Services:</span>
                          <span className="font-medium">Varies</span>
                        </li>
                      </ul>
                    </div>

                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium text-oxfordBlue">Travel Fees</h3>
                      <ul className="mt-2 space-y-2 text-sm">
                        <li className="flex justify-between">
                          <span>0-5 miles:</span>
                          <span className="font-medium">$0</span>
                        </li>
                        <li className="flex justify-between">
                          <span>5-10 miles:</span>
                          <span className="font-medium">$15</span>
                        </li>
                        <li className="flex justify-between">
                          <span>10-15 miles:</span>
                          <span className="font-medium">$25</span>
                        </li>
                        <li className="flex justify-between">
                          <span>15-20 miles:</span>
                          <span className="font-medium">$35</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium text-oxfordBlue">Additional Charges</h3>
                    <ul className="mt-2 space-y-2 text-sm">
                      <li className="flex justify-between">
                        <span>Additional signatures (beyond first 3):</span>
                        <span className="font-medium">$10 each</span>
                      </li>
                      <li className="flex justify-between">
                        <span>After-hours service (after 6 PM):</span>
                        <span className="font-medium">$25</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Weekend service:</span>
                        <span className="font-medium">$35</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Additional documents:</span>
                        <span className="font-medium">$15 per document</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="font-medium flex items-center">
                      <DollarSign className="h-5 w-5 text-auburn mr-2" />
                      Payment Methods
                    </h3>
                    <p className="text-sm mt-1">
                      We accept cash, credit/debit cards, Venmo, Zelle, and PayPal. Payment is due at the time of
                      service.
                    </p>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <Link
                    href="/fee-schedule"
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-oxfordBlue text-white hover:bg-oxfordBlue/90 h-10 px-4 py-2"
                  >
                    View Detailed Fee Schedule
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preparation" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Preparing for Your Appointment</CardTitle>
                <CardDescription>How to ensure a smooth notarization experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="font-medium flex items-center">
                      <AlertCircle className="h-5 w-5 text-auburn mr-2" />
                      Before Your Appointment
                    </h3>
                    <ul className="mt-2 space-y-2 text-sm">
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                        <span>
                          Ensure all documents are complete but <strong>NOT signed</strong> (unless instructed
                          otherwise)
                        </span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                        <span>Have valid government-issued photo ID ready for all signers</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                        <span>Confirm all signers will be present during the appointment</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                        <span>Prepare a suitable signing space with adequate lighting</span>
                      </li>
                    </ul>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium text-oxfordBlue">Acceptable Forms of ID</h3>
                    <p className="text-sm mt-1">
                      Texas law requires proper identification for notarization. Acceptable forms include:
                    </p>
                    <ul className="mt-2 space-y-1 text-sm">
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                        <span>Texas Driver's License or ID Card</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                        <span>U.S. Passport or Passport Card</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                        <span>U.S. Military ID</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                        <span>Permanent Resident Card or Alien Registration Receipt Card</span>
                      </li>
                    </ul>
                    <p className="text-sm mt-2 text-muted-foreground">
                      Note: All IDs must be current (not expired) and contain a photograph, physical description,
                      signature, and an identifying number.
                    </p>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium text-oxfordBlue">During Your Appointment</h3>
                    <ul className="mt-2 space-y-2 text-sm">
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                        <span>Present your ID to the notary</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                        <span>Sign documents only in the presence of the notary</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                        <span>Be prepared to verbally confirm you are signing willingly</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                        <span>Ask any questions you may have about the process</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="font-medium flex items-center">
                      <HelpCircle className="h-5 w-5 text-auburn mr-2" />
                      Special Circumstances
                    </h3>
                    <ul className="mt-2 space-y-2 text-sm">
                      <li className="flex items-start">
                        <span className="font-medium mr-2">Name Discrepancy:</span>
                        <span>If your name on the ID differs from the document, bring supporting documentation</span>
                      </li>
                      <li className="flex items-start">
                        <span className="font-medium mr-2">Physical Limitations:</span>
                        <span>Inform us in advance if you need accommodation for signing</span>
                      </li>
                      <li className="flex items-start">
                        <span className="font-medium mr-2">Foreign Language Documents:</span>
                        <span>We can notarize these, but cannot translate or verify content</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <Link
                    href="/document-requirements"
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-oxfordBlue text-white hover:bg-oxfordBlue/90 h-10 px-4 py-2"
                  >
                    View Document Requirements
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="space-y-8 mt-12">
          <div>
            <h2 className="text-2xl font-bold text-oxfordBlue mb-4">Common Questions</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-oxfordBlue flex items-center">
                  <HelpCircle className="h-5 w-5 text-auburn mr-2" />
                  What if I need to reschedule?
                </h3>
                <p className="text-sm mt-2">
                  We understand plans change. Please give us at least 2 hours' notice to reschedule. For same-day
                  cancellations with less than 2 hours' notice, a $25 fee may apply.
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-oxfordBlue flex items-center">
                  <HelpCircle className="h-5 w-5 text-auburn mr-2" />
                  How long does a typical appointment take?
                </h3>
                <p className="text-sm mt-2">
                  Essential and Priority services typically take 15-20 minutes. Loan signings usually take 30-45 minutes
                  depending on the number of documents.
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-oxfordBlue flex items-center">
                  <HelpCircle className="h-5 w-5 text-auburn mr-2" />
                  What if I don't have all my documents ready?
                </h3>
                <p className="text-sm mt-2">
                  It's best to have all documents prepared before the appointment. If additional documents need
                  notarization after the notary arrives, additional fees may apply.
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-oxfordBlue flex items-center">
                  <HelpCircle className="h-5 w-5 text-auburn mr-2" />
                  Can you provide legal advice about my documents?
                </h3>
                <p className="text-sm mt-2">
                  No. Texas law prohibits notaries from providing legal advice unless they are also licensed attorneys.
                  We can notarize your documents but cannot advise on their content.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-oxfordBlue mb-4">Ready to Book?</h2>
            <div className="bg-muted p-6 rounded-lg text-center">
              <p className="mb-4">We're ready to assist with your notary needs. Schedule an appointment today!</p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  href="/booking"
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-auburn text-white hover:bg-auburn/90 h-10 px-6 py-2"
                >
                  Book Now
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-6 py-2"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

