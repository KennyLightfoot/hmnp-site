"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="relative h-12 w-12 mr-2">
              {/* Replace with your actual logo */}
              <div className="h-12 w-12 rounded-full bg-[#002147] flex items-center justify-center text-white font-bold">
                HMNP
              </div>
            </div>
            <div className="hidden md:block">
              <h1 className="text-lg font-bold text-[#002147]">Houston Mobile Notary Pros</h1>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-[#A52A2A] font-medium">
              Home
            </Link>
            <Link href="/services" className="text-gray-700 hover:text-[#A52A2A] font-medium">
              Services
            </Link>
            <Link href="/service-area" className="text-gray-700 hover:text-[#A52A2A] font-medium">
              Service Area
            </Link>
            <Link href="/booking" className="text-gray-700 hover:text-[#A52A2A] font-medium">
              Book Now
            </Link>
            <Link href="/faq" className="text-gray-700 hover:text-[#A52A2A] font-medium">
              FAQ
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-[#A52A2A] font-medium">
              Contact
            </Link>
          </nav>

          {/* Book Now Button (Desktop) */}
          <div className="hidden md:block">
            <Button className="bg-[#A52A2A] hover:bg-[#8B0000]">Book Now</Button>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
            {isMenuOpen ? <X className="h-6 w-6 text-gray-700" /> : <Menu className="h-6 w-6 text-gray-700" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col space-y-4">
              <Link
                href="/"
                className="text-gray-700 hover:text-[#A52A2A] font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/services"
                className="text-gray-700 hover:text-[#A52A2A] font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Services
              </Link>
              <Link
                href="/service-area"
                className="text-gray-700 hover:text-[#A52A2A] font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Service Area
              </Link>
              <Link
                href="/booking"
                className="text-gray-700 hover:text-[#A52A2A] font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Book Now
              </Link>
              <Link
                href="/faq"
                className="text-gray-700 hover:text-[#A52A2A] font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                FAQ
              </Link>
              <Link
                href="/contact"
                className="text-gray-700 hover:text-[#A52A2A] font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              <Button className="bg-[#A52A2A] hover:bg-[#8B0000] w-full mt-2" onClick={() => setIsMenuOpen(false)}>
                Book Now
              </Button>
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
