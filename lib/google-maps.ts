// Singleton pattern to ensure Google Maps API is loaded only once
let isLoading = false
let isLoaded = false
const callbacks: Array<() => void> = []

export async function loadGoogleMapsApi(): Promise<void> {
  // Return existing promise if already loaded or loading
  if (isLoaded) {
    return Promise.resolve()
  }

  // If already loading, return a promise that resolves when loaded
  if (isLoading) {
    return new Promise((resolve) => {
      callbacks.push(resolve)
    })
  }

  // Start loading
  isLoading = true

  return new Promise(async (resolve, reject) => {
    try {
      // Check if Google Maps API is already loaded
      if (typeof window !== "undefined" && window.google && window.google.maps) {
        isLoaded = true
        isLoading = false
        resolve()
        return
      }

      // Fetch API key from server
      const response = await fetch("/api/maps")
      const data = await response.json()
      const apiKey = data.apiKey

      if (!apiKey) {
        isLoading = false
        reject(new Error("Google Maps API key is missing"))
        return
      }

      // Define callback function
      const callbackName = `googleMapsCallback_${Date.now()}`
      window[callbackName] = () => {
        isLoaded = true
        isLoading = false
        resolve()
        // Call all waiting callbacks
        callbacks.forEach((callback) => callback())
        callbacks.length = 0
        // Clean up
        delete window[callbackName]
      }

      // Check if script is already in the document
      const existingScript = document.querySelector(`script[src*="maps.googleapis.com/maps/api/js"]`)
      if (existingScript) {
        // If script exists but Google isn't defined yet, wait for it to load
        const checkGoogleMaps = setInterval(() => {
          if (window.google && window.google.maps) {
            clearInterval(checkGoogleMaps)
            isLoaded = true
            isLoading = false
            resolve()
            // Call all waiting callbacks
            callbacks.forEach((callback) => callback())
            callbacks.length = 0
          }
        }, 100)
        return
      }

      // Load Google Maps API script
      const script = document.createElement("script")
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&callback=${callbackName}&loading=async`
      script.async = true
      script.defer = true

      script.onerror = (error) => {
        isLoading = false
        delete window[callbackName]
        reject(error)
      }

      document.head.appendChild(script)
    } catch (error) {
      isLoading = false
      reject(error)
    }
  })
}

// Check if Google Maps API is loaded
export function isGoogleMapsLoaded(): boolean {
  return typeof window !== "undefined" && !!window.google && !!window.google.maps
}

