import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, Shield, MapPin, Phone, Star } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-background to-muted/20 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="text-sm font-medium">
                  Licensed & Insured in Texas
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold text-balance leading-tight">
                  Professional Mobile Notary Services in <span className="text-primary">Houston</span>
                </h1>
                <p className="text-xl text-muted-foreground text-pretty leading-relaxed">
                  We come to you! Fast, reliable notary services available 7 days a week. From quick documents to loan
                  signings, we make notarization convenient and secure.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="text-lg px-8 py-6" asChild>
                  <Link href="/booking">Book Appointment Now</Link>
                </Button>
                <Button variant="outline" size="lg" className="text-lg px-8 py-6 bg-transparent" asChild>
                  <Link href="/pricing">View Pricing</Link>
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Licensed & Bonded</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Same-Day Service</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">30-Mile Radius</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <img
                src="/professional-notary-with-documents-and-seal-in-mod.jpg"
                alt="Professional mobile notary service"
                className="rounded-lg shadow-2xl"
              />
              {/* Floating RON Badge */}
              <div className="absolute -top-4 -right-4 bg-secondary text-secondary-foreground px-4 py-2 rounded-lg shadow-lg">
                <div className="text-sm font-semibold">24/7 RON Available</div>
                <div className="text-xs opacity-90">Remote Online Notarization</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-balance">Choose Your Service Level</h2>
            <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
              Transparent pricing with no hidden fees. Select the service that fits your needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Quick-Stamp Local */}
            <Card className="relative hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Quick-Stamp Local</CardTitle>
                  <Badge variant="outline">Most Popular</Badge>
                </div>
                <div className="text-3xl font-bold text-primary">$50</div>
                <CardDescription>Perfect for simple documents</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Up to 1 document
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Up to 2 stamps
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    10-mile radius
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Same-day service
                  </li>
                </ul>
                <Button className="w-full" asChild>
                  <Link href="/booking?service=quick-stamp">Book Now</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Standard Mobile */}
            <Card className="relative hover:shadow-lg transition-shadow border-primary">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Standard Mobile</CardTitle>
                  <Badge className="bg-primary text-primary-foreground">Recommended</Badge>
                </div>
                <div className="text-3xl font-bold text-primary">$75</div>
                <CardDescription>Great for multiple documents</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Up to 4 documents
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Up to 2 signers
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    20-mile radius
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Priority scheduling
                  </li>
                </ul>
                <Button className="w-full" asChild>
                  <Link href="/booking?service=standard">Book Now</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Extended Hours */}
            <Card className="relative hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">Extended Hours</CardTitle>
                <div className="text-3xl font-bold text-primary">$100</div>
                <CardDescription>Evening & weekend service</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Up to 4 documents
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Up to 2 signers
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    30-mile radius
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    7am-9pm daily
                  </li>
                </ul>
                <Button className="w-full" asChild>
                  <Link href="/booking?service=extended">Book Now</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Loan Signing */}
            <Card className="relative hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">Loan Signing</CardTitle>
                <div className="text-3xl font-bold text-primary">$150</div>
                <CardDescription>Real estate professionals</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Unlimited documents
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Up to 4 signers
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    2-hour appointment
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Certified specialist
                  </li>
                </ul>
                <Button className="w-full" asChild>
                  <Link href="/booking?service=loan-signing">Book Now</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* RON Services */}
          <div className="mt-12">
            <Card className="bg-secondary text-secondary-foreground">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Remote Online Notarization (RON)</CardTitle>
                <CardDescription className="text-secondary-foreground/80">
                  Available 24/7 from anywhere in Texas
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <div className="flex items-center justify-center gap-8">
                  <div>
                    <div className="text-3xl font-bold">$25</div>
                    <div className="text-sm opacity-80">per session</div>
                  </div>
                  <div className="text-2xl font-light">+</div>
                  <div>
                    <div className="text-3xl font-bold">$5</div>
                    <div className="text-sm opacity-80">per seal</div>
                  </div>
                </div>
                <Button variant="outline" size="lg" className="bg-background text-foreground hover:bg-muted" asChild>
                  <Link href="/ron">Start RON Session</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 px-4 bg-muted/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-balance">Why Houston Trusts Us</h2>
            <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
              Over 5 years serving Houston with professional, reliable notary services.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Licensed & Insured</h3>
              <p className="text-muted-foreground">
                Fully licensed Texas notary with $100,000 E&O insurance for your protection.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Available 7 Days</h3>
              <p className="text-muted-foreground">
                Extended hours 7am-9pm daily, plus 24/7 RON services for your convenience.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Star className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">5-Star Service</h3>
              <p className="text-muted-foreground">
                Consistently rated 5 stars by clients for professionalism and reliability.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-balance">Ready to Get Your Documents Notarized?</h2>
          <p className="text-xl opacity-90 text-pretty">
            Book your appointment now and we'll come to you. Fast, professional, and convenient.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6" asChild>
              <Link href="/booking">Book Appointment</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary bg-transparent"
              asChild
            >
              <Link href="tel:+1234567890">
                <Phone className="h-5 w-5 mr-2" />
                Call Now
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
