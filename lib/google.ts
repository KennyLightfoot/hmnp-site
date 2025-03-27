export const google =
  typeof window !== "undefined" && window.google
    ? window.google
    : {
        maps: {
          Geocoder: class {},
          GeocoderStatus: { OK: "OK" },
          LatLng: class {
            constructor(lat: number, lng: number) {
              this.lat = lat
              this.lng = lng
            }
          },
          Map: class {},
          Marker: class {
            constructor(options: any) {}
          },
          places: {
            Autocomplete: class {
              constructor(inputField: any, options: any) {}
              addListener(event: string, callback: () => void) {}
              getPlace() {
                return { formatted_address: "", geometry: { location: { lat: 0, lng: 0 } } }
              }
            },
          },
          event: {
            clearInstanceListeners: () => {},
          },
          geometry: {
            spherical: {
              computeDistanceBetween: () => 0,
            },
          },
        },
      }

