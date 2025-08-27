"use client"

import { useSearchParams } from 'next/navigation'

// Simple variant switch via ?v= or NEXT_PUBLIC_VARIANT
// Returns the variant (e.g., 'A', 'B')
export function useVariant(experimentName: string, defaultVariant = "A"): string {
  if (typeof window === "undefined") return defaultVariant
  const searchParams = useSearchParams()
  const urlVariant = searchParams.get('v')
  if (urlVariant) return urlVariant.toUpperCase()
  if (process.env.NEXT_PUBLIC_VARIANT) return process.env.NEXT_PUBLIC_VARIANT.toUpperCase()
  return defaultVariant
}


