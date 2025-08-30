"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Phone, Calendar, MessageCircle } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import Link from "next/link"

export function StickyCTA() {
  const [isVisible, setIsVisible] = useState(false)
  const isMobile = useIsMobile()

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky CTA after scrolling 300px
      setIsVisible(window.scrollY > 300)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  if (!isMobile || !isVisible) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 flex gap-2 animate-in slide-in-from-bottom-2 duration-300">
      {/* Primary Book Now CTA */}
      <Button asChild className="flex-1 h-12 bg-accent hover:bg-accent/90 shadow-lg">
        <Link href="/booking" className="flex items-center justify-center gap-2">
          <Calendar className="h-4 w-4" />
          Book Now
        </Link>
      </Button>

      {/* Quick Call Button */}
      <Button
        asChild
        variant="outline"
        size="icon"
        className="h-12 w-12 bg-background/95 backdrop-blur shadow-lg border-2"
      >
        <a href="tel:+17135550123" className="flex items-center justify-center">
          <Phone className="h-5 w-5" />
          <span className="sr-only">Call Houston Mobile Notary Pros</span>
        </a>
      </Button>

      {/* Quick Chat Button */}
      <Button
        variant="outline"
        size="icon"
        className="h-12 w-12 bg-background/95 backdrop-blur shadow-lg border-2"
        onClick={() => {
          // This would integrate with your chat system
          console.log("[v0] Opening chat widget")
        }}
      >
        <MessageCircle className="h-5 w-5" />
        <span className="sr-only">Start chat</span>
      </Button>
    </div>
  )
}
