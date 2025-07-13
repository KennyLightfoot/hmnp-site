'use client';

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileQuestion } from "lucide-react"

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="mb-6 text-[#91A3B0]">
          <FileQuestion size={64} />
        </div>
        <h1 className="text-4xl font-bold text-[#002147] mb-4">404 - Page Not Found</h1>
        <p className="text-xl text-gray-600 mb-8 max-w-md">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/">
            <Button size="lg" className="bg-[#002147] hover:bg-[#002147]/90 w-full sm:w-auto">
              Return to Homepage
            </Button>
          </Link>
          <Link href="/contact">
            <Button variant="outline" size="lg" className="border-[#002147] text-[#002147] w-full sm:w-auto">
              Contact Us
            </Button>
          </Link>
        </div>
        <div className="mt-12 p-6 bg-gray-50 rounded-lg max-w-lg">
          <h2 className="text-xl font-semibold text-[#002147] mb-3">Looking for notary services?</h2>
          <p className="text-gray-600 mb-4">
            We offer mobile notary services throughout the Houston area. Check out our service options or book an
            appointment.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/services">
              <Button variant="outline" className="border-[#A52A2A] text-[#A52A2A] w-full sm:w-auto">
                View Services
              </Button>
            </Link>
            <Link href="/booking">
              <Button className="bg-[#A52A2A] hover:bg-[#A52A2A]/90 w-full sm:w-auto">Book Now</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
