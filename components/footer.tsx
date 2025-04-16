import Image from "next/image"
import Link from "next/link"

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
            <Link href="/booking" className="text-gray-600 hover:text-[#002147]">
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
          </div>
        </div>
        <div className="text-center text-gray-600">
          <p className="text-sm">&copy; {new Date().getFullYear()} Houston Mobile Notary Pros. All rights reserved.</p>
          <p className="text-xs mt-2">
            Serving Houston and surrounding areas with professional mobile notary services.
          </p>
          <p className="text-xs mt-2">
            <span className="font-medium">Phone:</span> (281) 779-8847 | <span className="font-medium">Email:</span>{" "}
            contact@houstonmobilnotarypros.com
          </p>
        </div>
      </div>
    </footer>
  )
}
