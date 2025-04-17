import BookingPageClient from "./BookingPageClient"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Book a Mobile Notary | Houston Mobile Notary Pros",
  description:
    "Schedule a mobile notary appointment in Houston, Galveston, Pearland, and surrounding areas. Choose from essential, priority, or loan signing services.",
  keywords: "book notary, schedule notary, notary appointment, mobile notary booking, Houston notary scheduling",
  openGraph: {
    title: "Book a Mobile Notary | Houston Mobile Notary Pros",
    description:
      "Schedule a mobile notary appointment in the Houston area. Choose from essential, priority, or loan signing services.",
    url: "/booking",
    type: "website",
  },
}

export default function BookingPage() {
  return <BookingPageClient />
}
