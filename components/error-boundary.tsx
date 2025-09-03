"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Error boundary caught error:", error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-4 text-center">
      <div className="mb-6 text-[#A52A2A]">
        <AlertTriangle size={48} />
      </div>
      <h2 className="text-2xl font-bold text-[#002147] mb-4">Something went wrong</h2>
      <p className="text-gray-600 mb-6 max-w-md">
        We apologize for the inconvenience. Please try again or contact us if the problem persists.
      </p>
      <div className="flex gap-4">
        <Button onClick={reset} className="bg-secondary hover:bg-secondary/90">
          Try again
        </Button>
        <Button
          variant="outline"
          onClick={() => (window.location.href = "/")}
          className="border-[#002147] text-[#002147]"
        >
          Return to home
        </Button>
      </div>
    </div>
  )
}
