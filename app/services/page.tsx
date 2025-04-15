import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function ServicesPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-[#002147] mb-4">Our Notary Services</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Professional mobile notary services tailored to your needs. We come to you for all your notarization
          requirements.
        </p>
      </div>

      {/* Service Categories */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {/* Essential Package */}
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="bg-[#002147] text-white">
            <CardTitle>Essential Mobile Package</CardTitle>
            <CardDescription className="text-gray-200">
              Perfect for wills, POAs, affidavits, and general notarizations
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-3xl font-bold mb-4">Starting at $75</p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-start">
                <span className="text-[#A52A2A] mr-2">✓</span>
                <span>1-2 quick documents</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#A52A2A] mr-2">✓</span>
                <span>Notary travel within 15 miles</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#A52A2A] mr-2">✓</span>
                <span>Available Mon-Fri, 9am-5pm</span>
              </li>
            </ul>
            <Link
              href="/services/essential"
              className="text-[#002147] hover:text-[#A52A2A] font-medium flex items-center"
            >
              View detailed pricing <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-[#002147] hover:bg-[#001a38]">
              <Link href="/booking?service=essential">Book Essential Service</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Priority Service */}
        <Card className="shadow-md hover:shadow-lg transition-shadow border-[#A52A2A] border-2">
          <CardHeader className="bg-[#A52A2A] text-white">
            <CardTitle>Priority Service Package</CardTitle>
            <CardDescription className="text-gray-200">
              For time-sensitive documents and last-minute needs
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-3xl font-bold mb-4">$100 flat fee</p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-start">
                <span className="text-[#A52A2A] mr-2">✓</span>
                <span>2-hour response time</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#A52A2A] mr-2">✓</span>
                <span>Service from 7am-9pm daily</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#A52A2A] mr-2">✓</span>
                <span>Up to 5 documents, 2 signers</span>
              </li>
            </ul>
            <Link
              href="/services/priority"
              className="text-[#002147] hover:text-[#A52A2A] font-medium flex items-center"
            >
              View detailed pricing <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-[#A52A2A] hover:bg-[#8B0000]">
              <Link href="/booking?service=priority">Book Priority Service</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Loan Signing */}
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="bg-[#002147] text-white">
            <CardTitle>Loan Signing Services</CardTitle>
            <CardDescription className="text-gray-200">
              Specialized for real estate and mortgage transactions
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-3xl font-bold mb-4">$150 flat fee</p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-start">
                <span className="text-[#A52A2A] mr-2">✓</span>
                <span>Unlimited documents</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#A52A2A] mr-2">✓</span>
                <span>Up to 4 signers</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#A52A2A] mr-2">✓</span>
                <span>90-minute signing session</span>
              </li>
            </ul>
            <Link
              href="/services/loan-signing"
              className="text-[#002147] hover:text-[#A52A2A] font-medium flex items-center"
            >
              View detailed pricing <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-[#002147] hover:bg-[#001a38]">
              <Link href="/booking?service=loan-signing">Book Loan Signing</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Specialty Services */}
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="bg-[#002147] text-white">
            <CardTitle>Specialty Services</CardTitle>
            <CardDescription className="text-gray-200">Specialized notary services for unique needs</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-3xl font-bold mb-4">Starting at $55</p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-start">
                <span className="text-[#A52A2A] mr-2">✓</span>
                <span>Background Check Verification</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#A52A2A] mr-2">✓</span>
                <span>Wedding Certificate Expediting</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#A52A2A] mr-2">✓</span>
                <span>Apostille Services</span>
              </li>
            </ul>
            <Link
              href="/services/specialty"
              className="text-[#002147] hover:text-[#A52A2A] font-medium flex items-center"
            >
              View detailed pricing <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-[#002147] hover:bg-[#001a38]">
              <Link href="/booking?service=specialty">Book Specialty Service</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Business Packages */}
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="bg-[#002147] text-white">
            <CardTitle>Business Packages</CardTitle>
            <CardDescription className="text-gray-200">
              Tailored solutions for businesses and organizations
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-3xl font-bold mb-4">Starting at $150/month</p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-start">
                <span className="text-[#A52A2A] mr-2">✓</span>
                <span>Title Company Partnerships</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#A52A2A] mr-2">✓</span>
                <span>Business Concierge Package</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#A52A2A] mr-2">✓</span>
                <span>Healthcare Provider Package</span>
              </li>
            </ul>
            <Link
              href="/services/business"
              className="text-[#002147] hover:text-[#A52A2A] font-medium flex items-center"
            >
              View detailed pricing <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-[#002147] hover:bg-[#001a38]">
              <Link href="/booking?service=business">Contact for Business Rates</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Additional Services */}
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="bg-[#002147] text-white">
            <CardTitle>Additional Services</CardTitle>
            <CardDescription className="text-gray-200">
              Supplementary services to enhance your notary experience
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-3xl font-bold mb-4">Various Pricing</p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-start">
                <span className="text-[#A52A2A] mr-2">✓</span>
                <span>Document Printing Services</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#A52A2A] mr-2">✓</span>
                <span>Secure Cloud Storage</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#A52A2A] mr-2">✓</span>
                <span>USPS Certified Mail</span>
              </li>
            </ul>
            <Link
              href="/services/additional"
              className="text-[#002147] hover:text-[#A52A2A] font-medium flex items-center"
            >
              View detailed pricing <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-[#002147] hover:bg-[#001a38]">
              <Link href="/booking?service=additional">Learn More</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Fee Transparency Section */}
      <div className="bg-gray-50 rounded-lg p-8 mb-16">
        <h2 className="text-2xl font-bold text-[#002147] mb-4">Fee Transparency</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-3">Texas Notary Fee Compliance</h3>
            <p className="mb-4">
              In compliance with Texas Government Code §406.024, we clearly separate statutory notarial fees from our
              professional service fees.
            </p>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#91A3B0]/30">
                  <th className="border p-2 text-left">Notarial Act</th>
                  <th className="border p-2 text-left">TX Maximum</th>
                  <th className="border p-2 text-left">Our Fee</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-2">Acknowledgments</td>
                  <td className="border p-2">$10</td>
                  <td className="border p-2">$6</td>
                </tr>
                <tr>
                  <td className="border p-2">Jurats</td>
                  <td className="border p-2">$10</td>
                  <td className="border p-2">$8</td>
                </tr>
                <tr>
                  <td className="border p-2">Oaths</td>
                  <td className="border p-2">$10</td>
                  <td className="border p-2">$8</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-3">Service Fees (Non-Notarial)</h3>
            <p className="mb-4">Our service fees cover additional value we provide beyond basic notarization:</p>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="text-[#A52A2A] mr-2">•</span>
                <span>Travel time and expenses</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#A52A2A] mr-2">•</span>
                <span>Document preparation and review</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#A52A2A] mr-2">•</span>
                <span>Mobile service convenience</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#A52A2A] mr-2">•</span>
                <span>Administrative costs</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#A52A2A] mr-2">•</span>
                <span>Technology fees</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#A52A2A] mr-2">•</span>
                <span>Professional expertise</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Policies Section */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-[#002147] mb-6">Our Policies</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-[#002147] mb-3">Travel Policy</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="text-[#A52A2A] mr-2">•</span>
                <span>Free within 20-mile radius of ZIP 77591</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#A52A2A] mr-2">•</span>
                <span>Beyond 20 miles: $0.50/mile</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#A52A2A] mr-2">•</span>
                <span>Toll fees: Reimbursed at cost</span>
              </li>
            </ul>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-[#002147] mb-3">Cancellation Policy</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="text-[#A52A2A] mr-2">•</span>
                <span>Less than 2 hours notice: $35 fee</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#A52A2A] mr-2">•</span>
                <span>Weather emergencies: 15% reschedule discount</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#A52A2A] mr-2">•</span>
                <span>No-show fee: $50 + travel costs</span>
              </li>
            </ul>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-[#002147] mb-3">Payment Policy</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="text-[#A52A2A] mr-2">•</span>
                <span>Credit/Debit Card (preferred)</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#A52A2A] mr-2">•</span>
                <span>Cash (exact change required)</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#A52A2A] mr-2">•</span>
                <span>Corporate Billing (approved accounts)</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-[#91A3B0]/20 p-8 rounded-lg text-center">
        <h2 className="text-2xl font-bold text-[#002147] mb-4">Ready to Book Your Notary Service?</h2>
        <p className="mb-6 max-w-2xl mx-auto">
          Contact us today to schedule an appointment or learn more about our services. We're here to make the
          notarization process as convenient as possible for you.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-[#A52A2A] hover:bg-[#8B0000]">
            <Link href="/booking">Book Appointment</Link>
          </Button>
          <Button size="lg" variant="outline" className="border-[#002147] text-[#002147]">
            Contact Us
          </Button>
        </div>
      </div>
    </div>
  )
}
