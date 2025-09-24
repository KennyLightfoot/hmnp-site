'use client'

import { useCallback, useState } from 'react'
import { GoogleMap, Circle, Marker } from '@react-google-maps/api'
import { useGoogleMaps } from '@/lib/maps/googleMapsLoader'
import { MapPin, Loader2, Info } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'

interface ServiceAreaMapProps {
  showServiceAreaCircle?: boolean
  showBusinessMarker?: boolean
  showMultipleServiceAreas?: boolean
  selectedServiceType?: 'STANDARD_NOTARY' | 'EXTENDED_HOURS' | 'LOAN_SIGNING'
  onLocationSelect?: (location: { address: string; distance: number; isWithinServiceArea: boolean; travelFee: number }) => void
  zoom?: number
  height?: string
  className?: string
  showLegend?: boolean
}

const mapContainerStyle = {
  width: '100%',
  height: '450px'
}

// Service center coordinates (ZIP 77591 - Texas City, TX)
const center = {
  lat: 29.3838,
  lng: -94.9027
}

// SOP_ENHANCED.md service area configurations
const SERVICE_AREAS = {
  STANDARD: {
    radius: 24140.2, // 15 miles in meters
    strokeColor: '#22c55e',
    fillColor: '#22c55e',
    name: 'Standard Service Area (15 miles)'
  },
  EXTENDED: {
    radius: 32186.9, // 20 miles in meters
    strokeColor: '#3b82f6',
    fillColor: '#3b82f6',
    name: 'Extended Hours Service Area (20 miles)'
  },
  MAXIMUM: {
    radius: 80467.2, // 50 miles in meters
    strokeColor: '#f59e0b',
    fillColor: '#f59e0b',
    name: 'Maximum Service Area (50 miles)'
  }
}

const baseCircleOptions = {
  strokeOpacity: 0.8,
  strokeWeight: 2,
  fillOpacity: 0.1,
}


export default function ServiceAreaMap({
  showServiceAreaCircle = true,
  showBusinessMarker = true,
  showMultipleServiceAreas = false,
  selectedServiceType = 'STANDARD_NOTARY',
  onLocationSelect,
  zoom = 9,
  height = '450px',
  className = '',
  showLegend = false
}: ServiceAreaMapProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<any>(null)
  const [geocoder, setGeocoder] = useState<google.maps.Geocoder | null>(null)

  const { isLoaded, loadError } = useGoogleMaps()

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map)
    setGeocoder(new google.maps.Geocoder())
    
    // Add click handler for location selection
    if (onLocationSelect) {
      map.addListener('click', async (e: google.maps.MapMouseEvent) => {
        if (e.latLng && geocoder) {
          try {
            const response = await geocoder.geocode({ location: e.latLng })
            if (response.results[0]) {
              const address = response.results[0].formatted_address

              // Fetch distance information from server-side API to avoid bundling Redis in the client
              const apiRes = await fetch(`/api/maps/distance?address=${encodeURIComponent(address)}&serviceType=${selectedServiceType}`)
              const apiData = await apiRes.json()

              if (!apiData.success) {
                throw new Error(apiData.error || 'Distance API error')
              }

              const distanceMiles = apiData.miles as number

              const locationData = {
                address,
                distance: distanceMiles,
                isWithinServiceArea: apiData.withinServiceArea as boolean,
                travelFee: apiData.travelFee as number
              }
              
              setSelectedLocation(locationData)
              onLocationSelect(locationData)
              
              // Add marker for selected location using modern AdvancedMarkerElement
              if (google.maps.marker && google.maps.marker.AdvancedMarkerElement) {
                // Create a custom marker element
                const markerContent = document.createElement('div');
                markerContent.innerHTML = `
                  <svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 0C7.164 0 0 7.164 0 16c0 8.836 16 24 16 24s16-15.164 16-24c0-8.836-7.164-16-16-16z" fill="${locationData.isWithinServiceArea ? '#22c55e' : '#ef4444'}"/>
                    <circle cx="16" cy="16" r="8" fill="white"/>
                  </svg>
                `;
                markerContent.style.cursor = 'pointer';
                markerContent.title = `${address} - ${distanceMiles.toFixed(1)} miles`;

                new google.maps.marker.AdvancedMarkerElement({
                  position: e.latLng,
                  map,
                  content: markerContent,
                  title: `${address} - ${distanceMiles.toFixed(1)} miles`
                });
              } else {
                // Fallback to legacy Marker for older browsers
                new google.maps.Marker({
                  position: e.latLng,
                  map,
                  title: `${address} - ${distanceMiles.toFixed(1)} miles`,
                  icon: {
                    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                      <svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16 0C7.164 0 0 7.164 0 16c0 8.836 16 24 16 24s16-15.164 16-24c0-8.836-7.164-16-16-16z" fill="${locationData.isWithinServiceArea ? '#22c55e' : '#ef4444'}"/>
                        <circle cx="16" cy="16" r="8" fill="white"/>
                      </svg>
                    `)}`,
                    scaledSize: new google.maps.Size(32, 40),
                    anchor: new google.maps.Point(16, 40)
                  }
                });
              }
            }
          } catch (error) {
            console.error('Location selection failed:', error)
          }
        }
      })
    }
  }, [onLocationSelect, selectedServiceType, geocoder])

  const onUnmount = useCallback(() => {
    setMap(null)
  }, [])

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

  // Define marker icon only after Google Maps API has loaded
  const markerIcon = isLoaded ? {
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
    <div className={`map-container rounded-lg overflow-hidden shadow-md border border-gray-200 ${className}`}>
      <GoogleMap
        mapContainerStyle={customMapStyle}
        center={center}
        zoom={zoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
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
        {showBusinessMarker && (
          <Marker
            position={center}
            title="Houston Mobile Notary Pros - Service Center (ZIP 77591)"
            icon={markerIcon}
          />
        )}
        
        {/* Service Area Circles */}
        {showServiceAreaCircle && !showMultipleServiceAreas && (
          <Circle
            center={center}
            radius={SERVICE_AREAS[selectedServiceType === 'STANDARD_NOTARY' ? 'STANDARD' : 'EXTENDED'].radius}
            options={{
              ...baseCircleOptions,
              strokeColor: SERVICE_AREAS[selectedServiceType === 'STANDARD_NOTARY' ? 'STANDARD' : 'EXTENDED'].strokeColor,
              fillColor: SERVICE_AREAS[selectedServiceType === 'STANDARD_NOTARY' ? 'STANDARD' : 'EXTENDED'].fillColor
            }}
          />
        )}
        
        {/* Multiple Service Areas */}
        {showMultipleServiceAreas && (
          <>
            <Circle
              center={center}
              radius={SERVICE_AREAS.STANDARD.radius}
              options={{
                ...baseCircleOptions,
                strokeColor: SERVICE_AREAS.STANDARD.strokeColor,
                fillColor: SERVICE_AREAS.STANDARD.fillColor
              }}
            />
            <Circle
              center={center}
              radius={SERVICE_AREAS.EXTENDED.radius}
              options={{
                ...baseCircleOptions,
                strokeColor: SERVICE_AREAS.EXTENDED.strokeColor,
                fillColor: SERVICE_AREAS.EXTENDED.fillColor
              }}
            />
            <Circle
              center={center}
              radius={SERVICE_AREAS.MAXIMUM.radius}
              options={{
                ...baseCircleOptions,
                strokeColor: SERVICE_AREAS.MAXIMUM.strokeColor,
                fillColor: SERVICE_AREAS.MAXIMUM.fillColor
              }}
            />
          </>
        )}
      </GoogleMap>
      
      {/* Service Area Legend */}
      {showLegend && (
        <div className="mt-4 space-y-2">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Service Areas
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span className="text-xs">Standard (15 mi) - No travel fee</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-500"></div>
              <span className="text-xs">Extended (20 mi) - Travel fee may apply</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-amber-500"></div>
              <span className="text-xs">Maximum (50 mi) - Travel fee applies</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Selected Location Info */}
      {selectedLocation && (
        <Alert className="mt-4">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <div><strong>Selected:</strong> {selectedLocation.address}</div>
              <div><strong>Distance:</strong> {selectedLocation.distance.toFixed(1)} miles</div>
              {selectedLocation.travelFee > 0 && (
                <div><strong>Travel Fee:</strong> ${selectedLocation.travelFee.toFixed(2)}</div>
              )}
              <Badge variant={selectedLocation.isWithinServiceArea ? "default" : "destructive"}>
                {selectedLocation.isWithinServiceArea ? "Within Service Area" : "Outside Service Area"}
              </Badge>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}