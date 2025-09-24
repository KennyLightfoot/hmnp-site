import Link from "next/link"
import {
  Clock,
  CheckCircle,
  ArrowRight,
  FileText,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function ServicesOverview() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-block bg-[#002147]/10 px-4 py-2 rounded-full mb-4">
            <span className="text-[#002147] font-medium">Our Services</span>
          </div>
          <h2 className="text-3xl font-bold text-[#002147] mb-4">Professional Notary Solutions</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We offer a range of mobile notary services to meet your needs, from basic notarizations to complex loan
            signings.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Essential Service */}
          <article>
            <Card className="shadow-md hover:shadow-lg transition-all duration-300 border-t-4 border-t-[#002147]">
              <CardHeader className="bg-[#002147]/5 pb-2">
                <div className="flex items-center mb-2">
                  <div className="bg-[#002147] p-2 rounded-full mr-3">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-[#002147]">Essential Mobile Package</CardTitle>
                </div>
                <CardDescription>Perfect for wills, POAs, and general notarizations</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex items-baseline mb-6">
                  <p className="text-3xl font-bold text-[#002147]">$75</p>
                  <span className="ml-2 text-gray-500">starting at</span>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                    <span>1-2 documents notarized</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                    <span>Travel within 20 miles included</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                    <span>Available Monday-Friday, 9am-5pm</span>
                  </li>
                  <li className="flex items-start text-sm text-gray-600">
                    <CheckCircle className="text-[#A52A2A] mr-2 h-4 w-4 mt-0.5 shrink-0" />
                    <span>Travel tiers beyond 20 miles: 21–30 +$25; 31–40 +$45; 41–50 +$65</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="pt-4 pb-6">
                <Link href="/services/standard-notary" className="w-full">
                  <Button
                    variant="outline"
                    className="w-full border-[#002147] text-[#002147] hover:bg-[#002147] hover:text-white"
                  >
                    Learn More
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </article>

          {/* Priority Service */}
          <article>
            <Card className="shadow-xl hover:shadow-2xl transition-all duration-300 border-t-4 border-t-[#A52A2A] relative">
              <div className="absolute top-0 right-0 bg-[#A52A2A] text-white px-3 py-1 text-xs font-medium rounded-bl-lg -mt-1">
                MOST POPULAR
              </div>
              <CardHeader className="bg-[#A52A2A] text-white pb-2">
                <div className="flex items-center mb-2">
                  <div className="bg-white p-2 rounded-full mr-3">
                    <Clock className="h-5 w-5 text-[#A52A2A]" />
                  </div>
                  <CardTitle>Priority Service Package</CardTitle>
                </div>
                <CardDescription className="text-gray-100">For time-sensitive documents</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex items-baseline mb-6">
                  <p className="text-3xl font-bold text-[#002147]">$125</p>
                  <span className="ml-2 text-gray-500">flat fee</span>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                    <span>2-hour response time</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                    <span>Service from 7am-9pm daily (evening/weekend included)</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                    <span>Up to 5 documents and 2 signers • 30-mile travel included</span>
                  </li>
                  <li className="flex items-start text-sm text-gray-600">
                    <CheckCircle className="text-[#A52A2A] mr-2 h-4 w-4 mt-0.5 shrink-0" />
                    <span>Travel tiers 31–40 +$45; 41–50 +$65</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="pt-4 pb-6">
                <Link href="/services/extended-hours-notary" className="w-full">
                  <Button className="w-full bg-[#A52A2A] hover:bg-[#8B0000]">Learn More</Button>
                </Link>
              </CardFooter>
            </Card>
          </article>

          {/* Loan Signing */}
          <article>
            <Card className="shadow-md hover:shadow-lg transition-all duration-300 border-t-4 border-t-[#002147]">
              <CardHeader className="bg-[#002147]/5 pb-2">
                <div className="flex items-center mb-2">
                  <div className="bg-[#002147] p-2 rounded-full mr-3">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-[#002147]">Loan Signing Services</CardTitle>
                </div>
                <CardDescription>For real estate and mortgage transactions</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex items-baseline mb-6">
                  <p className="text-3xl font-bold text-[#002147]">$175</p>
                  <span className="ml-2 text-gray-500">flat fee</span>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                    <span>Unlimited documents • 30-mile travel included</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                    <span>Up to 4 signers</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                    <span>90-minute signing session</span>
                  </li>
                  <li className="flex items-start text-sm text-gray-600">
                    <CheckCircle className="text-[#A52A2A] mr-2 h-4 w-4 mt-0.5 shrink-0" />
                    <span>Evenings/weekends +$25 • Travel tiers 31–40 +$45; 41–50 +$65</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="pt-4 pb-6">
                <Link href="/services/loan-signing-specialist" className="w-full">
                  <Button
                    variant="outline"
                    className="w-full border-[#002147] text-[#002147] hover:bg-[#002147] hover:text-white"
                  >
                    Learn More
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </article>
        </div>

        <div className="text-center mt-12">
          <Link href="/services">
            <Button className="bg-[#002147] hover:bg-[#001a38]">
              View All Services
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
} 