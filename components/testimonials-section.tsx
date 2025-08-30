"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react"

export function TestimonialsSection() {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Real Estate Agent",
      company: "Keller Williams",
      content:
        "Houston Mobile Notary Pros saved my closing! They arrived within 2 hours and handled everything professionally. My clients were impressed with the service.",
      rating: 5,
      service: "Mobile Notary",
    },
    {
      name: "Michael Chen",
      role: "Business Owner",
      company: "Tech Startup",
      content:
        "The RON service is incredible. I was able to get important contracts notarized at 11 PM from my home office. Game changer for busy entrepreneurs.",
      rating: 5,
      service: "RON Services",
    },
    {
      name: "Jennifer Martinez",
      role: "Homeowner",
      company: "Houston Resident",
      content:
        "Needed a will notarized urgently. They came to my house the same day and explained everything clearly. Professional, friendly, and efficient.",
      rating: 5,
      service: "Mobile Notary",
    },
    {
      name: "David Thompson",
      role: "Loan Officer",
      company: "First National Bank",
      content:
        "We use them for all our loan signings. Always on time, documents are handled perfectly, and clients love the convenience. Highly recommended.",
      rating: 5,
      service: "Loan Signing",
    },
  ]

  const [currentIndex, setCurrentIndex] = useState(0)

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  useEffect(() => {
    const timer = setInterval(nextTestimonial, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <Badge variant="outline" className="text-primary border-primary/20">
            Client Reviews
          </Badge>
          <h2 className="text-3xl lg:text-5xl font-bold text-balance">What Our Clients Say</h2>
          <p className="text-xl text-muted-foreground text-pretty max-w-3xl mx-auto">
            Don't just take our word for it. Here's what real clients say about their experience with Houston Mobile
            Notary Pros.
          </p>
        </div>

        {/* Testimonial Slider */}
        <div className="relative max-w-4xl mx-auto">
          <Card className="bg-muted/30 border-primary/20">
            <CardContent className="p-8 md:p-12">
              <div className="text-center space-y-6">
                <Quote className="h-12 w-12 text-primary/30 mx-auto" />

                <div className="space-y-4">
                  <p className="text-lg md:text-xl text-foreground leading-relaxed">
                    "{testimonials[currentIndex].content}"
                  </p>

                  <div className="flex justify-center space-x-1">
                    {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="font-semibold text-lg">{testimonials[currentIndex].name}</div>
                  <div className="text-muted-foreground">
                    {testimonials[currentIndex].role} • {testimonials[currentIndex].company}
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {testimonials[currentIndex].service}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-center items-center space-x-4 mt-8">
            <Button variant="outline" size="icon" onClick={prevTestimonial} className="rounded-full bg-transparent">
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex ? "bg-primary" : "bg-primary/30"
                  }`}
                />
              ))}
            </div>

            <Button variant="outline" size="icon" onClick={nextTestimonial} className="rounded-full bg-transparent">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Overall Rating */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center space-x-2 bg-muted/50 rounded-full px-6 py-3">
            <div className="flex space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="font-semibold">4.9/5</span>
            <span className="text-muted-foreground">• 200+ Reviews</span>
          </div>
        </div>
      </div>
    </section>
  )
}
