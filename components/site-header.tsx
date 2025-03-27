"use client"

import { MainNav } from "@/components/main-nav"
import { MobileHeader } from "@/components/mobile-header"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

export function SiteHeader({ className }: { className?: string }) {
  const [isScrolled, setIsScrolled] = useState(false)

  // Add scroll event listener to change header style on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-200",
        isScrolled ? "bg-background/95 backdrop-blur-sm shadow-sm" : "bg-background",
        className,
      )}
    >
      <div className="container px-4 sm:px-6 lg:px-8 py-3">
        <div className="hidden md:block">
          <MainNav />
        </div>
        <div className="md:hidden">
          <MobileHeader />
        </div>
      </div>
    </header>
  )
}

