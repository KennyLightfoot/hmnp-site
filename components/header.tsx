"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"
import { track } from "@/app/lib/analytics"
import { persistAttribution, getAttribution } from "@/lib/utm"
import dynamic from 'next/dynamic'
const ExitIntentModal = dynamic(() => import('@/components/ExitIntentModal'), { ssr: false })

const StickyCallButton = dynamic(() => import('@/components/StickyCallButton'), { ssr: false })

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [hasScrolled, setHasScrolled] = useState(false)

  // Handle scroll event to add shadow when scrolled
  useEffect(() => {
    persistAttribution()
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
          <Link href="/" className="flex items-center" onClick={() => {
            const a = getAttribution()
            track('cta_click', { cta_name: 'Logo', location: 'header', ...a })
          }}>
            <Image src="/logo.png" alt="Houston Mobile Notary Pros" width={140} height={56} priority />
          </Link>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden rounded-full p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-secondary"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-nav"
          >
            {isMenuOpen ? <X className="h-6 w-6 text-white" /> : <Menu className="h-6 w-6 text-white" />}
          </button>

          {/* Desktop navigation and CTA */}
          <div className="hidden md:flex items-center justify-between flex-1 ml-6">
            <nav>
              <ul className="flex space-x-6 items-center">
                {[
                  { href: '/services', label: 'Services' },
                  { href: '/pricing', label: 'Pricing' },
                  { href: '/service-areas', label: 'Areas' },
                  { href: '/faq', label: 'FAQs' },
                ].map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-white/80 hover:text-white" onClick={() => track('cta_click', { cta_name: item.label, location: 'header' })}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <Link
              href="/booking"
              className="px-6 py-2 rounded-full transition-colors font-medium hover:shadow-md bg-primary text-white"
              onClick={() => track('cta_click', { cta_name: 'Book', location: 'header' })}
            >
              Book Now
            </Link>
          </div>
        </div>
        <StickyCallButton />
        <ExitIntentModal />

        {/* Mobile navigation */}
        {isMenuOpen && (
          <nav id="mobile-nav" className="md:hidden mt-4 pb-2">
            <ul className="flex flex-col space-y-4">
              {[
                { href: '/services', label: 'Services' },
                { href: '/pricing', label: 'Pricing' },
                { href: '/service-areas', label: 'Areas' },
                { href: '/faq', label: 'FAQs' },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-white/90 hover:text-white block"
                    onClick={() => { setIsMenuOpen(false); track('cta_click', { cta_name: item.label, location: 'header' }) }}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/booking"
                  className="bg-primary text-white px-6 py-2 rounded-full transition-colors inline-block font-medium hover:shadow-md"
                  onClick={() => { setIsMenuOpen(false); track('cta_click', { cta_name: 'Book', location: 'header' }) }}
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
