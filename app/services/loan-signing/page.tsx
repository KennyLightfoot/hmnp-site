import Link from "next/link"
import { ChevronLeft, Check, FileText, Users, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoanSigningPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Link href="/services" className="flex items-center text-[#002147] hover:text-[#A52A2A] mb-8">
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back to All Services
      </Link>

      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-[#002147] mb-4">Loan Signing Services</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Professional loan signing services for real estate and mortgage transactions
        </p>
      </div>

      {/* Hero Banner */}
      <div className="bg-[#002147] text-white p-8 rounded-lg mb-12">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center">
            <FileText className="h-12 w-12 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Unlimited Documents</h3>
            <p>No limit on document count</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <Users className="h-12 w-12 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Multiple Signers</h3>
            <p>Up to 4 signers included</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <Clock className="h-12 w-12 mb-4" />
            <h3 className="text-xl font-semibold mb-2">90-Minute Session</h3>
            <p>Thorough signing experience</p>
          </div>
        </div>
      </div>

      {/* Service Options */}
      <div className="grid md:grid-cols-2 gap-8 mb-16">
        {/* Standard Loan Closing */}
        <Card className="shadow-md">
          <CardHeader className="bg-[#002147] text-white">
            <CardTitle>Standard Loan Closing</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-3xl font-bold mb-6">$150 flat fee</p>
            <h3 className="text-xl font-semibold mb-3">What's Included:</h3>
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
                <span>Color printing service</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Professional closing binder</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Title company shipping</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>90-minute signing session</span>
              </li>
            </ul>
            <h3 className="text-xl font-semibold mb-3">Additional Options:</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="text-[#A52A2A] mr-2">+</span>
                <span>Overnight document handling: $35</span>
              </li>
            </ul>
            <div className="mt-6">
              <Button className="w-full bg-[#002147] hover:bg-[#001a38]">Book Standard Loan Closing</Button>
            </div>
          </CardContent>
        </Card>

        {/* Reverse Mortgage/HELOC */}
        <Card className="shadow-md">
          <CardHeader className="bg-[#002147] text-white">
            <CardTitle>Reverse Mortgage/HELOC</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-3xl font-bold mb-6">$150 flat fee</p>
            <h3 className="text-xl font-semibold mb-3">What's Included:</h3>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>4-hour response window</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Certified mail return</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Dual agent coordination</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Unlimited documents</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>In-depth explanation of forms</span>
              </li>
            </ul>
            <div className="mt-6">
              <Button className="w-full bg-[#002147] hover:bg-[#001a38]">Book Reverse Mortgage Signing</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Service Description */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-[#002147] mb-6">Our Loan Signing Expertise</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-3">Experienced Loan Signing Agents</h3>
            <p className="mb-4">
              Our notaries are specifically trained in loan document signing. We understand the complexities of real
              estate transactions and provide professional service to ensure your closing goes smoothly.
            </p>
            <p>
              We work with title companies, lenders, and real estate professionals throughout the Houston area to
              facilitate timely and accurate loan closings.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-3">What Sets Us Apart</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>
                  <span className="font-semibold">Comprehensive Service:</span> We handle everything from document
                  preparation to final delivery.
                </span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>
                  <span className="font-semibold">Flexible Scheduling:</span> We accommodate your timeline, including
                  evenings and weekends.
                </span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>
                  <span className="font-semibold">E&O Insurance:</span> $100k coverage for your peace of mind.
                </span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>
                  <span className="font-semibold">Professional Presentation:</span> Organized documents in a
                  professional binder.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Legal Compliance */}
      <div className="bg-gray-50 p-8 rounded-lg mb-16">
        <h2 className="text-2xl font-bold text-[#002147] mb-6">Legal Compliance</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-3">Our Role as Notaries</h3>
            <p className="mb-4">
              As notaries, we are strictly prohibited from explaining loan terms or providing legal advice. Our role is
              limited to:
            </p>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="text-[#A52A2A] mr-2">•</span>
                <span>Verifying the identity of signers</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#A52A2A] mr-2">•</span>
                <span>Witnessing signatures</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#A52A2A] mr-2">•</span>
                <span>Administering oaths when required</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#A52A2A] mr-2">•</span>
                <span>Ensuring proper document execution</span>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-3">Legal Disclaimer</h3>
            <p className="mb-4">In accordance with Texas Government Code §406.017:</p>
            <p className="bg-white p-4 border-l-4 border-[#A52A2A] italic">
              "I AM NOT AN ATTORNEY LICENSED TO PRACTICE LAW IN TEXAS AND MAY NOT GIVE LEGAL ADVICE OR ACCEPT FEES FOR
              LEGAL ADVICE."
            </p>
            <p className="mt-4">
              For questions about your loan terms or legal implications, please consult with your lender, title company,
              or attorney.
            </p>
          </div>
        </div>
      </div>

      {/* Process */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-[#002147] mb-6">The Loan Signing Process</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="bg-[#91A3B0]/20">
              <CardTitle className="flex items-center">
                <div className="bg-[#002147] text-white w-8 h-8 rounded-full flex items-center justify-center mr-2">
                  1
                </div>
                Scheduling
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p>
                Book your appointment online or by phone. We'll coordinate with your title company or lender to receive
                the documents.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="bg-[#91A3B0]/20">
              <CardTitle className="flex items-center">
                <div className="bg-[#002147] text-white w-8 h-8 rounded-full flex items-center justify-center mr-2">
                  2
                </div>
                Preparation
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p>
                We review and organize your documents, prepare a signing binder, and confirm all details with relevant
                parties.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="bg-[#91A3B0]/20">
              <CardTitle className="flex items-center">
                <div className="bg-[#002147] text-white w-8 h-8 rounded-full flex items-center justify-center mr-2">
                  3
                </div>
                Signing
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p>
                Our notary arrives at your location, verifies IDs, and guides you through the signing process for all
                documents.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="bg-[#91A3B0]/20">
              <CardTitle className="flex items-center">
                <div className="bg-[#002147] text-white w-8 h-8 rounded-full flex items-center justify-center mr-2">
                  4
                </div>
                Return
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p>
                We return the signed documents to your title company or lender, either electronically or via overnight
                shipping.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* FAQ */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-[#002147] mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-[#002147] mb-2">
              How long does a typical loan signing appointment take?
            </h3>
            <p>
              Most loan signings take 60-90 minutes, depending on the number of documents and signers. Reverse mortgages
              may take longer due to their complexity.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-[#002147] mb-2">
              Do all signers need to be present at the same time?
            </h3>
            <p>
              For most loan documents, all signers must be present at the same time. However, in some cases,
              arrangements can be made for separate signings. Please consult with your lender about their requirements.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-[#002147] mb-2">
              Can you explain the loan terms to me during the signing?
            </h3>
            <p>
              No. As notaries, we are prohibited by law from explaining loan terms or providing legal advice. We can
              identify where you need to sign and what type of document you're signing, but for questions about terms,
              please contact your lender or attorney.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-[#002147] mb-2">
              What do I need to have ready for my loan signing appointment?
            </h3>
            <p>
              All signers should have valid, government-issued photo identification. You may also want to have any
              relevant loan documents or correspondence from your lender available for reference.
            </p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-[#002147] text-white p-8 rounded-lg text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to Schedule Your Loan Signing?</h2>
        <p className="mb-6 max-w-2xl mx-auto">
          Our professional loan signing agents are ready to assist with your real estate transaction.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-[#A52A2A] hover:bg-[#8B0000] text-white">
            Book Loan Signing
          </Button>
          <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[#002147]">
            Contact for Title Companies
          </Button>
        </div>
      </div>
    </div>
  )
}
