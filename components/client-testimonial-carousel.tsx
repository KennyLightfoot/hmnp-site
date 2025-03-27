"use client"

import { TestimonialCarousel } from "@/components/testimonial-carousel"
import { testimonials } from "@/data/testimonials"

export default function ClientTestimonialCarousel() {
  return <TestimonialCarousel testimonials={testimonials} />
}

