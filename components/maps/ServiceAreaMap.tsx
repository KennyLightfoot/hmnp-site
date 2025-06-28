'use client'

import { useCallback, useState } from 'react'
import { GoogleMap, useJsApiLoader, Circle, Marker } from '@react-google-maps/api'
import { MapPin, Loader2 } from 'lucide-react'

interface ServiceAreaMapProps {
  showServiceAreaCircle?: boolean
  showBusinessMarker?: boolean
  zoom?: number
  height?: string
  className?: string
}

const mapContainerStyle = {
  width: '100%',
  height: '450px'
}

const center = {
  lat: 29.4052,
  lng: -94.9355
}

const serviceAreaOptions = {
  strokeColor: '#002147',
  strokeOpacity: 0.8,
  strokeWeight: 2,
  fillColor: '#002147',
  fillOpacity: 0.1,
}

const markerIcon = {
  url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="12" fill="#A52A2A" stroke="#fff" stroke-width="2"/>
      <circle cx="16" cy="16" r="6" fill="#fff"/>
    </svg>
  `),
  scaledSize: new google.maps.Size(32, 32),
  anchor: new google.maps.Point(16, 16),
}

export default function ServiceAreaMap({
  showServiceAreaCircle = true,
  showBusinessMarker = true,
  zoom = 9,
  height = '450px',
  className = ''
}: ServiceAreaMapProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null)

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places']
  })

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map)
  }, [])

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
            title="Houston Mobile Notary Pros - Texas City, TX 77591"
            icon={markerIcon}
            className="map-marker"
          />
        )}
        
        {showServiceAreaCircle && (
          <Circle
            center={center}
            radius={32186.9} // 20 miles in meters
            options={{
              ...serviceAreaOptions,
              className: 'service-area-circle'
            }}
          />
        )}
      </GoogleMap>
    </div>
  )
}