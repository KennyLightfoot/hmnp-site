"use client"

import Link from "next/link"
import { ImageLogo } from "@/components/image-logo"
import { MobileNav } from "@/components/mobile-nav"
import { Button } from "@/components/ui/button"

export function MobileHeader() {
  return (
    <div className="flex items-center justify-between w-full">
      <Link href="/" className="flex items-center">
        <ImageLogo width={40} height={40} className="py-1" />
      </Link>

      <div className="flex items-center space-x-2">
        <Button size="sm" variant="outline" asChild className="hidden sm:inline-flex">
          <Link href="/contact">Contact</Link>
        </Button>
        <Button size="sm" asChild className="hidden sm:inline-flex">
          <Link href="/booking">Book</Link>
        </Button>
        <MobileNav />
      </div>
    </div>
  )
}

