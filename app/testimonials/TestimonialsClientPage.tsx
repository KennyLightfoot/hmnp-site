"use client"

import { useState, useEffect } from "react"
import { TestimonialCard } from "@/components/testimonial-card"
import { TestimonialFilter } from "@/components/testimonial-filter"
import { TestimonialStats } from "@/components/testimonial-stats"
import { CTABanner } from "@/components/cta-banner"
import { testimonials } from "@/data/testimonials"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { MessageSquare } from "lucide-react"
import { TestimonialsStructuredData } from "@/components/testimonials-structured-data"

export default function TestimonialsClientPage() {
  const [filteredTestimonials, setFilteredTestimonials] = useState(testimonials)
  const [filter, setFilter] = useState("all")
  const [sort, setSort] = useState("newest")
  const [visibleCount, setVisibleCount] = useState(6)

  useEffect(() => {
    let result = [...testimonials]

    // Apply source filter
    if (filter !== "all") {
      result = result.filter((t) => t.source.toLowerCase() === filter)
    }

    // Apply sort
    if (sort === "newest") {
      result = result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    } else if (sort === "highest") {
      result = result.sort((a, b) => b.rating - a.rating)
    }

    setFilteredTestimonials(result)
  }, [filter, sort])

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter)
    setVisibleCount(6) // Reset visible count when filter changes
  }

  const handleSortChange = (newSort: string) => {
    setSort(newSort)
  }

  const loadMore = () => {
    setVisibleCount((prev) => prev + 6)
  }

  return (
    <main className="container py-12">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-oxfordBlue mb-4">What Our Clients Say About Us</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Don't just take our word for it. See what our clients have to say about our mobile notary services in
            Houston and surrounding areas.
          </p>
        </div>

        <TestimonialStats testimonials={testimonials} />

        <TestimonialFilter
          onFilterChange={handleFilterChange}
          onSortChange={handleSortChange}
          totalCount={testimonials.length}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredTestimonials.slice(0, visibleCount).map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>

        {visibleCount < filteredTestimonials.length && (
          <div className="flex justify-center mb-12">
            <Button onClick={loadMore} variant="outline" size="lg">
              Load More Testimonials
            </Button>
          </div>
        )}

        <Separator className="my-12" />

        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Have You Used Our Services?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            We'd love to hear about your experience with Houston Mobile Notary Pros. Your feedback helps us improve our
            services and helps others find reliable notary services.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Leave a Review on Google
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Leave a Review on Facebook
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-16">
        <CTABanner
          title="Ready to Experience Our Service?"
          description="Join our satisfied clients by booking our professional mobile notary services today."
        />
      </div>
      <TestimonialsStructuredData />
    </main>
  )
}

