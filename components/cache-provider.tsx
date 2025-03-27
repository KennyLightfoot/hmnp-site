"use client"

import { createContext, useContext, type ReactNode } from "react"

// Define the context type
type CacheContextType = {
  registerKey: (key: string) => void
}

// Create the context with a default value
const CacheContext = createContext<CacheContextType>({
  registerKey: () => {},
})

// Custom hook to use the cache context
export function useCache() {
  return useContext(CacheContext)
}

// Server action to register a cache key
async function registerCacheKey(key: string) {
  try {
    // This is a client-side component, so we need to call an API endpoint
    await fetch("/api/register-cache-key", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ key }),
    })
  } catch (error) {
    console.error("Error registering cache key:", error)
  }
}

// Cache provider component
export function CacheProvider({ children }: { children: ReactNode }) {
  // Function to register a cache key
  const registerKey = (key: string) => {
    registerCacheKey(key).catch(console.error)
  }

  return <CacheContext.Provider value={{ registerKey }}>{children}</CacheContext.Provider>
}

