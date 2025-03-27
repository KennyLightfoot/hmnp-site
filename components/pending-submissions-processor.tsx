"use client"

import { useEffect } from "react"
import { retryPendingSubmissions } from "@/lib/gohighlevel"
import { getPendingSubmissions } from "@/lib/form-fallback"

export function PendingSubmissionsProcessor() {
  useEffect(() => {
    // Check for pending submissions on page load
    const pendingCount = getPendingSubmissions().length

    if (pendingCount > 0) {
      console.log(`Found ${pendingCount} pending submissions, attempting to process...`)

      // Wait a bit to ensure the page is fully loaded
      const timer = setTimeout(async () => {
        try {
          await retryPendingSubmissions()
        } catch (error) {
          console.error("Failed to process pending submissions:", error)
        }
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [])

  // This component doesn't render anything
  return null
}

