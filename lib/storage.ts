// This is a simplified storage utility that uses localStorage in the browser
// and a simple in-memory store on the server

// Simple in-memory store for server-side
const memoryStore = new Map<string, any>()

export async function getValue(key: string): Promise<any> {
  if (typeof window !== "undefined") {
    // Browser environment
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : null
  } else {
    // Server environment
    return memoryStore.get(key) || null
  }
}

export async function setValue(key: string, value: any): Promise<void> {
  if (typeof window !== "undefined") {
    // Browser environment
    localStorage.setItem(key, JSON.stringify(value))
  } else {
    // Server environment
    memoryStore.set(key, value)
  }
}

export async function deleteValue(key: string): Promise<void> {
  if (typeof window !== "undefined") {
    // Browser environment
    localStorage.removeItem(key)
  } else {
    // Server environment
    memoryStore.delete(key)
  }
}
