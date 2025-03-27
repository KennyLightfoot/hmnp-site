import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CalendarClock, Phone } from "lucide-react"

export function CTABanner() {
  return (
    <div className="rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white p-8 md:p-12 shadow-lg relative overflow-hidden">
      <div className="absolute inset-0 bg-dots opacity-10"></div>
      <div className="relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Ready to Get Started?</h2>
          <p className="text-lg md:text-xl mb-8 text-white/90">
            Book your mobile notary service today and experience the convenience of professional notarization at your
            location.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild size="lg" className="bg-white text-primary-500 hover:bg-white/90 gap-2">
              <Link href="/booking">
                <CalendarClock className="h-5 w-5" />
                Book an Appointment
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10 gap-2">
              <Link href="tel:+1234567890">
                <Phone className="h-5 w-5" />
                Call Us
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

