"use client"

import { useEffect } from "react"
import { persistAttribution } from "@/lib/utm"

export default function AttributionInit() {
  useEffect(() => {
    try { persistAttribution() } catch {}
  }, [])
  return null
}



