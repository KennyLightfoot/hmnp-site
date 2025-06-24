'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Download, X, Smartphone, Zap, Wifi, Bell } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if app is already installed
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches
    const isIOSInstalled = (window.navigator as any).standalone === true
    
    if (isInStandaloneMode || isIOSInstalled) {
      setIsInstalled(true)
      return
    }

    // Listen for PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      
      // Show prompt after a short delay
      setTimeout(() => {
        setShowPrompt(true)
      }, 3000)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        setIsInstalled(true)
        setShowPrompt(false)
      }
      
      setDeferredPrompt(null)
    } catch (error) {
      console.error('PWA install error:', error)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    // Don't show again for 24 hours
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString())
  }

  // Don't show if already installed or recently dismissed
  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null
  }

  const dismissedTimestamp = localStorage.getItem('pwa-prompt-dismissed')
  if (dismissedTimestamp) {
    const dayAgo = Date.now() - (24 * 60 * 60 * 1000)
    if (parseInt(dismissedTimestamp) > dayAgo) {
      return null
    }
  }

  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:bottom-6 md:right-6 md:w-96 shadow-lg border-2 border-[#A52A2A] bg-white">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#002147] rounded-lg">
              <Smartphone className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Install HMNP App</CardTitle>
              <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                Recommended
              </Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <CardDescription className="mb-4">
          Get the full experience with our mobile app
        </CardDescription>
        
        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-[#A52A2A]" />
            <span>Faster access</span>
          </div>
          <div className="flex items-center gap-2">
            <Wifi className="h-4 w-4 text-[#A52A2A]" />
            <span>Works offline</span>
          </div>
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-[#A52A2A]" />
            <span>Push notifications</span>
          </div>
          <div className="flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-[#A52A2A]" />
            <span>Home screen icon</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={handleInstall}
            className="flex-1 bg-[#A52A2A] hover:bg-[#8B0000]"
          >
            <Download className="h-4 w-4 mr-2" />
            Install App
          </Button>
          <Button 
            variant="outline" 
            onClick={handleDismiss}
            className="px-4"
          >
            Not Now
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Compact version for header/navigation
export function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches
    const isIOSInstalled = (window.navigator as any).standalone === true
    
    if (isInStandaloneMode || isIOSInstalled) {
      setIsInstalled(true)
      return
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        setIsInstalled(true)
      }
      
      setDeferredPrompt(null)
    } catch (error) {
      console.error('PWA install error:', error)
    }
  }

  if (isInstalled || !deferredPrompt) {
    return null
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleInstall}
      className="hidden md:flex items-center gap-2"
    >
      <Download className="h-4 w-4" />
      Install App
    </Button>
  )
} 