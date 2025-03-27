"use client"

import { useEffect, useRef } from "react"
import { createMarker } from "@/lib/create-marker"

interface MapMarkerProps {
  position: { lat: number; lng: number }
  map: any
  title?: string
  color?: string
}

export function MapMarker({ position, map, title, color = "#A52A2A" }: MapMarkerProps) {
  const markerRef = useRef<any>(null)

  useEffect(() => {
    if (!map || typeof window.google?.maps === "undefined") return

    // Clean up previous marker
    if (markerRef.current) {
      if (markerRef.current.map) {
        markerRef.current.map = null
      } else if (markerRef.current.setMap) {
        markerRef.current.setMap(null)
      }
    }

    // Create a new marker using our utility function
    markerRef.current = createMarker(map, position, { title, color })

    return () => {
      // Clean up
      if (markerRef.current) {
        if (markerRef.current.map) {
          markerRef.current.map = null
        } else if (markerRef.current.setMap) {
          markerRef.current.setMap(null)
        }
      }
    }
  }, [map, position, title, color])

  return null
}

