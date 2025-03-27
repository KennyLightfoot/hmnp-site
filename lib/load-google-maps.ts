let isLoading = false
let isLoaded = false
let callbacks: Array<() => void> = []

export function loadGoogleMapsScript(apiKey: string): Promise<void> {
  // Return existing promise if already loaded
  if (isLoaded) {
    return Promise.resolve()
  }

  // Return existing promise if loading
  if (isLoading) {
    return new Promise<void>((resolve) => {
      callbacks.push(resolve)
    })
  }

  isLoading = true

  return new Promise<void>((resolve, reject) => {
    // Create script element
    const script = document.createElement("script")
    script.id = "google-maps-script"
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
    script.async = true
    script.defer = true

    // Handle script load success
    script.onload = () => {
      isLoaded = true
      isLoading = false
      callbacks.forEach((callback) => callback())
      callbacks = []
      resolve()
    }

    // Handle script load error
    script.onerror = () => {
      isLoading = false
      reject(new Error("Failed to load Google Maps API"))
    }

    // Add script to document
    document.head.appendChild(script)
  })
}

export function isGoogleMapsLoaded(): boolean {
  return isLoaded
}

