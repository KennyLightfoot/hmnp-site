'use client'

import { useEffect, useState } from 'react'

declare global {
  interface Window {
    fbq: any;
    gtag: any;
    lintrk: any;
    dataLayer: any[];
  }
}

interface ScriptStatus {
  name: string
  loaded: boolean
  error?: string
  lastChecked: Date
}

export default function ThirdPartyScriptMonitor() {
  const [scriptStatuses, setScriptStatuses] = useState<ScriptStatus[]>([])
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const checkScripts = () => {
      const statuses: ScriptStatus[] = []
      const now = new Date()

      // Check Meta Pixel
      try {
        if (typeof window.fbq === 'function') {
          statuses.push({
            name: 'Meta Pixel',
            loaded: true,
            lastChecked: now
          })
        } else {
          statuses.push({
            name: 'Meta Pixel',
            loaded: false,
            error: 'fbq function not available',
            lastChecked: now
          })
        }
      } catch (error) {
        statuses.push({
          name: 'Meta Pixel',
          loaded: false,
          error: `Error: ${error}`,
          lastChecked: now
        })
      }

      // Check Google Analytics
      try {
        if (typeof window.gtag === 'function') {
          statuses.push({
            name: 'Google Analytics',
            loaded: true,
            lastChecked: now
          })
        } else {
          statuses.push({
            name: 'Google Analytics',
            loaded: false,
            error: 'gtag function not available',
            lastChecked: now
          })
        }
      } catch (error) {
        statuses.push({
          name: 'Google Analytics',
          loaded: false,
          error: `Error: ${error}`,
          lastChecked: now
        })
      }

      // Check Google Tag Manager
      try {
        if (window.dataLayer && Array.isArray(window.dataLayer)) {
          statuses.push({
            name: 'Google Tag Manager',
            loaded: true,
            lastChecked: now
          })
        } else {
          statuses.push({
            name: 'Google Tag Manager',
            loaded: false,
            error: 'dataLayer not available',
            lastChecked: now
          })
        }
      } catch (error) {
        statuses.push({
          name: 'Google Tag Manager',
          loaded: false,
          error: `Error: ${error}`,
          lastChecked: now
        })
      }

      // Check LinkedIn Insight Tag
      try {
        if (typeof window.lintrk === 'function') {
          statuses.push({
            name: 'LinkedIn Insight',
            loaded: true,
            lastChecked: now
          })
        } else {
          statuses.push({
            name: 'LinkedIn Insight',
            loaded: false,
            error: 'lintrk function not available',
            lastChecked: now
          })
        }
      } catch (error) {
        statuses.push({
          name: 'LinkedIn Insight',
          loaded: false,
          error: `Error: ${error}`,
          lastChecked: now
        })
      }

      // Check Service Worker
      try {
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistration('/sw.js').then(registration => {
            const swStatus: ScriptStatus = {
              name: 'Service Worker',
              loaded: !!registration,
              error: registration ? undefined : 'Not registered',
              lastChecked: now
            }
            setScriptStatuses(prev => {
              const filtered = prev.filter(s => s.name !== 'Service Worker')
              return [...filtered, swStatus]
            })
          })
        } else {
          statuses.push({
            name: 'Service Worker',
            loaded: false,
            error: 'Service Worker not supported',
            lastChecked: now
          })
        }
      } catch (error) {
        statuses.push({
          name: 'Service Worker',
          loaded: false,
          error: `Error: ${error}`,
          lastChecked: now
        })
      }

      setScriptStatuses(statuses)
    }

    // Initial check
    checkScripts()

    // Check periodically
    const interval = setInterval(checkScripts, 30000) // Every 30 seconds

    return () => clearInterval(interval)
  }, [])

  // Only show in development or when explicitly enabled
  useEffect(() => {
    const isDev = process.env.NODE_ENV === 'development'
    const showMonitor = localStorage.getItem('show-script-monitor') === 'true'
    setIsVisible(isDev || showMonitor)
  }, [])

  if (!isVisible) return null

  const allLoaded = scriptStatuses.every(status => status.loaded)
  const hasErrors = scriptStatuses.some(status => status.error)

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-800">Third-Party Scripts</h3>
        <div className={`w-3 h-3 rounded-full ${allLoaded ? 'bg-green-500' : hasErrors ? 'bg-red-500' : 'bg-yellow-500'}`} />
      </div>
      
      <div className="space-y-2 text-xs">
        {scriptStatuses.map((status) => (
          <div key={status.name} className="flex items-center justify-between">
            <span className="text-gray-600">{status.name}</span>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${status.loaded ? 'bg-green-500' : 'bg-red-500'}`} />
              {status.error && (
                <span className="text-red-600 text-xs" title={status.error}>⚠️</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-2 border-t border-gray-100 text-xs text-gray-500">
        Last checked: {scriptStatuses[0]?.lastChecked.toLocaleTimeString()}
      </div>

      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-1 right-1 text-gray-400 hover:text-gray-600 text-xs"
      >
        ×
      </button>
    </div>
  )
}