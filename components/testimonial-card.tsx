import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, Quote, CheckCircle } from "lucide-react"
import type { Testimonial } from "@/data/testimonials"
import Image from "next/image"

interface TestimonialCardProps {
  testimonial: Testimonial
  showSource?: boolean
}

export function TestimonialCard({ testimonial, showSource = true }: TestimonialCardProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardContent className="pt-6 flex-grow">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-5 w-5 ${i < testimonial.rating ? "text-primary fill-primary" : "text-muted"}`}
                aria-hidden="true"
              />
            ))}
          </div>
          {showSource && (
            <div className="flex items-center">
              {testimonial.source === "Google" && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Image
                    src="/placeholder.svg?height=16&width=16"
                    alt="Google"
                    width={16}
                    height={16}
                    className="mr-1"
                  />
                  Google
                </div>
              )}
              {testimonial.source === "Facebook" && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Image
                    src="/placeholder.svg?height=16&width=16"
                    alt="Facebook"
                    width={16}
                    height={16}
                    className="mr-1"
                  />
                  Facebook
                </div>
              )}
            </div>
          )}
        </div>
        <div className="relative">
          <Quote className="absolute -top-2 -left-2 h-6 w-6 text-secondary opacity-20" aria-hidden="true" />
          <p className="text-muted-foreground relative z-10 italic">"{testimonial.text}"</p>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4 pb-6">
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
            <AvatarFallback>
              {testimonial.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-grow">
            <div className="flex items-center">
              <p className="text-sm font-medium">{testimonial.name}</p>
              {testimonial.verified && (
                <CheckCircle className="h-4 w-4 ml-1 text-green-500" aria-label="Verified customer" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">{testimonial.location}</p>
          </div>
          <div className="text-xs text-muted-foreground">
            {new Date(testimonial.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
            })}
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}

