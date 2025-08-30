"use client"

import { Button } from "@/components/ui/button"
import { Phone, Clock, MapPin } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"

interface OneTapCallingProps {
  variant?: "primary" | "secondary" | "outline"
  size?: "sm" | "default" | "lg"
  showDetails?: boolean
  className?: string
}

export function OneTapCalling({
  variant = "primary",
  size = "default",
  showDetails = true,
  className = "",
}: OneTapCallingProps) {
  const isMobile = useIsMobile()
  const phoneNumber = "+17135550123"
  const displayNumber = "(713) 555-0123"

  // Enhanced click tracking for mobile
  const handleCall = () => {
    console.log("[v0] Mobile call initiated")
    // Track conversion event
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "phone_call", {
        event_category: "engagement",
        event_label: "mobile_cta",
      })
    }
  }

  if (variant === "primary") {
    return (
      <div className={`space-y-3 ${className}`}>
        <Button
          asChild
          size={size}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg"
          onClick={handleCall}
        >
          <a href={`tel:${phoneNumber}`} className="flex items-center justify-center gap-2">
            <Phone className="h-5 w-5" />
            <span className="font-semibold">Call {displayNumber}</span>
          </a>
        </Button>

        {showDetails && (
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>7AM-9PM Daily</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>Houston Area</span>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (variant === "secondary") {
    return (
      <Button
        asChild
        variant="outline"
        size={size}
        className={`${className} border-accent text-accent hover:bg-accent hover:text-accent-foreground`}
        onClick={handleCall}
      >
        <a href={`tel:${phoneNumber}`} className="flex items-center gap-2">
          <Phone className="h-4 w-4" />
          <span>Call Now</span>
        </a>
      </Button>
    )
  }

  return (
    <Button asChild variant="outline" size={size} className={className} onClick={handleCall}>
      <a href={`tel:${phoneNumber}`} className="flex items-center gap-2">
        <Phone className="h-4 w-4" />
        <span>{isMobile ? "Call" : "Call Now"}</span>
      </a>
    </Button>
  )
}
