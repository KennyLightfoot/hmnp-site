"use client"

import { useState, useEffect, useCallback } from "react"

interface ExitIntentOptions {
  threshold?: number
  delay?: number
  onExitIntent?: () => void
}

export function useExitIntent({ threshold = 10, delay = 1000, onExitIntent }: ExitIntentOptions = {}) {
  const [hasTriggered, setHasTriggered] = useState(false)
  const [isEnabled, setIsEnabled] = useState(false)

  const handleMouseLeave = useCallback(
    (e: MouseEvent) => {
      if (!hasTriggered && isEnabled && e.clientY <= threshold && e.relatedTarget === null) {
        setHasTriggered(true)
        onExitIntent?.()
      }
    },
    [hasTriggered, isEnabled, threshold, onExitIntent],
  )

  useEffect(() => {
    // Enable exit intent detection after delay
    const timer = setTimeout(() => {
      setIsEnabled(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  useEffect(() => {
    if (isEnabled) {
      document.addEventListener("mouseleave", handleMouseLeave)
      return () => document.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [isEnabled, handleMouseLeave])

  const reset = useCallback(() => {
    setHasTriggered(false)
  }, [])

  return { hasTriggered, reset }
}
