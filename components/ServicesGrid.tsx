"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { track } from "@/app/lib/analytics"

export default function ServicesGrid() {
  return (
    <section className="bg-white">
      <div className="container mx-auto px-4 py-14">
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { title: "Mobile Notary", sub: "from $75", desc: "We travel to you, same-day available.", href: "/booking?mode=MOBILE" },
            { title: "After-Hours Mobile", sub: "from $125", desc: "Evenings, weekends, urgent.", href: "/booking?mode=MOBILE" },
            { title: "Loan Signing", sub: "from $175", desc: "Title-friendly, error-free packages.", href: "/booking?mode=MOBILE" },
            { title: "Online Notary", sub: "$25/act", desc: "Secure RON with ID check & recording.", href: "/booking?mode=RON" },
          ].map((s) => (
            <div key={s.title} className="rounded-2xl border border-black/5 p-6">
              <h3 className="text-lg font-semibold text-secondary">{s.title} <span className="text-primary">{s.sub}</span></h3>
              <p className="text-sm text-secondary/70 mt-1">{s.desc}</p>
              <Link href={s.href} className="inline-flex mt-4" onClick={() => track('cta_clicked', { cta_name: s.title, location: 'services_grid' })}>
                <Button className="bg-secondary text-white hover:bg-secondary/90">Book</Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}


