"use client"

// import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [hasScrolled, setHasScrolled] = useState(false)

  // Handle scroll event to add shadow when scrolled
  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 10)
    }

    // Add scroll event listener
    window.addEventListener("scroll", handleScroll)

    // Check initial scroll position
    handleScroll()

    // Clean up event listener
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 w-full z-50 transition-all duration-300 backdrop-blur supports-[backdrop-filter]:bg-white/60 ${
        hasScrolled ? 'bg-white/90 border-b shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <img src="/logo.png" alt="Houston Mobile Notary Pros" className="h-14 w-auto" />
          </Link>

          {/* Mobile menu button */}
          <button
            className="md:hidden focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <X className="h-6 w-6 text-secondary" /> : <Menu className="h-6 w-6 text-secondary" />}
          </button>

          {/* Desktop navigation and CTA */}
          <div className="hidden md:flex items-center justify-between flex-1 ml-6">
            <nav>
              <ul className="flex space-x-6 items-center">
                <li>
                  <Link href="/services" className="text-secondary hover:text-primary">
                    Services
                  </Link>
                </li>
                <li>
                  <Link href="/ron/how-it-works" className="text-secondary hover:text-primary">
                    RON
                  </Link>
                </li>
                <li>
                  <Link href="/service-areas" className="text-secondary hover:text-primary">
                    Service Areas
                  </Link>
                </li>
                <li>
                  <Link href="/what-to-expect" className="text-secondary hover:text-primary">
                    What to Expect
                  </Link>
                </li>
                <li>
                  <Link href="/testimonials" className="text-secondary hover:text-primary">
                    Testimonials
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="text-secondary hover:text-primary">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-secondary hover:text-primary">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-secondary hover:text-primary">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="text-secondary hover:text-primary">
                    Sign In
                  </Link>
                </li>
              </ul>
            </nav>
            <Link
              href="/booking"
              className="bg-primary text-primary-foreground px-6 py-2 rounded-full hover:bg-primary/90 transition-colors font-medium hover:shadow-md"
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
                  className="text-secondary hover:text-primary block"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Services
                </Link>
              </li>
              <li>
                <Link
                  href="/ron/how-it-works"
                  className="text-secondary hover:text-primary block"
                  onClick={() => setIsMenuOpen(false)}
                >
                  RON
                </Link>
              </li>
              <li>
                <Link
                  href="/service-areas"
                  className="text-secondary hover:text-primary block"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Service Areas
                </Link>
              </li>
              <li>
                <Link
                  href="/what-to-expect"
                  className="text-secondary hover:text-primary block"
                  onClick={() => setIsMenuOpen(false)}
                >
                  What to Expect
                </Link>
              </li>
              <li>
                <Link
                  href="/testimonials"
                  className="text-secondary hover:text-primary block"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Testimonials
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-secondary hover:text-primary block"
                  onClick={() => setIsMenuOpen(false)}
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-secondary hover:text-primary block"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-secondary hover:text-primary block"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="text-secondary hover:text-primary block"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
              </li>
              <li>
                <Link
                  href="/booking"
                  className="bg-primary text-primary-foreground px-6 py-2 rounded-full hover:bg-primary/90 transition-colors inline-block font-medium hover:shadow-md"
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
