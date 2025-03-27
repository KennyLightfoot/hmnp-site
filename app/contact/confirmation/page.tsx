import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

export const metadata: Metadata = {
  title: "Message Sent",
  description: "Thank you for contacting Houston Mobile Notary Pros. We'll get back to you soon.",
}

export default function ContactConfirmationPage() {
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

            <h1 className="text-3xl font-bold mb-4">Message Received</h1>

            <p className="text-lg mb-6">
              Thank you for contacting Houston Mobile Notary Pros. We've received your message and will get back to you
              shortly.
            </p>

            <div className="bg-muted rounded-lg p-6 mb-6 text-left">
              <h2 className="text-xl font-semibold mb-4">What Happens Next?</h2>
              <ul className="space-y-2 list-disc list-inside">
                <li>Our team will review your message</li>
                <li>We'll respond to your inquiry within 2 business hours</li>
                <li>If you requested a quote or service information, we'll include that in our response</li>
                <li>We may call you to discuss your specific needs in more detail</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline">
                <Link href="/" className="flex items-center">
                  Return to Home
                </Link>
              </Button>
              <Button className="bg-primary text-primary-foreground">
                <Link href="/booking" className="flex items-center">
                  Book an Appointment
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

