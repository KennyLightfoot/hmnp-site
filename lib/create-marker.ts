/**
 * Creates a custom marker on a Google Map
 * @param map - The Google Map instance
 * @param position - The position (lat/lng) for the marker
 * @param options - Additional options for the marker
 * @returns The marker instance
 */
export function createMarker(
  map: any,
  position: { lat: number; lng: number },
  options: {
    title?: string
    color?: string
    label?: string
    icon?: string
  } = {},
) {
  const { title, color = "#FF0000", label, icon } = options

  // If a custom icon URL is provided, use it
  if (icon) {
    return new window.google.maps.Marker({
      position,
      map,
      title,
      icon,
      label,
    })
  }

  // Otherwise create a custom SVG marker
  const markerIcon = {
    path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
    fillColor: color,
    fillOpacity: 1,
    strokeWeight: 1,
    strokeColor: "#FFFFFF",
    scale: 1.5,
    anchor: new window.google.maps.Point(12, 22),
  }

  return new window.google.maps.Marker({
    position,
    map,
    title,
    icon: markerIcon,
    label,
  })
}

