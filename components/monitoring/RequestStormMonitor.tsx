'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Activity, TrendingUp, TrendingDown, Zap } from 'lucide-react'

interface RequestStats {
  endpoint: string
  count: number
  lastCall: Date
  averageInterval: number
  status: 'normal' | 'warning' | 'critical'
  errorCount: number
  successCount: number
}

interface GlobalStats {
  totalRequests: number
  requestsPerMinute: number
  activeEndpoints: number
  criticalEndpoints: number
  topEndpoint: string
}

export default function RequestStormMonitor() {
  const [stats, setStats] = useState<RequestStats[]>([])
  const [globalStats, setGlobalStats] = useState<GlobalStats>({
    totalRequests: 0,
    requestsPerMinute: 0,
    activeEndpoints: 0,
    criticalEndpoints: 0,
    topEndpoint: ''
  })
  const [isVisible, setIsVisible] = useState(false)
  const [autoHide, setAutoHide] = useState(true)

  useEffect(() => {
    // Show monitor in development or when explicitly enabled
    const isDev = process.env.NODE_ENV === 'development'
    const showMonitor = localStorage.getItem('show-request-monitor') === 'true'
    const hasAlerts = localStorage.getItem('request-alerts') === 'true'
    setIsVisible(isDev || showMonitor || hasAlerts)
  }, [])

  useEffect(() => {
    if (!isVisible) return

    // Monitor global fetch override for stats
    const originalFetch = window.fetch
    const requestTracker = new Map<string, { calls: Date[], errors: number, successes: number }>()

    window.fetch = function(...args) {
      const url = args[0]?.toString() || 'unknown'
      const endpoint = new URL(url, window.location.origin).pathname
      
      // Track the request
      if (!requestTracker.has(endpoint)) {
        requestTracker.set(endpoint, { calls: [], errors: 0, successes: 0 })
      }
      
      const tracker = requestTracker.get(endpoint)!
      tracker.calls.push(new Date())
      
      // Keep only last 10 minutes of calls
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000)
      tracker.calls = tracker.calls.filter(call => call > tenMinutesAgo)

      return originalFetch.apply(this, args).then(
        response => {
          if (response.ok) {
            tracker.successes++
          } else {
            tracker.errors++
          }
          return response
        },
        error => {
          tracker.errors++
          throw error
        }
      )
    }

    // Update stats every 2 seconds
    const interval = setInterval(() => {
      const now = new Date()
      const oneMinuteAgo = new Date(now.getTime() - 60 * 1000)
      const requestStats: RequestStats[] = []
      let totalRequests = 0
      let requestsLastMinute = 0

      for (const [endpoint, tracker] of requestTracker.entries()) {
        if (tracker.calls.length === 0) continue

        const recentCalls = tracker.calls.filter(call => call > oneMinuteAgo)
        const allCallsLastMinute = tracker.calls.filter(call => call > oneMinuteAgo).length
        
        requestsLastMinute += allCallsLastMinute
        totalRequests += tracker.calls.length

        if (tracker.calls.length > 0) {
          const intervals = []
          for (let i = 1; i < tracker.calls.length; i++) {
            intervals.push(tracker.calls[i].getTime() - tracker.calls[i-1].getTime())
          }
          const averageInterval = intervals.length > 0 
            ? intervals.reduce((a, b) => a + b, 0) / intervals.length 
            : 0

          // Determine status
          let status: 'normal' | 'warning' | 'critical' = 'normal'
          if (recentCalls.length > 20) status = 'critical'  // > 20 calls/minute
          else if (recentCalls.length > 10) status = 'warning'  // > 10 calls/minute
          else if (averageInterval < 1000 && tracker.calls.length > 5) status = 'warning'  // < 1 second apart

          requestStats.push({
            endpoint,
            count: tracker.calls.length,
            lastCall: tracker.calls[tracker.calls.length - 1],
            averageInterval,
            status,
            errorCount: tracker.errors,
            successCount: tracker.successes
          })
        }
      }

      // Sort by most recent activity
      requestStats.sort((a, b) => b.lastCall.getTime() - a.lastCall.getTime())

      setStats(requestStats.slice(0, 20)) // Show top 20

      // Update global stats
      const criticalCount = requestStats.filter(s => s.status === 'critical').length
      const topEndpoint = requestStats.length > 0 ? requestStats[0].endpoint : ''

      setGlobalStats({
        totalRequests,
        requestsPerMinute: requestsLastMinute,
        activeEndpoints: requestStats.length,
        criticalEndpoints: criticalCount,
        topEndpoint
      })

      // Auto-hide if everything is normal and auto-hide is enabled
      if (autoHide && criticalCount === 0 && requestsLastMinute < 30) {
        setIsVisible(false)
      }

      // Show alert if critical
      if (criticalCount > 0 || requestsLastMinute > 100) {
        setIsVisible(true)
        localStorage.setItem('request-alerts', 'true')
      }

    }, 2000)

    return () => {
      clearInterval(interval)
      window.fetch = originalFetch
    }
  }, [isVisible, autoHide])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-red-500'
      case 'warning': return 'bg-yellow-500'
      default: return 'bg-green-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical': return <AlertTriangle className="h-4 w-4" />
      case 'warning': return <TrendingUp className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  const formatInterval = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`
    return `${(ms / 1000).toFixed(1)}s`
  }

  if (!isVisible) return null

  const hasAlerts = globalStats.criticalEndpoints > 0 || globalStats.requestsPerMinute > 100

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-md">
      <Card className={`shadow-lg ${hasAlerts ? 'border-red-500' : 'border-gray-200'}`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center space-x-2">
              {hasAlerts ? (
                <AlertTriangle className="h-4 w-4 text-red-500" />
              ) : (
                <Activity className="h-4 w-4 text-green-500" />
              )}
              <span>Request Monitor</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant={hasAlerts ? 'destructive' : 'secondary'}>
                {globalStats.requestsPerMinute}/min
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVisible(false)}
              >
                ×
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {/* Global Stats */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-500">Endpoints:</span>
              <span className="ml-1 font-mono">{globalStats.activeEndpoints}</span>
            </div>
            <div>
              <span className="text-gray-500">Critical:</span>
              <span className={`ml-1 font-mono ${globalStats.criticalEndpoints > 0 ? 'text-red-600' : ''}`}>
                {globalStats.criticalEndpoints}
              </span>
            </div>
          </div>

          {/* Top Endpoints */}
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {stats.slice(0, 8).map((stat, index) => (
              <div key={stat.endpoint} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(stat.status)}`} />
                  <span className="truncate font-mono text-xs">{stat.endpoint}</span>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <span className="text-gray-500">{stat.count}</span>
                  <span className="text-gray-400">
                    {formatInterval(stat.averageInterval)}
                  </span>
                  {stat.errorCount > 0 && (
                    <span className="text-red-500">E:{stat.errorCount}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between border-t pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAutoHide(!autoHide)}
              className="text-xs"
            >
              Auto-hide: {autoHide ? 'On' : 'Off'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                localStorage.removeItem('request-alerts')
                setStats([])
              }}
              className="text-xs"
            >
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}