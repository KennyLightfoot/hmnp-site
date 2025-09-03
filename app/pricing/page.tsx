import Link from "next/link"
import { Metadata } from "next"
import { Calculator, DollarSign, MapPin, Clock, Shield, Star, CheckCircle, Zap, Users, Award, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import SimplePricingCalculator from "@/components/pricing/SimplePricingCalculator"
import ServiceComparisonTable from "@/components/pricing/ServiceComparisonTable"
import PricingFAQ from "@/components/pricing/PricingFAQ"
import TrustBadges from "@/components/ui/TrustBadges"

export const metadata: Metadata = {
  title: "Transparent Mobile Notary Pricing | Houston Mobile Notary Pros",
  description:
    "Get instant pricing for mobile notary services. Transparent fees, no hidden costs. Standard service from $75, same-day available. Serving Houston metro area.",
  keywords: "mobile notary pricing, notary fees, Houston notary costs, transparent pricing, same-day notary",
}

export default function PricingPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#002147]/5 via-[#A52A2A]/5 to-[#002147]/5 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-serif text-[#002147] tracking-tight mb-6">
            Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Clear, upfront pricing with no hidden fees. Get instant quotes and see exactly what you'll pay for professional mobile notary services.
          </p>
          
          {/* Trust Badges */}
          <div className="flex items-center justify-center gap-6 text-sm text-gray-500 mb-8">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-500" />
              <span>Licensed & Insured</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span>4.9★ Rating</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-blue-500" />
              <span>No Hidden Fees</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-orange-500" />
              <span>Same-Day Available</span>
            </div>
          </div>

          {/* Quick Pricing Overview */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
            <Card className="border-2 border-[#002147]/20 hover:border-[#A52A2A]/30 transition-all duration-300">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-lg text-[#002147]">Quick-Stamp Local</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-3xl font-bold text-[#A52A2A] mb-2">$50</div>
                <p className="text-sm text-gray-600">Fast & simple local signings</p>
                <div className="text-xs text-gray-500 mt-2">≤10 miles • 1 document • 1 signer</div>
              </CardContent>
            </Card>

            <Card className="border-2 border-[#A52A2A] relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-[#A52A2A] text-white px-3 py-1">Most Popular</Badge>
              </div>
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-lg text-[#002147]">Standard Mobile Notary</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-3xl font-bold text-[#A52A2A] mb-2">$75</div>
                <p className="text-sm text-gray-600">Professional document notarization</p>
                <div className="text-xs text-gray-500 mt-2">≤20 miles • 4 documents • 2 signers</div>
              </CardContent>
            </Card>

            <Card className="border-2 border-[#002147]/20 hover:border-[#A52A2A]/30 transition-all duration-300">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-lg text-[#002147]">Extended Hours</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-3xl font-bold text-[#A52A2A] mb-2">$100</div>
                <p className="text-sm text-gray-600">Flexible scheduling & same-day</p>
                <div className="text-xs text-gray-500 mt-2">≤30 miles • 4 documents • 2 signers</div>
              </CardContent>
            </Card>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-[#A52A2A] hover:bg-[#8B0000] h-12 px-8" asChild>
              <Link href="/booking">
                <Calculator className="h-5 w-5 mr-2" />
                Get Instant Quote
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8" asChild>
              <Link href="#calculator">
                <DollarSign className="h-5 w-5 mr-2" />
                Try Pricing Calculator
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Interactive Pricing Calculator */}
      <section id="calculator" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <SimplePricingCalculator />
          </div>
        </div>
      </section>

      {/* Service Comparison Table */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <ServiceComparisonTable />
        </div>
      </section>

      {/* Additional Services */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#002147] mb-4">Additional Services & Fees</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Understand all potential costs with our transparent fee structure
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Travel Fees */}
            <Card className="border-2 border-[#002147]/20 hover:border-[#A52A2A]/30 transition-all duration-300">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-12 h-12 bg-[#002147]/10 rounded-lg flex items-center justify-center mb-3">
                  <MapPin className="h-6 w-6 text-[#002147]" />
                </div>
                <CardTitle className="text-lg text-[#002147]">Travel Fees</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-2xl font-bold text-[#A52A2A] mb-2">$0.50/mile</div>
                <p className="text-sm text-gray-600 mb-3">Beyond included radius</p>
                <div className="text-xs text-gray-500 space-y-1">
                  <div>Quick-Stamp: 10 miles included</div>
                  <div>Standard: 20 miles included</div>
                  <div>Extended: 30 miles included</div>
                </div>
              </CardContent>
            </Card>

            {/* Urgency Fees */}
            <Card className="border-2 border-[#002147]/20 hover:border-[#A52A2A]/30 transition-all duration-300">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-12 h-12 bg-[#002147]/10 rounded-lg flex items-center justify-center mb-3">
                  <Clock className="h-6 w-6 text-[#002147]" />
                </div>
                <CardTitle className="text-lg text-[#002147]">Urgency Fees</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Same-day (1-2 hours):</span>
                    <span className="font-semibold text-[#A52A2A]">+$25</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Urgent (30-60 min):</span>
                    <span className="font-semibold text-[#A52A2A]">+$50</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Weekend service:</span>
                    <span className="font-semibold text-[#A52A2A]">+$40</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Document & Signer Fees */}
            <Card className="border-2 border-[#002147]/20 hover:border-[#A52A2A]/30 transition-all duration-300">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-12 h-12 bg-[#002147]/10 rounded-lg flex items-center justify-center mb-3">
                  <FileText className="h-6 w-6 text-[#002147]" />
                </div>
                <CardTitle className="text-lg text-[#002147]">Additional Items</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Extra document:</span>
                    <span className="font-semibold text-[#A52A2A]">+$10</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Extra signer:</span>
                    <span className="font-semibold text-[#A52A2A]">+$5</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Extra stamp:</span>
                    <span className="font-semibold text-[#A52A2A]">+$5</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Trust Badges Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#002147] mb-4">Why Choose Houston Mobile Notary Pros?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Professional, reliable, and transparent - we're your trusted mobile notary partner
            </p>
          </div>
          <TrustBadges variant="carousel" />
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <PricingFAQ />
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#002147] to-[#001a38] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
            Get your documents notarized quickly and professionally. Same-day service available, no hidden fees.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-[#A52A2A] hover:bg-[#8B0000] h-12 px-8" asChild>
              <Link href="/booking">
                <Calculator className="h-5 w-5 mr-2" />
                Book Appointment Now
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 border-white text-white hover:bg-white hover:text-[#002147]" asChild>
              <Link href="/contact">
                <Users className="h-5 w-5 mr-2" />
                Contact Us
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}


