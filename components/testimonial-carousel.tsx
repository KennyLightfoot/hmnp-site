"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Quote } from "lucide-react"
import { cn } from "@/lib/utils"

interface Testimonial {
  name: string
  title?: string
  content: string
  rating?: number
}

interface TestimonialCarouselProps {
  testimonials: Testimonial[]
}

export function TestimonialCarousel({ testimonials }: TestimonialCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [direction, setDirection] = useState<"left" | "right" | null>(null)

  const goToPrevious = () => {
    if (isAnimating) return
    setDirection("left")
    setIsAnimating(true)
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1))
  }

  const goToNext = () => {
    if (isAnimating) return
    setDirection("right")
    setIsAnimating(true)
    setCurrentIndex((prevIndex) => (prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1))
  }

  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => {
        setIsAnimating(false)
        setDirection(null)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [isAnimating])

  // Auto-advance the carousel
  useEffect(() => {
    const interval = setInterval(goToNext, 8000)
    return () => clearInterval(interval)
  }, [currentIndex])

  return (
    <div className="relative">
      <div className="overflow-hidden">
        <div
          className={cn(
            "flex transition-transform duration-500 ease-in-out",
            isAnimating && direction === "right" && "-translate-x-full",
            isAnimating && direction === "left" && "translate-x-full",
          )}
        >
          <div className="w-full flex-shrink-0">
            <Card className="testimonial-card border-none shadow-none bg-transparent">
              <CardContent className="pt-6">
                <Quote className="h-10 w-10 text-accent-500/30 mb-4" />
                <p className="text-lg mb-6 italic text-balance">"{testimonials[currentIndex].content}"</p>
                <div className="flex items-center">
                  <div>
                    <p className="font-semibold">{testimonials[currentIndex].name}</p>
                    {testimonials[currentIndex].title && (
                      <p className="text-sm text-muted-foreground">{testimonials[currentIndex].title}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-6 gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={goToPrevious}
          className="rounded-full h-10 w-10 border-primary-200 text-primary-500 hover:bg-primary-50 hover:text-primary-600"
          aria-label="Previous testimonial"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={goToNext}
          className="rounded-full h-10 w-10 border-primary-200 text-primary-500 hover:bg-primary-50 hover:text-primary-600"
          aria-label="Next testimonial"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex justify-center mt-4 gap-1">
        {testimonials.map((_, index) => (
          <button
            key={index}
            className={cn(
              "w-2 h-2 rounded-full transition-all",
              index === currentIndex ? "bg-primary-500 w-6" : "bg-primary-200",
            )}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Go to testimonial ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

