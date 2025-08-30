"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, ExternalLink, Cookie as Google } from "lucide-react"

interface GoogleReview {
  id: string
  author: string
  rating: number
  text: string
  date: string
  verified: boolean
}

export function GoogleReviewsWidget() {
  const [reviews, setReviews] = useState<GoogleReview[]>([])
  const [averageRating, setAverageRating] = useState(4.9)
  const [totalReviews, setTotalReviews] = useState(247)

  // Mock Google Reviews data - in production, this would come from Google My Business API
  useEffect(() => {
    const mockReviews: GoogleReview[] = [
      {
        id: "1",
        author: "Sarah Johnson",
        rating: 5,
        text: "Exceptional service! They came to my office within 2 hours and handled everything professionally. Will definitely use again.",
        date: "2 days ago",
        verified: true,
      },
      {
        id: "2",
        author: "Michael Chen",
        rating: 5,
        text: "The RON service saved me so much time. Professional, secure, and available when I needed it most. Highly recommend!",
        date: "1 week ago",
        verified: true,
      },
      {
        id: "3",
        author: "Jennifer Martinez",
        rating: 5,
        text: "Outstanding mobile notary service. Punctual, professional, and very knowledgeable. Made the whole process seamless.",
        date: "2 weeks ago",
        verified: true,
      },
    ]
    setReviews(mockReviews)
  }, [])

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Google className="h-6 w-6 text-blue-600" />
            <Badge variant="outline" className="text-primary border-primary/20">
              Google Reviews
            </Badge>
          </div>
          <h2 className="text-2xl lg:text-3xl font-bold mb-4">Trusted by Houston Residents</h2>

          {/* Overall Rating */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-2xl font-bold">{averageRating}</span>
            </div>
            <div className="text-muted-foreground">Based on {totalReviews}+ Google Reviews</div>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {reviews.map((review) => (
            <Card key={review.id} className="bg-background border-primary/10">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-1">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    {review.verified && (
                      <Badge variant="secondary" className="text-xs">
                        Verified
                      </Badge>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed">"{review.text}"</p>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">{review.author}</div>
                      <div className="text-xs text-muted-foreground">{review.date}</div>
                    </div>
                    <Google className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA to Google Reviews */}
        <div className="text-center">
          <Button variant="outline" className="bg-transparent" asChild>
            <a
              href="https://g.page/r/YOUR_GOOGLE_BUSINESS_ID/review"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2"
            >
              <span>Read All Reviews on Google</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  )
}
