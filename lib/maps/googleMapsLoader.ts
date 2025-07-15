import { useJsApiLoader } from '@react-google-maps/api'

export const MAPS_LIBRARIES = ['places'] as const

export function useGoogleMaps() {
  return useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: MAPS_LIBRARIES as unknown as undefined
  })
} 