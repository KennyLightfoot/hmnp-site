"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { RefreshCw, Trash2, Search, AlertCircle } from "lucide-react"
import {
  revalidatePathAction,
  revalidateTagAction,
  clearCacheEntryAction,
  clearAllCacheAction,
} from "@/lib/revalidation"

export default function CacheManagementPage() {
  const [path, setPath] = useState("/")
  const [tag, setTag] = useState("")
  const [key, setKey] = useState("")
  const [message, setMessage] = useState("")
  const [isSuccess, setIsSuccess] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [cacheKeys, setCacheKeys] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  // Fetch cache keys on component mount
  useEffect(() => {
    fetchCacheKeys()
  }, [])

  // Filter cache keys based on search term
  const filteredCacheKeys = cacheKeys.filter((key) => key.toLowerCase().includes(searchTerm.toLowerCase()))

  async function fetchCacheKeys() {
    try {
      setIsLoading(true)
      const response = await fetch("/api/revalidate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch cache keys")
      }

      const data = await response.json()
      if (data.success && data.cacheKeys) {
        setCacheKeys(data.cacheKeys)
      }
    } catch (error) {
      console.error("Error fetching cache keys:", error)
      setMessage("Failed to fetch cache keys")
      setIsSuccess(false)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleRevalidatePath() {
    try {
      setIsLoading(true)
      const result = await revalidatePathAction(path)
      setMessage(result.message)
      setIsSuccess(result.success)
      if (result.success) {
        await fetchCacheKeys()
      }
    } catch (error) {
      console.error("Error revalidating path:", error)
      setMessage("Failed to revalidate path")
      setIsSuccess(false)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleRevalidateTag() {
    try {
      setIsLoading(true)
      const result = await revalidateTagAction(tag)
      setMessage(result.message)
      setIsSuccess(result.success)
      if (result.success) {
        await fetchCacheKeys()
      }
    } catch (error) {
      console.error("Error revalidating tag:", error)
      setMessage("Failed to revalidate tag")
      setIsSuccess(false)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleClearCacheEntry() {
    try {
      setIsLoading(true)
      const result = await clearCacheEntryAction(key)
      setMessage(result.message)
      setIsSuccess(result.success)
      if (result.success) {
        await fetchCacheKeys()
      }
    } catch (error) {
      console.error("Error clearing cache entry:", error)
      setMessage("Failed to clear cache entry")
      setIsSuccess(false)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleClearAllCache() {
    try {
      setIsLoading(true)
      const result = await clearAllCacheAction()
      setMessage(result.message)
      setIsSuccess(result.success)
      if (result.success) {
        await fetchCacheKeys()
      }
    } catch (error) {
      console.error("Error clearing all cache:", error)
      setMessage("Failed to clear all cache")
      setIsSuccess(false)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleClearSpecificCacheEntry(cacheKey: string) {
    try {
      setIsLoading(true)
      const result = await clearCacheEntryAction(cacheKey)
      setMessage(result.message)
      setIsSuccess(result.success)
      if (result.success) {
        await fetchCacheKeys()
      }
    } catch (error) {
      console.error("Error clearing cache entry:", error)
      setMessage("Failed to clear cache entry")
      setIsSuccess(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Cache Management</h1>

      {message && (
        <Alert className={`mb-6 ${isSuccess ? "bg-green-50" : "bg-red-50"}`}>
          <AlertCircle className={isSuccess ? "text-green-600" : "text-red-600"} />
          <AlertTitle>{isSuccess ? "Success" : "Error"}</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="revalidate">
        <TabsList className="mb-6">
          <TabsTrigger value="revalidate">Revalidate</TabsTrigger>
          <TabsTrigger value="cache-entries">Cache Entries</TabsTrigger>
        </TabsList>

        <TabsContent value="revalidate">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revalidate Path</CardTitle>
                <CardDescription>Revalidate a specific page or route</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="path">Path</Label>
                    <Input id="path" placeholder="/about" value={path} onChange={(e) => setPath(e.target.value)} />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleRevalidatePath} disabled={isLoading || !path} className="w-full">
                  {isLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Revalidating...
                    </>
                  ) : (
                    "Revalidate Path"
                  )}
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revalidate Tag</CardTitle>
                <CardDescription>Revalidate all pages with a specific cache tag</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="tag">Tag</Label>
                    <Input id="tag" placeholder="services" value={tag} onChange={(e) => setTag(e.target.value)} />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleRevalidateTag} disabled={isLoading || !tag} className="w-full">
                  {isLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Revalidating...
                    </>
                  ) : (
                    "Revalidate Tag"
                  )}
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Clear Cache Entry</CardTitle>
                <CardDescription>Clear a specific cache entry by key</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="key">Cache Key</Label>
                    <Input id="key" placeholder="services:all" value={key} onChange={(e) => setKey(e.target.value)} />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleClearCacheEntry}
                  disabled={isLoading || !key}
                  className="w-full"
                  variant="destructive"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Clearing...
                    </>
                  ) : (
                    "Clear Cache Entry"
                  )}
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Clear All Cache</CardTitle>
                <CardDescription>Clear all cache entries and revalidate important pages</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  This will clear all cache entries and revalidate the home page, services page, and blog page.
                </p>
              </CardContent>
              <CardFooter>
                <Button onClick={handleClearAllCache} disabled={isLoading} className="w-full" variant="destructive">
                  {isLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Clearing...
                    </>
                  ) : (
                    "Clear All Cache"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cache-entries">
          <Card>
            <CardHeader>
              <CardTitle>Cache Entries</CardTitle>
              <CardDescription>View and manage all cache entries</CardDescription>
              <div className="flex items-center space-x-2 mt-4">
                <Search className="h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search cache keys..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
                <Button variant="outline" size="sm" onClick={fetchCacheKeys} disabled={isLoading}>
                  <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {filteredCacheKeys.length > 0 ? (
                <div className="space-y-2">
                  {filteredCacheKeys.map((cacheKey) => (
                    <div key={cacheKey} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                      <span className="text-sm font-mono truncate flex-1">{cacheKey}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleClearSpecificCacheEntry(cacheKey)}
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {isLoading ? "Loading cache keys..." : "No cache keys found"}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

