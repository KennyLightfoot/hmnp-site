import Link from "next/link"
import { Button } from "@/components/ui/button"
import { track } from "@/app/lib/analytics"

export default function FinalCta() {
  return (
    <section className="bg-[#0F1419] text-white">
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-serif mb-3">Ready for a seamless notarization?</h2>
        <div className="flex gap-4 justify-center mt-4">
          <Link href="/booking" className="inline-flex" onClick={() => track('cta_clicked', { cta_name: 'Book Now', location: 'final_cta' })}>
            <Button className="bg-white text-[#0F1419] hover:bg-white/90 h-12 px-6">Book Now</Button>
          </Link>
          <a href="tel:18326174285" className="inline-flex" onClick={() => track('call_clicked', { location: 'final_cta' })}>
            <Button className="bg-[#A0522D] hover:bg-[#8d471f] h-12 px-6">Call (832) 617-4285</Button>
          </a>
        </div>
      </div>
    </section>
  )
}


