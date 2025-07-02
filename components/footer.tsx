import Image from "next/image"
import Link from "next/link"
import { Facebook } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-100 py-8 border-t">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center mb-6">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="Houston Mobile Notary Pros"
              width={120}
              height={120}
              className="h-24 w-auto mb-4"
            />
          </Link>
          <div className="flex space-x-6 mt-4">
            <Link href="/services" className="text-gray-600 hover:text-[#002147]">
              Services
            </Link>
            <Link href="/what-to-expect" className="text-gray-600 hover:text-[#002147]">
              What to Expect
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-[#002147]">
              Book Now
            </Link>
            <Link href="/testimonials" className="text-gray-600 hover:text-[#002147]">
              Testimonials
            </Link>
            <Link href="/faq" className="text-gray-600 hover:text-[#002147]">
              FAQ
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-[#002147]">
              Contact
            </Link>
            <Link href="/service-areas" className="text-gray-600 hover:text-[#002147]">
              Service Areas
            </Link>
          </div>
        </div>
        <div className="text-center text-gray-600">
          <p className="text-xs font-medium text-[#002147] mb-2 opacity-80">
  Our Promise: Fast, precise notary service—every time, no hassle.
</p>
          <p className="text-sm">&copy; {new Date().getFullYear()} Houston Mobile Notary Pros. All rights reserved.</p>
          <p className="text-xs mt-2">
            Serving Houston and surrounding areas with professional mobile notary services.
          </p>
          <p className="text-xs mt-2">
            <span className="font-medium">Phone:</span> (832) 617-4285 | <span className="font-medium">Email:</span>{" "}
            contact@houstonmobilenotarypros.com
          </p>
          <div className="flex justify-center space-x-4 mt-4">
            <Link href="/terms" className="text-xs text-gray-500 hover:text-[#002147] hover:underline">
              Terms & Conditions
            </Link>
            <span className="text-xs text-gray-400">|</span>
            <Link href="/privacy" className="text-xs text-gray-500 hover:text-[#002147] hover:underline">
              Privacy Policy
            </Link>
          </div>
          <div className="flex justify-center space-x-4 mt-6">
            <Link href="https://www.facebook.com/HoustonMobileNotaryPros/" target="_blank" rel="noopener noreferrer" aria-label="Houston Mobile Notary Pros on Facebook" className="text-gray-600 hover:text-[#002147]">
              <Facebook className="h-6 w-6" />
            </Link>
            {/* Add other social media links here */}
          </div>
        </div>
        {/* Service Areas quick links */}
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs text-gray-600">
          {[
            "Clear Lake City",
            "Pasadena",
            "Texas City",
            "Webster",
            "Nassau Bay",
            "Seabrook",
            "Clear Lake Shores",
            "Taylor Lake Village",
            "Friendswood",
            "League City",
            "Kemah",
            "La Porte",
            "Deer Park",
            "South Houston",
            "La Marque",
            "Dickinson",
            "Santa Fe",
            "Galveston",
          ].map((city) => {
            const slug = city.toLowerCase().replace(/ /g, "-")
            return (
              <Link key={city} href={`/service-areas/${slug}`} className="hover:text-[#002147]">
                {city}
              </Link>
            )
          })}
        </div>
      </div>
    </footer>
  )
}
