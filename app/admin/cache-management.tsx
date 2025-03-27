"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getAllCacheKeys, revalidateCacheKey, revalidatePath, clearAllCache } from "@/lib/revalidation"

export default function CacheManagement() {
  const [cacheKeys, setCacheKeys] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    loadCacheKeys()
  }, [])

  async function loadCacheKeys() {
    setLoading(true)
    const keys = await getAllCacheKeys()
    setCacheKeys(keys)
    setLoading(false)
  }

  async function handleRevalidateKey(key: string) {
    setLoading(true)
    setMessage(`Revalidating ${key}...`)

    const success = await revalidateCacheKey(key)

    setMessage(success ? `Successfully revalidated ${key}` : `Failed to revalidate ${key}`)
    setLoading(false)

    // Reload cache keys
    await loadCacheKeys()
  }

  async function handleRevalidatePath(path: string) {
    setLoading(true)
    setMessage(`Revalidating path ${path}...`)

    const success = await revalidatePath(path)

    setMessage(success ? `Successfully revalidated path ${path}` : `Failed to revalidate path ${path}`)
    setLoading(false)
  }

  async function handleClearAllCache() {
    if (!confirm("Are you sure you want to clear all cache?")) return

    setLoading(true)
    setMessage("Clearing all cache...")

    const success = await clearAllCache()

    setMessage(success ? "Successfully cleared all cache" : "Failed to clear all cache")
    setLoading(false)

    // Reload cache keys
    await loadCacheKeys()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cache Management</CardTitle>
        <CardDescription>Manage and revalidate cached data</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => handleRevalidatePath("/")} disabled={loading} variant="outline">
              Revalidate Home Page
            </Button>
            <Button onClick={() => handleRevalidatePath("/services")} disabled={loading} variant="outline">
              Revalidate Services
            </Button>
            <Button onClick={() => handleRevalidatePath("/blog")} disabled={loading} variant="outline">
              Revalidate Blog
            </Button>
            <Button onClick={handleClearAllCache} disabled={loading} variant="destructive">
              Clear All Cache
            </Button>
            <Button onClick={loadCacheKeys} disabled={loading} variant="secondary">
              Refresh Cache Keys
            </Button>
          </div>

          {message && <div className="p-2 bg-muted rounded text-sm">{message}</div>}

          <div>
            <h3 className="text-lg font-medium mb-2">Cache Keys ({cacheKeys.length})</h3>
            {loading ? (
              <div>Loading...</div>
            ) : (
              <div className="max-h-96 overflow-y-auto border rounded p-2">
                {cacheKeys.length === 0 ? (
                  <div className="text-muted-foreground">No cache keys found</div>
                ) : (
                  <ul className="space-y-1">
                    {cacheKeys.map((key) => (
                      <li key={key} className="flex items-center justify-between text-sm p-1 hover:bg-muted rounded">
                        <span className="font-mono">{key}</span>
                        <Button onClick={() => handleRevalidateKey(key)} size="sm" variant="ghost">
                          Revalidate
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

