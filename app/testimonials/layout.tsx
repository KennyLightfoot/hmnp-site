import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Client Testimonials | Houston Mobile Notary Pros",
  description:
    "Read reviews and testimonials from satisfied clients who have used our mobile notary services in Houston and surrounding areas.",
  keywords:
    "notary testimonials, mobile notary reviews, Houston notary service reviews, client feedback, notary recommendations",
}

export default function TestimonialsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
