"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useEffect } from "react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Booking error:", error)
  }, [error])

  return (
    <div className="container mx-auto px-4 py-12 text-center">
      <h2 className="mb-2 text-2xl font-bold">Booking System Unavailable</h2>
      <p className="mb-4 text-muted-foreground">We're experiencing issues with our booking system.</p>
      <div className="flex flex-wrap justify-center gap-4">
        <Button onClick={() => reset()}>Try again</Button>
        <Button variant="outline" asChild>
          <Link href="/contact">Contact Us</Link>
        </Button>
      </div>
      <p className="mt-4 text-sm">
        You can also call us directly at{" "}
        <a href="tel:+12817798847" className="font-medium text-primary">
          (281) 779-8847
        </a>{" "}
        to schedule your appointment.
      </p>
    </div>
  )
}

