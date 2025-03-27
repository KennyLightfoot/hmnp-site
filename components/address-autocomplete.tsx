"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { loadGoogleMapsScript } from "@/lib/load-google-maps"

interface AddressAutocompleteProps {
  onAddressSelect: (address: string) => void
  label?: string
  placeholder?: string
  className?: string
  required?: boolean
  defaultValue?: string
}

export function AddressAutocomplete({
  onAddressSelect,
  label = "Address",
  placeholder = "Enter your address",
  className,
  required = false,
  defaultValue = "",
}: AddressAutocompleteProps) {
  const [inputValue, setInputValue] = useState(defaultValue)
  const autocompleteRef = useRef<HTMLInputElement>(null)
  const autocompleteInstance = useRef<google.maps.places.Autocomplete | null>(null)
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

  useEffect(() => {
    if (
      !isScriptLoaded ||
      !autocompleteRef.current ||
      autocompleteInstance.current ||
      typeof window === "undefined" ||
      !window.google?.maps?.places
    )
      return

    try {
      // Initialize Google Places Autocomplete
      autocompleteInstance.current = new window.google.maps.places.Autocomplete(autocompleteRef.current, {
        componentRestrictions: { country: "us" },
        fields: ["formatted_address"],
        types: ["address"],
      })

      // Add listener for place selection
      const listener = autocompleteInstance.current.addListener("place_changed", () => {
        const place = autocompleteInstance.current?.getPlace()
        if (place?.formatted_address) {
          setInputValue(place.formatted_address)
          onAddressSelect(place.formatted_address)
        }
      })

      // Cleanup
      return () => {
        if (autocompleteInstance.current && window.google.maps.event) {
          window.google.maps.event.removeListener(listener)
        }
      }
    } catch (error) {
      console.error("Error initializing Google Places Autocomplete:", error)
    }
  }, [isScriptLoaded, onAddressSelect])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
    // If the user is typing, we still want to pass the current value
    onAddressSelect(e.target.value)
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label htmlFor="address-autocomplete" className="text-accent">
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
      )}
      <Input
        ref={autocompleteRef}
        id="address-autocomplete"
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInputChange}
        className="bg-background"
        required={required}
        disabled={!isScriptLoaded}
      />
    </div>
  )
}

