"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { track } from "@/app/lib/analytics"
import TelLink from "@/components/TelLink"

export default function FinalCta() {
  return (
    <section className="bg-secondary text-white">
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-serif mb-3">Ready for a seamless notarization?</h2>
        <div className="flex gap-4 justify-center mt-4">
          <Link href="/booking" className="inline-flex" onClick={() => track('cta_clicked', { cta_name: 'Book Appointment', location: 'final_cta' })}>
            <Button className="bg-white text-secondary hover:bg-white/90 h-12 px-6">Book Appointment</Button>
          </Link>
          <TelLink className="inline-flex" location="final_cta">
            <Button className="bg-primary hover:bg-primary/90 h-12 px-6">Call (832) 617-4285</Button>
          </TelLink>
        </div>
        <p className="mt-6 text-sm text-white/80">
          Prefer to explore first? Browse our{" "}
          <Link href="/services" className="underline text-white hover:text-white/80">
            mobile notary services
          </Link>
          , compare{" "}
          <Link href="/pricing" className="underline text-white hover:text-white/80">
            transparent pricing
          </Link>
          , or find availability in{" "}
          <Link href="/service-areas/league-city" className="underline text-white hover:text-white/80">
            League City
          </Link>{" "}
          and{" "}
          <Link href="/service-areas/pearland" className="underline text-white hover:text-white/80">
            Pearland
          </Link>
          .
        </p>
      </div>
    </section>
  )
}


