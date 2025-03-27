import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

export const metadata: Metadata = {
  title: "Booking Confirmation",
  description: "Your mobile notary appointment has been requested. We'll contact you soon to confirm the details.",
}

export default function BookingConfirmationPage() {
  return (
    <main className="flex flex-col">
      <section className="py-12 bg-background">
        <div className="container-custom max-w-3xl text-center">
          <div className="bg-card rounded-xl shadow-sm p-6 md:p-8">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
            </div>

            <h1 className="text-3xl font-bold mb-4">Booking Request Received</h1>

            <p className="text-lg mb-6">
              Thank you for booking with Houston Mobile Notary Pros. We've received your request and will contact you
              shortly to confirm your appointment details.
            </p>

            <div className="bg-muted rounded-lg p-6 mb-6 text-left">
              <h2 className="text-xl font-semibold mb-4">What Happens Next?</h2>
              <ol className="space-y-2 list-decimal list-inside">
                <li>We'll review your booking request</li>
                <li>You'll receive a call or email within 2 hours to confirm details</li>
                <li>We'll send a confirmation with the final price and appointment time</li>
                <li>Our notary will arrive at your location at the scheduled time</li>
              </ol>
            </div>

            <div className="space-y-2 mb-6 text-left">
              <h2 className="text-xl font-semibold mb-2">Important Reminders</h2>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>All signers must present a valid government-issued photo ID</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Documents should be unsigned until the notary arrives</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Payment is due at the time of service</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline">
                <Link href="/" className="flex items-center">
                  Return to Home
                </Link>
              </Button>
              <Button className="bg-primary text-primary-foreground">
                <Link href="/contact" className="flex items-center">
                  Contact Us
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

