import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type Offer = {
  name: string
  priceFrom: string
  points: string[]
  href: string
  highlight?: boolean
}

const OFFERS: Offer[] = [
  {
    name: "Remote Online Notarization (RON)",
    priceFrom: "$35",
    points: [
      "Texas-compliant: credential analysis, KBA, recording",
      "Up to 10 docs included",
      "24/7 statewide",
    ],
    href: "/ron/how-it-works",
  },
  {
    name: "Mobile Standard",
    priceFrom: "$75",
    points: [
      "≤4 docs, ≤2 signers",
      "20‑mile included",
      "60‑minute slot (business hours)",
    ],
    href: "/booking",
  },
  {
    name: "Extended Mobile (Urgent)",
    priceFrom: "$125",
    points: [
      "30‑mile included",
      "7–21 daily",
      "Priority same‑day windows",
    ],
    href: "/booking",
    highlight: true,
  },
  {
    name: "Loan Signing",
    priceFrom: "$175",
    points: [
      "Single package, ≤2 hours",
      "30‑mile included",
      "Scanbacks/courier add‑ons",
    ],
    href: "/booking",
  },
]

export default function OfferStack() {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {OFFERS.map((offer) => (
            <Card key={offer.name} className={offer.highlight ? "border-[#A52A2A]" : undefined}>
              <CardHeader>
                <CardTitle className="text-[#002147]">{offer.name}</CardTitle>
                <div className="text-2xl font-bold text-[#A52A2A]">from {offer.priceFrom}</div>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-700 space-y-2">
                  {offer.points.map((p) => (
                    <li key={p} className="flex items-start gap-2">
                      <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-[#A52A2A]"></span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button asChild className={offer.highlight ? "bg-[#A52A2A] hover:bg-[#8B0000]" : "bg-[#002147] hover:bg-[#001a38]"}>
                  <Link href={offer.href}>Book Now</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}



