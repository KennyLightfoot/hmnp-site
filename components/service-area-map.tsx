"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { MapPin, Search } from "lucide-react"
import { createMarker } from "@/lib/create-marker"

// Define the center of the service area (Dickinson, TX)
const SERVICE_CENTER = { lat: 29.4608, lng: -95.0513 }
const PRIMARY_RADIUS = 20 // 20 miles primary service area
const EXTENDED_RADIUS = 50 // 50 miles extended service area

// Declare google variable
declare global {
  interface Window {
    google: any
    initMap: () => void
  }
}

export default function ServiceAreaMap() {
  const mapRef = useRef<HTMLDivElement>(null)
  const markerRef = useRef<any>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [address, setAddress] = useState("")
  const [searchResult, setSearchResult] = useState<{
    address: string
    inServiceArea: boolean
    distance: number
    extraFee: number | null
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mapError, setMapError] = useState<string | null>(null)

  // Load Google Maps script
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      window.google?.maps ||
      document.querySelector('script[src*="maps.googleapis.com"]')
    ) {
      // Google Maps is already loaded or loading
      if (window.google?.maps) {
        setMapLoaded(true)
      }
      return
    }

    async function loadMapsApi() {
      try {
        // Fetch API key from server
        const response = await fetch("/api/maps")
        const data = await response.json()
        const apiKey = data.apiKey

        if (!apiKey) {
          setMapError("Google Maps API key is missing")
          return
        }

        // Define the callback function
        window.initMap = () => {
          setMapLoaded(true)
        }

        // Create script element
        const script = document.createElement("script")
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&callback=initMap&loading=async`
        script.async = true
        script.defer = true
        script.onerror = () => {
          setMapError("Failed to load Google Maps API")
        }

        document.head.appendChild(script)
      } catch (error) {
        setMapError("Failed to load Google Maps API")
      }
    }

    loadMapsApi()

    return () => {
      // Clean up
      window.initMap = () => {}
      const script = document.querySelector('script[src*="maps.googleapis.com"]')
      if (script && document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [])

  // Initialize map
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !window.google?.maps) return

    try {
      // Create the map
      const map = new window.google.maps.Map(mapRef.current, {
        center: SERVICE_CENTER,
        zoom: 10,
        mapTypeId: "roadmap",
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      })

      // Add primary service area circle
      new window.google.maps.Circle({
        strokeColor: "hsl(var(--primary))", // Primary color
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "hsl(var(--primary))", // Primary color
        fillOpacity: 0.2,
        map,
        center: SERVICE_CENTER,
        radius: PRIMARY_RADIUS * 1609.34, // Convert miles to meters
      })

      // Add extended service area circle
      new window.google.maps.Circle({
        strokeColor: "hsl(var(--secondary))", // Secondary color
        strokeOpacity: 0.5,
        strokeWeight: 1,
        fillColor: "hsl(var(--secondary))", // Secondary color
        fillOpacity: 0.1,
        map,
        center: SERVICE_CENTER,
        radius: EXTENDED_RADIUS * 1609.34, // Convert miles to meters
      })

      // Clean up previous marker if it exists
      if (markerRef.current) {
        if (markerRef.current.map) {
          markerRef.current.map = null
        } else if (markerRef.current.setMap) {
          markerRef.current.setMap(null)
        }
      }

      // Create a marker for the service center using our utility function
      markerRef.current = createMarker(map, SERVICE_CENTER, {
        title: "Houston Mobile Notary Pros",
        color: "hsl(var(--primary))", // Primary color
      })
    } catch (err) {
      console.error("Error initializing map:", err)
      setMapError("Error initializing map")
    }

    return () => {
      // Clean up marker
      if (markerRef.current) {
        if (markerRef.current.map) {
          markerRef.current.map = null
        } else if (markerRef.current.setMap) {
          markerRef.current.setMap(null)
        }
      }
    }
  }, [mapLoaded])

  // Check if address is in service area
  const checkServiceArea = async () => {
    if (!mapLoaded || !address || !window.google?.maps) return

    setLoading(true)
    setError(null)
    setSearchResult(null)

    try {
      const geocoder = new window.google.maps.Geocoder()

      geocoder.geocode({ address }, (results, status) => {
        if (status !== window.google.maps.GeocoderStatus.OK) {
          setError("Address not found. Please try again.")
          setLoading(false)
          return
        }

        const location = results[0].geometry.location

        const distance =
          window.google.maps.geometry.spherical.computeDistanceBetween(
            new window.google.maps.LatLng(SERVICE_CENTER),
            location,
          ) / 1609.34 // Convert meters to miles

        const inServiceArea = distance <= EXTENDED_RADIUS
        const extraFee = distance <= PRIMARY_RADIUS ? null : Math.ceil((distance - PRIMARY_RADIUS) * 0.5 * 2) / 2 // $0.50 per mile, rounded to nearest $0.50

        setSearchResult({
          address: results[0].formatted_address,
          inServiceArea,
          distance: Math.round(distance * 10) / 10, // Round to 1 decimal place
          extraFee,
        })

        setLoading(false)
      })
    } catch (err) {
      console.error("Error checking service area:", err)
      setError("An error occurred. Please try again.")
      setLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-accent">Service Area</CardTitle>
        <CardDescription>
          We serve Dickinson, TX and surrounding areas. Check if your location is within our service area.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Enter your address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              aria-label="Enter your address to check if it's in our service area"
            />
            <Button
              onClick={checkServiceArea}
              disabled={loading || !address || !mapLoaded}
              aria-label="Check service area"
            >
              {loading ? <LoadingSpinner size="sm" /> : <Search className="h-4 w-4 mr-2" />}
              Check
            </Button>
          </div>

          {error && (
            <div className="bg-destructive/10 p-3 rounded-md border border-destructive" role="alert">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          {searchResult && (
            <div
              className={`p-4 rounded-md border ${searchResult.inServiceArea ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"}`}
              role="status"
            >
              <h3 className="font-medium flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                {searchResult.address}
              </h3>
              <p className="mt-2 text-sm">
                {searchResult.inServiceArea ? (
                  <>
                    <span className="font-medium text-green-700">Good news!</span> Your location is within our service
                    area ({searchResult.distance} miles from our center).
                    {searchResult.extraFee && (
                      <span className="block mt-1">
                        Additional travel fee of ${searchResult.extraFee.toFixed(2)} applies for locations beyond our
                        20-mile primary service area.
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <span className="font-medium text-amber-700">We're sorry.</span> Your location is outside our
                    standard service area ({searchResult.distance} miles from our center).
                    <span className="block mt-1">
                      Please contact us directly to discuss service options for your location.
                    </span>
                  </>
                )}
              </p>
            </div>
          )}
        </div>

        <div
          ref={mapRef}
          className="w-full h-[400px] rounded-md overflow-hidden border"
          aria-label="Map showing Houston Mobile Notary Pros service area"
        >
          {!mapLoaded && !mapError && (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <LoadingSpinner size="lg" text="Loading map..." />
            </div>
          )}

          {mapError && (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-destructive">
              <p>{mapError}</p>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-primary mr-2"></div>
            <span>Primary Service Area (20 miles)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-secondary mr-2"></div>
            <span>Extended Service Area (50 miles)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

