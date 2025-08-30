"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, CheckCircle } from "lucide-react"

interface BookingNotification {
  id: string
  name: string
  location: string
  service: string
  timeAgo: string
}

export function SocialProofNotifications() {
  const [currentNotification, setCurrentNotification] = useState<BookingNotification | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  const notifications: BookingNotification[] = [
    { id: "1", name: "Sarah M.", location: "Katy", service: "RON Service", timeAgo: "2 minutes ago" },
    { id: "2", name: "Michael C.", location: "The Woodlands", service: "Loan Signing", timeAgo: "5 minutes ago" },
    { id: "3", name: "Jennifer L.", location: "Sugar Land", service: "Mobile Notary", timeAgo: "8 minutes ago" },
    { id: "4", name: "David R.", location: "Pearland", service: "Business Documents", timeAgo: "12 minutes ago" },
    { id: "5", name: "Lisa K.", location: "Cypress", service: "Real Estate Closing", timeAgo: "15 minutes ago" },
  ]

  useEffect(() => {
    const showNotification = () => {
      const randomNotification = notifications[Math.floor(Math.random() * notifications.length)]
      setCurrentNotification(randomNotification)
      setIsVisible(true)

      // Hide after 4 seconds
      setTimeout(() => {
        setIsVisible(false)
      }, 4000)
    }

    // Show first notification after 3 seconds
    const initialTimer = setTimeout(showNotification, 3000)

    // Then show notifications every 15-25 seconds
    const interval = setInterval(
      () => {
        showNotification()
      },
      Math.random() * 10000 + 15000,
    ) // 15-25 seconds

    return () => {
      clearTimeout(initialTimer)
      clearInterval(interval)
    }
  }, [])

  if (!currentNotification || !isVisible) return null

  return (
    <div className="fixed bottom-6 left-6 z-50 animate-in slide-in-from-left-5 duration-500">
      <Card className="bg-background/95 backdrop-blur-sm border-green-200 shadow-lg max-w-sm">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <p className="text-sm font-medium text-foreground">{currentNotification.name}</p>
                <Badge variant="secondary" className="text-xs">
                  {currentNotification.service}
                </Badge>
              </div>
              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <MapPin className="h-3 w-3" />
                  <span>{currentNotification.location}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{currentNotification.timeAgo}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
