"use client"

import { Button, type ButtonProps } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { useState } from "react"
import { toast } from "@/hooks/use-toast"

interface CacheButtonProps extends ButtonProps {
  path?: string
  cacheKey?: string
  clearAll?: boolean
  onSuccess?: () => void
}

export function CacheButton({ path, cacheKey, clearAll = false, onSuccess, children, ...props }: CacheButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    try {
      setIsLoading(true)

      if (path) {
        // Revalidate path
        const response = await fetch("/api/revalidate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ path }),
        })

        if (!response.ok) {
          throw new Error("Failed to revalidate path")
        }

        toast({
          title: "Success",
          description: `Path ${path} revalidated`,
        })
      } else if (cacheKey || clearAll) {
        // Clear cache
        const response = await fetch("/api/cache", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            key: cacheKey,
            clearAll,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to clear cache")
        }

        toast({
          title: "Success",
          description: clearAll ? "All cache cleared" : `Cache entry ${cacheKey} cleared`,
        })
      }

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleClick} disabled={isLoading} {...props}>
      {isLoading ? (
        <>
          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </>
      ) : (
        children
      )}
    </Button>
  )
}

