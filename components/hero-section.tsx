import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, MapPin, Clock, Shield } from "lucide-react"
import { OneTapCalling } from "@/components/mobile/one-tap-calling"

export function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-background via-muted/30 to-background py-20 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
                ⭐ #1 Rated Mobile Notary in Houston
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-bold text-balance leading-tight">
                Your Trusted <span className="text-primary">Mobile Notary</span> in Houston
              </h1>
              <p className="text-xl text-muted-foreground text-pretty max-w-2xl">
                Professional notary services that come to you. From real estate closings to business documents, we
                provide secure, convenient notarization anywhere in the Houston area.
              </p>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>Licensed & Bonded</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <span>60-Mile Service Area</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-accent" />
                <span>7AM-9PM Daily</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                <span>$1M E&O Insurance</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-lg px-8">
                <Link href="/booking">Book Mobile Notary</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 bg-transparent">
                <Link href="/ron">Try RON Services</Link>
              </Button>
            </div>

            <div className="md:hidden">
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-3">Need immediate assistance?</p>
                <OneTapCalling variant="primary" size="lg" />
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">5,000+</div>
                <div className="text-sm text-muted-foreground">Documents Notarized</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">24/7</div>
                <div className="text-sm text-muted-foreground">RON Available</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">99%</div>
                <div className="text-sm text-muted-foreground">Client Satisfaction</div>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 p-8 flex items-center justify-center">
              <img
                src="/professional-notary-with-documents-and-seal-in-mod.png"
                alt="Professional notary providing mobile services"
                className="rounded-lg shadow-2xl w-full h-full object-cover"
              />
            </div>
            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 bg-background border shadow-lg rounded-lg p-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Available Now</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
