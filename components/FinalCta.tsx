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
          <Link href="/booking" className="inline-flex" onClick={() => track('cta_clicked', { cta_name: 'Book Now', location: 'final_cta' })}>
            <Button className="bg-white text-secondary hover:bg-white/90 h-12 px-6">Book Now</Button>
          </Link>
          <TelLink className="inline-flex" location="final_cta">
            <Button className="bg-primary hover:bg-primary/90 h-12 px-6">Call {"(dynamic)"}</Button>
          </TelLink>
        </div>
      </div>
    </section>
  )
}


