import Link from "next/link"
import { ChevronLeft, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Define Base URL for metadata
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://houstonmobilenotarypros.com'; // Replace with your actual domain

export const metadata = {
  metadataBase: new URL(BASE_URL),
  title: "Essential Mobile Notary Houston | Stress-Free & Professional | Houston Mobile Notary Pros",
  description:
    "Experience stress-free essential mobile notary services in Houston. We bring calm, clarity, and precision to your wills, POAs, affidavits, and general notarizations. Mon-Fri, 9am-5pm.",
  keywords:
    "essential notary Houston, mobile notary, general notarization, power of attorney notary, will notary, affidavit notary, Houston notary service, stress-free notary, clear notary process, precise notarization, peace of mind notary",
  alternates: {
    canonical: '/services/essential',
  },
  openGraph: {
    title: "Essential Mobile Notary Package | Houston Mobile Notary Pros",
    description: "Get your essential documents (wills, POAs, etc.) notarized in Houston with calm and precision. Our mobile service ensures a stress-free experience.",
    url: `${BASE_URL}/services/essential`,
    siteName: 'Houston Mobile Notary Pros',
    images: [
      {
        url: '/og-image.jpg', // Ensure this image exists in /public
        width: 1200,
        height: 630,
        alt: 'Essential Mobile Notary Service by Houston Mobile Notary Pros',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Essential Mobile Notary Package - Houston Mobile Notary Pros",
    description: "Houston's choice for essential mobile notary services. We bring calm, clarity, and professional precision to your standard document needs (wills, POAs). Book your stress-free appointment!",
    // Add your Twitter handle here if you have one
    // siteId: 'YourTwitterID',
    // creator: '@YourTwitterHandle',
    // creatorId: 'YourTwitterCreatorID',
    images: [`${BASE_URL}/og-image.jpg`], // Must be an absolute URL
  },
}

export default function EssentialServicePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Link href="/services" className="flex items-center text-[#002147] hover:text-[#A52A2A] mb-8">
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back to All Services
      </Link>

      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-[#002147] mb-4">Essential Mobile Notary Package</h1>
        <p className="text-xl text-gray-700 max-w-3xl mx-auto">
          Ensuring your important documents like wills, POAs, and affidavits are handled with <span className="font-semibold text-[#002147]">precision and care</span>, right at your doorstep. Experience notarization that brings you <span className="font-semibold text-[#002147]">peace of mind</span>.
        </p>
      </div>

      {/* Service Description */}
      <div className="grid md:grid-cols-2 gap-12 mb-16">
        <div>
          <h2 className="text-2xl font-bold text-[#002147] mb-4">Service Overview</h2>
          <p className="mb-4">
            When you need important documents notarized without the stress, our Essential Mobile Package is designed for individuals and businesses who need standard notary services with the convenience of a mobile notary. We come to your location, making the notarization process straightforward and stress-free, allowing you to focus on what truly matters.
          </p>
          <p className="mb-4">
            This package is ideal for notarizing wills, powers of attorney, affidavits, and other general documents that
            require notarization. Our professional notaries are experienced in handling a wide variety of documents and
            will ensure that every document is meticulously and correctly executed, safeguarding its validity and contributing to your peace of mind.
          </p>
          <p>
            All of our notaries are commissioned by the state of Texas, carry E&O insurance, and follow strict protocols
            to ensure the validity of every notarization.
          </p>
        </div>
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-2xl font-bold text-[#002147] mb-4">Package Options</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Essential Service: $75</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                  <span>Ideal for your straightforward notarization needs: 1-2 documents handled efficiently and accurately.</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                  <span>Includes notary travel within 15 miles</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                  <span>Available Monday-Friday, 9am-5pm</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Two Signers: $85</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                  <span>Up to 3 documents per signer</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                  <span>Includes all benefits of Essential Service</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Three Signers: $95</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                  <span>Up to 3 documents per signer</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                  <span>Includes all benefits of Essential Service</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Four+ Signers: Custom Quote</h3>
              <p>Contact us for pricing for groups of four or more signers.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Options */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-[#002147] mb-6">Additional Options</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Extra Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold mb-2">$5 each</p>
              <p>Additional documents beyond the package limit</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Weekend Service</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold mb-2">+$50 flat fee</p>
              <p>Available Saturday and Sunday</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Extended Travel</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold mb-2">$0.50/mile</p>
              <p>For locations beyond 20-mile radius of ZIP 77591</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* What to Expect */}
      <div className="bg-gray-50 p-8 rounded-lg mb-16">
        <h2 className="text-2xl font-bold text-[#002147] mb-6">Our Clear & Professional Process</h2>
        <p className="text-gray-700 mb-6 text-center max-w-xl mx-auto">
          We believe in transparency and a calm experience. Here's a brief look at how we make your notarization process smooth and predictable.
        </p>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-3">Before Your Appointment</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="text-[#A52A2A] font-bold mr-2">1.</span>
                <span>Book your appointment online or by phone</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#A52A2A] font-bold mr-2">2.</span>
                <span>Prepare your documents (unsigned)</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#A52A2A] font-bold mr-2">3.</span>
                <span>Ensure all signers have valid government-issued photo ID</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#A52A2A] font-bold mr-2">4.</span>
                <span>Confirm your appointment location and time</span>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-3">During Your Appointment</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="text-[#A52A2A] font-bold mr-2">1.</span>
                <span>Our notary will arrive at your location</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#A52A2A] font-bold mr-2">2.</span>
                <span>ID verification for all signers</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#A52A2A] font-bold mr-2">3.</span>
                <span>Document signing and notarization</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#A52A2A] font-bold mr-2">4.</span>
                <span>Payment collection</span>
              </li>
            </ul>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-6 text-center">
          For a comprehensive overview of our entire client journey, please see our detailed{" "}
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
            <h3 className="text-xl font-semibold text-[#002147] mb-2">What forms of ID are acceptable?</h3>
            <p>
              We accept government-issued photo IDs such as driver's licenses, passports, military IDs, and state ID
              cards. The ID must be current (not expired) and contain a photograph, physical description, signature, and
              serial number.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-[#002147] mb-2">How long does a typical appointment take?</h3>
            <p>
              For the Essential Package, most appointments take 15-30 minutes depending on the number of documents and
              signers.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-[#002147] mb-2">
              Can you provide legal advice about my documents?
            </h3>
            <p>
              No. As notaries, we are prohibited by law from providing legal advice. Our role is strictly to verify
              identity and witness signatures. For legal advice, please consult with an attorney.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-[#002147] mb-2">What payment methods do you accept?</h3>
            <p>
              We accept credit/debit cards (preferred) and cash (exact change required). For corporate clients, we offer
              billing options for approved accounts.
            </p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-[#002147] text-white p-8 rounded-lg text-center">
        <h2 className="text-2xl font-bold mb-4">Secure Your Peace of Mind with Our Essential Notary Service</h2>
        <p className="mb-6 max-w-2xl mx-auto">
          Let us handle the details with the professionalism and care you deserve. Schedule your convenient mobile notary appointment today and sign with confidence.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/booking?service=essential">
            <Button size="lg" className="bg-[#A52A2A] hover:bg-[#8B0000] text-white w-full sm:w-auto">
              Book Essential Service
            </Button>
          </Link>
          <Link href="/contact">
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[#002147] w-full sm:w-auto">
              Contact Us
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
