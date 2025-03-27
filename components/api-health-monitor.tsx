"use client"

import { useEffect, useState } from "react"
import { getApiHealthStatus, retryPendingSubmissions } from "@/lib/gohighlevel"
import { getPendingSubmissions } from "@/lib/form-fallback"
import { AlertTriangle, CheckCircle, RefreshCw } from "lucide-react"

export function ApiHealthMonitor() {
  const [apiStatus, setApiStatus] = useState({
    healthy: true,
    lastFailure: null as Date | null,
    consecutiveFailures: 0,
  })

  const [pendingCount, setPendingCount] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)
  const [showMonitor, setShowMonitor] = useState(false)

  // Only show for admins - this is a simple check that could be enhanced with proper auth
  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin") === "true"
    setShowMonitor(isAdmin)
  }, [])

  // Update status every 30 seconds
  useEffect(() => {
    if (!showMonitor) return

    const updateStatus = () => {
      setApiStatus(getApiHealthStatus())
      setPendingCount(getPendingSubmissions().length)
    }

    updateStatus()
    const interval = setInterval(updateStatus, 30000)

    return () => clearInterval(interval)
  }, [showMonitor])

  // Handle retry
  const handleRetry = async () => {
    if (isRetrying) return

    setIsRetrying(true)
    try {
      await retryPendingSubmissions()
      setPendingCount(getPendingSubmissions().length)
    } catch (error) {
      console.error("Error retrying submissions:", error)
    } finally {
      setIsRetrying(false)
    }
  }

  if (!showMonitor) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 p-4 rounded-lg shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 max-w-xs">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">API Status</h3>
        <button
          onClick={() => setShowMonitor(false)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ×
        </button>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex items-center">
          <div className="mr-2">
            {apiStatus.healthy ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-500" />
            )}
          </div>
          <div>
            <p>
              Status:{" "}
              <span className={apiStatus.healthy ? "text-green-500" : "text-red-500"}>
                {apiStatus.healthy ? "Healthy" : "Degraded"}
              </span>
            </p>
            {apiStatus.lastFailure && (
              <p className="text-gray-500">Last issue: {apiStatus.lastFailure.toLocaleTimeString()}</p>
            )}
          </div>
        </div>

        {pendingCount > 0 && (
          <div className="flex items-center justify-between">
            <p>Pending submissions: {pendingCount}</p>
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="flex items-center text-primary hover:text-primary/80 disabled:opacity-50"
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${isRetrying ? "animate-spin" : ""}`} />
              Retry
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

