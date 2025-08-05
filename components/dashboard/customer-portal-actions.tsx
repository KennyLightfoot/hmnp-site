'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,  
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { 
  MoreVertical, 
  CreditCard, 
  Bell, 
  Download, 
  Settings,
  Smartphone,
  Check,
  X
} from 'lucide-react'
import { toast } from 'sonner'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export function CustomerPortalActions() {
  const [showNotificationDialog, setShowNotificationDialog] = useState(false)
  const [showPWADialog, setShowPWADialog] = useState(false)
  const [pushPermission, setPushPermission] = useState<NotificationPermission>('default')
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [pushEnabled, setPushEnabled] = useState(false)

  useEffect(() => {
    // Check notification permission
    if ('Notification' in window) {
      setPushPermission(Notification.permission)
      
      // Check if push notifications are already enabled (disabled to prevent 404 errors)
      // if ('serviceWorker' in navigator && 'PushManager' in window) {
      //   navigator.serviceWorker.ready.then(registration => {
      //     registration.pushManager.getSubscription().then(subscription => {
      //       setPushEnabled(!!subscription)
      //     })
      //   })
      // }
    }

    // Listen for PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleStripeCustomerPortal = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/stripe/customer-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (response.ok) {
        const { url } = await response.json()
        window.open(url, '_blank')
      } else {
        throw new Error('Failed to create customer portal session')
      }
    } catch (error) {
      toast.error('Unable to open billing portal. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePushNotificationToggle = async (enabled: boolean) => {
    if (!('Notification' in window)) {
      toast.error('Push notifications are not supported in this browser')
      return
    }

    if (enabled) {
      // Request permission
      const permission = await Notification.requestPermission()
      setPushPermission(permission)
      
      if (permission === 'granted') {
        try {
          // Subscribe to push notifications (disabled to prevent 404 errors)
          // const registration = await navigator.serviceWorker.ready
          // const subscription = await registration.pushManager.subscribe({
          //   userVisibleOnly: true,
          //   applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
          // })
          
          // Temporarily disable push notifications
          toast.error('Push notifications are temporarily disabled')
          return

          // Send subscription to server
          const response = await fetch('/api/push/subscribe', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(subscription)
          })

          if (response.ok) {
            setPushEnabled(true)
            toast.success('Push notifications enabled!')
          } else {
            throw new Error('Failed to save subscription')
          }
        } catch (error) {
          toast.error('Failed to enable push notifications')
        }
      } else {
        toast.error('Permission denied for push notifications') 
      }
    } else {
      try {
        // Unsubscribe from push notifications (disabled to prevent 404 errors)
        // const registration = await navigator.serviceWorker.ready
        // const subscription = await registration.pushManager.getSubscription()
        
        // Temporarily disable push notifications
        toast.error('Push notifications are temporarily disabled')
        return
        
        if (subscription) {
          await subscription.unsubscribe()
          
          // Remove subscription from server
          await fetch('/api/push/unsubscribe', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ endpoint: subscription.endpoint })
          })
        }

        setPushEnabled(false)
        toast.success('Push notifications disabled')
      } catch (error) {
        toast.error('Failed to disable push notifications')
      }
    }
  }

  const handlePWAInstall = async () => {
    if (!deferredPrompt) {
      toast.error('App is already installed or not installable')
      return
    }

    try {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        toast.success('App installed successfully!')
        setDeferredPrompt(null)
      }
    } catch (error) {
      toast.error('Failed to install app')
    }
    
    setShowPWADialog(false)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Account</DropdownMenuLabel>
          <DropdownMenuItem onClick={handleStripeCustomerPortal} disabled={isLoading}>
            <CreditCard className="mr-2 h-4 w-4" />
            Billing & Receipts
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Settings</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setShowNotificationDialog(true)}>
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </DropdownMenuItem>
          {deferredPrompt && (
            <DropdownMenuItem onClick={() => setShowPWADialog(true)}>
              <Smartphone className="mr-2 h-4 w-4" />
              Install App
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Push Notification Settings Dialog */}
      <Dialog open={showNotificationDialog} onOpenChange={setShowNotificationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Notification Settings</DialogTitle>
            <DialogDescription>
              Manage your push notification preferences for booking updates and reminders.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="push-notifications">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive booking updates and reminders
                </p>
              </div>
              <Switch
                id="push-notifications"
                checked={pushEnabled}
                onCheckedChange={handlePushNotificationToggle}
                disabled={pushPermission === 'denied'}
              />
            </div>
            {pushPermission === 'denied' && (
              <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                <p className="flex items-center gap-2">
                  <X className="h-4 w-4 text-destructive" />
                  Push notifications are blocked. Enable them in your browser settings to receive updates.
                </p>
              </div>
            )}
            {pushPermission === 'granted' && pushEnabled && (
              <div className="text-sm text-muted-foreground bg-green-50 p-3 rounded-md">
                <p className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  Push notifications are enabled. You'll receive booking updates and reminders.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNotificationDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PWA Install Dialog */}
      <Dialog open={showPWADialog} onOpenChange={setShowPWADialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Install App</DialogTitle>
            <DialogDescription>
              Install Houston Mobile Notary Pros as an app for quick access and offline features.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-md">
              <h4 className="font-medium mb-2">Benefits of installing:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Quick access from your home screen</li>
                <li>• Faster loading times</li>
                <li>• Work offline for viewing past bookings</li>
                <li>• Push notifications for booking updates</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPWADialog(false)}>
              Not Now
            </Button>
            <Button onClick={handlePWAInstall}>
              <Download className="mr-2 h-4 w-4" />
              Install App
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
} 