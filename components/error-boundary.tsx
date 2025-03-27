"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

interface ErrorBoundaryProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Unhandled error:", error)
  }, [error])

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
      <div className="space-y-4 px-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">Something went wrong</h1>
          <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
            We apologize for the inconvenience. Our team has been notified of this issue.
          </p>
        </div>
        <div className="flex justify-center gap-2">
          <Button onClick={reset}>Try again</Button>
          <Button variant="outline" onClick={() => (window.location.href = "/")}>
            Go to homepage
          </Button>
        </div>
        {process.env.NODE_ENV === "development" && (
          <div className="mt-8 rounded-lg bg-gray-100 p-4 text-left dark:bg-gray-800">
            <p className="font-mono text-sm text-red-500">{error.message}</p>
            <p className="mt-2 font-mono text-xs text-gray-500">{error.stack}</p>
          </div>
        )}
      </div>
    </div>
  )
}

