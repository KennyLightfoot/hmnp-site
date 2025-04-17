"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import TestimonialCard from "./testimonial-card"

// Sample testimonial data
const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    location: "Houston, TX",
    service: "Essential Mobile Package",
    rating: 5,
    date: "June 15, 2023",
    content:
      "I needed a notary for my power of attorney documents and Houston Mobile Notary Pros made it so easy. The notary arrived on time, was professional, and efficiently handled all my documents. I highly recommend their services!",
    featured: true,
  },
  {
    id: 2,
    name: "Michael Rodriguez",
    location: "Pearland, TX",
    service: "Loan Signing Service",
    rating: 5,
    date: "July 3, 2023",
    content:
      "Our loan signing went smoothly thanks to the professional service provided. The notary explained everything clearly and made sure all documents were properly executed. The process was much less stressful than I anticipated!",
  },
  {
    id: 3,
    name: "Jennifer Williams",
    location: "Sugar Land, TX",
    service: "Priority Service Package",
    rating: 4.5,
    date: "May 22, 2023",
    content:
      "I needed a notary urgently for some time-sensitive documents. I called in the morning and they had someone at my office by lunchtime. The service was prompt and professional. Would definitely use again!",
  },
  {
    id: 4,
    name: "David Thompson",
    location: "Katy, TX",
    service: "Reverse Mortgage Signing",
    rating: 5,
    date: "August 10, 2023",
    content:
      "The notary who handled our reverse mortgage signing was knowledgeable and patient. They took the time to ensure we understood each document before signing. Their expertise made a complex process much easier.",
  },
  {
    id: 5,
    name: "Lisa Chen",
    location: "The Woodlands, TX",
    service: "Weekend Service",
    rating: 5,
    date: "September 5, 2023",
    content:
      "I was impressed that they could accommodate my request for a Sunday appointment. The notary was professional and efficient, and the additional weekend fee was well worth the convenience. Great service!",
  },
  {
    id: 6,
    name: "Robert Garcia",
    location: "Galveston, TX",
    service: "Essential Mobile Package",
    rating: 4.5,
    date: "July 28, 2023",
    content:
      "Despite being at the edge of their service area, they arrived on time and provided excellent service. The notary was friendly and professional. I appreciated their willingness to travel to my location.",
  },
]

interface TestimonialCarouselProps {
  title?: string
  description?: string
  itemsToShow?: number
}

export default function TestimonialCarousel({
  title = "What Our Clients Say",
  description = "Read testimonials from satisfied clients who have used our mobile notary services",
  itemsToShow = 3,
}: TestimonialCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [visibleTestimonials, setVisibleTestimonials] = useState<typeof testimonials>([])
  const [isMobile, setIsMobile] = useState(false)

  // Check if mobile on mount and window resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Update visible testimonials when currentIndex changes or screen size changes
  useEffect(() => {
    const itemsToDisplay = isMobile ? 1 : itemsToShow
    setVisibleTestimonials(testimonials.slice(currentIndex, currentIndex + itemsToDisplay))
  }, [currentIndex, isMobile, itemsToShow])

  const nextSlide = () => {
    const itemsToDisplay = isMobile ? 1 : itemsToShow
    const newIndex = currentIndex + itemsToDisplay
    if (newIndex < testimonials.length) {
      setCurrentIndex(newIndex)
    } else {
      setCurrentIndex(0) // Loop back to the beginning
    }
  }

  const prevSlide = () => {
    const itemsToDisplay = isMobile ? 1 : itemsToShow
    const newIndex = currentIndex - itemsToDisplay
    if (newIndex >= 0) {
      setCurrentIndex(newIndex)
    } else {
      setCurrentIndex(Math.max(0, testimonials.length - itemsToDisplay)) // Go to the end
    }
  }

  return (
    <div className="w-full py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-[#002147] mb-4">{title}</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">{description}</p>
      </div>

      <div className="relative">
        {/* Navigation Buttons */}
        <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-4 z-10">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full bg-white shadow-md hover:bg-gray-100"
            onClick={prevSlide}
            aria-label="Previous testimonials"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </div>

        <div className="absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-4 z-10">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full bg-white shadow-md hover:bg-gray-100"
            onClick={nextSlide}
            aria-label="Next testimonials"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Testimonial Cards */}
        <div className="px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {visibleTestimonials.map((testimonial) => (
              <TestimonialCard
                key={testimonial.id}
                name={testimonial.name}
                location={testimonial.location}
                service={testimonial.service}
                rating={testimonial.rating}
                date={testimonial.date}
                content={testimonial.content}
                featured={testimonial.featured}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Pagination Dots */}
      <div className="flex justify-center mt-8">
        {Array.from({ length: Math.ceil(testimonials.length / (isMobile ? 1 : itemsToShow)) }).map((_, index) => (
          <button
            key={index}
            className={`h-2 w-2 rounded-full mx-1 ${
              index === Math.floor(currentIndex / (isMobile ? 1 : itemsToShow))
                ? "bg-[#A52A2A]"
                : "bg-gray-300 hover:bg-gray-400"
            }`}
            onClick={() => setCurrentIndex(index * (isMobile ? 1 : itemsToShow))}
            aria-label={`Go to testimonial group ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
