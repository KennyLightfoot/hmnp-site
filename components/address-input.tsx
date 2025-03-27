"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { loadGoogleMapsScript } from "@/lib/load-google-maps"

interface AddressInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onAddressSelect?: (address: string) => void
}

export function AddressInput({ onAddressSelect, id, ...props }: AddressInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const [isScriptLoaded, setIsScriptLoaded] = useState(false)

  // Load Google Maps script
  useEffect(() => {
    const loadScript = async () => {
      try {
        await loadGoogleMapsScript()
        setIsScriptLoaded(true)
      } catch (error) {
        console.error("Failed to load Google Maps script:", error)
      }
    }

    if (typeof window !== "undefined" && !window.google) {
      loadScript()
    } else if (typeof window !== "undefined" && window.google) {
      setIsScriptLoaded(true)
    }
  }, [])

  // Initialize autocomplete
  useEffect(() => {
    if (
      !isScriptLoaded ||
      !inputRef.current ||
      autocompleteRef.current ||
      typeof window === "undefined" ||
      !window.google?.maps?.places
    )
      return

    try {
      // Initialize Google Places Autocomplete
      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: "us" },
        fields: ["formatted_address"],
        types: ["address"],
      })

      // Add listener for place selection
      const listener = autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current?.getPlace()
        if (place?.formatted_address && onAddressSelect) {
          onAddressSelect(place.formatted_address)
        }
      })

      // Cleanup
      return () => {
        if (autocompleteRef.current && window.google?.maps?.event) {
          window.google.maps.event.removeListener(listener)
        }
      }
    } catch (error) {
      console.error("Error initializing Google Places Autocomplete:", error)
    }
  }, [isScriptLoaded, onAddressSelect])

  return <Input ref={inputRef} id={id} name={id} {...props} />
}

