"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Phone, Mail } from "lucide-react"
import { getBusinessPhoneFormatted, getBusinessTel, getSmsHref, getSmsNumberFormatted } from "@/lib/phone"
import { track } from "@/app/lib/analytics"

export default function CtaSection() {
  return (
    <section className="py-16 bg-[#002147]">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Book Your Notary Service?</h2>
            <p className="text-xl text-gray-200 max-w-2xl mx-auto">
              Schedule your appointment today and experience the convenience of our mobile notary services.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
            <Link href="/booking">
              <Button size="lg" className="bg-[#A52A2A] hover:bg-[#8B0000] text-white w-full sm:w-auto">
                Book Now
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white bg-transparent hover:bg-white hover:text-[#002147] w-full sm:w-auto"
              >
                Contact Us
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-6 text-white">
            <div className="bg-white/10 p-4 rounded-lg">
              <div className="flex items-center mb-3">
                <Phone className="mr-3 h-5 w-5 text-[#91A3B0]" />
                <h3 className="font-semibold">Call Us</h3>
              </div>
              <p className="text-lg">
                <a href={`tel:${getBusinessTel()}`} className="underline">
                  {getBusinessPhoneFormatted()}
                </a>
              </p>
              <p className="text-sm text-gray-300">Available 7am-9pm daily</p>
              <p className="text-xs text-gray-300 mt-2">
                Prefer texting?{" "}
                <a
                  href={getSmsHref()}
                  className="underline"
                  onClick={() => {
                    try { track('sms_click', { location: 'cta_section', sms: getSmsNumberFormatted() }) } catch {}
                  }}
                >
                  Text {getSmsNumberFormatted()}
                </a>
              </p>
            </div>

            <div className="bg-white/10 p-4 rounded-lg">
              <div className="flex items-center mb-3">
                <Mail className="mr-3 h-5 w-5 text-[#91A3B0]" />
                <h3 className="font-semibold">Email Us</h3>
              </div>
              <p className="text-lg">contact@houstonmobilenotarypros.com</p>
              <p className="text-sm text-gray-300">We respond within 2 hours</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 