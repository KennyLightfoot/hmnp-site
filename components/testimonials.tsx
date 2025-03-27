import { TestimonialCard } from "@/components/testimonial-card"
import type { Testimonial } from "@/data/testimonials"

interface TestimonialsProps {
  testimonials: Testimonial[]
}

export function Testimonials({ testimonials }: TestimonialsProps) {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-oxfordBlue">What Our Clients Say</h2>
        <p className="mt-4 text-muted-foreground">
          Don't just take our word for it — hear from some of our satisfied clients.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((testimonial) => (
          <TestimonialCard key={testimonial.id} testimonial={testimonial} showSource={false} />
        ))}
      </div>
    </div>
  )
}

