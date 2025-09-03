"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { safeFormSubmit } from "@/lib/utils"

interface ReviewFormProps {
  serviceName?: string
}

export function ReviewForm({ serviceName }: ReviewFormProps) {
  const privacyPolicyLink = "/privacy-policy"; // Define this or pass as prop if dynamic
  const router = useRouter()
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [reviewText, setReviewText] = useState("")
  const [service, setService] = useState(serviceName || "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (rating === 0) {
      setError("Please select a rating")
      setLoading(false)
      return
    }

    try {
      // Submit to new review API
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reviewerName: name,
          reviewerEmail: email,
          rating,
          reviewText,
          serviceType: service,
          platform: 'internal',
          isVerified: false, // Can be verified later if booking is linked
          metadata: {
            submittedVia: 'website-form',
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
          }
        })
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true)
        // Reset form
        setName("")
        setEmail("")
        setReviewText("")
        setService(serviceName || "")
        setRating(0)

        // Redirect after a delay
        setTimeout(() => {
          router.push("/reviews/thank-you")
        }, 2000)
      } else {
        setError(result.error || "Failed to submit review. Please try again.")
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again later.")
      console.error("Review submission error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleRatingClick = (selectedRating: number) => {
    setRating(selectedRating)
  }

  const handleRatingHover = (hoveredRating: number) => {
    setHoveredRating(hoveredRating)
  }

  const handleRatingLeave = () => {
    setHoveredRating(0)
  }

  if (success) {
    return (
      <div className="bg-green-50 p-6 rounded-lg text-center">
        <h3 className="text-xl font-semibold text-green-800 mb-2">Thank You for Your Review!</h3>
        <p className="text-green-700 mb-4">
          Your feedback has been submitted successfully and will be displayed after review.
        </p>
        <div className="flex justify-center space-x-4">
          <Button
            variant="outline"
            onClick={() => {
              setSuccess(false)
            }}
          >
            Submit Another Review
          </Button>
          <Button onClick={() => router.push("/testimonials")}>View Testimonials</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 border rounded-lg shadow-md">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-semibold text-[#002147]">Share Your Experience</h2>
        <p className="text-sm text-gray-700 mt-1 italic">Houston Mobile Notary Pros - Professional Notary Services Day & Evening</p>
        <p className="text-muted-foreground mt-2">
          We value your feedback! Please take a moment to tell us about your experience. Your review helps us improve and informs other clients.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="name" className="text-base">
          Your Name
        </Label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Jane D."
          required
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="email" className="text-base">
          Email Address
        </Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="e.g., jane.d@example.com"
          required
          className="mt-1"
        />
        <p className="text-sm text-gray-500 mt-1">Your email will not be published</p>
      </div>

      <div>
        <Label htmlFor="service" className="text-base">
          Service Used
        </Label>
        <select
          id="service"
          value={service}
          onChange={(e) => setService(e.target.value)}
          className="w-full rounded-md border border-gray-300 p-2 mt-1"
          required
        >
          <option value="">Select a service</option>
          <option value="Essential Notary">Essential Notary</option>
          <option value="Priority Notary">Priority Notary</option>
          <option value="Loan Signing">Loan Signing</option>
          <option value="Specialty Notary">Specialty Notary</option>
          <option value="Business Notary">Business Notary</option>
          <option value="Additional Services">Additional Services</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div>
        <Label className="text-base">Your Rating</Label>
        <div className="flex items-center mt-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={32}
              onClick={() => handleRatingClick(star)}
              onMouseEnter={() => handleRatingHover(star)}
              onMouseLeave={handleRatingLeave}
              className={`cursor-pointer ${
                star <= (hoveredRating || rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
              } transition-colors`}
            />
          ))}
          <span className="ml-2 text-sm text-gray-600">
            {rating > 0 ? `${rating} out of 5 stars` : "Click to rate"}
          </span>
        </div>
      </div>

      <div>
        <Label htmlFor="reviewText" className="text-base">
          Your Review
        </Label>
        <Textarea
          id="reviewText"
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="Please share details about your experience. What did we do well? How could we improve? Your feedback helps us and other customers."
          required
          className="mt-1 min-h-[150px]"
        />
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md">
          <p>{error}</p>
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-gray-200 text-center">
        <p className="text-sm font-semibold text-[#002147] mb-1">Houston Mobile Notary Pros</p>
        <p className="text-xs text-gray-600 mb-2 italic">Professional Notary Services Day & Evening.</p>
        <p className="text-xs text-gray-500">
          By submitting your review, you grant us permission to display it on our website and other marketing materials. Your email address will not be published.
          Please review our <a href={privacyPolicyLink} target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700">Privacy Policy</a> for more information on how we handle your data.
        </p>
        <p className="text-xs text-gray-500 mt-2">
          We appreciate your feedback and look forward to serving you again in the future.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
        <Button type="submit" disabled={loading} className="bg-secondary hover:bg-secondary-darker">
          {loading ? "Submitting Review..." : "Submit Review"}
        </Button>

        <div className="flex flex-col sm:items-end">
          <p className="text-sm text-gray-600 mb-1">Also leave a review on:</p>
          <div className="flex space-x-3">
            <a
              href="https://g.co/kgs/HqnKqcz"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Google
            </a>
            <a
              href="https://www.facebook.com/profile.php?viewas=100000686899395&id=61556113852881"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Facebook
            </a>
            <a
              href="https://www.yelp.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Yelp
            </a>
          </div>
        </div>
      </div>
    </form>
    </div>
  )
}
