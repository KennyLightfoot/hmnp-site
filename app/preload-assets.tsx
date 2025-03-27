"use client"

import { useEffect } from "react"

export function PreloadAssets() {
  useEffect(() => {
    // Preload critical images
    const imagesToPreload = ["/images/hero-bg.jpg", "/images/logo.png"]

    imagesToPreload.forEach((src) => {
      const img = new Image()
      img.src = src
    })

    // We'll no longer preload Google Maps API here to avoid exposing the API key
    // Instead, the API will be loaded when needed via our secure server endpoint
  }, [])

  return null
}

