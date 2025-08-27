"use client"

// import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"
import { track } from "@/app/lib/analytics"

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
          <Link href="/" className="flex items-center" onClick={() => track('cta_clicked', { cta_name: 'Logo', location: 'header' })}>
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
                  <Link href="/services" className="text-secondary hover:text-primary" onClick={() => track('cta_clicked', { cta_name: 'Services', location: 'header' })}>
                    Services
                  </Link>
                </li>
                <li>
                  <Link href="/ron/how-it-works" className="text-secondary hover:text-primary" onClick={() => track('cta_clicked', { cta_name: 'RON', location: 'header' })}>
                    RON
                  </Link>
                </li>
                <li>
                  <Link href="/service-areas" className="text-secondary hover:text-primary" onClick={() => track('cta_clicked', { cta_name: 'Service Areas', location: 'header' })}>
                    Service Areas
                  </Link>
                </li>
                <li>
                  <Link href="/what-to-expect" className="text-secondary hover:text-primary" onClick={() => track('cta_clicked', { cta_name: 'What to Expect', location: 'header' })}>
                    What to Expect
                  </Link>
                </li>
                <li>
                  <Link href="/testimonials" className="text-secondary hover:text-primary" onClick={() => track('cta_clicked', { cta_name: 'Testimonials', location: 'header' })}>
                    Testimonials
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="text-secondary hover:text-primary" onClick={() => track('cta_clicked', { cta_name: 'FAQ', location: 'header' })}>
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-secondary hover:text-primary" onClick={() => track('cta_clicked', { cta_name: 'Blog', location: 'header' })}>
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-secondary hover:text-primary" onClick={() => track('cta_clicked', { cta_name: 'Contact', location: 'header' })}>
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="text-secondary hover:text-primary" onClick={() => track('cta_clicked', { cta_name: 'Sign In', location: 'header' })}>
                    Sign In
                  </Link>
                </li>
              </ul>
            </nav>
            <Link
              href="/booking"
              className="px-6 py-2 rounded-full transition-colors font-medium hover:shadow-md bg-brand text-white"
              onClick={() => track('cta_clicked', { cta_name: 'Book', location: 'header' })}
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
                  onClick={() => { setIsMenuOpen(false); track('cta_clicked', { cta_name: 'Services', location: 'header' }) }}
                >
                  Services
                </Link>
              </li>
              <li>
                <Link
                  href="/ron/how-it-works"
                  className="text-secondary hover:text-primary block"
                  onClick={() => { setIsMenuOpen(false); track('cta_clicked', { cta_name: 'RON', location: 'header' }) }}
                >
                  RON
                </Link>
              </li>
              <li>
                <Link
                  href="/service-areas"
                  className="text-secondary hover:text-primary block"
                  onClick={() => { setIsMenuOpen(false); track('cta_clicked', { cta_name: 'Service Areas', location: 'header' }) }}
                >
                  Service Areas
                </Link>
              </li>
              <li>
                <Link
                  href="/what-to-expect"
                  className="text-secondary hover:text-primary block"
                  onClick={() => { setIsMenuOpen(false); track('cta_clicked', { cta_name: 'What to Expect', location: 'header' }) }}
                >
                  What to Expect
                </Link>
              </li>
              <li>
                <Link
                  href="/testimonials"
                  className="text-secondary hover:text-primary block"
                  onClick={() => { setIsMenuOpen(false); track('cta_clicked', { cta_name: 'Testimonials', location: 'header' }) }}
                >
                  Testimonials
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-secondary hover:text-primary block"
                  onClick={() => { setIsMenuOpen(false); track('cta_clicked', { cta_name: 'FAQ', location: 'header' }) }}
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-secondary hover:text-primary block"
                  onClick={() => { setIsMenuOpen(false); track('cta_clicked', { cta_name: 'Blog', location: 'header' }) }}
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-secondary hover:text-primary block"
                  onClick={() => { setIsMenuOpen(false); track('cta_clicked', { cta_name: 'Contact', location: 'header' }) }}
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="text-secondary hover:text-primary block"
                  onClick={() => { setIsMenuOpen(false); track('cta_clicked', { cta_name: 'Sign In', location: 'header' }) }}
                >
                  Sign In
                </Link>
              </li>
              <li>
                <Link
                  href="/booking"
                  className="bg-brand text-white px-6 py-2 rounded-full transition-colors inline-block font-medium hover:shadow-md"
                  onClick={() => { setIsMenuOpen(false); track('cta_clicked', { cta_name: 'Book', location: 'header' }) }}
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
