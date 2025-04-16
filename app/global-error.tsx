"use client"

import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"
import { logError } from "@/lib/error-logger"
import { useEffect } from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the global error with our enhanced logger
    logError(error, {
      severity: "critical",
      context: {
        digest: error.digest,
        location: "global-error",
      },
      tags: ["client", "global-error"],
    })
  }, [error])

  return (
    <html lang="en">
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
          <div className="mb-6 text-[#A52A2A]">
            <AlertTriangle size={64} />
          </div>
          <h1 className="text-3xl font-bold text-[#002147] mb-4">Something went wrong</h1>
          <p className="text-gray-600 mb-6 max-w-md">
            We apologize for the inconvenience. Our team has been notified of this issue.
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
      </body>
    </html>
  )
}
