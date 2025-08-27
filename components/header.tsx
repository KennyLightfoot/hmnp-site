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
      className={`sticky top-0 w-full z-50 transition-all duration-300 backdrop-blur supports-[backdrop-filter]:bg-secondary/80 ${
        hasScrolled ? 'bg-secondary/95 border-b border-black/10 shadow-sm' : 'bg-secondary/70'
      } text-white`}
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
            {isMenuOpen ? <X className="h-6 w-6 text-white" /> : <Menu className="h-6 w-6 text-white" />}
          </button>

          {/* Desktop navigation and CTA */}
          <div className="hidden md:flex items-center justify-between flex-1 ml-6">
            <nav>
              <ul className="flex space-x-6 items-center">
                {[
                  { href: '/services', label: 'Services' },
                  { href: '/ron/how-it-works', label: 'RON' },
                  { href: '/service-areas', label: 'Service Areas' },
                  { href: '/what-to-expect', label: 'What to Expect' },
                  { href: '/testimonials', label: 'Testimonials' },
                  { href: '/faq', label: 'FAQ' },
                  { href: '/blog', label: 'Blog' },
                  { href: '/contact', label: 'Contact' },
                  { href: '/login', label: 'Sign In' }
                ].map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-white/80 hover:text-white" onClick={() => track('cta_clicked', { cta_name: item.label, location: 'header' })}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <Link
              href="/booking"
              className="px-6 py-2 rounded-full transition-colors font-medium hover:shadow-md bg-primary text-white"
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
              {[
                { href: '/services', label: 'Services' },
                { href: '/ron/how-it-works', label: 'RON' },
                { href: '/service-areas', label: 'Service Areas' },
                { href: '/what-to-expect', label: 'What to Expect' },
                { href: '/testimonials', label: 'Testimonials' },
                { href: '/faq', label: 'FAQ' },
                { href: '/blog', label: 'Blog' },
                { href: '/contact', label: 'Contact' },
                { href: '/login', label: 'Sign In' },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-white/90 hover:text-white block"
                    onClick={() => { setIsMenuOpen(false); track('cta_clicked', { cta_name: item.label, location: 'header' }) }}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/booking"
                  className="bg-primary text-white px-6 py-2 rounded-full transition-colors inline-block font-medium hover:shadow-md"
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
