import type { Metadata } from "next"
import TestimonialsClientPage from "./TestimonialsClientPage"

export const metadata: Metadata = {
  title: "Client Testimonials | Houston Mobile Notary Pros",
  description:
    "Read what our clients have to say about our mobile notary services in Houston. Real reviews from satisfied customers on Google, Facebook, and more.",
}

export default function TestimonialsPage() {
  return <TestimonialsClientPage />
}

