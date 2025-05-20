import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Book a Notary | Houston Mobile Notary Pros",
  description:
    "Schedule your mobile notary service with Houston Mobile Notary Pros. We offer flexible scheduling and come to your location.",
  keywords: "book mobile notary Houston, schedule notary, online notary booking, Houston notary appointment, HMNP booking",
}

export default function BookingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
