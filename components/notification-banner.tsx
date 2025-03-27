"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface NotificationBannerProps {
  message: string
  ctaText?: string
  ctaLink?: string
  variant?: "default" | "primary" | "secondary" | "accent"
  className?: string
  onClose?: () => void
}

export function NotificationBanner({
  message,
  ctaText,
  ctaLink,
  variant = "default",
  className,
  onClose,
}: NotificationBannerProps) {
  const [isVisible, setIsVisible] = useState(true)

  const handleClose = () => {
    setIsVisible(false)
    onClose?.()
  }

  if (!isVisible) return null

  const variantStyles = {
    default: "bg-background border-border",
    primary: "bg-primary/10 border-primary/20",
    secondary: "bg-secondary/10 border-secondary/20",
    accent: "bg-accent/10 border-accent/20",
  }

  return (
    <div
      className={cn(
        "relative flex items-center justify-between px-4 py-3 text-sm border rounded-md",
        variantStyles[variant],
        className,
      )}
    >
      <div className="flex-1 mr-8">
        <p>{message}</p>
        {ctaText && ctaLink && (
          <Link href={ctaLink} className="inline-block mt-1 font-medium text-primary hover:text-primary/80">
            {ctaText}
          </Link>
        )}
      </div>
      <button
        onClick={handleClose}
        className="absolute right-2 top-2 p-1 rounded-full text-foreground hover:bg-muted"
        aria-label="Close notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

