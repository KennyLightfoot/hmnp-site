"use client"

import { useState, useRef, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MapPin } from 'lucide-react'

interface PlaceDetails {
  address: string
  city: string
  state: string
  zipCode: string
  latitude?: number
  longitude?: number
}

interface GooglePlacesInputProps {
  onPlaceSelect: (place: PlaceDetails) => void
  placeholder?: string
  label?: string
  value?: string
  disabled?: boolean
}

export default function GooglePlacesInput({
  onPlaceSelect,
  placeholder = "Enter your address",
  label = "Address",
  value = "",
  disabled = false
}: GooglePlacesInputProps) {
  const [inputValue, setInputValue] = useState(value)
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout>()

  // Mock Google Places API for now - will be replaced with real API
  const mockGooglePlaces = useCallback(async (query: string) => {
    if (!query || query.length < 3) return []
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Mock Houston-area addresses
    const mockSuggestions = [
      {
        description: `${query} Main St, Houston, TX, USA`,
        place_id: 'mock_1',
        structured_formatting: {
          main_text: `${query} Main St`,
          secondary_text: 'Houston, TX, USA'
        }
      },
      {
        description: `${query} Westheimer Rd, Houston, TX, USA`,
        place_id: 'mock_2',
        structured_formatting: {
          main_text: `${query} Westheimer Rd`,
          secondary_text: 'Houston, TX, USA'
        }
      },
      {
        description: `${query} Richmond Ave, Houston, TX, USA`,
        place_id: 'mock_3',
        structured_formatting: {
          main_text: `${query} Richmond Ave`,
          secondary_text: 'Houston, TX, USA'
        }
      }
    ]
    
    return mockSuggestions.filter(s => 
      s.description.toLowerCase().includes(query.toLowerCase())
    )
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    // Debounce search
    timeoutRef.current = setTimeout(async () => {
      if (newValue.length >= 3) {
        setIsLoading(true)
        try {
          const results = await mockGooglePlaces(newValue)
          setSuggestions(results)
          setShowSuggestions(true)
        } catch (error) {
          console.error('Error fetching places:', error)
          setSuggestions([])
        } finally {
          setIsLoading(false)
        }
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    }, 300)
  }

  const handleSuggestionClick = (suggestion: any) => {
    const addressParts = suggestion.description.split(', ')
    const streetAddress = addressParts[0] || ''
    const city = addressParts[1] || 'Houston'
    const stateZip = addressParts[2] || 'TX'
    const stateParts = stateZip.split(' ')
    const state = stateParts[0] || 'TX'
    const zipCode = stateParts[1] || ''

    const placeDetails: PlaceDetails = {
      address: streetAddress,
      city: city,
      state: state,
      zipCode: zipCode
    }

    setInputValue(suggestion.description)
    setShowSuggestions(false)
    onPlaceSelect(placeDetails)
  }

  const handleBlur = () => {
    // Delay hiding suggestions to allow for click
    setTimeout(() => setShowSuggestions(false), 200)
  }

  return (
    <div className="relative">
      <Label htmlFor="google-places-input" className="flex items-center gap-2">
        <MapPin className="h-4 w-4" />
        {label}
      </Label>
      <div className="relative">
        <Input
          id="google-places-input"
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full"
        />
        
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
            {suggestions.map((suggestion, index) => (
              <button
                key={suggestion.place_id || index}
                type="button"
                className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <div className="font-medium text-gray-900">
                  {suggestion.structured_formatting?.main_text || suggestion.description}
                </div>
                <div className="text-sm text-gray-500">
                  {suggestion.structured_formatting?.secondary_text || ''}
                </div>
              </button>
            ))}
          </div>
        )}
        
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600"></div>
          </div>
        )}
      </div>
      
      <p className="text-sm text-gray-500 mt-1">
        Start typing your address for suggestions
      </p>
    </div>
  )
} 