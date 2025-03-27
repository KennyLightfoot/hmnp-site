import type { Metadata } from "next"
import { ContactForm } from "@/components/contact-form"
import { CTABanner } from "@/components/cta-banner"
import { CallScheduler } from "@/components/call-scheduler"
import ClientMap from "@/components/client-map"

export const metadata: Metadata = {
  title: "Contact Us | Houston Mobile Notary Pros",
  description:
    "Contact Houston Mobile Notary Pros for all your mobile notary needs. Schedule an appointment or ask us any questions.",
}

export default function ContactPage() {
  return (
    <main className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-oxford-blue text-center mb-8">Contact Us</h1>

      <div className="max-w-3xl mx-auto mb-16">
        <p className="text-lg text-center mb-8">
          Have questions or ready to schedule a notary service? Fill out the form below, schedule a call, or contact us
          directly.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <h3 className="text-xl font-semibold text-oxford-blue mb-4">Contact Information</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-auburn mr-3 mt-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <div>
                  <p className="font-medium">Phone</p>
                  <p>(281) 779-8847</p>
                </div>
              </div>

              <div className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-auburn mr-3 mt-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <div>
                  <p className="font-medium">Email</p>
                  <p>contact@houstonmobilenotarypros.com</p>
                </div>
              </div>

              <div className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-auburn mr-3 mt-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <p className="font-medium">Business Hours</p>
                  <p>Monday - Friday: 8am - 8pm</p>
                  <p>Saturday: 9am - 5pm</p>
                  <p>Sunday: By appointment only</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <h3 className="text-xl font-semibold text-oxford-blue mb-4">Schedule a Call</h3>
            <p className="mb-4">Prefer to speak with us directly? Schedule a call at a time that works for you.</p>
            <CallScheduler />
          </div>
        </div>

        <ContactForm />
      </div>

      <div className="max-w-4xl mx-auto mb-16">
        <h2 className="text-3xl font-bold text-oxford-blue text-center mb-8">Our Service Area</h2>
        <ClientMap />
      </div>

      <CTABanner
        title="Ready to Book a Notary Service?"
        description="Schedule an appointment now and we'll come to your location."
        primaryButtonText="Book Now"
        primaryButtonHref="/booking"
        secondaryButtonText="View Services"
        secondaryButtonHref="/services"
      />
    </main>
  )
}

