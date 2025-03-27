import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProcessTimeline } from "@/components/process-timeline"
import { CheckCircle, Clock, Calendar, MapPin, FileText, CreditCard, Phone } from "lucide-react"

export const metadata: Metadata = {
  title: "Our Process | Houston Mobile Notary Pros",
  description:
    "Learn about our simple 4-step process for mobile notary services in Houston. From booking to completion, we make notarization easy.",
  keywords: [
    "notary process",
    "mobile notary steps",
    "how notary works",
    "houston notary process",
    "notary appointment",
  ],
}

export default function ProcessPage() {
  return (
    <div className="container-custom py-12 md:py-16">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-oxfordBlue mb-4">Our Process</h1>
          <p className="text-lg text-muted-foreground">How our mobile notary service works from start to finish</p>
        </div>

        <div className="grid gap-12 md:gap-16">
          {/* Overview Section */}
          <section>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-2xl font-bold text-oxfordBlue mb-4">Simple, Convenient Notarization</h2>
                <p className="text-muted-foreground mb-4">
                  We've streamlined the mobile notary process to make it as easy as possible for you. Our professional
                  notaries come to your location, saving you time and hassle.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                    <span>No need to travel or wait in line</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                    <span>Flexible scheduling including evenings and weekends</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                    <span>Professional, experienced notaries</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                    <span>Service throughout the Houston area</span>
                  </li>
                </ul>
              </div>
              <div className="relative h-64 md:h-full rounded-lg overflow-hidden">
                <Image
                  src="/placeholder.svg?height=400&width=600"
                  alt="Mobile notary service"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </section>

          {/* Process Timeline Section */}
          <section>
            <h2 className="text-2xl font-bold text-oxfordBlue mb-6 text-center">Our 4-Step Process</h2>
            <ProcessTimeline
              steps={[
                {
                  title: "Book Your Appointment",
                  description:
                    "Schedule online, by phone, or email. Choose a date, time, and location that works for you.",
                },
                {
                  title: "Prepare Your Documents",
                  description: "Gather your documents and valid ID. Make sure documents are complete but unsigned.",
                },
                {
                  title: "Meet Our Notary",
                  description: "Our notary arrives at your location. Present your ID and documents for verification.",
                },
                {
                  title: "Complete the Notarization",
                  description: "Sign your documents in the presence of the notary. Pay for services, and you're done!",
                },
              ]}
            />
            <div className="mt-8 text-center">
              <Link
                href="/booking"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-auburn text-white hover:bg-auburn/90 h-10 px-6 py-2"
              >
                Book Your Appointment
              </Link>
            </div>
          </section>

          {/* Detailed Steps Section */}
          <section>
            <h2 className="text-2xl font-bold text-oxfordBlue mb-6">Detailed Process Steps</h2>

            <div className="space-y-6">
              <Card>
                <CardHeader className="bg-muted">
                  <div className="flex items-center">
                    <Calendar className="h-6 w-6 text-auburn mr-3" />
                    <CardTitle>Step 1: Book Your Appointment</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <p>
                      Scheduling your mobile notary appointment is quick and easy. Choose the option that works best for
                      you:
                    </p>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium text-oxfordBlue mb-2">Online Booking</h4>
                        <p className="text-sm">
                          Use our online booking system to select your preferred date, time, and service type.
                        </p>
                        <Link
                          href="/booking"
                          className="text-auburn hover:text-auburn/80 font-medium text-sm inline-flex items-center mt-2"
                        >
                          Book Online
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
                        <h4 className="font-medium text-oxfordBlue mb-2">Phone Booking</h4>
                        <p className="text-sm">Call us at (281) 779-8847 to speak with our scheduling team directly.</p>
                        <Link
                          href="tel:2817798847"
                          className="text-auburn hover:text-auburn/80 font-medium text-sm inline-flex items-center mt-2"
                        >
                          Call Now
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
                        <h4 className="font-medium text-oxfordBlue mb-2">Email Request</h4>
                        <p className="text-sm">
                          Send your request to contact@houstonmobilenotarypros.com with your details.
                        </p>
                        <Link
                          href="mailto:contact@houstonmobilenotarypros.com"
                          className="text-auburn hover:text-auburn/80 font-medium text-sm inline-flex items-center mt-2"
                        >
                          Email Us
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
                    </div>

                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-medium text-oxfordBlue mb-2">Information We'll Need</h4>
                      <ul className="space-y-1 text-sm">
                        <li className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                          <span>Your name and contact information</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                          <span>Preferred date and time (with alternatives if possible)</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                          <span>Service location address</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                          <span>Type of service needed (essential, priority, loan signing, etc.)</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                          <span>Number of documents and signatures requiring notarization</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="bg-muted">
                  <div className="flex items-center">
                    <FileText className="h-6 w-6 text-auburn mr-3" />
                    <CardTitle>Step 2: Prepare Your Documents</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <p>Proper preparation ensures a smooth notarization process. Here's what you need to do:</p>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium text-oxfordBlue mb-2">Document Preparation</h4>
                        <ul className="space-y-1 text-sm">
                          <li className="flex items-start">
                            <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                            <span>Ensure documents are complete with no blank spaces</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                            <span>Keep documents unsigned unless instructed otherwise</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                            <span>Verify documents have proper notary sections</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                            <span>Have all pages of multi-page documents ready</span>
                          </li>
                        </ul>
                      </div>

                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium text-oxfordBlue mb-2">ID Requirements</h4>
                        <ul className="space-y-1 text-sm">
                          <li className="flex items-start">
                            <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                            <span>Have valid government-issued photo ID ready</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                            <span>Ensure ID is not expired</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                            <span>Prepare additional documentation if your name differs from ID</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                            <span>All signers must have their own valid ID</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-medium text-oxfordBlue mb-2">Setting Up Your Space</h4>
                      <ul className="space-y-1 text-sm">
                        <li className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                          <span>Choose a quiet location with minimal distractions</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                          <span>Ensure adequate lighting for document review</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                          <span>Provide a flat surface for signing (table or desk)</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                          <span>Make sure all signers will be present during the appointment</span>
                        </li>
                      </ul>
                    </div>

                    <div className="text-center">
                      <Link
                        href="/document-requirements"
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                      >
                        View Detailed Document Requirements
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="bg-muted">
                  <div className="flex items-center">
                    <MapPin className="h-6 w-6 text-auburn mr-3" />
                    <CardTitle>Step 3: Meet Our Notary</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <p>On the day of your appointment, our professional notary will arrive at your location:</p>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium text-oxfordBlue mb-2">What to Expect</h4>
                        <ul className="space-y-1 text-sm">
                          <li className="flex items-start">
                            <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                            <span>Our notary will arrive at the scheduled time</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                            <span>They will introduce themselves and explain the process</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                            <span>The notary will verify your identity using your ID</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                            <span>They will review your documents to ensure they can be notarized</span>
                          </li>
                        </ul>
                      </div>

                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium text-oxfordBlue mb-2">The Verification Process</h4>
                        <ul className="space-y-1 text-sm">
                          <li className="flex items-start">
                            <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                            <span>Present your government-issued photo ID</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                            <span>The notary will compare your ID to your appearance</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                            <span>They will verify the notarial language on your documents</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                            <span>The notary will confirm you understand what you're signing</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-medium text-oxfordBlue mb-2">Our Professional Standards</h4>
                      <p className="text-sm">All our notaries are:</p>
                      <ul className="mt-2 space-y-1 text-sm">
                        <li className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                          <span>Commissioned by the State of Texas</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                          <span>Background-checked and insured</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                          <span>Trained in proper notarial procedures</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                          <span>Committed to maintaining confidentiality</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="bg-muted">
                  <div className="flex items-center">
                    <CreditCard className="h-6 w-6 text-auburn mr-3" />
                    <CardTitle>Step 4: Complete the Notarization</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <p>The final step is completing the notarization process:</p>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium text-oxfordBlue mb-2">The Signing Process</h4>
                        <ul className="space-y-1 text-sm">
                          <li className="flex items-start">
                            <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                            <span>Sign your documents in the presence of the notary</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                            <span>For jurats, you'll take an oath or affirmation</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                            <span>The notary will complete their portion of the document</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                            <span>They will apply their official seal to the documents</span>
                          </li>
                        </ul>
                      </div>

                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium text-oxfordBlue mb-2">Payment & Completion</h4>
                        <ul className="space-y-1 text-sm">
                          <li className="flex items-start">
                            <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                            <span>Payment is due at the time of service</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                            <span>We accept cash, credit/debit cards, Venmo, Zelle, and PayPal</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                            <span>You'll receive a receipt for your records</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                            <span>The notary will record the transaction in their journal</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-medium text-oxfordBlue mb-2">After Your Notarization</h4>
                      <ul className="space-y-1 text-sm">
                        <li className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                          <span>Keep your notarized documents in a safe place</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                          <span>Make copies if needed for your records</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                          <span>Submit your documents to the appropriate recipient</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                          <span>Contact us if you need additional notarizations in the future</span>
                        </li>
                      </ul>
                    </div>

                    <div className="text-center">
                      <Link
                        href="/fee-schedule"
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                      >
                        View Our Fee Schedule
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* FAQ Section */}
          <section>
            <h2 className="text-2xl font-bold text-oxfordBlue mb-6">Frequently Asked Questions</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-oxfordBlue flex items-center">
                  <Clock className="h-5 w-5 text-auburn mr-2" />
                  How long does the process take?
                </h3>
                <p className="text-sm mt-2">
                  Most standard notarizations take 15-20 minutes to complete. Loan signings typically take 30-45 minutes
                  depending on the number of documents.
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-oxfordBlue flex items-center">
                  <Phone className="h-5 w-5 text-auburn mr-2" />
                  What if I need to reschedule?
                </h3>
                <p className="text-sm mt-2">
                  We understand plans change. Please give us at least 2 hours' notice to reschedule. For same-day
                  cancellations with less than 2 hours' notice, a $25 fee may apply.
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-oxfordBlue flex items-center">
                  <MapPin className="h-5 w-5 text-auburn mr-2" />
                  How far will you travel?
                </h3>
                <p className="text-sm mt-2">
                  We serve the greater Houston area within a 20-mile radius of ZIP code 77591. Travel beyond this area
                  may be available for an additional fee.
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-oxfordBlue flex items-center">
                  <FileText className="h-5 w-5 text-auburn mr-2" />
                  What if my documents aren't ready?
                </h3>
                <p className="text-sm mt-2">
                  It's best to have all documents prepared before the appointment. If additional documents need
                  notarization after the notary arrives, additional fees may apply.
                </p>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section>
            <div className="bg-muted p-6 rounded-lg text-center">
              <h2 className="text-2xl font-bold text-oxfordBlue mb-4">Ready to Get Started?</h2>
              <p className="mb-6">
                Our mobile notary service makes notarization simple and convenient. Book your appointment today and
                experience the difference!
              </p>
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
          </section>
        </div>
      </div>
    </div>
  )
}

