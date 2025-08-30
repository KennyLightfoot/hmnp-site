import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Star } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative bg-[#002147] text-white py-20 lg:py-32 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-y-12"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Content */}
          <div className="space-y-8">
            <Badge className="bg-[#A52A2A] hover:bg-[#A52A2A]/90 text-white border-none">
              Professional Mobile Notary Services
            </Badge>

            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl font-bold text-balance leading-tight">
                Same-Day Mobile Notary. No Surprises.
              </h1>
              <p className="text-lg text-blue-100 text-pretty max-w-2xl">
                Transparent $75 flat rate (4 docs, 2 signers, 20 miles). If we're late to your workday, you get $25 off.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-blue-200">Covered anywhere</div>
              </div>
              <div className="text-center">
                <div className="text-blue-200">24/7 on-demand</div>
              </div>
              <div className="text-center">
                <div className="text-blue-200">Transparent pricing</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-[#A52A2A] hover:bg-[#A52A2A]/90 text-white text-lg px-8">
                Book Mobile Notary
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-white border-white hover:bg-white hover:text-[#002147] text-lg px-8 bg-transparent"
              >
                Get Free e-Notary Now
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-white border-white hover:bg-white hover:text-[#002147] text-lg px-8 bg-transparent"
              >
                Travel Zones
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-8 pt-8">
              <div className="text-center">
                <div className="text-blue-200 text-sm">Priority arrival windows at any</div>
                <div className="text-white font-medium">location</div>
              </div>
              <div className="text-center">
                <div className="text-blue-200 text-sm">Live text updates + on-time tracking</div>
              </div>
              <div className="text-center">
                <div className="text-blue-200 text-sm">Pay on site — card or cash accepted</div>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <div className="text-sm text-blue-200">Trusted by 500+ clients in the Houston area</div>
            </div>
          </div>

          <div className="relative">
            <Card className="bg-white text-gray-900 shadow-2xl">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#002147] rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">H</span>
                  </div>
                  <div>
                    <CardTitle className="text-lg">Mobile Notary</CardTitle>
                    <p className="text-sm text-gray-600">We come to you</p>
                  </div>
                </div>
                <Badge className="bg-[#A52A2A] text-white w-fit">Professional Service</Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Available 7 days a week</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Fast response times</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Licensed professionals</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Serving all of Houston</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="text-2xl font-bold text-[#002147]">$75</div>
                  <div className="text-sm text-gray-600">Standard rate</div>
                </div>

                <Button asChild className="w-full bg-[#002147] hover:bg-[#002147]/90 text-white">
                  <Link href="/booking">Book now available</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
