import { Star } from "lucide-react"
import type { Testimonial } from "@/data/testimonials"

interface TestimonialStatsProps {
  testimonials: Testimonial[]
}

export function TestimonialStats({ testimonials }: TestimonialStatsProps) {
  // Calculate average rating
  const totalRating = testimonials.reduce((acc, testimonial) => acc + testimonial.rating, 0)
  const averageRating = totalRating / testimonials.length

  // Calculate rating distribution
  const ratingCounts = [0, 0, 0, 0, 0]
  testimonials.forEach((testimonial) => {
    ratingCounts[testimonial.rating - 1]++
  })

  // Calculate percentages
  const ratingPercentages = ratingCounts.map((count) => (count / testimonials.length) * 100)

  return (
    <div className="bg-gray-50 rounded-lg p-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex flex-col items-center justify-center">
          <div className="text-5xl font-bold text-oxfordBlue mb-2">{averageRating.toFixed(1)}</div>
          <div className="flex mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-6 w-6 ${star <= Math.round(averageRating) ? "text-auburn fill-auburn" : "text-gray-300"}`}
              />
            ))}
          </div>
          <p className="text-muted-foreground">Based on {testimonials.length} reviews</p>
        </div>

        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating, index) => (
            <div key={rating} className="flex items-center">
              <div className="w-12 text-sm text-muted-foreground flex items-center">
                {rating} <Star className="h-3 w-3 ml-1 inline" />
              </div>
              <div className="flex-grow mx-2 bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-auburn h-2.5 rounded-full"
                  style={{ width: `${ratingPercentages[5 - rating]}%` }}
                  aria-label={`${ratingPercentages[5 - rating].toFixed(0)}% rated ${rating} stars`}
                ></div>
              </div>
              <div className="w-12 text-right text-sm text-muted-foreground">{ratingCounts[rating - 1]}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

