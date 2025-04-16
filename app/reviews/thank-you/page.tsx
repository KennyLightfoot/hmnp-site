import type { Metadata } from "next"
import Link from "next/link"
import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Thank You for Your Review | Houston Mobile Notary Pros",
  description:
    "Thank you for sharing your experience with Houston Mobile Notary Pros. Your feedback is valuable to us and helps us improve our services.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function ThankYouPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle className="h-16 w-16 text-green-600" />
        </div>

        <h1 className="text-3xl font-bold text-[#002147] mb-4">Thank You for Your Review!</h1>

        <p className="text-lg text-gray-700 mb-8">
          We appreciate you taking the time to share your experience with us. Your feedback helps us improve our
          services and helps others find reliable notary services in Houston.
        </p>

        <div className="bg-blue-50 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold text-[#002147] mb-2">What Happens Next?</h2>
          <p className="text-gray-700">
            Your review will be reviewed by our team and published on our testimonials page soon. We may reach out to
            you if we have any questions about your experience.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/">
            <Button variant="outline" size="lg">
              Return to Homepage
            </Button>
          </Link>

          <Link href="/testimonials">
            <Button size="lg" className="bg-[#002147] hover:bg-[#001a38]">
              View Testimonials
            </Button>
          </Link>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <h3 className="text-lg font-medium text-[#002147] mb-3">Also Consider Reviewing Us On:</h3>
          <div className="flex justify-center space-x-6">
            <a
              href="https://g.co/kgs/HqnKqcz"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 flex items-center"
            >
              <span className="mr-1">Google</span>
            </a>
            <a
              href="https://www.facebook.com/profile.php?viewas=100000686899395&id=61556113852881"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 flex items-center"
            >
              <span className="mr-1">Facebook</span>
            </a>
            <a
              href="https://www.yelp.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 flex items-center"
            >
              <span className="mr-1">Yelp</span>
            </a>
          </div>
          <p className="mt-4 text-sm text-gray-600">
            Questions? Call us at (281) 779-8847 or email contact@houstonmobilnotarypros.com
          </p>
        </div>
      </div>
    </div>
  )
}
