"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Loader } from "lucide-react"

interface ServiceAreaMapProps {
  height?: string
  zoom?: number
  showControls?: boolean
}

export default function ServiceAreaMap({ height = "400px", zoom = 9, showControls = true }: ServiceAreaMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [mapLoaded, setMapLoaded] = useState(false)

  // Coordinates for ZIP 77591 (Texas City, TX)
  const centerLat = 29.383845
  const centerLng = -94.9027
  const radiusMiles = 30

  // Convert miles to meters for the circle radius
  const radiusMeters = radiusMiles * 1609.34

  // Initialize the map
  const initializeMap = useCallback(() => {
    if (!mapRef.current || !window.google || mapLoaded) return

    try {
      const mapOptions = {
        center: { lat: centerLat, lng: centerLng },
        zoom: zoom,
        mapTypeControl: showControls,
        streetViewControl: showControls,
        fullscreenControl: showControls,
        zoomControl: showControls,
      }

      const map = new window.google.maps.Map(mapRef.current, mapOptions)

      // Add a marker for the center point
      new window.google.maps.Marker({
        position: { lat: centerLat, lng: centerLng },
        map: map,
        title: "ZIP 77591 - Our Base Location",
        animation: window.google.maps.Animation.DROP,
      })

      // Add a circle for the service area
      const serviceAreaCircle = new window.google.maps.Circle({
        strokeColor: "#A52A2A",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#A52A2A",
        fillOpacity: 0.1,
        map: map,
        center: { lat: centerLat, lng: centerLng },
        radius: radiusMeters,
      })

      // Add a circle for the free service area (20 miles)
      const freeServiceAreaCircle = new window.google.maps.Circle({
        strokeColor: "#002147",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#002147",
        fillOpacity: 0.1,
        map: map,
        center: { lat: centerLat, lng: centerLng },
        radius: 20 * 1609.34, // 20 miles in meters
      })

      // Create info window for the marker
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; max-width: 200px;">
            <h3 style="margin: 0 0 8px; font-weight: bold; color: #002147;">Houston Mobile Notary Pros</h3>
            <p style="margin: 0 0 5px;">Base location: ZIP 77591</p>
            <p style="margin: 0 0 5px;"><span style="color: #002147; font-weight: bold;">Blue area:</span> Free travel within 20 miles</p>
            <p style="margin: 0;"><span style="color: #A52A2A; font-weight: bold;">Red area:</span> Extended service area ($0.50/mile)</p>
          </div>
        `,
      })

      // Add click listener to marker to open info window
      const marker = new window.google.maps.Marker({
        position: { lat: centerLat, lng: centerLng },
        map: map,
        title: "ZIP 77591 - Our Base Location",
      })

      marker.addListener("click", () => {
        infoWindow.open(map, marker)
      })

      // Open info window by default
      infoWindow.open(map, marker)

      setMapLoaded(true)
    } catch (error) {
      console.error("Error initializing map:", error)
    } finally {
      setLoading(false)
    }
  }, [mapLoaded, zoom, showControls])

  // Load Google Maps API
  useEffect(() => {
    if (window.google?.maps) {
      initializeMap()
      return
    }

    const fetchMapApiKey = async () => {
      try {
        const response = await fetch("/api/map")
        if (!response.ok) {
          throw new Error("Failed to load map configuration")
        }
        const data = await response.json()
        if (!data.success || !data.apiKey) {
          throw new Error("Invalid map configuration")
        }

        const script = document.createElement("script")
        script.src = `https://maps.googleapis.com/maps/api/js?key=${data.apiKey}&libraries=geometry&callback=initMap`
        script.async = true
        script.defer = true
        window.initMap = initializeMap

        document.head.appendChild(script)
      } catch (error) {
        console.error("Error loading map:", error)
        setLoading(false)
      }
    }

    fetchMapApiKey()

    return () => {
      delete window.initMap
    }
  }, [initializeMap])

  return (
    <div className="relative w-full rounded-lg overflow-hidden" style={{ height }}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <Loader className="h-8 w-8 animate-spin text-[#002147]" />
        </div>
      )}
      <div
        ref={mapRef}
        className="w-full h-full rounded-lg"
        aria-label="Map showing our 30-mile service radius from ZIP 77591"
      />
    </div>
  )
}
