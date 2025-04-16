"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"
import { logError } from "@/lib/error-logger"

export default function EnhancedErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error using our enhanced logger
    logError(error, {
      severity: "error",
      context: {
        digest: error.digest,
        componentStack: (error as any).componentStack,
      },
      tags: ["client", "react", "error-boundary"],
    })
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
        <Button onClick={reset} className="bg-[#002147] hover:bg-[#002147]/90">
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
