'use client'

import { useCallback, useState, useRef, useEffect } from 'react'
import { GoogleMap, useJsApiLoader, Circle, Marker, Autocomplete } from '@react-google-maps/api'
import { MapPin, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { UnifiedDistanceService } from '@/lib/maps/unified-distance-service'

interface BookingLocationMapProps {
  onLocationSelect?: (location: {
    address: string
    coordinates: { lat: number; lng: number }
    distance: number
    travelFee: number
    isWithinServiceArea: boolean
  }) => void
  defaultAddress?: string
  height?: string
  className?: string
}

const mapContainerStyle = {
  width: '100%',
  height: '400px'
}

const businessCenter = {
  lat: 29.4052,
  lng: -94.9355
}

const serviceAreaOptions = {
  strokeColor: '#002147',
  strokeOpacity: 0.6,
  strokeWeight: 2,
  fillColor: '#002147',
  fillOpacity: 0.08,
}

// Stable reference for libraries to prevent reload issues
const MAPS_LIBRARIES = ['places']


export default function BookingLocationMap({
  onLocationSelect,
  defaultAddress = '',
  height = '400px',
  className = ''
}: BookingLocationMapProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [customerLocation, setCustomerLocation] = useState<google.maps.LatLng | null>(null)
  const [address, setAddress] = useState(defaultAddress)
  const [isCalculating, setIsCalculating] = useState(false)
  const [locationInfo, setLocationInfo] = useState<{
    distance: number
    travelFee: number
    isWithinServiceArea: boolean
  } | null>(null)
  
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: MAPS_LIBRARIES
  })

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map)
  }, [])

  const onUnmount = useCallback(() => {
    setMap(null)
  }, [])

  const onAutocompleteLoad = useCallback((autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete
  }, [])

  const onPlaceChanged = useCallback(async () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace()
      
      if (place.geometry?.location) {
        const location = place.geometry.location
        const newAddress = place.formatted_address || place.name || ''
        
        setCustomerLocation(location)
        setAddress(newAddress)
        setIsCalculating(true)

        // Fit map to show both locations
        if (map) {
          const bounds = new google.maps.LatLngBounds()
          bounds.extend(businessCenter)
          bounds.extend(location)
          map.fitBounds(bounds)
        }

        try {
          // Calculate distance and travel fee
          const distanceResult = await UnifiedDistanceService.calculateDistance(newAddress)
          const travelFee = UnifiedDistanceService.calculateTravelFee(distanceResult.distance.miles)
          
          const locationData = {
            distance: distanceResult.distance.miles,
            travelFee,
            isWithinServiceArea: distanceResult.isWithinServiceArea
          }
          
          setLocationInfo(locationData)
          
          // Notify parent component
          if (onLocationSelect) {
            onLocationSelect({
              address: newAddress,
              coordinates: {
                lat: location.lat(),
                lng: location.lng()
              },
              ...locationData
            })
          }
        } catch (error) {
          console.error('Error calculating distance:', error)
        } finally {
          setIsCalculating(false)
        }
      }
    }
  }, [map, onLocationSelect])

  const customMapStyle = {
    ...mapContainerStyle,
    height
  }

  if (loadError) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`} style={{ height }}>
        <div className="text-center p-8">
          <MapPin className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          <p className="text-gray-600">Unable to load map</p>
          <p className="text-sm text-gray-500">Please check your connection</p>
        </div>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className={`map-loading ${className}`} style={{ height }}>
        <div className="text-center p-4 md:p-8">
          <Loader2 className="mx-auto h-6 w-6 md:h-8 md:w-8 text-[#002147] animate-spin mb-2" />
          <p className="text-gray-600 text-sm md:text-base">Loading map...</p>
        </div>
      </div>
    )
  }

  // Define marker icons only after Google Maps API has loaded
  const businessMarkerIcon = isLoaded ? {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="12" fill="#002147" stroke="#fff" stroke-width="2"/>
        <circle cx="16" cy="16" r="6" fill="#fff"/>
      </svg>
    `)}`,
    scaledSize: new google.maps.Size(32, 32),
    anchor: new google.maps.Point(16, 16),
  } : undefined

  const customerMarkerIcon = isLoaded ? {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="12" fill="#A52A2A" stroke="#fff" stroke-width="2"/>
        <circle cx="16" cy="16" r="6" fill="#fff"/>
      </svg>
    `)}`,
    scaledSize: new google.maps.Size(32, 32),
    anchor: new google.maps.Point(16, 16),
  } : undefined

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Address Input */}
      <div className="space-y-2">
        <label htmlFor="booking-address-input" className="text-sm font-medium text-gray-700">
          Service Address
        </label>
        <Autocomplete
          onLoad={onAutocompleteLoad}
          onPlaceChanged={onPlaceChanged}
          restrictions={{ country: 'us' }}
          fields={['formatted_address', 'geometry', 'name']}
        >
          <Input
            id="booking-address-input"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter your address..."
            className="w-full"
            aria-describedby="address-help"
          />
        </Autocomplete>
        <p id="address-help" className="text-xs text-gray-500">
          Enter your address to calculate distance and travel fees
        </p>
      </div>

      {/* Location Information */}
      {locationInfo && (
        <div className={`p-4 rounded-lg border ${
          locationInfo.isWithinServiceArea 
            ? 'bg-green-50 border-green-200' 
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-start space-x-3">
            {locationInfo.isWithinServiceArea ? (
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            )}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">
                  Distance: {locationInfo.distance.toFixed(1)} miles
                </span>
                {isCalculating && (
                  <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                )}
              </div>
              {locationInfo.travelFee > 0 ? (
                <p className="text-sm text-gray-600 mt-1">
                  Travel fee: <span className="font-medium">${locationInfo.travelFee.toFixed(2)}</span>
                  <span className="text-xs text-gray-500 ml-1">
                    ($0.50/mile beyond 20-mile radius)
                  </span>
                </p>
              ) : (
                <p className="text-sm text-green-600 mt-1">
                  No travel fee - within 20-mile service area
                </p>
              )}
              {!locationInfo.isWithinServiceArea && (
                <p className="text-sm text-yellow-700 mt-2">
                  Location is beyond our standard 50-mile service area. Please contact us for special arrangements.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Map */}
      <div className="map-container rounded-lg overflow-hidden shadow-md border border-gray-200">
        <GoogleMap
          mapContainerStyle={customMapStyle}
          center={businessCenter}
          zoom={9}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={{
            disableDefaultUI: false,
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
            gestureHandling: 'cooperative',
            styles: [
              {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
              }
            ]
          }}
        >
          {/* Business Location Marker */}
          <Marker
            position={businessCenter}
            title="Houston Mobile Notary Pros - Texas City, TX 77591"
            icon={businessMarkerIcon}
            className="map-marker"
          />
          
          {/* Service Area Circle */}
          <Circle
            center={businessCenter}
            radius={32186.9} // 20 miles in meters
            options={{
              ...serviceAreaOptions,
              className: 'service-area-circle'
            }}
          />

          {/* Customer Location Marker */}
          {customerLocation && (
            <Marker
              position={{
                lat: customerLocation.lat(),
                lng: customerLocation.lng()
              }}
              title="Your Location"
              icon={customerMarkerIcon}
              className="map-marker"
            />
          )}
        </GoogleMap>
      </div>
    </div>
  )
}