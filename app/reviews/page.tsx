import type { Metadata } from "next"
import { ReviewForm } from "@/components/review-form"

export const metadata: Metadata = {
  title: "Submit a Review | Houston Mobile Notary Pros",
  description:
    "Share your experience with Houston Mobile Notary Pros. Your feedback helps us improve our services and helps others find reliable notary services in Houston.",
  keywords: "notary review, Houston notary feedback, mobile notary testimonial, review submission",
}

export default function ReviewsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-[#002147] mb-2">Share Your Experience</h1>
        <p className="text-gray-600 mb-8">
          We value your feedback! Please take a moment to share your experience with our notary services. Your review
          helps us improve and helps others find reliable notary services in Houston.
        </p>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <ReviewForm />
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-[#002147] mb-4">Why Your Review Matters</h2>
          <p className="mb-4">
            At Houston Mobile Notary Pros, we strive to provide exceptional service to every client. Your honest
            feedback helps us:
          </p>
          <ul className="list-disc pl-5 mb-4 space-y-2">
            <li>Improve our services to better meet your needs</li>
            <li>Recognize our team members for excellent service</li>
            <li>Help other clients make informed decisions</li>
            <li>Identify areas where we can grow and enhance our offerings</li>
          </ul>
          <p>Thank you for taking the time to share your experience with us and the Houston community!</p>
        </div>
      </div>
    </div>
  )
}
