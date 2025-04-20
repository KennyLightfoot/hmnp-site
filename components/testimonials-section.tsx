import Link from "next/link"
import { Star, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import TestimonialCarousel from "@/components/testimonial-carousel"

export default function TestimonialsSection() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-block bg-[#91A3B0]/20 px-4 py-2 rounded-full mb-4">
            <span className="text-[#002147] font-medium">Client Testimonials</span>
          </div>
          <h2 className="text-3xl font-bold text-[#002147] mb-4">What Our Clients Say</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Read testimonials from satisfied clients who have used our mobile notary services
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-12">
          <div className="flex justify-center mb-6">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="h-6 w-6 text-yellow-400 fill-yellow-400" />
              ))}
            </div>
          </div>
          <TestimonialCarousel itemsToShow={3} />
        </div>

        <div className="text-center">
          <Link href="/testimonials">
            <Button variant="outline" className="border-[#002147] text-[#002147] hover:bg-[#002147] hover:text-white">
              View All Testimonials
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
