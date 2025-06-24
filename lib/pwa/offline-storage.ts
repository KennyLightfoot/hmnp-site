/**
 * Offline Storage System for PWA
 * Uses IndexedDB for client-side data persistence
 */

interface OfflineBooking {
  id: string
  signerName: string
  serviceName: string
  appointmentDate: string
  status: string
  location?: string
  notes?: string
  documents?: string[]
  lastSync: number
}

interface OfflineAction {
  id: string
  type: 'create' | 'update' | 'delete'
  entity: 'booking' | 'document' | 'user'
  data: any
  timestamp: number
  synced: boolean
}

class OfflineStorageManager {
  private dbName = 'hmnp-offline'
  private version = 1
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        resolve() // Server-side, skip initialization
        return
      }

      if (!window.indexedDB) {
        console.warn('IndexedDB not supported')
        resolve()
        return
      }

      const request = window.indexedDB.open(this.dbName, this.version)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create object stores
        if (!db.objectStoreNames.contains('bookings')) {
          const bookingsStore = db.createObjectStore('bookings', { keyPath: 'id' })
          bookingsStore.createIndex('status', 'status', { unique: false })
          bookingsStore.createIndex('appointmentDate', 'appointmentDate', { unique: false })
        }

        if (!db.objectStoreNames.contains('offlineActions')) {
          const actionsStore = db.createObjectStore('offlineActions', { keyPath: 'id' })
          actionsStore.createIndex('synced', 'synced', { unique: false })
          actionsStore.createIndex('timestamp', 'timestamp', { unique: false })
        }

        if (!db.objectStoreNames.contains('cachedData')) {
          db.createObjectStore('cachedData', { keyPath: 'key' })
        }
      }
    })
  }

  // Booking Management
  async saveBooking(booking: OfflineBooking): Promise<void> {
    if (!this.db) await this.init()
    if (!this.db) return

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['bookings'], 'readwrite')
      const store = transaction.objectStore('bookings')
      
      booking.lastSync = Date.now()
      const request = store.put(booking)
      
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getBookings(): Promise<OfflineBooking[]> {
    if (!this.db) await this.init()
    if (!this.db) return []

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['bookings'], 'readonly')
      const store = transaction.objectStore('bookings')
      const request = store.getAll()
      
      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => reject(request.error)
    })
  }

  async getBooking(id: string): Promise<OfflineBooking | null> {
    if (!this.db) await this.init()
    if (!this.db) return null

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['bookings'], 'readonly')
      const store = transaction.objectStore('bookings')
      const request = store.get(id)
      
      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => reject(request.error)
    })
  }

  // Offline Actions Queue
  async addOfflineAction(action: Omit<OfflineAction, 'id' | 'timestamp' | 'synced'>): Promise<void> {
    if (!this.db) await this.init()
    if (!this.db) return

    const fullAction: OfflineAction = {
      ...action,
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      synced: false
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineActions'], 'readwrite')
      const store = transaction.objectStore('offlineActions')
      const request = store.add(fullAction)
      
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getPendingActions(): Promise<OfflineAction[]> {
    if (!this.db) await this.init()
    if (!this.db) return []

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineActions'], 'readonly')
      const store = transaction.objectStore('offlineActions')
      const index = store.index('synced')
      const request = index.getAll(false)
      
      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => reject(request.error)
    })
  }

  async markActionSynced(actionId: string): Promise<void> {
    if (!this.db) await this.init()
    if (!this.db) return

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineActions'], 'readwrite')
      const store = transaction.objectStore('offlineActions')
      
      const getRequest = store.get(actionId)
      getRequest.onsuccess = () => {
        const action = getRequest.result
        if (action) {
          action.synced = true
          const putRequest = store.put(action)
          putRequest.onsuccess = () => resolve()
          putRequest.onerror = () => reject(putRequest.error)
        } else {
          resolve()
        }
      }
      getRequest.onerror = () => reject(getRequest.error)
    })
  }

  // Cache Management
  async cacheData(key: string, data: any, ttl?: number): Promise<void> {
    if (!this.db) await this.init()
    if (!this.db) return

    const cacheEntry = {
      key,
      data,
      timestamp: Date.now(),
      ttl: ttl || (24 * 60 * 60 * 1000) // Default 24 hours
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cachedData'], 'readwrite')
      const store = transaction.objectStore('cachedData')
      const request = store.put(cacheEntry)
      
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getCachedData(key: string): Promise<any | null> {
    if (!this.db) await this.init()
    if (!this.db) return null

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cachedData'], 'readonly')
      const store = transaction.objectStore('cachedData')
      const request = store.get(key)
      
      request.onsuccess = () => {
        const result = request.result
        if (!result) {
          resolve(null)
          return
        }

        // Check if cache is expired
        const isExpired = (Date.now() - result.timestamp) > result.ttl
        if (isExpired) {
          // Clean up expired cache
          this.deleteCachedData(key)
          resolve(null)
        } else {
          resolve(result.data)
        }
      }
      request.onerror = () => reject(request.error)
    })
  }

  async deleteCachedData(key: string): Promise<void> {
    if (!this.db) await this.init()
    if (!this.db) return

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cachedData'], 'readwrite')
      const store = transaction.objectStore('cachedData')
      const request = store.delete(key)
      
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  // Sync with server
  async syncWithServer(): Promise<{ success: boolean; syncedCount: number; errors: string[] }> {
    const pendingActions = await this.getPendingActions()
    const errors: string[] = []
    let syncedCount = 0

    for (const action of pendingActions) {
      try {
        // Attempt to sync action with server
        const success = await this.sendActionToServer(action)
        if (success) {
          await this.markActionSynced(action.id)
          syncedCount++
        }
      } catch (error) {
        errors.push(`Failed to sync action ${action.id}: ${error}`)
      }
    }

    return {
      success: errors.length === 0,
      syncedCount,
      errors
    }
  }

  private async sendActionToServer(action: OfflineAction): Promise<boolean> {
    if (typeof window === 'undefined') return false

    try {
      const response = await fetch('/api/sync/offline-actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(action)
      })

      return response.ok
    } catch (error) {
      console.error('Failed to send action to server:', error)
      return false
    }
  }

  // Storage info
  async getStorageInfo(): Promise<{
    bookingsCount: number
    pendingActionsCount: number
    cachedDataCount: number
    totalSize: number
  }> {
    if (!this.db) await this.init()
    if (!this.db) return { bookingsCount: 0, pendingActionsCount: 0, cachedDataCount: 0, totalSize: 0 }

    const bookings = await this.getBookings()
    const pendingActions = await this.getPendingActions()
    
    // Estimate total size (rough calculation)
    const totalSize = JSON.stringify({ bookings, pendingActions }).length

    return {
      bookingsCount: bookings.length,
      pendingActionsCount: pendingActions.length,
      cachedDataCount: 0, // Would need to count cached data entries
      totalSize
    }
  }

  // Clear all offline data
  async clearAllData(): Promise<void> {
    if (!this.db) await this.init()
    if (!this.db) return

    const stores = ['bookings', 'offlineActions', 'cachedData']
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(stores, 'readwrite')
      let completed = 0
      
      stores.forEach(storeName => {
        const store = transaction.objectStore(storeName)
        const request = store.clear()
        
        request.onsuccess = () => {
          completed++
          if (completed === stores.length) {
            resolve()
          }
        }
        request.onerror = () => reject(request.error)
      })
    })
  }
}

// Singleton instance
export const offlineStorage = new OfflineStorageManager()

// Initialize on client-side
if (typeof window !== 'undefined') {
  offlineStorage.init().catch(console.error)
}

// Hook for React components
export function useOfflineStorage() {
  return {
    storage: offlineStorage,
    isOnline: typeof window !== 'undefined' ? navigator.onLine : true
  }
}

export { OfflineStorageManager, type OfflineBooking, type OfflineAction } 