"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { Menu, X } from "lucide-react"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="bg-white py-4 border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image src="/logo.png" alt="Houston Mobile Notary Pros" width={150} height={150} className="h-16 w-auto" />
          </Link>

          {/* Mobile menu button */}
          <button
            className="md:hidden focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <X className="h-6 w-6 text-[#002147]" /> : <Menu className="h-6 w-6 text-[#002147]" />}
          </button>

          {/* Desktop navigation and CTA */}
          <div className="hidden md:flex items-center justify-between flex-1 ml-6">
            <nav>
              <ul className="flex space-x-6 items-center">
                <li>
                  <Link href="/services" className="text-[#002147] hover:text-[#A52A2A]">
                    Services
                  </Link>
                </li>
                <li>
                  <Link href="/testimonials" className="text-[#002147] hover:text-[#A52A2A]">
                    Testimonials
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="text-[#002147] hover:text-[#A52A2A]">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-[#002147] hover:text-[#A52A2A]">
                    Contact
                  </Link>
                </li>
              </ul>
            </nav>
            <Link
              href="/booking"
              className="bg-[#A52A2A] text-white px-6 py-2 rounded-full hover:bg-[#8B2323] transition-colors font-medium"
            >
              Book Now
            </Link>
          </div>
        </div>

        {/* Mobile navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-2">
            <ul className="flex flex-col space-y-4">
              <li>
                <Link
                  href="/services"
                  className="text-[#002147] hover:text-[#A52A2A] block"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Services
                </Link>
              </li>
              <li>
                <Link
                  href="/testimonials"
                  className="text-[#002147] hover:text-[#A52A2A] block"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Testimonials
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-[#002147] hover:text-[#A52A2A] block"
                  onClick={() => setIsMenuOpen(false)}
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-[#002147] hover:text-[#A52A2A] block"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/booking"
                  className="bg-[#A52A2A] text-white px-6 py-2 rounded-full hover:bg-[#8B2323] transition-colors inline-block font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Book Now
                </Link>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </header>
  )
}
